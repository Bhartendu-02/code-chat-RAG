from langchain_google_genai import GoogleGenerativeAIEmbeddings
from config import settings

def get_embedding_function() -> GoogleGenerativeAIEmbeddings:
    return GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=settings.GEMINI_API_KEY
    )

