import React from 'react';
import { Wifi, XCircle, AlertTriangle, Bell } from 'lucide-react';

export default function StatusBar({ activeFile }) {
    return (
        <div className="h-6 bg-[#007acc] text-white flex items-center px-2 text-xs select-none justify-between">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 hover:bg-white/10 px-2 h-full cursor-pointer">
                    <XCircle className="w-3 h-3" /> 0
                    <AlertTriangle className="w-3 h-3 ml-1" /> 0
                </div>
            </div>

            <div className="flex items-center gap-4">
                {activeFile && (
                    <>
                        <div className="cursor-pointer hover:bg-white/10 px-2 h-full flex items-center">
                            Ln 1, Col 1
                        </div>
                        <div className="cursor-pointer hover:bg-white/10 px-2 h-full flex items-center">
                            UTF-8
                        </div>
                        <div className="cursor-pointer hover:bg-white/10 px-2 h-full flex items-center">
                            Javascript
                        </div>
                    </>
                )}
                <div className="cursor-pointer hover:bg-white/10 px-2 h-full flex items-center">
                    <Bell className="w-3 h-3" />
                </div>
            </div>
        </div>
    );
}
