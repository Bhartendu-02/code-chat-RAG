import React, { useState, useEffect, useRef } from 'react';
import { useRepo } from '../context/RepoContext';
import { sendChatMessage } from '../api/axios';
import MessageBubble from './MessageBubble';
import {
  Send,
  MessageSquare,
  Sparkles,
  Trash2,
  Lock,
  Loader2,
  Terminal,
  CornerDownLeft,
  Lightbulb,
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'What is the project architecture and main flow?',
  'Where are the primary API routes defined?',
  'Explain how the core logic or processing works.',
  'What are the key dependencies and configuration options?',
];

const ChatPanel = () => {
  const { repoName } = useRepo();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    setMessages([]);
    setInput('');
  }, [repoName]);

  const handleSend = async (customPrompt) => {
    const questionText = (customPrompt || input).trim();
    if (!questionText || loading || !repoName) return;

    setInput('');
    setLoading(true);

    setMessages((prev) => [...prev, { role: 'user', content: questionText }]);

    try {
      const result = await sendChatMessage(repoName, questionText);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: result.answer,
          sources: result.sources,
        },
      ]);
    } catch (err) {
      console.error('Chat error details:', err);
      const detailMsg =
        err.response?.data?.detail ||
        'Unable to answer question at this time. Please ensure the backend is running and the repo is indexed.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: detailMsg,
          sources: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <div className="chat-panel-container">
      <div className="chat-panel-header">
        <div className="chat-panel-header-left">
          <div className="chat-status-dot online"></div>
          <span className="chat-panel-title">Repository Chat</span>
          {repoName && <span className="chat-panel-repo-badge">{repoName}</span>}
        </div>

        <div className="chat-panel-header-right">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="chat-clear-btn"
              title="Clear conversation"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      <div className="chat-messages-viewport">
        {!repoName ? (
          <div className="chat-welcome-placeholder">
            <div className="welcome-icon-box">
              <Lock size={28} className="text-slate-400" />
            </div>
            <h3>No Repository Loaded</h3>
            <p>
              Enter a public GitHub repository link above to index the source code and begin asking natural language questions.
            </p>
          </div>
        ) : messages.length === 0 ? (
          <div className="chat-welcome-placeholder with-prompts">
            <div className="welcome-icon-box active">
              <Sparkles size={28} className="text-blue-400" />
            </div>
            <h3>Ask anything about <span className="highlight-repo">{repoName}</span></h3>
            <p>
              The AI answers with ground-truth code citations retrieved from the ChromaDB vector index.
            </p>

            <div className="starter-prompts-section">
              <div className="starter-prompts-label">
                <Lightbulb size={13} className="text-amber-400" />
                <span>Suggested Questions</span>
              </div>
              <div className="starter-prompts-grid">
                {SUGGESTED_QUESTIONS.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="starter-prompt-card"
                  >
                    <span>{q}</span>
                    <CornerDownLeft size={12} className="prompt-icon" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <MessageBubble
              key={idx}
              role={msg.role}
              content={msg.content}
              sources={msg.sources}
            />
          ))
        )}

        {loading && (
          <div className="chat-loading-indicator">
            <Loader2 size={16} className="spin-icon text-blue-400" />
            <span>Searching vector embeddings and generating answer...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input-area">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="chat-input-form">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              repoName
                ? "Ask a question about this codebase (e.g. 'How does authentication work?')..."
                : "Load a repository first to enable chat..."
            }
            disabled={!repoName || loading}
            className="chat-textarea-input"
            rows={1}
          />
          <button
            type="submit"
            disabled={!repoName || loading || !input.trim()}
            className="chat-send-btn"
            title="Send message (Enter)"
          >
            <Send size={15} />
          </button>
        </form>
        <div className="chat-input-footer">
          <span>Press <kbd>Enter</kbd> to send, <kbd>Shift + Enter</kbd> for new line</span>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
