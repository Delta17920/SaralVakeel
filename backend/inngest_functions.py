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
from langchain_cohere import CohereEmbeddings
from langchain_groq import ChatGroq
from langchain.schema import Document
from supabase import create_client, Client
from dotenv import load_dotenv

from inngest_client import inngest_client
from typing import List, Dict, Any, Tuple, Optional
from langchain_community.vectorstores import SupabaseVectorStore
from langchain.schema import Document

class CustomSupabaseVectorStore(SupabaseVectorStore):
    def similarity_search_by_vector_with_relevance_scores(
        self,
        query: List[float],
        k: int,
        filter: Optional[Dict[str, Any]] = None,
        postgrest_filter: Optional[str] = None,
        score_threshold: Optional[float] = None,
        **kwargs: Any,
    ) -> List[Tuple[Document, float]]:
        match_documents_params = {
            "query_embedding": query,
            "filter": filter or {},
            "match_count": k,
            "match_threshold": score_threshold or 0.0
        }
        
        query_builder = self._client.rpc(self.query_name, match_documents_params)

        if postgrest_filter:
            query_builder.params = query_builder.params.set("and", f"({postgrest_filter})")

        res = query_builder.execute()

        match_result = [
            (
                Document(
                    metadata=search.get("metadata", {}),
                    page_content=search.get("content", ""),
                ),
                search.get("similarity", 0.0),
            )
            for search in res.data
            if search.get("content")
        ]
        
        return match_result

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

supabase: Client = None
if SUPABASE_URL and SUPABASE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# Global initialization removed to prevent import-time crashes.
# embeddings and llm will be initialized inside the worker function.

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
        
        embeddings = CohereEmbeddings(model="embed-english-v3.0", cohere_api_key=os.environ.get("COHERE_API_KEY"))
        llm = ChatGroq(model="groq/compound-mini", api_key=os.environ.get("GROQ_API_KEY"), temperature=0.1)

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
        
        # 3. Store Vectors & Retrieve Context
        print(f"WORKER: Storing {len(docs)} vectors")
        context = ""
        if docs:
            vector_store = CustomSupabaseVectorStore.from_documents(
                docs, embeddings, client=supabase, 
                table_name="document_chunks_1024", query_name="match_documents_1024"
            )
            
            # Immediately retrieve the 8 most relevant chunks for the summary
            retriever = vector_store.as_retriever(search_kwargs={"k": 8})
            relevant_docs = retriever.invoke("Identify the key terms, parties involved, legal obligations, and potential risks in this document.")
            context = "\n\n".join([doc.page_content for doc in relevant_docs])

        # 4. Generate AI Report
        print("WORKER: Generating AI Report")
        analysis_prompt = f"""
        Analyze these excerpts from a legal document (Title: {file_name}) and extract JSON metadata.
        Focus on extracting:
        - Key Terms
        - Parties Involved
        - Obligations
        - Risks

        Document Excerpts: 
        {context}
        
        Return ONLY valid JSON with this structure:
        {{
            "documentTitle": "Inferred Title",
            "documentType": "Contract Type",
            "summary": "Executive summary",
            "keyTerms": ["list of key defined terms found in the doc"],
            "obligations": ["detailed list of key obligations"],
            "parties": [
                {{"name": "Party A", "type": "Individual/Company", "role": "Buyer/Seller etc"}}
            ],
            "risks": ["detailed list of potential legal risks"],
            "riskScore": 1-10
        }}
        """
        
        response = await llm.ainvoke(analysis_prompt)
        content_str = response.content
        print(f"WORKER: Raw LLM Response: {content_str[:500]}...")

        # Robust JSON Extraction
        import re
        json_match = re.search(r"\{.*\}", content_str, re.DOTALL)
        if json_match:
            content_str = json_match.group(0)
        else:
             content_str = content_str.replace('```json', '').replace('```', '').strip()

        report_json = json.loads(content_str)
        
        # Normalize keys
        def normalize_keys(data):
            if not isinstance(data, dict): return data
            new_data = {}
            for k, v in data.items():
                if k.lower() in ['keyterms', 'key_terms', 'terms']: new_key = 'keyTerms'
                elif k.lower() in ['riskscore', 'risk_score', 'risk_level']: new_key = 'riskScore'
                elif k.lower() in ['documenttitle', 'document_title', 'title']: new_key = 'documentTitle'
                elif k.lower() in ['documenttype', 'document_type', 'type']: new_key = 'documentType'
                else: new_key = k
                new_data[new_key] = v
            return new_data

        report_json = normalize_keys(report_json)

        # Ensure required fields exist
        if "documentTitle" not in report_json: report_json["documentTitle"] = file_name
        if "keyTerms" not in report_json: report_json["keyTerms"] = []
        if "parties" not in report_json: report_json["parties"] = []
        if "risks" not in report_json: report_json["risks"] = []
        if "obligations" not in report_json: report_json["obligations"] = []
        report_json["filePath"] = file_path 
        report_json["fileName"] = file_name
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
        try:
            if 'file_name' in locals() and 'user_id' in locals():
                supabase.table("documents").update({
                    "metadata": {
                        "status": "error", 
                        "error_message": str(e),
                        "documentType": "Unsupported or Corrupted File"
                    }
                }).eq("id", file_name).eq("user_id", user_id).execute()
        except Exception as db_err:
            print(f"Failed to update document status to error: {str(db_err)}")
        return {"status": "error", "message": str(e)}
    finally:
        if 'temp_filename' in locals() and os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except:
                pass
