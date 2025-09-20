import os
import shutil
import tempfile

from google.cloud import documentai, storage
import vertexai
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_vertexai.embeddings import VertexAIEmbeddings
from langchain_google_vertexai import ChatVertexAI
import chromadb
from dotenv import load_dotenv

# Load environment variables from .env file for local development
load_dotenv()

# --- CONFIGURATION (Reads from Environment) ---
GCP_PROJECT_ID = os.environ.get("GCP_PROJECT_ID")
VERTEXAI_LOCATION = os.environ.get("VERTEXAI_LOCATION")
DOCAI_LOCATION = os.environ.get("DOCAI_LOCATION")
DOCAI_PROCESSOR_ID = os.environ.get("DOCAI_PROCESSOR_ID")
FINAL_DB_BUCKET = os.environ.get("FINAL_DB_BUCKET")

# --- LAZY INITIALIZATION ---
docai_client = None
embedding_model = None
llm = None

def process_document_for_chroma(event, context):
    """
    Triggered by a file upload, generates a report, creates embeddings,
    and saves them to a ChromaDB database in GCS.
    """
    global docai_client, embedding_model, llm

    bucket_name = event['bucket']
    file_name = event['name']
    
    # Input Validation
    if not file_name.lower().endswith('.pdf'):
        print(f"File {file_name} is not a PDF. Skipping.")
        return "Not a PDF."
    
    if "vector_databases/" in file_name or "_report.txt" in file_name:
        print(f"File {file_name} is a generated file. Skipping.")
        return "Skipped generated file."
        
    # Client Initialization (on cold start)
    if not docai_client:
        print("-> Initializing AI clients (cold start)...")
        vertexai.init(project=GCP_PROJECT_ID, location=VERTEXAI_LOCATION)
        docai_client = documentai.DocumentProcessorServiceClient(client_options={"api_endpoint": f"{DOCAI_LOCATION}-documentai.googleapis.com"})
        embedding_model = VertexAIEmbeddings(model_name="text-embedding-005")
        llm = ChatVertexAI(model_name="gemini-2.0-flash")

    gcs_uri = f"gs://{bucket_name}/{file_name}"
    print(f"🎉 Processing started for: {gcs_uri}")
    
    # Text Extraction
    print("-> Step 1: Extracting text with Document AI...")
    docai_resource_name = docai_client.processor_path(GCP_PROJECT_ID, DOCAI_LOCATION, DOCAI_PROCESSOR_ID)
    gcs_document = documentai.GcsDocument(gcs_uri=gcs_uri, mime_type="application/pdf")
    request = documentai.ProcessRequest(name=docai_resource_name, gcs_document=gcs_document)
    result = docai_client.process_document(request=request)
    extracted_text = result.document.text
    print("-> Text extraction complete.")

    if not extracted_text.strip():
        print("-> No text found in document. Halting.")
        return "No text found."

    # Detailed Report Generation
    print("-> Step 2: Generating detailed report with Gemini...")
    report_prompt = f"Act as a legal analyst. Analyze the following text and provide a structured report including a summary, key entities, main obligations, and potential risks.\n\nDOCUMENT TEXT:\n---\n{extracted_text}\n---"
    try:
        response = llm.invoke(report_prompt)
        report_text = response.content
        print("-> Report generated successfully.")

        storage_client = storage.Client()
        bucket = storage_client.bucket(FINAL_DB_BUCKET)
        report_file_name = os.path.splitext(os.path.basename(file_name))[0] + "_report.txt"
        report_blob = bucket.blob(report_file_name)
        report_blob.upload_from_string(report_text)
        print(f"-> Report saved to gs://{FINAL_DB_BUCKET}/{report_file_name}")
    except Exception as e:
        print(f"❌ Error generating report: {e}")
    
    # ChromaDB Indexing
    print("-> Step 3: Chunking document for RAG...")
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = text_splitter.split_text(extracted_text)
    print(f"-> Document split into {len(chunks)} chunks.")
    
    print("-> Step 4: Creating embeddings...")
    embedding_values = embedding_model.embed_documents(chunks)
    print("-> Embeddings created.")

    print("-> Step 5: Saving to ChromaDB and uploading to GCS...")
    with tempfile.TemporaryDirectory() as temp_dir:
        db = chromadb.PersistentClient(path=temp_dir)
        collection = db.get_or_create_collection(name="legal_docs")
        ids = [f"{file_name}_{i}" for i in range(len(chunks))]
        collection.add(embeddings=embedding_values, documents=chunks, ids=ids)
        
        archive_path = shutil.make_archive(base_name="chroma_db", format='zip', root_dir=temp_dir)
        
        storage_client = storage.Client()
        bucket = storage_client.bucket(FINAL_DB_BUCKET)
        db_file_name = os.path.splitext(os.path.basename(file_name))[0] + "_db.zip"
        blob = bucket.blob(f"vector_databases/{db_file_name}")
        blob.upload_from_filename(archive_path)

    print(f"✅ Successfully created and uploaded ChromaDB database to gs://{FINAL_DB_BUCKET}/vector_databases/{db_file_name}")

    return "Full processing complete."