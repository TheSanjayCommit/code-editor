const os = require('os');
const path = require('path');
const pty = require('node-pty');

const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

class TerminalManager {
    constructor() {
        this.sessions = {};
    }

    createSession(id) {
        // Default to workspace directory for terminal session
        const cwd = path.join(process.cwd(), 'workspace');
        // Ensure it exists (sync for simplicity in constructor context, or assume created by index.js)
        // For safety, we can fallback to cwd if workspace doesn't exist, but we want isolation.

        const term = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: 80,
            rows: 24,
            cwd: cwd,
            env: process.env
        });

        this.sessions[id] = term;
        return term;
    }

    getSession(id) {
        return this.sessions[id];
    }

    killSession(id) {
        const term = this.sessions[id];
        if (term) {
            term.kill();
            delete this.sessions[id];
        }
    }
}

module.exports = new TerminalManager();
