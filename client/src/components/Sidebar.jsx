import React from 'react';
import FileTree from './FileTree';
import SearchSidebar from './SearchSidebar';
import SettingsSidebar from './SettingsSidebar';

export default function Sidebar({ activeView, files, activeFile, onFileSelect, onRefresh, onCreateFile, onCreateFolder, onDelete, onRename, settings, onUpdateSettings }) {
    if (!activeView) return null;

    if (activeView === 'search') {
        return <SearchSidebar onFileSelect={onFileSelect} />;
    }

    if (activeView === 'settings') {
        return <SettingsSidebar settings={settings} onUpdateSettings={onUpdateSettings} />;
    }

    if (activeView === 'preview') {
        // Preview is main panel content, so sidebar can be empty or show info?
        // Let's just return minimal sidebar for preview, or null if we want to hide it
        // Or render the explorer still? usually sidebar stays. 
        // Let's render explorer for 'preview' too, effectively sharing 'explorer' sidebar
        // But for now, let's keep it simple. User clicked "Preview" in sidebar? No, activity bar.
        // If activeView is 'preview', maybe sidebar should show instructions?

        // Actually, usually 'Preview' might just toggle the right panel and keep sidebar as Explorer.
        // But our layout logic makes 'activeView' drive both sidebar and main content? No, just sidebar.
        // Layout.jsx uses activeView to select Sidebar content.

        // Let's return Explorer as fallback or empty
        return (
            <div className="p-4 text-sm text-gray-400">
                Preview Mode Active
            </div>
        );
    }

    return (
        <div className="w-64 bg-[#252526] h-full flex flex-col border-r border-[#1e1e1e]">
            <div className="px-4 py-2.5 text-xs text-gray-400 font-medium uppercase tracking-wide">
                {activeView === 'explorer' ? 'Explorer' : activeView.toUpperCase()}
            </div>

            <div className="flex-1 overflow-y-auto">
                {activeView === 'explorer' && (
                    <div className="mt-2">
                        <div className="px-4 py-1 text-xs font-bold text-gray-300 flex items-center justify-between group cursor-pointer hover:bg-[#2a2d2e]">
                            <span>PROJECT</span>
                        </div>
                        <FileTree
                            files={files}
                            activeFile={activeFile}
                            onSelect={onFileSelect}
                            onRefresh={onRefresh}
                            onCreateFile={onCreateFile}
                            onCreateFolder={onCreateFolder}
                            onDelete={onDelete}
                            onRename={onRename}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
