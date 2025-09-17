import os
import json
import tempfile
import shutil
from google.cloud import storage
import vertexai
from langchain_google_vertexai.embeddings import VertexAIEmbeddings
from langchain_google_vertexai import ChatVertexAI
import chromadb

from dotenv import load_dotenv
load_dotenv()
GCP_PROJECT_ID=os.environ.get("GCP_PROJECT_ID")
VERTEXAI_LOCATION=os.environ.get("VERTEXAI_LOCATION")
FINAL_DB_BUCKET=os.environ.get("FINAL_DB_BUCKET") 

# --- Initialize AI Clients (globally) ---
vertexai.init(project=GCP_PROJECT_ID, location=VERTEXAI_LOCATION)
embedding_model = VertexAIEmbeddings(model_name="text-embedding-005") 
llm = ChatVertexAI(model_name="gemini-2.0-flash")


def query_document(request):
    try:
        request_json = request.get_json(silent=True)
        document_name = request_json['document_name']
        question = request_json['question']
        print(f"-> Received query for '{document_name}': '{question}'")
    except (TypeError, KeyError):
        return ("Invalid request. Please provide a JSON payload with 'document_name' and 'question'.", 400)

    try:
        db_file_name = os.path.splitext(document_name)[0] + "_db.zip"
        storage_client = storage.Client(project=GCP_PROJECT_ID)
        bucket = storage_client.bucket(FINAL_DB_BUCKET)
        blob = bucket.blob(f"vector_databases/{db_file_name}")

        with tempfile.TemporaryDirectory() as temp_dir:
            archive_path = os.path.join(temp_dir, "db.zip")
            db_path = os.path.join(temp_dir, "db")
            blob.download_to_filename(archive_path)
            shutil.unpack_archive(archive_path, db_path)
            db = chromadb.PersistentClient(path=db_path)
            collection = db.get_collection(name="legal_docs")
            print("-> Successfully downloaded and loaded ChromaDB.")

    except Exception as e:
        print(f"❌ Error loading database for {document_name}: {e}")
        return (f"Could not find or load the specified document's database: {document_name}", 404)

    print("-> Searching for relevant document chunks...")
    
    # --- THIS IS THE CORRECTED PART ---
    # 1. Create an embedding of the user's question using OUR model
    query_embedding = embedding_model.embed_query(question)

    # 2. Search the database using the embedding vector, not the raw text
    results = collection.query(
        query_embeddings=[query_embedding], # Use query_embeddings instead of query_texts
        n_results=3
    )
    # --- END OF CORRECTION ---
    
    context = "\n---\n".join(results['documents'][0])
    print("-> Found relevant context.")

    print("-> Generating final answer with Gemini...")
    prompt = f"""
    You are an expert legal assistant. Based ONLY on the following context from a legal document, answer the user's question.
    If the answer cannot be found in the context, say "The answer to that question could not be found in the document."
    Do not make up information.

    CONTEXT:
    ---
    {context}
    ---

    QUESTION: {question}

    ANSWER:
    """

    try:
        response = llm.invoke(prompt)
        final_answer = response.content
        print(f"-> Generated answer: {final_answer}")
        
        return (json.dumps({"answer": final_answer}), 200, {'Content-Type': 'application/json'})

    except Exception as e:
        print(f"❌ Error during Gemini generation: {e}")
        return ("An error occurred while generating the answer.", 500)