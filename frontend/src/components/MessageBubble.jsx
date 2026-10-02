import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useRepo } from '../context/RepoContext';
import {
  Copy,
  Check,
  FileCode,
  Sparkles,
  User,
  ExternalLink,
} from 'lucide-react';

const CodeBlock = ({ inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeText = String(children).replace(/\n$/, '');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code snippet:', err);
    }
  };

  if (inline) {
    return <code className="chat-inline-code" {...props}>{children}</code>;
  }

  return (
    <div className="chat-codeblock-container">
      <div className="chat-codeblock-header">
        <span className="codeblock-lang">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="codeblock-copy-btn"
          title="Copy code snippet"
        >
          {copied ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span>Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="chat-codeblock-pre">
        <code>{children}</code>
      </pre>
    </div>
  );
};

const MessageBubble = ({ role, content, sources }) => {
  const isUser = role === 'user';
  const { setSelectedFile } = useRepo();
  const [copiedMessage, setCopiedMessage] = useState(false);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  return (
    <div className={`message-bubble-wrapper ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-avatar">
        {isUser ? <User size={15} /> : <Sparkles size={15} />}
      </div>

      <div className="message-main">
        <div className="message-header-row">
          <span className="message-sender-name">
            {isUser ? 'You' : 'CodeChat Assistant'}
          </span>
          {!isUser && (
            <button
              onClick={handleCopyMessage}
              className="message-quick-copy-btn"
              title="Copy entire response"
            >
              {copiedMessage ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
          )}
        </div>

        <div className="message-bubble-content">
          {isUser ? (
            <p className="user-message-text">{content}</p>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown
                components={{
                  code: CodeBlock,
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {!isUser && sources && sources.length > 0 && (
          <div className="message-sources-panel">
            <div className="message-sources-title">
              <FileCode size={13} className="sources-icon" />
              <span>Source Citations:</span>
            </div>
            <div className="message-sources-list">
              {sources.map((src, i) => {
                const fileName = src.split('/').pop();
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedFile(src)}
                    className="message-source-chip"
                    title={`Click to open ${src} in code viewer`}
                  >
                    <span className="source-chip-name">{fileName}</span>
                    <ExternalLink size={10} className="source-chip-icon" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
