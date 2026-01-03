import React, { useState } from 'react';
import {
    FileCode,
    FileJson,
    FileType,
    File,
    Folder,
    FolderOpen,
    ChevronRight,
    ChevronDown,
    Plus,
    FolderPlus,
    RefreshCw
} from 'lucide-react';

const FileIcon = ({ name }) => {
    if (name.endsWith('.js') || name.endsWith('.jsx')) return <FileCode className="w-4 h-4 text-yellow-500" />;
    if (name.endsWith('.ts') || name.endsWith('.tsx')) return <FileCode className="w-4 h-4 text-blue-500" />;
    if (name.endsWith('.json')) return <FileJson className="w-4 h-4 text-yellow-300" />;
    if (name.endsWith('.css')) return <FileType className="w-4 h-4 text-blue-400" />;
    if (name.endsWith('.html')) return <FileType className="w-4 h-4 text-orange-500" />;
    return <File className="w-4 h-4 text-gray-400" />;
};

const ContextMenu = ({ x, y, onClose, onDelete, onRename, node }) => (
    <div
        className="fixed z-50 bg-[#252526] border border-[#454545] shadow-xl rounded py-1 min-w-[160px]"
        style={{ top: y, left: x }}
    >
        <button
            className="w-full text-left px-4 py-1.5 text-sm hover:bg-[#094771] text-gray-200"
            onClick={(e) => { e.stopPropagation(); onRename(node.path); onClose(); }}
        >
            Rename
        </button>
        <button
            className="w-full text-left px-4 py-1.5 text-sm hover:bg-[#094771] text-gray-200"
            onClick={(e) => { e.stopPropagation(); onDelete(node.path); onClose(); }}
        >
            Delete
        </button>
        <div className="h-px bg-[#454545] my-1" />
        <button
            className="w-full text-left px-4 py-1.5 text-sm hover:bg-[#094771] text-gray-200"
            onClick={onClose}
        >
            Cancel
        </button>
    </div>
);

const FileNode = ({ node, level, activeFile, onSelect, onContextMenu }) => {
    const [isOpen, setIsOpen] = useState(false);
    const isSelected = activeFile?.path === node.path;
    const isFolder = node.type === 'folder';

    const handleClick = (e) => {
        e.stopPropagation();
        if (isFolder) {
            setIsOpen(!isOpen);
        } else {
            onSelect(node);
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onContextMenu(e, node);
    };

    return (
        <div>
            <div
                className={`
                    flex items-center gap-1.5 py-1 px-4 cursor-pointer text-sm select-none
                    ${isSelected ? 'bg-[#37373d] text-white' : 'text-gray-400 hover:bg-[#2a2d2e] hover:text-gray-200'}
                `}
                style={{ paddingLeft: `${level * 12 + 12}px` }}
                onClick={handleClick}
                onContextMenu={handleContextMenu}
            >
                {isFolder && (
                    <span className="text-gray-500">
                        {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </span>
                )}
                {!isFolder && <span className="w-4" />} {/* Spacer */}

                {isFolder ? (
                    isOpen ? <FolderOpen className="w-4 h-4 text-blue-400" /> : <Folder className="w-4 h-4 text-blue-400" />
                ) : (
                    <FileIcon name={node.name} />
                )}
                <span className="truncate">{node.name}</span>
            </div>
            {isFolder && isOpen && node.children && (
                <div>
                    {node.children.map(child => (
                        <FileNode
                            key={child.path}
                            node={child}
                            level={level + 1}
                            activeFile={activeFile}
                            onSelect={onSelect}
                            onContextMenu={onContextMenu}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function FileTree({ files, activeFile, onSelect, onRefresh, onCreateFile, onCreateFolder, onDelete, onRename }) {
    const [contextMenu, setContextMenu] = useState(null);

    // Close context menu on click elsewhere
    React.useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    const handleContextMenu = (e, node) => {
        setContextMenu({
            x: e.clientX,
            y: e.clientY,
            node
        });
    };

    return (
        <div className="flex flex-col w-full h-full relative">
            <div className="flex items-center justify-between px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider group bg-[#252526]">
                <span>Explorer</span>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="hover:text-white" title="New File" onClick={onCreateFile}><Plus className="w-4 h-4" /></button>
                    <button className="hover:text-white" title="New Folder" onClick={onCreateFolder}><FolderPlus className="w-4 h-4" /></button>
                    <button className="hover:text-white" title="Refresh" onClick={onRefresh}><RefreshCw className="w-4 h-4" /></button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {(!files || files.length === 0) && (
                    <div className="p-4 text-xs text-gray-500 italic">
                        No files found.
                    </div>
                )}
                {files && files.map((node) => (
                    <FileNode
                        key={node.path}
                        node={node}
                        level={0}
                        activeFile={activeFile}
                        onSelect={onSelect}
                        onContextMenu={handleContextMenu}
                    />
                ))}
            </div>

            {contextMenu && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    node={contextMenu.node}
                    onClose={() => setContextMenu(null)}
                    onDelete={onDelete}
                    onRename={onRename}
                />
            )}
        </div>
    );
}
