from langchain_text_splitters import RecursiveCharacterTextSplitter
from utils.file_utils import read_file_safe

def chunk_repo_files(files: list[dict]) -> list[dict]:
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=150,
        separators=["\nclass ", "\ndef ", "\nfunction ", "\n\n", "\n", " "]
    )
    
    all_chunks = []
    
    for file_info in files:
        relative_path = file_info["path"]
        full_path = file_info["full_path"]
        
        content = read_file_safe(full_path)
        if content is None:
            continue
            
        chunks = text_splitter.split_text(content)
        
        for i, chunk_text in enumerate(chunks):
            chunk_id = f"{relative_path}::chunk_{i}"
            all_chunks.append({
                "id": chunk_id,
                "text": chunk_text,
                "metadata": {
                    "file_path": relative_path,
                    "chunk_index": i
                }
            })
            
    return all_chunks

