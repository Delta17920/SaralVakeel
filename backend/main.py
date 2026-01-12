import os
import shutil
import uuid
import json
import tempfile
from pathlib import Path
from typing import List

from fastapi import FastAPI, UploadFile, File, HTTPException, Depends, Security
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from pydantic import BaseModel
from dotenv import load_dotenv

# --- RAG / LangChain Imports ---
import pdfplumber
import langchain
print(f"DEBUG: LangChain Version: {langchain.__version__}")
try:
    import langchain.chains
    print("DEBUG: langchain.chains imported successfully")
except ImportError as e:
    print(f"DEBUG: langchain.chains FAILED: {e}")

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.schema import Document

# --- Load Environment Variables ---
# --- Load Environment Variables ---
current_dir = Path(__file__).resolve().parent
root_dir = current_dir.parent
# Try loading from multiple potential locations
env_paths = [
    current_dir / ".env",
    root_dir / ".env",
    root_dir.parent / ".env"
]

for path in env_paths:
    if path.exists():
        print(f"DEBUG: Loading .env from {path}")
        load_dotenv(path)
        break
else:
    print(f"DEBUG: .env not found in {env_paths}")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")

# Initialize Supabase Client
# Initialize Supabase Client
supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print(f"Warning: SUPABASE_URL or SUPABASE_KEY not set. Looking in {root_dir / '.env'}")

# Initialize Gemini Clients
if not GOOGLE_API_KEY:
    print("Error: GOOGLE_API_KEY is missing.")

# 1. Initialize Embeddings (Gemini)
# Using text-embedding-004 for better performance and newer quotas
embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004", google_api_key=GOOGLE_API_KEY)

# 2. LLM Model (for Chat)
# Using Gemini 2.5 Flash as requested by user
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=GOOGLE_API_KEY, temperature=0.1)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Scheme
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Security(security)):
    if not supabase:
        raise HTTPException(status_code=503, detail="Supabase not configured. Please check server logs.")
        
    token = credentials.credentials
    try:
        user = supabase.auth.get_user(token)
        if not user or not user.user:
             raise HTTPException(status_code=401, detail="Invalid authentication token")
        return user.user
    except Exception as e:
        print(f"Auth Error: {e}")
        raise HTTPException(status_code=401, detail=str(e))

@app.get("/")
def health_check():
    return {"status": "active", "service": "Legal AI Backend"}

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
async def process_document(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    print(f"Processing: {file.filename}")
    
    temp_dir = tempfile.gettempdir()
    temp_filename = os.path.join(temp_dir, f"{uuid.uuid4()}.pdf")
    
    try:
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # 1. Extract Text & Chunk per Page (CRITICAL for Page Citations)
        docs = []
        full_text = ""
        
        # We process page by page to ensure chunks don't cross page boundaries
        # and to accurately assign page numbers.
        try:
            with pdfplumber.open(temp_filename) as pdf:                # 1. Processing PDF with Granular Chunks
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=400, # Smaller chunks for "pinpoint" citations
                    chunk_overlap=50,
                    separators=["\n\n", "\n", ".", " ", ""]
                )
                
                for i, page in enumerate(pdf.pages):
                    page_text = page.extract_text() or ""
                    full_text += page_text + "\n"
                    
                    if not page_text.strip():
                        continue
                        
                    # Split this page's text
                    page_chunks = text_splitter.split_text(page_text)
                    
                    for chunk in page_chunks:
                        docs.append(
                            Document(
                                page_content=chunk, 
                                metadata={
                                    "document_id": file.filename, 
                                    "source": file.filename,
                                    "page": i + 1 # 1-based page number
                                }
                            )
                        )
        except Exception as e:
            print(f"PDF Processing Error: {e}")
            return {"error": f"Failed to read PDF: {str(e)}"}

        if not docs:
            return {"error": "No text found in PDF"}

        # 2. Store Vectors in Supabase
        try:
            # Note: We are using the same table, ensure dimensions match!
            # Add user_id to metadata for filtering
            for doc in docs:
                doc.metadata["user_id"] = user.id

            vector_store = SupabaseVectorStore.from_documents(
                docs,
                embeddings,
                client=supabase,
                table_name="document_chunks",
                query_name="match_documents"
            )
        except Exception as vec_err:
             print(f"Vector Store Error: {vec_err}")
        
        print(f"DEBUG: Successfully inserted {len(docs)} chunks into 'document_chunks' table.")

        # 2a. Upload actual PDF to Supabase Storage (for frontend viewer)
        try:
            with open(temp_filename, "rb") as f:
                file_content = f.read()
                # Upsert option (overwrite if exists) is safest
                supabase.storage.from_("pdfs").upload(
                    path=file.filename,
                    file=file_content,
                    file_options={"content-type": "application/pdf", "upsert": "true"}
                )
            print(f"DEBUG: Successfully uploaded '{file.filename}' to 'pdfs' bucket.")
        except Exception as storage_err:
             print(f"Storage Upload Error: {storage_err}")
             # Don't fail the whole process if storage upload fails (e.g. bucket doesn't exist yet)
             # User might need to create 'pdfs' bucket manually if not verified.

        # 3. Generate Basic Report Metadata
        # (Simplified for speed, can be enhanced with LLM summary if needed)
        # 3. Generate Detailed Report Metadata via Gemini
        print("DEBUG: Generating document analysis...")
        analysis_prompt = f"""
        Analyze the following legal document and extract detailed metadata in JSON format.
        Focus heavily on identifying specific contractual obligations and potential legal risks.
        
        Document Text (truncated):
        {full_text[:30000]}
        
        Return ONLY valid JSON with this structure. Ensure 'obligations' and 'risks' are populated with at least 3-5 items each if present in the text.
        {{
            "documentTitle": "Inferred Title",
            "documentType": "Type of Contract/Doc",
            "summary": "3-5 sentence executive summary",
            "keyTerms": ["list of key defined terms found in the doc"],
            "obligations": ["detailed list of key obligations (e.g., 'Party A shall pay X', 'Party B must deliver Y')"],
            "parties": [
                {{"name": "Party A", "type": "Individual/Company", "role": "Buyer/Seller etc"}}
            ],
            "risks": ["detailed list of potential legal risks (e.g., 'Unlimited indemnity', 'Termination for convenience', 'Jurisdiction issues')"],
            "riskScore": 1-10 (10 being highest risk)
        }}
        """
        
        try:
            analysis_response = llm.invoke(analysis_prompt)
            # Clean up code blocks if present
            content_str = analysis_response.content.replace('```json', '').replace('```', '').strip()
            report_json = json.loads(content_str)
            
            # Ensure required fields exist
            if "documentTitle" not in report_json: report_json["documentTitle"] = file.filename
            
            # Add file size
            report_json["fileSize"] = os.path.getsize(temp_filename)
            
        except Exception as analysis_err:
            print(f"Analysis Error: {analysis_err}")
            # Fallback
            report_json = {
                "documentTitle": file.filename,
                "documentType": "Uploaded Document",
                "summary": "Analysis failed. However, RAG search is active.",
                "riskScore": 0,
                "risks": [],
                "obligations": [],
                "keyTerms": [],
                "parties": [],
                "fileSize": os.path.getsize(temp_filename) if os.path.exists(temp_filename) else 0
            }
        
        # Save metadata to 'documents' table
        data = {
            "id": file.filename,
            "content": full_text[:10000], # truncated preview
            "metadata": report_json,
            "user_id": user.id
        }
        supabase.table("documents").upsert(data).execute()

        return {"status": "success", "report": report_json}

    except Exception as e:
        print(f"Error processing document: {e}")
        return {"error": str(e)}
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

