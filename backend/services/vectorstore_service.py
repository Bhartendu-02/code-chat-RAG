import os
import shutil
from langchain_community.vectorstores import Chroma
from services.embedding_service import get_embedding_function
from config import settings

def build_vectorstore(repo_name: str, chunks: list[dict]) -> Chroma:
    persist_directory = os.path.join(settings.CHROMA_PERSIST_DIR, repo_name)
    
    if os.path.exists(persist_directory):
        def remove_readonly(func, path, exc):
            import stat
            os.chmod(path, stat.S_IWRITE)
            func(path)
        shutil.rmtree(persist_directory, onexc=remove_readonly)
        
    os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)
    
    texts = [c["text"] for c in chunks]
    metadatas = [c["metadata"] for c in chunks]
    ids = [c["id"] for c in chunks]
    embedding = get_embedding_function()
    
    vectorstore = Chroma.from_texts(
        texts=texts,
        metadatas=metadatas,
        ids=ids,
        embedding=embedding,
        persist_directory=persist_directory
    )
    
    return vectorstore

def load_vectorstore(repo_name: str) -> Chroma:
    persist_directory = os.path.join(settings.CHROMA_PERSIST_DIR, repo_name)
    
    if not os.path.exists(persist_directory):
        raise FileNotFoundError(f"No persistent vector store found for repository: {repo_name}")
        
    embedding = get_embedding_function()
    
    return Chroma(
        persist_directory=persist_directory,
        embedding_function=embedding
    )

