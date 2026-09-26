import os
from fastapi import APIRouter, HTTPException, Query
from models.schemas import FileTreeResponse
from utils.file_utils import walk_repo_files, read_file_safe
from config import settings

router = APIRouter(prefix="/api/repo", tags=["Repository Files"])

@router.get("/{repo_name}/files", response_model=FileTreeResponse)
async def get_repository_files(repo_name: str):
    repo_path = os.path.join(settings.CLONE_DIR, repo_name)
    
    if not os.path.exists(repo_path) or not os.path.isdir(repo_path):
        raise HTTPException(
            status_code=404,
            detail="Repo not found. Ingest it first."
        )
        
    files_list = walk_repo_files(repo_path, settings.MAX_FILE_SIZE_KB)
    relative_paths = [file_entry["path"] for file_entry in files_list]
    
    return FileTreeResponse(
        repo_name=repo_name,
        files=sorted(relative_paths)
    )

@router.get("/{repo_name}/file-content")
async def get_repository_file_content(repo_name: str, path: str = Query(..., description="Relative file path inside the repo")):
    repo_path = os.path.join(settings.CLONE_DIR, repo_name)
    
    if not os.path.exists(repo_path) or not os.path.isdir(repo_path):
        raise HTTPException(
            status_code=404,
            detail="Repository not found."
        )
        
    repo_abs = os.path.abspath(repo_path)
    file_abs = os.path.abspath(os.path.join(repo_path, path))
    
    if not file_abs.startswith(repo_abs):
        raise HTTPException(
            status_code=400,
            detail="Invalid file path structure."
        )
        
    if not os.path.exists(file_abs) or not os.path.isfile(file_abs):
        raise HTTPException(
            status_code=404,
            detail=f"File not found: {path}"
        )
        
    content = read_file_safe(file_abs)
    if content is None:
        raise HTTPException(
            status_code=400,
            detail="File is binary or cannot be decoded as UTF-8 text."
        )
        
    return {
        "path": path,
        "content": content
    }

