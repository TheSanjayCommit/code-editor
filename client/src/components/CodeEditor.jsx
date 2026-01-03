import React from 'react';
import Editor from '@monaco-editor/react';

export default function CodeEditor({ activeFile, onEdit, options = {}, theme = "vs-dark" }) {
    if (!activeFile) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500 bg-[#1e1e1e]">
                Select a file to view code
            </div>
        );
    }

    // Simple language detection
    const getLanguage = (path) => {
        if (path.endsWith('.js') || path.endsWith('.jsx')) return 'javascript';
        if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'typescript';
        if (path.endsWith('.css')) return 'css';
        if (path.endsWith('.html')) return 'html';
        if (path.endsWith('.json')) return 'json';
        return 'plaintext';
    };

    const defaultOptions = {
        minimap: { enabled: false },
        fontSize: 14,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        wordWrap: 'on',
        formatOnPaste: true,
        formatOnType: true,
    };

    return (
        <div className="h-full w-full overflow-hidden">
            <Editor
                height="100%"
                theme={theme}
                path={activeFile.path}
                defaultLanguage={getLanguage(activeFile.path)}
                defaultValue={activeFile.content}
                value={activeFile.content}
                onChange={(value) => onEdit(activeFile.path, value)}
                options={{ ...defaultOptions, ...options }}
            />
        </div>
    );
}
