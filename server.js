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
        const result = await pool.query('SELECT * FROM expenses ORDER BY expense_date DESC, id DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error fetching expenses' });
    }
});


// Add expense
app.post('/expenses', async (req, res) => {
  const { name, amount, expense_type, expense_date, note } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO expenses (name, amount, expense_type, expense_date, note)
       VALUES ($1, $2, COALESCE($3, 'Other'), COALESCE($4, CURRENT_DATE), $5)
       RETURNING *`,
      [name, amount, expense_type, expense_date, note]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});


// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
