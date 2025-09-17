import os
import json
import base64
import shutil
import tempfile

from google.cloud import documentai, storage
import vertexai
from vertexai.language_models import TextEmbeddingModel
import chromadb
from dotenv import load_dotenv
load_dotenv()
GCP_PROJECT_ID=os.environ.get("GCP_PROJECT_ID")
VERTEXAI_LOCATION=os.environ.get("VERTEXAI_LOCATION")
DOCAI_LOCATION=os.environ.get("DOCAI_LOCATION")
DOCAI_PROCESSOR_ID=os.environ.get("DOCAI_PROCESSOR_ID")
FINAL_DB_BUCKET=os.environ.get("FINAL_DB_BUCKET")

# --- LAZY INITIALIZATION ---
docai_client = None
embedding_model = None

def process_document_for_chroma(event, context):
    """
    Triggered by a file upload, extracts text, creates embeddings,
    and saves them to a ChromaDB database in GCS.
    """
    global docai_client, embedding_model

    bucket_name = event['bucket']
    file_name = event['name']
    
    if not file_name.lower().endswith('.pdf'):
        print(f"File {file_name} is not a PDF. Skipping.")
        return "Not a PDF."
    
    if not docai_client:
        print("-> Initializing AI clients (cold start)...")
        vertexai.init(project=GCP_PROJECT_ID, location=VERTEXAI_LOCATION)
        docai_client = documentai.DocumentProcessorServiceClient(client_options={"api_endpoint": f"{DOCAI_LOCATION}-documentai.googleapis.com"})
        embedding_model = TextEmbeddingModel.from_pretrained("text-embedding-005")

    gcs_uri = f"gs://{bucket_name}/{file_name}"
    print(f"🎉 ChromaDB Indexing started for: {gcs_uri}")
    
    print("-> Step 1: Extracting text...")
    docai_resource_name = docai_client.processor_path(GCP_PROJECT_ID, DOCAI_LOCATION, DOCAI_PROCESSOR_ID)
    gcs_document = documentai.GcsDocument(gcs_uri=gcs_uri, mime_type="application/pdf")
    request = documentai.ProcessRequest(name=docai_resource_name, gcs_document=gcs_document)
    result = docai_client.process_document(request=request)
    extracted_text = result.document.text
    print("-> Text extraction complete.")

    if not extracted_text.strip():
        print("-> No text found.")
        return "No text found."

    print("-> Step 2: Chunking document...")
    chunks = [extracted_text[i:i + 1000] for i in range(0, len(extracted_text), 900)]
    print(f"-> Document split into {len(chunks)} chunks.")
    
    print("-> Step 3: Creating embeddings...")
    embeddings = embedding_model.get_embeddings(chunks)
    embedding_values = [e.values for e in embeddings]
    print("-> Embeddings created.")

    print("-> Step 4: Saving to ChromaDB and uploading to GCS...")
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

    return "ChromaDB indexing process completed successfully."