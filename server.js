const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

let cachedData = null;

// Utility to read data
const readData = () => {
    if (cachedData !== null) {
        return cachedData;
    }
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        cachedData = JSON.parse(data);
        return cachedData;
    } catch (err) {
        console.error('Error reading data.json:', err);
        return [];
    }
};

// Initialize cache on startup
readData();

// Utility to write data
const writeData = (data) => {
    cachedData = data;
    try {
        // Write file asynchronously to avoid blocking the event loop, and minify JSON
        fs.writeFile(DATA_FILE, JSON.stringify(data), 'utf8', (err) => {
            if (err) {
                console.error('Error writing data.json asynchronously:', err);
            }
        });
        return true;
    } catch (err) {
        console.error('Error writing data.json:', err);
        return false;
    }
};

// Serve data.json dynamically from memory cache to bypass disk read I/O
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
    
    // Generate a unique ID if not provided
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
        // Keep the same ID
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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Admin dashboard: http://localhost:${PORT}/admin/`);
});
