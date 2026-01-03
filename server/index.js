require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { generateProject } = require("./lib/groq");
const path = require('path');
const fileUtils = require('./lib/files');

const http = require('http');
const { Server } = require('socket.io');
const terminalManager = require('./lib/terminal');

const app = express();
app.use(cors());
app.use(express.json());

// Vercel Detection
const IS_VERCEL = process.env.VERCEL === '1';

// Serve workspace statically for preview
// On Vercel, we use /tmp for writable storage
const WORKSPACE_DIR = process.env.PROJECT_ROOT || (IS_VERCEL ? '/tmp/workspace' : path.join(process.cwd(), 'workspace'));

// Ensure workspace exists immediately
if (IS_VERCEL) {
    try {
        if (!require('fs').existsSync(WORKSPACE_DIR)) {
            require('fs').mkdirSync(WORKSPACE_DIR, { recursive: true });
        }
    } catch (e) {
        console.error("Failed to create temp workspace:", e);
    }
}

app.use('/preview', express.static(WORKSPACE_DIR));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    transports: ['polling'] // Force polling for serverless compatibility if needed
});

io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    try {
        // Create terminal session
        // On Vercel, this might throw or fail if node-pty binaries are missing/incompatible
        if (IS_VERCEL) {
            socket.emit('terminal:data', '\r\n\x1b[33mTerminal is read-only in Vercel Demo.\x1b[0m\r\n');
            return;
        }

        const term = terminalManager.createSession(socket.id);

        // Send data to client
        term.onData((data) => {
            socket.emit('terminal:data', data);
        });

        // Receive input from client
        socket.on('terminal:write', (data) => {
            term.write(data);
        });

        // Resize terminal
        socket.on('terminal:resize', ({ cols, rows }) => {
            term.resize(cols, rows);
        });

        socket.on('disconnect', () => {
            terminalManager.killSession(socket.id);
        });

    } catch (err) {
        console.error("Terminal error:", err);
        socket.emit('terminal:data', '\r\n\x1b[31mTerminal Unavailable.\x1b[0m\r\n');
    }
});

// File System Routes

// Get File Tree (defaults to workspace dir)
app.get('/files', async (req, res) => {
    try {
        // Use 'workspace' folder relative to server root OR tmp
        const rootDir = WORKSPACE_DIR;


        // Ensure workspace exists
        await require('fs').promises.mkdir(rootDir, { recursive: true });

        const tree = await fileUtils.getFileTree(rootDir);
        res.json({ root: rootDir, tree });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read content
app.get('/files/content', async (req, res) => {
    try {
        const { path: filePath } = req.query;
        // SECURITY: Verify path is inside workspace?
        // For local MVP, trusting input but in prod needs recursion check.
        const content = await fileUtils.readFile(filePath);
        res.json({ content });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Save content
app.post('/files/save', async (req, res) => {
    try {
        const { path: filePath, content } = req.body;
        await fileUtils.writeFile(filePath, content);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create File
app.post('/files/create', async (req, res) => {
    try {
        const { path: relPath, type } = req.body; // type: 'file' or 'folder'

        // Resolve relative to workspace
        // NOTE: Frontend usually sends relative path like "src/App.js"
        // If we want to support that, we join with rootDir.
        // Check if path is absolute or not. FileUtils expects full path in our current implementation?
        // Let's modify FileUtils to assume absolute, so we construct absolute here.

        // Wait, earlier logic was loose. Let's strict it up.
        // If path starts_with WORKSPACE_DIR, use it. Else join.
        let targetPath;
        if (relPath.startsWith(WORKSPACE_DIR)) {
            targetPath = relPath;
        } else {
            targetPath = path.join(rootDir, relPath);
        }

        if (type === 'folder') {
            await fileUtils.createFolder(targetPath);
        } else {
            await fileUtils.createFile(targetPath);
        }
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rename
app.post('/files/rename', async (req, res) => {
    try {
        const { oldPath, newPath } = req.body;
        // Assuming absolute paths from frontend or handling similar to create
        // Frontend FileTree node paths are currently Absolute?
        // Yes, getFileTree returns absolute 'path'.
        // So we just pass them through.
        await fileUtils.renameItem(oldPath, newPath);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete
app.post('/files/delete', async (req, res) => {
    try {
        const { path } = req.body;
        await fileUtils.deleteItem(path);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search
app.get('/files/search', async (req, res) => {
    try {
        const { q: query } = req.query;
        if (!query) return res.json({ results: [] });

        const rootDir = WORKSPACE_DIR;
        const results = await fileUtils.searchFiles(query, rootDir);

        // Relative paths for frontend display
        const relativeResults = results.map(r => ({
            ...r,
            path: path.relative(rootDir, r.path)
        }));

        res.json({ results: relativeResults });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post("/generate", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        console.log("Generating project for prompt:", prompt);
        const projectData = await generateProject(prompt);

        // Write generated files to workspace
        const rootDir = WORKSPACE_DIR;
        await require('fs').promises.mkdir(rootDir, { recursive: true });

        // Helper to write recursively
        for (const file of projectData.files) {
            const filePath = path.join(rootDir, file.path);
            await fileUtils.writeFile(filePath, file.content);
        }

        res.json(projectData);
    } catch (error) {
        console.error("Generation failed:", error);
        res.status(500).json({ error: "Failed to generate project", details: error.message });
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
