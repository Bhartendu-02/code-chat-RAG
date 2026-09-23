import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    def __init__(self):
        self.GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
        if not self.GEMINI_API_KEY or self.GEMINI_API_KEY == "your_gemini_api_key_here":
            raise ValueError("GEMINI_API_KEY is not set in .env")

        try:
            self.PORT = int(os.environ.get("PORT", 8000))
        except ValueError:
            self.PORT = 8000

        self.CHROMA_PERSIST_DIR = os.environ.get("CHROMA_PERSIST_DIR", "./chroma_store")
        self.CLONE_DIR = os.environ.get("CLONE_DIR", "./cloned_repos")

        try:
            self.MAX_FILE_SIZE_KB = int(os.environ.get("MAX_FILE_SIZE_KB", 500))
        except ValueError:
            self.MAX_FILE_SIZE_KB = 500

settings = Settings()

