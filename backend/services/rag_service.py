from langchain_google_genai import ChatGoogleGenerativeAI
from config import settings
from services.vectorstore_service import load_vectorstore

def answer_question(repo_name: str, question: str, chat_history: list[dict] = None) -> dict:
    vectorstore = load_vectorstore(repo_name)
    retrieved_docs = vectorstore.similarity_search(question, k=5)
    
    context_parts = []
    for doc in retrieved_docs:
        file_path = doc.metadata.get("file_path", "unknown")
        context_parts.append(f"// File: {file_path}\n{doc.page_content}")
        
    context = "\n\n".join(context_parts)
    
    prompt = f"""You are a senior software engineer explaining a codebase to a teammate.
Use ONLY the following code context to answer. If the answer isn't in the
context, say so honestly instead of guessing.

CODE CONTEXT:
{context}

QUESTION: {question}

Answer clearly, and mention which file(s) your answer is based on."""

    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash",
        google_api_key=settings.GEMINI_API_KEY
    )
    response = llm.invoke(prompt)
    
    unique_sources = list(set(doc.metadata.get("file_path") for doc in retrieved_docs if doc.metadata.get("file_path")))
    
    return {
        "answer": response.content,
        "sources": unique_sources
    }

