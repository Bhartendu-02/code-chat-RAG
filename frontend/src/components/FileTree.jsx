import React, { useState, useMemo } from 'react';
import { useRepo } from '../context/RepoContext';
import {
  Folder,
  FolderOpen,
  FileCode2,
  FileText,
  FileJson,
  FileSpreadsheet,
  FileCode,
  File,
  Search,
  X,
  ChevronRight,
  ChevronDown,
  Layers,
} from 'lucide-react';

const getFileIcon = (fileName) => {
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'ts':
    case 'tsx':
      return <FileCode2 className="tree-file-icon text-amber-400" size={15} />;
    case 'py':
      return <FileCode className="tree-file-icon text-sky-400" size={15} />;
    case 'json':
      return <FileJson className="tree-file-icon text-yellow-300" size={15} />;
    case 'md':
    case 'txt':
    case 'rst':
      return <FileText className="tree-file-icon text-slate-300" size={15} />;
    case 'csv':
    case 'tsv':
      return <FileSpreadsheet className="tree-file-icon text-emerald-400" size={15} />;
    case 'css':
    case 'scss':
    case 'html':
      return <FileCode2 className="tree-file-icon text-indigo-400" size={15} />;
    default:
      return <File className="tree-file-icon text-slate-400" size={15} />;
  }
};

const buildFileTree = (paths) => {
  const root = { name: '', isDir: true, children: {}, fullPath: '' };

  paths.forEach((path) => {
    const parts = path.split('/');
    let current = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const fullPath = parts.slice(0, index + 1).join('/');

      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          isDir: !isLast,
          fullPath: fullPath,
          children: {},
        };
      }
      current = current.children[part];
    });
  });

  return root;
};

const TreeNode = ({ node, level = 0, selectedFile, onSelectFile, expandedDirs, toggleDir, searchTerm }) => {
  if (!node.name) {
    return (
      <>
        {Object.values(node.children)
          .sort((a, b) => (a.isDir === b.isDir ? a.name.localeCompare(b.name) : a.isDir ? -1 : 1))
          .map((child) => (
            <TreeNode
              key={child.fullPath}
              node={child}
              level={level}
              selectedFile={selectedFile}
              onSelectFile={onSelectFile}
              expandedDirs={expandedDirs}
              toggleDir={toggleDir}
              searchTerm={searchTerm}
            />
          ))}
      </>
    );
  }

  const isExpanded = expandedDirs[node.fullPath] !== false; // default expanded

  if (node.isDir) {
    const childList = Object.values(node.children).sort((a, b) =>
      a.isDir === b.isDir ? a.name.localeCompare(b.name) : a.isDir ? -1 : 1
    );

    return (
      <div className="tree-folder-node">
        <div
          className="tree-item tree-folder-row"
          style={{ paddingLeft: `${Math.max(8, level * 14 + 8)}px` }}
          onClick={() => toggleDir(node.fullPath)}
        >
          <span className="tree-chevron">
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
          <span className="tree-folder-icon">
            {isExpanded ? <FolderOpen size={16} className="text-blue-400" /> : <Folder size={16} className="text-blue-400" />}
          </span>
          <span className="tree-label folder-name">{node.name}</span>
        </div>

        {isExpanded && (
          <div className="tree-children-container">
            {childList.map((child) => (
              <TreeNode
                key={child.fullPath}
                node={child}
                level={level + 1}
                selectedFile={selectedFile}
                onSelectFile={onSelectFile}
                expandedDirs={expandedDirs}
                toggleDir={toggleDir}
                searchTerm={searchTerm}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  const isSelected = selectedFile === node.fullPath;

  return (
    <div
      className={`tree-item tree-file-row ${isSelected ? 'selected' : ''}`}
      style={{ paddingLeft: `${Math.max(8, level * 14 + 22)}px` }}
      onClick={() => onSelectFile(node.fullPath)}
      title={node.fullPath}
    >
      {getFileIcon(node.name)}
      <span className="tree-label file-name">{node.name}</span>
    </div>
  );
};

const FileTree = () => {
  const { files, selectedFile, setSelectedFile } = useRepo();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDirs, setExpandedDirs] = useState({});

  const toggleDir = (dirPath) => {
    setExpandedDirs((prev) => ({
      ...prev,
      [dirPath]: prev[dirPath] === undefined ? false : !prev[dirPath],
    }));
  };

  const filteredFiles = useMemo(() => {
    if (!files) return [];
    if (!searchTerm.trim()) return files;
    const term = searchTerm.toLowerCase();
    return files.filter((f) => f.toLowerCase().includes(term));
  }, [files, searchTerm]);

  const treeRoot = useMemo(() => {
    return buildFileTree(filteredFiles);
  }, [filteredFiles]);

  if (!files || files.length === 0) {
    return (
      <div className="file-tree-container empty">
        <div className="file-tree-empty-state">
          <Layers size={32} className="empty-state-icon" />
          <h4>No Repository Loaded</h4>
          <p>Load a public GitHub repository to browse files and view codebase structure.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="file-tree-container">
      <div className="file-tree-header">
        <div className="file-tree-title-row">
          <span className="file-tree-title">Explorer</span>
          <span className="file-count-badge">{filteredFiles.length} {filteredFiles.length === 1 ? 'file' : 'files'}</span>
        </div>

        <div className="file-search-box">
          <Search size={13} className="search-icon" />
          <input
            type="text"
            placeholder="Filter files (e.g. .py, utils)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="file-search-input"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="search-clear-btn"
              title="Clear search"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      <div className="file-tree-list-viewport">
        {filteredFiles.length === 0 ? (
          <div className="no-search-results">
            <span>No files match "{searchTerm}"</span>
          </div>
        ) : (
          <TreeNode
            node={treeRoot}
            level={0}
            selectedFile={selectedFile}
            onSelectFile={setSelectedFile}
            expandedDirs={expandedDirs}
            toggleDir={toggleDir}
            searchTerm={searchTerm}
          />
        )}
      </div>
    </div>
  );
};

export default FileTree;
