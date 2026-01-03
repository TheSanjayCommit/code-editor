import React, { useState, useEffect } from 'react';

export default function SettingsSidebar({ settings, onUpdateSettings }) {
    const handleChange = (key, value) => {
        onUpdateSettings(key, value);
    };

    return (
        <div className="flex flex-col h-full bg-[#252526] border-r border-[#1e1e1e]">
            <div className="px-4 py-2.5 text-xs text-gray-400 font-medium uppercase tracking-wide">
                SETTINGS
            </div>

            <div className="p-4 space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Editor</label>

                    <div className="space-y-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-300">Font Size</span>
                            <input
                                type="number"
                                value={settings.fontSize}
                                onChange={(e) => handleChange('fontSize', parseInt(e.target.value))}
                                className="bg-[#3c3c3c] text-white px-2 py-1 text-sm border border-[#3c3c3c] focus:border-[#007fd4] outline-none rounded-sm w-full"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Word Wrap</span>
                            <input
                                type="checkbox"
                                checked={settings.wordWrap === 'on'}
                                onChange={(e) => handleChange('wordWrap', e.target.checked ? 'on' : 'off')}
                                className="accent-[#007fd4]"
                            />
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-300">Minimap</span>
                            <input
                                type="checkbox"
                                checked={settings.minimap}
                                onChange={(e) => handleChange('minimap', e.target.checked)}
                                className="accent-[#007fd4]"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Appearance</label>
                    <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-300">Theme</span>
                        <select
                            value={settings.theme}
                            onChange={(e) => handleChange('theme', e.target.value)}
                            className="bg-[#3c3c3c] text-white px-2 py-1 text-sm border border-[#3c3c3c] focus:border-[#007fd4] outline-none rounded-sm w-full"
                        >
                            <option value="vs-dark">Dark (Visual Studio)</option>
                            <option value="light">Light (Visual Studio)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
}
