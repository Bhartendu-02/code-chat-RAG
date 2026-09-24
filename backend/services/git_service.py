import os
import shutil
from urllib.parse import urlparse
import git
from config import settings

def get_repo_name(repo_url: str) -> str:
    parsed = urlparse(repo_url)
    path = parsed.path.strip('/')
    if path.endswith('.git'):
        path = path[:-4]
    return path.replace('/', '_')

def clone_repo(repo_url: str) -> str:
    folder_name = get_repo_name(repo_url)
    target_path = os.path.join(settings.CLONE_DIR, folder_name)

    os.makedirs(settings.CLONE_DIR, exist_ok=True)

    if os.path.exists(target_path):
        def remove_readonly(func, path, exc):
            import stat
            os.chmod(path, stat.S_IWRITE)
            func(path)
        shutil.rmtree(target_path, onexc=remove_readonly)

    try:
        git.Repo.clone_from(repo_url, target_path, depth=1)
    except git.exc.GitCommandError as e:
        raise ValueError("Could not clone repo. Check the URL is a valid public GitHub repository.") from e

    return target_path

