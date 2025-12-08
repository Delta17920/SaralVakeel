import os
import shutil
import uuid
import json
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import google.generativeai as genai
import pdfplumber
from pydantic import BaseModel

# --- Configuration ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")

# Initialize Clients
try:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    genai.configure(api_key=GOOGLE_API_KEY)
except Exception as e:
    print(f"Init Error: {e}")

app = FastAPI()

# Enable CORS for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Helper: Extract Text (Replaces Document AI) ---
def extract_text(file_path):
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += (page.extract_text() or "") + "\n"
    except Exception:
        return None
    return text

# --- Endpoint 1: Upload & Process ---
@app.post("/process-document")
async def process_document(file: UploadFile = File(...)):
    print(f"Processing: {file.filename}")
    
    # 1. Save locally temporarily
    temp_filename = f"/tmp/{uuid.uuid4()}.pdf"
    with open(temp_filename, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Upload to Supabase Storage (Replaces GCS)
    try:
        with open(temp_filename, "rb") as f:
            supabase.storage.from_("pdfs").upload(file.filename, f)
    except Exception as e:
        print(f"Storage Note: {e}") # Ignore if file exists

    # 3. Extract Text
    text = extract_text(temp_filename)
    if not text:
        return {"error": "No text found in PDF"}

    # 4. Generate Report (YOUR EXACT PROMPT)
    # Replaces Vertex AI with AI Studio (Free)
    model = genai.GenerativeModel('gemini-1.5-flash')
    
    report_prompt = f"""
    Act as a meticulous legal analyst. Analyze the following legal document text.
    Your response MUST be a single, valid JSON object. Do not include any text before or after the JSON.

    The JSON object should have the following structure:
    - "documentTitle": A short, descriptive title for the document.
    - "documentType": The type of document (e.g., "Lease Agreement", "Loan Contract").
    - "summary": A concise, easy-to-understand summary of the document's main purpose.
    - "parties": A list of JSON objects, where each object represents a party and has the keys "role" and "name".
    - "keyTerms": A list of JSON objects, where each object represents a key financial or temporal term and has the keys "term", "value", and "details".
    - "obligations": A list of strings detailing the primary responsibilities and duties of the main party.
    - "risks": A list of strings identifying clauses that are potentially unfavorable, ambiguous, or require special attention.
    - "riskScore": A decimal risk score out of 10.

    DOCUMENT TEXT:
    ---
    {text[:30000]}
    ---
    """
    
    try:
        response = model.generate_content(report_prompt)
        # Clean JSON
        clean_json = response.text.replace("```json", "").replace("```", "").strip()
        report_json = json.loads(clean_json)
    except Exception as e:
        return {"error": f"AI Error: {str(e)}"}

    # 5. Save Data to Supabase DB (Replaces Vector DB/GCS Report)
    data = {
        "id": file.filename,
        "content": text, 
        "metadata": report_json
    }
    supabase.table("documents").upsert(data).execute()

    # Return the EXACT structure your frontend likely expects
    return {"status": "success", "report": report_json}

# --- Endpoint 2: Ask Questions ---
class QueryRequest(BaseModel):
    document_name: str
    question: str

@app.post("/query-document")
async def query_document(payload: QueryRequest):
    # 1. Fetch text from Supabase
    response = supabase.table("documents").select("content").eq("id", payload.document_name).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Document not found")
        
    doc_text = response.data[0]['content']

    # 2. Ask Gemini (Long Context)
    model = genai.GenerativeModel('gemini-1.5-flash')
    prompt = f"""
    Answer based ONLY on the text below.
    
    TEXT: {doc_text[:30000]}
    
    QUESTION: {payload.question}
    """
    
    response = model.generate_content(prompt)
    return {"answer": response.text}