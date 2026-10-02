import React from 'react';
import RepoInput from '../components/RepoInput';
import FileTree from '../components/FileTree';
import CodeViewer from '../components/CodeViewer';
import ChatPanel from '../components/ChatPanel';
import { useRepo } from '../context/RepoContext';
import {
  Code2,
  Database,
  Cpu,
  CheckCircle2,
  CircleDot,
} from 'lucide-react';

const Home = () => {
  const { repoName, selectedFile, files, isIngesting } = useRepo();

  return (
    <div className="home-layout">
      <header className="home-header">
        <div className="logo-section">
          <div className="logo-icon-wrapper">
            <Code2 size={20} className="logo-icon text-blue-400" />
          </div>
          <div className="logo-text-group">
            <h1 className="logo-title">CodeChat</h1>
            <span className="logo-tag">RAG</span>
          </div>
        </div>

        <div className="header-center-area">
          <RepoInput />
        </div>
      </header>

      <main className="home-main-grid">
        <section className="left-workspace-pane">
          <div className="explorer-subpane">
            <FileTree />
          </div>
          <div className="viewer-subpane">
            <CodeViewer />
          </div>
        </section>

        <section className="right-chat-pane">
          <ChatPanel />
        </section>
      </main>

      <footer className="home-status-bar">
        <div className="status-item">
          <CircleDot size={12} className={`status-indicator ${repoName ? 'active' : isIngesting ? 'pending' : ''}`} />
          <span>{isIngesting ? 'Ingesting repository...' : repoName ? `Repository: ${repoName}` : 'No repository loaded'}</span>
        </div>

        {selectedFile && (
          <div className="status-item active-file">
            <span>Active: {selectedFile}</span>
          </div>
        )}

        <div className="status-right-group">
          <div className="status-item">
            <Database size={12} className="text-slate-400" />
            <span>ChromaDB VectorStore</span>
          </div>
          <div className="status-item">
            <Cpu size={12} className="text-slate-400" />
            <span>Gemini RAG Pipeline</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
