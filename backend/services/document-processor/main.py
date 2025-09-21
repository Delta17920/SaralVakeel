import os
import json
import base64
import shutil
import tempfile

from google.cloud import documentai, storage
import vertexai
from vertexai.language_models import TextEmbeddingModel
from vertexai.generative_models import GenerativeModel
import chromadb
from dotenv import load_dotenv

load_dotenv()

# --- CONFIGURATION ---
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
    global docai_client, embedding_model, llm

    bucket_name = event['bucket']
    file_name = event['name']
    
    if not file_name.lower().endswith('.pdf'):
        return "Not a PDF."
    
    if "vector_databases/" in file_name or "_report.json" in file_name:
        return "Skipped generated file."
        
    if not docai_client:
        print("-> Initializing AI clients (cold start)...")
        vertexai.init(project=GCP_PROJECT_ID, location=VERTEXAI_LOCATION)
        docai_client = documentai.DocumentProcessorServiceClient(client_options={"api_endpoint": f"{DOCAI_LOCATION}-documentai.googleapis.com"})
        embedding_model = TextEmbeddingModel.from_pretrained("text-embedding-005")
        llm = GenerativeModel("gemini-2.0-flash")

    gcs_uri = f"gs://{bucket_name}/{file_name}"
    print(f"🎉 Processing started for: {gcs_uri}")
    
    # --- Text Extraction ---
    print("-> Step 1: Extracting text with Document AI...")
    # ... (rest of the text extraction code is the same)
    docai_resource_name = docai_client.processor_path(GCP_PROJECT_ID, DOCAI_LOCATION, DOCAI_PROCESSOR_ID)
    gcs_document = documentai.GcsDocument(gcs_uri=gcs_uri, mime_type="application/pdf")
    request = documentai.ProcessRequest(name=docai_resource_name, gcs_document=gcs_document)
    result = docai_client.process_document(request=request)
    extracted_text = result.document.text
    print("-> Text extraction complete.")

    if not extracted_text.strip():
        return "No text found."

    # --- NEW STEP: GENERATE DETAILED JSON REPORT ---
    print("-> Step 2: Generating detailed report as JSON...")
    report_prompt = f"""
    Act as a meticulous legal analyst. Analyze the following legal document text.
    Your response MUST be a single, valid JSON object. Do not include any text before or after the JSON.

    The JSON object should have the following structure:
    - "documentTitle": A short, descriptive title for the document.
    - "documentType": The type of document (e.g., "Lease Agreement", "Loan Contract").
    - "summary": A concise, easy-to-understand summary of the document's main purpose.
    - "parties": A list of JSON objects, where each object represents a party and has the keys "role" (e.g., "Tenant") and "name" (e.g., "Jane Smith").
    - "keyTerms": A list of JSON objects, where each object represents a key financial or temporal term and has the keys "term" (e.g., "Monthly Rent"), "value" (e.g., "$1500"), and "details" (e.g., "Due on the 1st of each month").
    - "obligations": A list of strings detailing the primary responsibilities and duties of the main party (e.g., the Tenant).
    - "risks": A list of strings identifying clauses that are potentially unfavorable, ambiguous, or require special attention.
    - "risk score": A decimal risk score out of 10.

    DOCUMENT TEXT:
    ---
    {extracted_text}
    ---
    """
    try:
        response = llm.generate_content(report_prompt)
        # Clean the response to ensure it's valid JSON
        json_text = response.text.strip().replace("```json", "").replace("```", "").strip()
        report_json = json.loads(json_text)
        print("-> JSON report generated successfully.")

        storage_client = storage.Client()
        bucket = storage_client.bucket(FINAL_DB_BUCKET)
        report_file_name = os.path.splitext(os.path.basename(file_name))[0] + "_report.json"
        report_blob = bucket.blob(report_file_name)
        # Upload the JSON data
        report_blob.upload_from_string(
            data=json.dumps(report_json, indent=2),
            content_type="application/json"
        )
        print(f"-> Report saved to gs://{FINAL_DB_BUCKET}/{report_file_name}")

    except Exception as e:
        print(f"❌ Error generating JSON report: {e}")
    # --- END OF NEW STEP ---


    # --- ChromaDB Indexing (remains the same) ---
    print("-> Step 3: Chunking document for RAG...")
    # ... (rest of the ChromaDB indexing code is the same)
    chunks = [extracted_text[i:i + 1000] for i in range(0, len(extracted_text), 900)]
    print(f"-> Document split into {len(chunks)} chunks.")
    
    print("-> Step 4: Creating embeddings...")
    embeddings = embedding_model.get_embeddings(chunks)
    embedding_values = [e.values for e in embeddings]
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