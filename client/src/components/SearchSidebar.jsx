import React, { useState } from 'react';
import axios from 'axios';
import { Search, ChevronRight, ChevronDown, FileCode } from 'lucide-react';

// API URL (match App.jsx)
// API URL (match App.jsx)
const API_BASE = import.meta.env.PROD ? "" : "http://localhost:3000";

export default function SearchSidebar({ onFileSelect }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [expandedFiles, setExpandedFiles] = useState({});

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsSearching(true);
        try {
            const res = await axios.get(`${API_BASE}/files/search?q=${encodeURIComponent(query)}`);
            // Group results by file path
            const grouped = res.data.results.reduce((acc, match) => {
                if (!acc[match.path]) {
                    acc[match.path] = [];
                }
                acc[match.path].push(match);
                return acc;
            }, {});
            setResults(grouped);
            // Expand all by default
            const initialExpanded = Object.keys(grouped).reduce((acc, path) => ({ ...acc, [path]: true }), {});
            setExpandedFiles(initialExpanded);
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setIsSearching(false);
        }
    };

    const toggleFile = (path) => {
        setExpandedFiles(prev => ({ ...prev, [path]: !prev[path] }));
    };

    const FileResult = ({ path, matches }) => (
        <div className="mb-2">
            <div
                className="flex items-center gap-1 px-4 py-1 text-gray-300 font-bold bg-[#37373d] cursor-pointer hover:bg-[#454545]"
                onClick={() => toggleFile(path)}
            >
                {expandedFiles[path] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                <FileCode className="w-4 h-4 text-blue-400" />
                <span className="text-xs truncate" title={path}>{path}</span>
                <span className="ml-auto text-xs bg-gray-600 px-1.5 rounded-full">{matches.length}</span>
            </div>

            {expandedFiles[path] && (
                <div>
                    {matches.map((match, idx) => (
                        <div
                            key={idx}
                            className="px-4 py-1 text-xs text-gray-400 cursor-pointer hover:bg-[#2a2d2e] hover:text-white font-mono truncate"
                            onClick={() => onFileSelect({ path, line: match.line })}
                            title={match.content}
                        >
                            <span className="text-gray-500 mr-2">{match.line}:</span>
                            {match.content}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-[#252526] border-r border-[#1e1e1e]">
            <div className="px-4 py-2.5 text-xs text-gray-400 font-medium uppercase tracking-wide">
                SEARCH
            </div>

            <div className="p-4 pt-0">
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search"
                        className="w-full bg-[#3c3c3c] border border-transparent focus:border-[#007fd4] text-white text-sm px-2 py-1 outline-none rounded-sm"
                    />
                    {isSearching && (
                        <div className="absolute right-2 top-1.5 w-3 h-3 border-2 border-t-transparent border-gray-400 rounded-full animate-spin"></div>
                    )}
                </form>
            </div>

            <div className="flex-1 overflow-y-auto">
                {Object.keys(results).length === 0 && !isSearching && query && (
                    <div className="p-4 text-sm text-gray-500 text-center">No results found.</div>
                )}

                {Object.entries(results).map(([path, matches]) => (
                    <FileResult key={path} path={path} matches={matches} />
                ))}
            </div>
        </div>
    );
}
