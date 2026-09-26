import React, { useState } from 'react';
import { useRepo } from '../context/RepoContext';
import {
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  ArrowRight,
  GitBranch,
} from 'lucide-react';

const GithubIcon = ({ size = 16, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);


const SAMPLE_REPOS = [
  { name: 'octocat/Spoon-Knife', url: 'https://github.com/octocat/Spoon-Knife' },
  { name: 'pallets/flask', url: 'https://github.com/pallets/flask' },
];

const RepoInput = () => {
  const { loadRepo, isIngesting, ingestError, repoName, files } = useRepo();
  const [url, setUrl] = useState('');
  const [showError, setShowError] = useState(true);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (url.trim()) {
      setShowError(true);
      loadRepo(url.trim());
    }
  };

  const handleSampleClick = (sampleUrl) => {
    setUrl(sampleUrl);
    setShowError(true);
    loadRepo(sampleUrl);
  };

  return (
    <div className="repo-input-bar">
      <div className="repo-input-main-group">
        <form onSubmit={handleSubmit} className="repo-input-form">
          <div className="repo-input-prefix">
            <GithubIcon size={16} className="github-icon" />
          </div>

          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste public GitHub repository URL..."
            disabled={isIngesting}
            className="repo-url-input"
          />

          {url && !isIngesting && (
            <button
              type="button"
              onClick={() => setUrl('')}
              className="repo-input-clear-btn"
              title="Clear input"
            >
              <X size={14} />
            </button>
          )}

          <button
            type="submit"
            disabled={isIngesting || !url.trim()}
            className={`repo-load-btn ${isIngesting ? 'loading' : ''}`}
          >
            {isIngesting ? (
              <>
                <Loader2 size={14} className="spin-icon" />
                <span>Indexing...</span>
              </>
            ) : (
              <>
                <span>Load Repo</span>
                <ArrowRight size={13} />
              </>
            )}
          </button>
        </form>

        {!repoName && !isIngesting && (
          <div className="sample-repos-group">
            <span className="sample-label">Try sample:</span>
            {SAMPLE_REPOS.map((sample) => (
              <button
                key={sample.name}
                type="button"
                onClick={() => handleSampleClick(sample.url)}
                className="sample-repo-pill"
              >
                {sample.name}
              </button>
            ))}
          </div>
        )}

        {repoName && !isIngesting && (
          <div className="repo-loaded-badge">
            <CheckCircle2 size={14} className="text-emerald-400" />
            <span className="loaded-label">Active:</span>
            <span className="loaded-name">{repoName}</span>
            {files && files.length > 0 && (
              <span className="loaded-count">({files.length} files indexed)</span>
            )}
          </div>
        )}
      </div>

      {ingestError && showError && (
        <div className="repo-error-banner">
          <AlertCircle size={15} className="text-rose-400 flex-shrink-0" />
          <span className="error-text">{ingestError}</span>
          <button
            onClick={() => setShowError(false)}
            className="error-dismiss-btn"
            title="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      )}
    </div>
  );
};

export default RepoInput;