class QueryRequest(BaseModel):
    document_name: str
    question: str

@app.post("/query-document")
async def query_document(payload: QueryRequest, user: dict = Depends(get_current_user)):
    try:
        # 1. Setup Retrieval
        vector_store = SupabaseVectorStore(
            embedding=embeddings,
            client=supabase,
            table_name="document_chunks",
            query_name="match_documents"
        )
        
        retriever = vector_store.as_retriever(
            search_kwargs={
                "k": 5, 
                "filter": {"document_id": payload.document_name, "user_id": user.id}
            }
        )
        
        # 2. Create Chain with Source Returns
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True # Get metadata back!
        )
        
        # 3. Run Query
        result = qa_chain.invoke({"query": payload.question})
        
        answer_text = result['result']
        source_docs = result['source_documents']
        
        # 4. Extract Citations (Unique Pages)
        citations = []
        seen_pages = set()
        
        for doc in source_docs:
            page_num = doc.metadata.get('page')
            if page_num and page_num not in seen_pages:
                citations.append({
                    "page": page_num,
                    "text": doc.page_content, # Full text for highlighting
                    "preview": doc.page_content[:100] + "..."
                })
                seen_pages.add(page_num)
        
        return {
            "answer": answer_text,
            "citations": citations
        }
        
    except Exception as e:
        print(f"Query Error: {e}")
        return {"answer": f"Error: {str(e)}"}

@app.delete("/documents/{document_id}")
async def delete_document(document_id: str, user: dict = Depends(get_current_user)):
    try:
        # 1. Delete from 'documents' table
        # We enforce user_id to ensure users can only delete their own docs
        res = supabase.table("documents").delete().eq("id", document_id).eq("user_id", user.id).execute()
        
        # 2. Delete from 'document_chunks' table (Vector Store)
        # Assuming metadata->>document_id or similar. 
        # Since we used SupabaseVectorStore which stores metadata in a jsonb column, 
        # we delete where metadata->>document_id matches.
        # However, standard Supabase vector store might not expose direct delete by metadata easily via python client 
        # if not using the vector_store object. 
        # But we can use raw supabase client.
        supabase.table("document_chunks").delete().match({"metadata->>document_id": document_id, "metadata->>user_id": user.id}).execute()
        
        # Alternative: simpler delete if we trust the metadata column structure
        # supabase.table("document_chunks").delete().eq("metadata->>document_id", document_id).execute()
        
        # 3. Delete from Storage ('pdfs' bucket)
        supabase.storage.from_("pdfs").remove([document_id])
        
        return {"status": "success", "message": f"Document {document_id} deleted successfully"}
        
    except Exception as e:
        print(f"Delete Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))