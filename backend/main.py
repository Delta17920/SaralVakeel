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
            
        # 1. Extract Text
        text = extract_text(temp_filename)
        if not text:
            return {"error": "No text found in PDF"}

        # 2. Chunking (Critical for RAG: smaller pieces = better matches)
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=2000, # Gemini handles larger chunks well
            chunk_overlap=200,
            separators=["\n\n", "\n", " ", ""]
        )
        docs = [
            Document(
                page_content=chunk, 
                metadata={"document_id": file.filename, "source": file.filename}
            ) 
            for chunk in text_splitter.split_text(text)
        ]

        # 3. Store Vectors in Supabase
        # Uses Gemini Embeddings -> Supabase Vector Store
        try:
            vector_store = SupabaseVectorStore.from_documents(
                docs,
                embeddings,
                client=supabase,
                table_name="document_chunks",
                query_name="match_documents"
            )
        except Exception as vec_err:
             print(f"Vector Store Error: {vec_err}")
             # Proceeding anyway so we at least return the JSON report, 
             # but Chat might fail if vectors aren't stored.

        # 4. Generate Initial Report (using LLM directly on first part of text)
        # We start a new chain just for the summary/JSON extraction
        
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

        DOCUMENT TEXT (Preview):
        ---
        {text[:30000]}
        ---
        """
        
        try:
            # We use the Invoke method for direct generation
            response = llm.invoke(report_prompt)
            clean_json = response.content.replace("```json", "").replace("```", "").strip()
            report_json = json.loads(clean_json)
        except Exception as e:
            print(f"JSON Gen Error: {e}")
            # Fallback if AI fails
            report_json = {
                "documentTitle": file.filename,
                "documentType": "Document",
                "summary": "AI extraction failed, but document text is searchable.",
                "riskScore": 0,
                "risks": [],
                "obligations": []
            }

        # Save to Supabase DB (Main Document Record)
        data = {
            "id": file.filename,
            "content": text, 
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
        # 1. Setup Vector Store for Retrieval
        vector_store = SupabaseVectorStore(
            embedding=embeddings,
            client=supabase,
            table_name="document_chunks",
            query_name="match_documents"
        )
        
        # 2. Setup Retriever
        # Search for top 5 most relevant chunks
        retriever = vector_store.as_retriever(
            search_kwargs={
                "k": 5, 
                "filter": {"document_id": payload.document_name}
            }
        )
        
        # 3. Create RAG Prompt
        prompt_template = """
        You are an intelligent legal assistant.
        Use the following pieces of context to answer the question at the end.
        
        CRITICAL RULES:
        1. Answer ONLY based on the context provided.
        2. If the answer is found, cite the specific clause or section numbers referenced in the text.
        3. If you cannot find the answer in the context, say "I cannot find this information in the document."
        4. Do NOT hallucinate or make up laws/facts not in the text.
        
        Context:
        {context}
        
        Question: {question}
        
        Answer:"""
        
        PROMPT = PromptTemplate(
            template=prompt_template, input_variables=["context", "question"]
        )
        
        # 4. Execute RetrievalQA Chain
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            chain_type_kwargs={"prompt": PROMPT}
        )
        
        result = qa_chain.run(payload.question)
        
        return {"answer": result}
        
    except Exception as e:
        print(f"Query Error: {e}")
        return {"answer": f"Error: {str(e)}"}