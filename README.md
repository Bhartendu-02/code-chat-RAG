# CodeChat RAG

A web application that allows you to chat with any public GitHub repository using Retrieval-Augmented Generation (RAG). Paste a repo link, index its files into a vector store, and ask questions about architecture, functions, logic, or dependencies with grounded answers and file citations.

---

## Overview

When onboarding to a new codebase or reviewing an open-source project, understanding how components connect can take hours of manual browsing. CodeChat automates code exploration by:

1. **Cloning & Parsing**: Shallow-clones the target public repository and filters out binaries, dependencies (`node_modules`, `venv`, `.git`), and lockfiles.
2. **Chunking & Embeddings**: Splits source files into logical chunks and generates vector representations using Google Gemini (`models/embedding-001`).
3. **Local Vector Storage**: Indexes and stores embeddings locally in ChromaDB on disk.
4. **Context-Aware Q&A**: On each query, retrieves the top 5 most relevant code chunks and prompts Gemini 1.5 Flash to answer strictly using the retrieved context, citing exact source files.
5. **Interactive UI**: A split-view React interface with an expandable file tree, code viewer, and chat panel.

---

## Tech Stack

- **Backend**: Python 3.10+, FastAPI, Uvicorn
- **LLM & Embeddings**: Google Gemini (`gemini-1.5-flash`, `models/embedding-001`) via `langchain-google-genai`
- **Vector Database**: ChromaDB (`chromadb` / `langchain-community`)
- **Git Ingestion**: GitPython
- **Frontend**: React 19, Vite, Axios, Lucide React
- **Styling**: Vanilla CSS (custom dark theme)

---

## Project Structure

```text
code-chat-RAG/
├── backend/
│   ├── config.py               # Environment variables and settings
│   ├── main.py                 # FastAPI entry point & CORS configuration
│   ├── models/
│   │   └── schemas.py          # Pydantic request/response schemas
│   ├── routes/
│   │   ├── chat_routes.py      # POST /api/chat
│   │   ├── file_routes.py      # GET /api/repo/{name}/files & file-content
│   │   └── repo_routes.py      # POST /api/repo/ingest
│   ├── services/
│   │   ├── chunking_service.py # Text splitting for code
│   │   ├── embedding_service.py# Google Gemini embedding client
│   │   ├── git_service.py      # Git clone & repo naming
│   │   ├── rag_service.py      # Prompt construction & LLM invocation
│   │   └── vectorstore_service.py # ChromaDB index creation & loading
│   └── utils/
│       └── file_utils.py       # File traversal & encoding safety
├── frontend/
│   ├── index.html
│   ├── src/
│   │   ├── api/axios.js         # Axios instance configured with base URL
│   │   ├── components/
│   │   │   ├── ChatPanel.jsx    # Chat input, query suggestions & history
│   │   │   ├── CodeViewer.jsx   # Code viewer with line numbers
│   │   │   ├── FileTree.jsx     # Hierarchical repository explorer
│   │   │   ├── MessageBubble.jsx# Message bubble with citation badges
│   │   │   └── RepoInput.jsx    # GitHub repository URL input & trigger
│   │   ├── context/
│   │   │   └── RepoContext.jsx  # Global repo and selection state
│   │   ├── pages/Home.jsx       # Main application layout
│   │   ├── App.jsx
│   │   └── index.css            # Global theme styles and layout
│   └── vite.config.js
└── README.md
```

---

## Getting Started

### Prerequisites

- Python 3.10 or higher
- Node.js 18 or higher & npm
- Git installed on your system PATH
- A Google Gemini API key (from [Google AI Studio](https://aistudio.google.com/))

---

### 1. Backend Setup

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # On Windows:
   python -m venv venv
   .\venv\Scripts\activate

   # On macOS / Linux:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open `.env` and set your key:
   ```env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=8000
   CLIENT_URL=http://localhost:5173
   CHROMA_PERSIST_DIR=./chroma_store
   CLONE_DIR=./cloned_repos
   MAX_FILE_SIZE_KB=500
   ```

5. Run the FastAPI development server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The API will be available at `http://localhost:8000`. You can test endpoints via Swagger docs at `http://localhost:8000/docs`.

---

### 2. Frontend Setup

1. Open a second terminal and navigate to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure frontend environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Ensure the API URL points to your backend:
   ```env
   VITE_API_BASE_URL=http://localhost:8000/api
   ```

4. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

---

## API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | Health check |
| `POST` | `/api/repo/ingest` | Clones a public repository, chunks files, and builds ChromaDB vectors |
| `GET` | `/api/repo/{repo_name}/files` | Returns a list of all parsed files in the repository |
| `GET` | `/api/repo/{repo_name}/file-content?path=...` | Returns the UTF-8 text content of a specific file |
| `POST` | `/api/chat` | Queries the RAG pipeline with a question and returns an answer with source citations |

---

## Notes & Limitations

- **Public Repositories**: Currently supports public GitHub repositories over HTTPS.
- **File Filters**: Common build directories (`dist`, `build`, `node_modules`, `venv`, `__pycache__`, `.git`), binary files, and files larger than 500 KB are excluded during indexing.
- **Persistence**: Cloned repositories and ChromaDB embeddings are stored locally inside `backend/cloned_repos/` and `backend/chroma_store/` (both are gitignored).
- **Gemini Free Tier**: If indexing very large repositories with hundreds of files, be aware of rate limits on free Gemini API keys.
