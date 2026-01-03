import React, { useRef } from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';

const PREVIEW_URL = import.meta.env.PROD ? "/preview" : "http://localhost:3000/preview";

export default function PreviewPanel() {
    const iframeRef = useRef(null);

    const handleReload = () => {
        if (iframeRef.current) {
            iframeRef.current.src = iframeRef.current.src;
        }
    };

    const handleOpenExternal = () => {
        window.open(PREVIEW_URL, '_blank');
    };

    return (
        <div className="flex flex-col h-full bg-white">
            <div className="flex items-center justify-between px-4 py-2 bg-[#f3f3f3] border-b border-[#e1e4e8]">
                <div className="text-xs text-gray-500 font-mono truncate max-w-[300px]">
                    {PREVIEW_URL}
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleReload} className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Reload">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                    <button onClick={handleOpenExternal} className="p-1 hover:bg-gray-200 rounded text-gray-600" title="Open in New Tab">
                        <ExternalLink className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="flex-1 relative">
                <iframe
                    ref={iframeRef}
                    src={PREVIEW_URL}
                    className="w-full h-full border-none"
                    title="Preview"
                    sandbox="allow-scripts allow-same-origin allow-forms" // Safety
                />
            </div>
        </div>
    );
}
