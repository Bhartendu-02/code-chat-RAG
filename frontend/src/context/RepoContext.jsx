import React, { createContext, useContext, useState } from 'react';
import { ingestRepo, getFileTree } from '../api/axios';

const RepoContext = createContext();

export const RepoProvider = ({ children }) => {
  const [repoName, setRepoName] = useState(null);
  const [files, setFiles] = useState([]);
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestError, setIngestError] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const loadRepo = async (repoUrl) => {
    setIsIngesting(true);
    setIngestError(null);
    setSelectedFile(null);
    
    try {
      const ingestResult = await ingestRepo(repoUrl);
      const name = ingestResult.repo_name;
      
      const treeResult = await getFileTree(name);
      
      setRepoName(name);
      setFiles(treeResult.files);
    } catch (err) {
      console.error('Ingest error details:', err);
      const detailMsg = err.response?.data?.detail || 'Failed to ingest repository. Make sure the URL is public and valid.';
      setIngestError(detailMsg);
      setRepoName(null);
      setFiles([]);
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <RepoContext.Provider
      value={{
        repoName,
        files,
        isIngesting,
        ingestError,
        selectedFile,
        loadRepo,
        setSelectedFile,
      }}
    >
      {children}
    </RepoContext.Provider>
  );
};

export const useRepo = () => {
  const context = useContext(RepoContext);
  if (!context) {
    throw new Error('useRepo must be used within a RepoProvider');
  }
  return context;
};
