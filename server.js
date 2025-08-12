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

// Get expenses
app.get('/expenses', async (req, res) => {
    const result = await pool.query('SELECT * FROM expenses ORDER BY id DESC');
    res.json(result.rows);
});

// Add expense
app.post('/expenses', async (req, res) => {
    const { name, amount } = req.body;
    const result = await pool.query(
        'INSERT INTO expenses (name, amount) VALUES ($1, $2) RETURNING *',
        [name, amount]
    );
    res.status(201).json(result.rows[0]);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
