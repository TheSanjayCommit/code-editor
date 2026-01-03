import React from 'react';
import { X, FileCode, FileJson, FileType, File } from 'lucide-react';

export default function Tabs({ openFiles, activeFile, onSelect, onClose }) {
    if (openFiles.length === 0) return null;

    const getIcon = (path) => {
        if (path.endsWith('.js') || path.endsWith('.jsx')) return <FileCode className="w-4 h-4 text-yellow-500" />;
        if (path.endsWith('.json')) return <FileJson className="w-4 h-4 text-yellow-300" />;
        if (path.endsWith('.css')) return <FileType className="w-4 h-4 text-blue-400" />;
        return <File className="w-4 h-4 text-gray-400" />;
    };

    return (
        <div className="flex bg-[#252526] h-9 overflow-x-auto scrollbar-hide">
            {openFiles.map((file) => (
                <div
                    key={file.path}
                    className={`
            group flex items-center gap-2 px-3 min-w-[120px] max-w-[200px] border-r border-[#1e1e1e] cursor-pointer text-sm select-none
            ${activeFile?.path === file.path
                            ? 'bg-[#1e1e1e] text-white border-t border-t-blue-500'
                            : 'bg-[#2d2d2d] text-gray-400 hover:bg-[#2d2d2d]/80'}
          `}
                    onClick={() => onSelect(file)}
                >
                    {getIcon(file.path)}
                    <span className="truncate flex-1">{file.name}</span>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClose(file.path);
                        }}
                        className={`opacity-0 group-hover:opacity-100 hover:bg-gray-600 rounded p-0.5 ${activeFile?.path === file.path ? 'opacity-100' : ''}`}
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            ))}
        </div>
    );
}
