import React from 'react';
import ActivityBar from './ActivityBar';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';

export default function Layout({
    children,
    activeView,
    onNavigate,
    files,
    activeFile,
    onFileSelect,
    activeSidebar, // boolean to show/hide sidebar
    onRefresh,
    onCreateFile,
    onCreateFolder,
    onDelete,
    onRename,
    settings,
    onUpdateSettings
}) {
    return (
        <div className="flex flex-col h-screen bg-[#1e1e1e] text-white">
            <div className="flex-1 flex overflow-hidden">
                <ActivityBar activeView={activeView} onNavigate={onNavigate} />

                {activeSidebar && (
                    <Sidebar
                        activeView={activeView}
                        files={files}
                        activeFile={activeFile}
                        onFileSelect={onFileSelect}
                        onRefresh={onRefresh}
                        onCreateFile={onCreateFile}
                        onCreateFolder={onCreateFolder}
                        onDelete={onDelete}
                        onRename={onRename}
                        settings={settings}
                        onUpdateSettings={onUpdateSettings}
                    />
                )}

                <div className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e]">
                    {children}
                </div>
            </div>

            <StatusBar activeFile={activeFile} />
        </div>
    );
}
