import os
import shutil
import uuid
import json
import tempfile
from pathlib import Path

# Re-import dependencies for the worker
import pdfplumber
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_google_genai import GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI
from langchain.schema import Document
from supabase import create_client, Client
from dotenv import load_dotenv

from inngest_client import inngest_client

# --- Init Logic (Duplicated for Worker safety) ---
current_dir = Path(__file__).resolve().parent
root_dir = current_dir.parent
env_paths = [current_dir / ".env", root_dir / ".env", root_dir.parent / ".env"]

for path in env_paths:
    if path.exists():
        load_dotenv(path)
        break

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
GOOGLE_API_KEY = os.environ.get("GOOGLE_API_KEY")

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004", google_api_key=GOOGLE_API_KEY)
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=GOOGLE_API_KEY, temperature=0.1)

import inngest

# ... existing code ...

@inngest_client.create_function(
    fn_id="process-document-background",
    trigger=inngest.TriggerEvent(event="app/document.uploaded"),
)
async def process_document_async(*args, **kwargs):
    import traceback
    print(f"WORKER: Starting process_document_async with args={len(args)} kwargs={kwargs.keys()}")
    
    # Attempt to extract ctx and step from arguments
    ctx = kwargs.get('ctx')
    step = kwargs.get('step')
    
    if not ctx and len(args) > 0:
        ctx = args[0]
    if not step and len(args) > 1:
        step = args[1]
        
    try:
        # Accessing event data: Check both attribute and dict access to be safe
        event_data = ctx.event.data if hasattr(ctx.event, 'data') else ctx.event.get('data', {})
        
        file_path = event_data.get("filePath")
        user_id = event_data.get("userId")
        file_name = event_data.get("fileName", file_path)

        print(f"WORKER: Parsed event - file_path={file_path}, user_id={user_id}")

        if not file_path or not user_id:
            return {"status": "error", "message": "Missing file_path or user_id"}

        temp_dir = tempfile.gettempdir()
        temp_filename = os.path.join(temp_dir, f"{uuid.uuid4()}.pdf")

        # 1. Download from Storage
        print(f"WORKER: Downloading {file_path}")
        # Supabase synchronous call in async function
        data = supabase.storage.from_("pdfs").download(file_path)
        with open(temp_filename, "wb") as f:
            f.write(data)
        
        # 2. Extract Text & Chunk
        print("WORKER: Extracting text")
        docs = []
        full_text = ""
        
        with pdfplumber.open(temp_filename) as pdf:
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=400,
                chunk_overlap=50,
                separators=["\n\n", "\n", ".", " ", ""]
            )
            for i, page in enumerate(pdf.pages):
                page_text = page.extract_text() or ""
                full_text += page_text + "\n"
                if not page_text.strip(): continue
                
                page_chunks = text_splitter.split_text(page_text)
                for chunk in page_chunks:
                    docs.append(Document(
                        page_content=chunk, 
                        metadata={
                            "document_id": file_name, 
                            "source": file_name,
                            "page": i + 1,
                            "user_id": user_id
                        }
                    ))
        
        # 3. Store Vectors
        print(f"WORKER: Storing {len(docs)} vectors")
        if docs:
            SupabaseVectorStore.from_documents(
                docs, embeddings, client=supabase, 
                table_name="document_chunks", query_name="match_documents"
            )

        # 4. Generate AI Report
        print("WORKER: Generating AI Report")
        analysis_prompt = f"""
        Analyze this legal document (Title: {file_name}) and extract JSON metadata.
        Text (truncated): {full_text[:25000]}
        
        Return ONLY valid JSON:
        {{
            "documentTitle": "Inferred Title",
            "documentType": "Contract Type",
            "summary": "Executive summary",
            "obligations": ["List of obligations"],
            "risks": ["List of legal risks"],
            "riskScore": 1-10
        }}
        """
        
        response = await llm.ainvoke(analysis_prompt) # Use async invoke if available, otherwise invoke
        content_str = response.content.replace('```json', '').replace('```', '').strip()
        report_json = json.loads(content_str)
        report_json["fileSize"] = os.path.getsize(temp_filename)
        report_json["status"] = "complete"
        
        # 5. Update DB
        print("WORKER: Updating Database")
        data = {
            "id": file_name,
            "content": full_text[:5000],
            "metadata": report_json,
            "user_id": user_id
        }
        supabase.table("documents").upsert(data).execute()
        
        print(f"WORKER: Completed {file_name}")
        return {"status": "success", "report": report_json}

    except Exception as e:
        print("WORKER EXCEPTION TRACEBACK:")
        traceback.print_exc()
        return {"status": "error", "message": str(e)}
    finally:
        if 'temp_filename' in locals() and os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except:
                pass
