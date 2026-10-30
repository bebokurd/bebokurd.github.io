const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// In-memory data cache
let cachedData = null;
let lastMtime = 0;

function readData() {
    try {
        const stats = fs.statSync(DATA_FILE);
        if (cachedData && stats.mtimeMs === lastMtime) {
            return cachedData;
        }
        const raw = fs.readFileSync(DATA_FILE, 'utf8');
        cachedData = JSON.parse(raw);
        lastMtime = stats.mtimeMs;
        return cachedData;
    } catch (err) {
        console.error('Error reading data file:', err);
        return [];
    }
}

function writeData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        const stats = fs.statSync(DATA_FILE);
        cachedData = data;
        lastMtime = stats.mtimeMs;
        return true;
    } catch (err) {
        console.error('Error writing data file:', err);
        return false;
    }
}

// Serve data.json dynamically
app.get('/data.json', (req, res) => {
    res.json(readData());
});

// Serve static files from current directory
app.use(express.static(__dirname));

// GET all items
app.get('/api/data', (req, res) => {
    const data = readData();
    res.json(data);
});

// POST new item
app.post('/api/data', (req, res) => {
    const data = readData();
    const newItem = req.body;
    
    if (!newItem.id) {
        const baseId = newItem.name ? newItem.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'item';
        newItem.id = `${baseId}-${Date.now()}`;
    }
    
    data.push(newItem);
    if (writeData(data)) {
        res.status(201).json(newItem);
    } else {
        res.status(500).json({ error: 'Failed to save data' });
    }
});

// PUT update item
app.put('/api/data/:id', (req, res) => {
    const data = readData();
    const { id } = req.params;
    const index = data.findIndex(item => item.id === id);
    
    if (index !== -1) {
        data[index] = { ...req.body, id };
        if (writeData(data)) {
            res.json(data[index]);
        } else {
            res.status(500).json({ error: 'Failed to save data' });
        }
    } else {
        res.status(404).json({ error: 'Item not found' });
    }
});

// DELETE item
app.delete('/api/data/:id', (req, res) => {
    let data = readData();
    const { id } = req.params;
    const initialLength = data.length;
    
    data = data.filter(item => item.id !== id);
    
    if (data.length < initialLength) {
        if (writeData(data)) {
            res.json({ message: 'Item deleted' });
        } else {
            res.status(500).json({ error: 'Failed to save data' });
        }
    } else {
        res.status(404).json({ error: 'Item not found' });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Admin dashboard: http://localhost:${PORT}/admin/`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.warn(`\n[Notice] Port ${PORT} is already in use by an existing instance.`);
        console.log(`Tip: To stop the other instance on port ${PORT}, run: taskkill /F /IM node.exe`);
        const fallbackPort = Number(PORT) + 1;
        console.log(`Starting server on fallback port http://localhost:${fallbackPort} ...\n`);
        app.listen(fallbackPort, () => {
            console.log(`Server is running on http://localhost:${fallbackPort}`);
            console.log(`Admin dashboard: http://localhost:${fallbackPort}/admin/`);
        });
    } else {
        console.error('Server error:', err);
    }
});
