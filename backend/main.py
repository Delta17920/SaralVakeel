import os
import shutil
import uuid
import json
import tempfile
from pathlib import Path
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
import google.generativeai as genai
import pdfplumber
from pydantic import BaseModel
from dotenv import load_dotenv

# --- Load Environment Variables ---
current_dir = Path(__file__).resolve().parent
root_dir = current_dir.parent
load_dotenv(root_dir / ".env")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")

# Initialize Clients
if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def extract_text(file_path):
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += (page.extract_text() or "") + "\n"
    except Exception as e:
        print(f"PDF Error: {e}")
        return None
    return text

@app.post("/process-document")
async def process_document(file: UploadFile = File(...)):
    print(f"Processing: {file.filename}")
    
    # Create temp file
    temp_dir = tempfile.gettempdir()
    temp_filename = os.path.join(temp_dir, f"{uuid.uuid4()}.pdf")
    
    try:
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Upload to Supabase
        try:
            with open(temp_filename, "rb") as f:
                supabase.storage.from_("pdfs").upload(file.filename, f)
        except Exception as e:
            print(f"Storage Note: {e}") 

        # Extract Text
        text = extract_text(temp_filename)
        if not text:
            return {"error": "No text found in PDF"}

        # --- UPDATED MODEL: GEMINI 2.5 FLASH ---
        # This is the active model for late 2025
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        report_prompt = f"""
        Act as a meticulous legal analyst. Analyze the following legal document text.
        Your response MUST be a single, valid JSON object. Do not include any text before or after the JSON.

        The JSON object should have the following structure:
        - "documentTitle": string
        - "documentType": string
        - "summary": string
        - "parties": list of objects {{"role": string, "name": string}}
        - "keyTerms": list of objects {{"term": string, "value": string, "details": string}}
        - "obligations": list of strings
        - "risks": list of strings
        - "riskScore": integer (1-10)

        DOCUMENT TEXT:
        ---
        {text[:30000]}
        ---
        """
        
        try:
            response = model.generate_content(report_prompt)
            clean_json = response.text.replace("```json", "").replace("```", "").strip()
            report_json = json.loads(clean_json)
        except Exception as e:
            return {"error": f"AI Error: {str(e)}"}

        # Save to Supabase DB
        data = {
            "id": file.filename,
            "content": text, 
            "metadata": report_json
        }
        supabase.table("documents").upsert(data).execute()

        return {"status": "success", "report": report_json}

    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

class QueryRequest(BaseModel):
    document_name: str
    question: str

@app.post("/query-document")
async def query_document(payload: QueryRequest):
    # Fetch text
    response = supabase.table("documents").select("content").eq("id", payload.document_name).execute()
    
    if not response.data:
        raise HTTPException(status_code=404, detail="Document not found")
        
    doc_text = response.data[0]['content']

    # --- UPDATED MODEL: GEMINI 2.5 FLASH ---
    model = genai.GenerativeModel('gemini-2.5-flash')
    
    prompt = f"""
    Answer based ONLY on the text below.
    TEXT: {doc_text[:30000]}
    QUESTION: {payload.question}
    """
    
    response = model.generate_content(prompt)
    return {"answer": response.text}