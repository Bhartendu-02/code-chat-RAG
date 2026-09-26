import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const ingestRepo = async (repoUrl) => {
  const response = await api.post('/repo/ingest', { repo_url: repoUrl });
  return response.data;
};

export const sendChatMessage = async (repoName, question) => {
  const response = await api.post('/chat', { repo_name: repoName, question });
  return response.data;
};

export const getFileTree = async (repoName) => {
  const response = await api.get(`/repo/${repoName}/files`);
  return response.data;
};

export const getFileContent = async (repoName, path) => {
  const response = await api.get(`/repo/${repoName}/file-content`, {
    params: { path },
  });
  return response.data;
};

export default api;
