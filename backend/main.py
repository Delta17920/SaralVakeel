import os
import shutil
import uuid
import json
import tempfile
from pathlib import Path
from typing import List

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from dotenv import load_dotenv

import os
import shutil
import uuid
import json
import tempfile
from pathlib import Path
from typing import List

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from pydantic import BaseModel
from dotenv import load_dotenv

# --- RAG / LangChain Imports ---
import pdfplumber
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from langchain.schema import Document

# --- Load Environment Variables ---
current_dir = Path(__file__).resolve().parent
root_dir = current_dir.parent
load_dotenv(root_dir / ".env")

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")

# Initialize Supabase Client
if SUPABASE_URL and SUPABASE_KEY:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
else:
    print("Warning: SUPABASE_URL or SUPABASE_KEY not set.")

# Initialize Gemini Clients
if not GOOGLE_API_KEY:
    print("Error: GOOGLE_API_KEY is missing.")

# 1. Embeddings Model (for Vectors)
embeddings = GoogleGenerativeAIEmbeddings(model="models/embedding-001", google_api_key=GOOGLE_API_KEY)

# 2. LLM Model (for Chat)
# Using Gemini 1.5 Flash for speed/cost effectiveness, acts as our "Analyst"
llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=GOOGLE_API_KEY, temperature=0.1)


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
            with pdfplumber.open(temp_filename) as pdf:
                text_splitter = RecursiveCharacterTextSplitter(
                    chunk_size=1000, 
                    chunk_overlap=100,
                    separators=["\n\n", "\n", " ", ""]
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
            vector_store = SupabaseVectorStore.from_documents(
                docs,
                embeddings,
                client=supabase,
                table_name="document_chunks",
                query_name="match_documents"
            )
        except Exception as vec_err:
             print(f"Vector Store Error: {vec_err}")

        # 3. Generate Basic Report Metadata
        # (Simplified for speed, can be enhanced with LLM summary if needed)
        report_json = {
            "documentTitle": file.filename,
            "documentType": "Uploaded Document",
            "summary": "Document processed for RAG (Page-Level Citations Enabled).",
            "riskScore": 5, # Placeholder
            "risks": ["Content available for AI Analysis"],
            "obligations": []
        }
        
        # Save metadata to 'documents' table
        data = {
            "id": file.filename,
            "content": full_text[:10000], # truncated preview
            "metadata": report_json
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
async def query_document(payload: QueryRequest):
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
                "filter": {"document_id": payload.document_name}
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