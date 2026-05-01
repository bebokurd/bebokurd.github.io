const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json());

// Serve static files from current directory
app.use(express.static(__dirname));

// Utility to read data
const readData = () => {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error('Error reading data.json:', err);
        return [];
    }
};

// Utility to write data
const writeData = (data) => {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 4), 'utf8');
        return true;
    } catch (err) {
        console.error('Error writing data.json:', err);
        return false;
    }
};

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
