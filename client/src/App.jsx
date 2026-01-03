import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from './components/Layout';
import CodeEditor from './components/CodeEditor';
import Tabs from './components/Tabs';
import TerminalPanel from './components/TerminalPanel';
import PromptBar from './components/PromptBar';
import PreviewPanel from './components/PreviewPanel';

// API URL (change port if backend differs)
// API URL (change port if backend differs)
const API_BASE = import.meta.env.PROD ? "" : "http://localhost:3000";

export default function App() {
  const [project, setProject] = useState({ files: [] });
  const [activeFile, setActiveFile] = useState(null);
  const [openFiles, setOpenFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  // UI State
  const [activeView, setActiveView] = useState('explorer');
  const [activeSidebar, setActiveSidebar] = useState(true);
  const [showTerminal, setShowTerminal] = useState(true);

  // Settings State
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('editorSettings');
    return saved ? JSON.parse(saved) : {
      fontSize: 14,
      wordWrap: 'on',
      minimap: false,
      theme: 'vs-dark'
    };
  });

  useEffect(() => {
    localStorage.setItem('editorSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Initial Load
  useEffect(() => {
    fetchFileTree();
  }, []);

  // Save Shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeFile) {
          saveFile(activeFile);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile]);

  const fetchFileTree = async () => {
    try {
      const res = await axios.get(`${API_BASE}/files`);
      setProject(prev => ({ ...prev, files: res.data.tree }));
    } catch (err) {
      console.error("Failed to fetch files:", err);
    }
  };

  const saveFile = async (file) => {
    try {
      await axios.post(`${API_BASE}/files/save`, {
        path: file.path,
        content: file.content
      });
      console.log("Saved:", file.path);
    } catch (err) {
      alert("Failed to save: " + err.message);
    }
  };

  const handleCreate = async (type) => {
    const name = prompt(`Enter ${type} name (relative path, e.g., src/NewComponent.jsx):`);
    if (!name) return;

    try {
      await axios.post(`${API_BASE}/files/create`, { path: name, type });
      fetchFileTree();
    } catch (err) {
      alert("Failed to create: " + err.message);
    }
  };

  const handleDelete = async (path) => {
    if (!confirm(`Are you sure you want to delete ${path}?`)) return;
    try {
      await axios.post(`${API_BASE}/files/delete`, { path });
      handleCloseFile(path);
      fetchFileTree();
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  const handleRename = async (oldPath) => {
    const newPath = prompt("Enter new path:", oldPath);
    if (!newPath || newPath === oldPath) return;

    try {
      await axios.post(`${API_BASE}/files/rename`, { oldPath, newPath });
      if (openFiles.find(f => f.path === oldPath)) {
        handleCloseFile(oldPath);
      }
      fetchFileTree();
    } catch (err) {
      alert("Failed to rename: " + err.message);
    }
  };

  const handleGenerate = async (prompt) => {
    setIsGenerating(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/generate`, { prompt });
      await fetchFileTree();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to generate project. Make sure the backend is running.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileSelect = async (fileNode) => {
    // If receiving file/line object from Search (has 'line' prop)
    const filePath = fileNode.path || fileNode;

    // Check if it's just a file node from FileTree
    const isFolder = fileNode.type === 'folder';
    if (isFolder) return;

    try {
      const res = await axios.get(`${API_BASE}/files/content?path=${encodeURIComponent(filePath)}`);
      const fullFile = {
        path: filePath,
        name: filePath.split('/').pop(), // Simple name extraction
        content: res.data.content,
        // .. preserve other props if needed
      };

      const existing = openFiles.find(f => f.path === fullFile.path);
      if (existing) {
        setActiveFile(existing);
      } else {
        setOpenFiles([...openFiles, fullFile]);
        setActiveFile(fullFile);
      }

      // If coming from search with line number, we might want to pass options to editor?
      // simple hack: stash line number in file object?
    } catch (err) {
      console.error("Failed to read file:", err);
    }
  };

  const handleCloseFile = (path) => {
    const newOpenFiles = openFiles.filter(f => f.path !== path);
    setOpenFiles(newOpenFiles);

    if (activeFile && activeFile.path === path) {
      if (newOpenFiles.length > 0) {
        setActiveFile(newOpenFiles[newOpenFiles.length - 1]);
      } else {
        setActiveFile(null);
      }
    }
  };

  const handleCodeEdit = (path, newVal) => {
    const updatedFile = { ...activeFile, content: newVal };
    if (activeFile && activeFile.path === path) {
      setActiveFile(updatedFile);
    }
    setOpenFiles(openFiles.map(f => f.path === path ? { ...f, content: newVal } : f));
  };

  const toggleSidebar = (view) => {
    if (activeView === view) {
      // Toggle off only if not preview (preview is main view)
      // Actually preview behaves like a sidebar item that swaps the main view OR sidebar?
      // Logic: If I click Explorer -> Sidebar=Explorer, Main=Editor
      // If I click Preview -> Sidebar=PreviewInfo, Main=PreviewFrame

      // If clicking same icon again, toggle sidebar visibility?
      if (activeView === 'preview') {
        // Switch back to explorer just to exit preview mode?
        setActiveView('explorer');
      } else {
        setActiveSidebar(!activeSidebar);
      }
    } else {
      setActiveView(view);
      setActiveSidebar(true);
    }
  };

  return (
    <Layout
      activeView={activeView}
      onNavigate={toggleSidebar}
      files={project?.files || []}
      activeFile={activeFile}
      onFileSelect={handleFileSelect}
      activeSidebar={activeSidebar}
      onRefresh={fetchFileTree}
      onCreateFile={() => handleCreate('file')}
      onCreateFolder={() => handleCreate('folder')}
      onDelete={handleDelete}
      onRename={handleRename}
      settings={settings}
      onUpdateSettings={updateSettings}
    >
      <div className="flex flex-col h-full w-full bg-[#1e1e1e]">
        {activeView === 'preview' ? (
          <PreviewPanel />
        ) : (
          <>
            <div className="bg-[#1e1e1e] p-2 border-b border-[#333]">
              <PromptBar onSubmit={handleGenerate} isGenerating={isGenerating} />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              <Tabs
                openFiles={openFiles}
                activeFile={activeFile}
                onSelect={(f) => setActiveFile(f)}
                onClose={handleCloseFile}
              />

              <div className="flex-1 relative">
                {error && (
                  <div className="absolute top-0 left-0 right-0 z-10 bg-red-900/50 text-red-200 px-4 py-2 text-sm border-b border-red-900">
                    Error: {error}
                  </div>
                )}
                <CodeEditor
                  activeFile={activeFile}
                  onEdit={handleCodeEdit}
                  theme={settings.theme}
                  options={{
                    fontSize: settings.fontSize,
                    wordWrap: settings.wordWrap,
                    minimap: { enabled: settings.minimap }
                  }}
                />
              </div>
            </div>

            {showTerminal && (
              <TerminalPanel onClose={() => setShowTerminal(false)} />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
