const fs = require('fs').promises;
const path = require('path');

async function getFileTree(dir) {
    const stats = await fs.stat(dir);
    if (!stats.isDirectory()) {
        throw new Error('Path is not a directory');
    }

    const dirents = await fs.readdir(dir, { withFileTypes: true });

    // Filter out hidden files or node_modules for cleaner view if desired
    // For now, let's keep it simple but maybe exclude node_modules to avoid massive trees
    const filtered = dirents.filter(d => d.name !== 'node_modules' && d.name !== '.git');

    const tree = await Promise.all(filtered.map(async (dirent) => {
        const res = path.resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            return {
                name: dirent.name,
                path: res,
                type: 'folder',
                children: await getFileTree(res)
            };
        } else {
            return {
                name: dirent.name,
                path: res,
                type: 'file'
            };
        }
    }));

    return tree.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'folder' ? -1 : 1;
    });
}

async function readFile(filePath) {
    return fs.readFile(filePath, 'utf-8');
}

async function writeFile(filePath, content) {
    // Ensure directory exists
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    return fs.writeFile(filePath, content, 'utf-8');
}

async function createFile(filePath, content = '') {
    return writeFile(filePath, content);
}

async function createFolder(folderPath) {
    return fs.mkdir(folderPath, { recursive: true });
}

async function renameItem(oldPath, newPath) {
    return fs.rename(oldPath, newPath);
}

async function deleteItem(itemPath) {
    return fs.rm(itemPath, { recursive: true, force: true });
}

module.exports = {
    getFileTree,
    readFile,
    writeFile,
    createFile,
    createFolder,
    renameItem,
    deleteItem
};

async function searchFiles(query, dir) {
    const results = [];

    async function scan(directory) {
        const dirents = await fs.readdir(directory, { withFileTypes: true });
        for (const dirent of dirents) {
            const res = path.resolve(directory, dirent.name);
            if (dirent.isDirectory()) {
                if (dirent.name !== 'node_modules' && dirent.name !== '.git') {
                    await scan(res);
                }
            } else {
                // Determine if text file (simple heuristic)
                if (/\.(js|jsx|ts|tsx|css|html|json|md|txt)$/i.test(dirent.name)) {
                    try {
                        const content = await fs.readFile(res, 'utf-8');
                        const lines = content.split('\n');
                        lines.forEach((line, index) => {
                            if (line.includes(query)) {
                                results.push({
                                    path: res,
                                    line: index + 1,
                                    content: line.trim()
                                });
                            }
                        });
                    } catch (err) {
                        // ignore read errors
                    }
                }
            }
        }
    }

    await scan(dir);
    return results;
}

module.exports = {
    getFileTree,
    readFile,
    writeFile,
    createFile,
    createFolder,
    renameItem,
    deleteItem,
    searchFiles
};
