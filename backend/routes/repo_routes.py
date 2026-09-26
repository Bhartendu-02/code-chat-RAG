import re
from fastapi import APIRouter, HTTPException
from models.schemas import IngestRequest, IngestResponse
from services.git_service import clone_repo, get_repo_name
from utils.file_utils import walk_repo_files
from services.chunking_service import chunk_repo_files
from services.vectorstore_service import build_vectorstore
from config import settings

router = APIRouter(prefix="/api/repo", tags=["Repository Ingestion"])

@router.post("/ingest", response_model=IngestResponse)
async def ingest_repository(request: IngestRequest):
    repo_url = request.repo_url.strip()
    if not repo_url:
        raise HTTPException(status_code=400, detail="Repo URL is required")
        
    pattern = r'^https://github\.com/[\w.-]+/[\w.-]+(\.git)?/?$'
    if not re.match(pattern, repo_url):
        raise HTTPException(
            status_code=400,
            detail="Please provide a valid public GitHub repo URL, e.g. https://github.com/user/repo"
        )
        
    try:
        repo_name = get_repo_name(repo_url)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid repository URL provided.")
        
    try:
        repo_path = clone_repo(repo_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    files = walk_repo_files(repo_path, settings.MAX_FILE_SIZE_KB)
    file_count = len(files)
    
    if file_count == 0:
        raise HTTPException(status_code=400, detail="No supported source files found in this repo")
        
    chunks = chunk_repo_files(files)
    chunk_count = len(chunks)
    
    try:
        build_vectorstore(repo_name, chunks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate embeddings: {str(e)}")
        
    message = f"Successfully ingested {file_count} files into {chunk_count} chunks"
    return IngestResponse(
        repo_name=repo_name,
        file_count=file_count,
        chunk_count=chunk_count,
        message=message
    )

