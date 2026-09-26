import React, { useEffect, useState } from 'react';
import { useRepo } from '../context/RepoContext';
import { getFileContent } from '../api/axios';
import {
  FileCode,
  Copy,
  Check,
  Code2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

const CodeViewer = () => {
  const { repoName, selectedFile } = useRepo();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!selectedFile || !repoName) {
      setContent('');
      setError(null);
      return;
    }

    const fetchFileContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getFileContent(repoName, selectedFile);
        setContent(result.content);
      } catch (err) {
        console.error('Error fetching file content:', err);
        setError('Failed to load file content.');
      } finally {
        setLoading(false);
      }
    };

    fetchFileContent();
  }, [selectedFile, repoName]);

  const handleCopy = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  if (!selectedFile) {
    return (
      <div className="code-viewer-container empty">
        <div className="code-viewer-placeholder">
          <Code2 size={36} className="placeholder-icon" />
          <h4>Source Code Viewer</h4>
          <p>Select a file from the Explorer on the left, or click any citation pill in the chat to inspect the full file code.</p>
        </div>
      </div>
    );
  }

  const lines = content ? content.split('\n') : [];
  const fileName = selectedFile.split('/').pop();
  const dirPath = selectedFile.includes('/') ? selectedFile.substring(0, selectedFile.lastIndexOf('/')) : '';

  return (
    <div className="code-viewer-container">
      <div className="code-viewer-header">
        <div className="code-viewer-file-info">
          <FileCode size={16} className="code-header-icon" />
          <div className="code-breadcrumbs">
            {dirPath && <span className="dir-crumb">{dirPath} /</span>}
            <span className="file-crumb">{fileName}</span>
          </div>
          {!loading && !error && (
            <span className="line-count-badge">{lines.length} {lines.length === 1 ? 'line' : 'lines'}</span>
          )}
        </div>

        <div className="code-viewer-actions">
          <button
            onClick={handleCopy}
            disabled={loading || !content}
            className={`code-action-btn ${copied ? 'copied' : ''}`}
            title="Copy file contents"
          >
            {copied ? (
              <>
                <Check size={13} className="text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy size={13} />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="code-viewer-body">
        {loading ? (
          <div className="code-viewer-loading">
            <Loader2 size={24} className="spin-icon" />
            <span>Loading {fileName}...</span>
          </div>
        ) : error ? (
          <div className="code-viewer-error-box">
            <AlertCircle size={20} className="text-rose-400" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="code-editor-viewport">
            <div className="code-gutter" aria-hidden="true">
              {lines.map((_, i) => (
                <span key={i} className="line-number">{i + 1}</span>
              ))}
            </div>
            <pre className="code-content-block">
              <code>
                {lines.map((line, i) => (
                  <div key={i} className="code-line">
                    {line || ' '}
                  </div>
                ))}
              </code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeViewer;
