from fastapi import APIRouter, HTTPException
from models.schemas import ChatRequest, ChatResponse
from services.rag_service import answer_question

router = APIRouter(prefix="/api/chat", tags=["Codebase Chat"])

@router.post("", response_model=ChatResponse)
async def chat_with_repo(request: ChatRequest):
    repo_name = request.repo_name.strip()
    question = request.question.strip()
    
    try:
        result = answer_question(repo_name, question)
    except FileNotFoundError:
        raise HTTPException(
            status_code=404,
            detail="Repo not found. Please ingest it first via /api/repo/ingest"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"An error occurred while answering your question: {str(e)}"
        )
        
    return ChatResponse(
        answer=result["answer"],
        sources=result["sources"]
    )

