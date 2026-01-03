import React, { useState } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';

export default function PromptBar({ onSubmit, isGenerating }) {
    const [prompt, setPrompt] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (prompt.trim() && !isGenerating) {
            onSubmit(prompt);
        }
    };

    return (
        <div className="bg-[#1e1e1e] p-2 border-b border-[#333]">
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-4xl mx-auto">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ask AI to generate code..."
                        className="w-full bg-[#252526] text-gray-200 px-4 py-1.5 pl-9 rounded-md border border-[#3c3c3c] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500 text-sm"
                        disabled={isGenerating}
                    />
                    <Sparkles className="w-4 h-4 text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <button
                    type="submit"
                    disabled={isGenerating || !prompt.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isGenerating ? <Loader2 className="animate-spin w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                    Generate
                </button>
            </form>
        </div>
    );
}
