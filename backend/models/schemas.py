from pydantic import BaseModel
from typing import List

class IngestRequest(BaseModel):
    repo_url: str

class IngestResponse(BaseModel):
    repo_name: str
    file_count: int
    chunk_count: int
    message: str

class ChatRequest(BaseModel):
    repo_name: str
    question: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[str]

class FileTreeResponse(BaseModel):
    repo_name: str
    files: List[str]

