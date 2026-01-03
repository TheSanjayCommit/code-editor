import { Files, Search, GitGraph, Box, Settings, Play } from 'lucide-react';

export default function ActivityBar({ activeView, onNavigate }) {
    const items = [
        { id: 'explorer', icon: Files, label: 'Explorer' },
        { id: 'search', icon: Search, label: 'Search' },
        { id: 'preview', icon: Play, label: 'Preview' },
        { id: 'git', icon: GitGraph, label: 'Source Control' },
        { id: 'extensions', icon: Box, label: 'Extensions' },
    ];

    return (
        <div className="w-12 bg-[#333333] flex flex-col items-center py-2 h-full justify-between">
            <div className="flex flex-col gap-4">
                {items.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className={`p-2 rounded-md transition-colors relative group ${activeView === item.id ? 'text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        title={item.label}
                    >
                        <item.icon className="w-6 h-6" />
                        {activeView === item.id && (
                            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500 -ml-2" />
                        )}
                    </button>
                ))}
            </div>

            <div className="flex-1" />

            <div className="flex flex-col gap-4 mb-2">
                <button
                    onClick={() => onNavigate('settings')}
                    className={`p-2 rounded-md transition-colors relative group ${activeView === 'settings' ? 'text-white' : 'text-gray-400 hover:text-white'
                        }`}
                    title="Settings"
                >
                    <Settings className="w-6 h-6" />
                    {activeView === 'settings' && (
                        <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-blue-500 -ml-2" />
                    )}
                </button>
            </div>
        </div>
    );
}
