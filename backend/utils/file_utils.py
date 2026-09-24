import os

SUPPORTED_EXTENSIONS = ['.py', '.js', '.jsx', '.ts', '.tsx', '.java', '.go', '.rb', '.cpp', '.c', '.h', '.md', '.json']
IGNORED_DIRS = ['.git', 'node_modules', 'venv', '__pycache__', 'dist', 'build', '.next', 'vendor']

def walk_repo_files(repo_path: str, max_file_size_kb: int) -> list[dict]:
    valid_files = []
    
    for root, dirs, files in os.walk(repo_path):
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
        
        for file in files:
            _, ext = os.path.splitext(file)
            if ext.lower() not in SUPPORTED_EXTENSIONS:
                continue
                
            full_path = os.path.join(root, file)
            try:
                size_bytes = os.path.getsize(full_path)
            except OSError:
                continue
                
            size_kb = size_bytes / 1024.0
            if size_kb > max_file_size_kb:
                continue
                
            relative_path = os.path.relpath(full_path, repo_path).replace('\\', '/')
            
            valid_files.append({
                "path": relative_path,
                "full_path": os.path.abspath(full_path),
                "size_kb": size_kb
            })
            
    return valid_files

def read_file_safe(full_path: str) -> str | None:
    try:
        with open(full_path, 'r', encoding='utf-8', errors='strict') as f:
            return f.read()
    except (UnicodeDecodeError, OSError):
        return None

