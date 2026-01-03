import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { socket } from '../socket';

export default function TerminalPanel({ onClose }) {
    const terminalRef = useRef(null);

    useEffect(() => {
        if (!terminalRef.current) return;

        // Wait for connection
        if (!socket.connected) {
            socket.connect();
        }

        const term = new Terminal({
            cursorBlink: true,
            fontSize: 14,
            fontFamily: 'Consolas, "Courier New", monospace',
            theme: {
                background: '#1e1e1e',
                foreground: '#cccccc',
            }
        });

        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        // Handle resize
        const handleResize = () => {
            fitAddon.fit();
            socket.emit('terminal:resize', { cols: term.cols, rows: term.rows });
        };
        window.addEventListener('resize', handleResize);

        // Initial resize
        setTimeout(() => {
            handleResize();
        }, 100);

        // Socket interactions
        term.onData(data => {
            socket.emit('terminal:write', data);
        });

        const onData = (data) => {
            term.write(data);
        };

        socket.on('terminal:data', onData);

        return () => {
            socket.off('terminal:data', onData);
            window.removeEventListener('resize', handleResize);
            term.dispose();
        };
    }, []);

    return (
        <div className="h-48 bg-[#1e1e1e] border-t border-[#333] flex flex-col">
            <div className="flex items-center justify-between px-4 py-2 bg-[#252526] border-b border-[#333]">
                <div className="flex gap-4 text-xs font-medium text-gray-400">
                    <span className="text-white border-b-2 border-blue-500 pb-1 cursor-pointer">TERMINAL</span>
                    <span className="hover:text-white cursor-pointer">OUTPUT</span>
                    <span className="hover:text-white cursor-pointer">DEBUG CONSOLE</span>
                    <span className="hover:text-white cursor-pointer">PROBLEMS</span>
                </div>
                <button onClick={onClose} className="hover:bg-[#333] rounded p-1">
                    <X className="w-4 h-4 text-gray-400" />
                </button>
            </div>
            <div className="flex-1 bg-[#1e1e1e] pl-2 pt-1 overflow-hidden" ref={terminalRef} />
        </div>
    );
}
