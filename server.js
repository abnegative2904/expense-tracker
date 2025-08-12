const express = require('express');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Get expenses (latest first)
app.get('/expenses', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM expenses ORDER BY date DESC, id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error fetching expenses' });
    }
});

// Add expense
app.post('/expenses', async (req, res) => {
    try {
        const { name, amount, category, date } = req.body;

        if (!name || !amount || !category || !date) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const result = await pool.query(
            `INSERT INTO expenses (name, amount, category, date) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [name, amount, category, date]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error adding expense' });
    }
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
