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

/**
 * GET /expenses
 * optional query: ?month=YYYY-MM
 * returns rows ordered by expense_date desc
 */
app.get('/expenses', async (req, res) => {
  try {
    const { month } = req.query;
    let result;
    if (month) {
      // month must be 'YYYY-MM'
      result = await pool.query(
        `SELECT id, name, amount, expense_type, expense_date, note, created_at
         FROM expenses
         WHERE to_char(expense_date,'YYYY-MM') = $1
         ORDER BY expense_date DESC, id DESC`,
        [month]
      );
    } else {
      result = await pool.query(
        `SELECT id, name, amount, expense_type, expense_date, note, created_at
         FROM expenses
         ORDER BY expense_date DESC, id DESC`
      );
    }
    res.json(result.rows);
  } catch (err) {
    console.error('GET /expenses error:', err);
    res.status(500).json({ error: 'Database error fetching expenses' });
  }
});

/**
 * POST /expenses
 * body: { amount, expense_type, note }
 * name will be NULL (per your request), expense_date defaults to CURRENT_DATE on DB side
 */
app.post('/expenses', async (req, res) => {
  try {
    const { amount, expense_type, note } = req.body;

    if (!amount || !expense_type) {
      return res.status(400).json({ error: 'amount and expense_type required' });
    }

    const result = await pool.query(
      `INSERT INTO expenses (name, amount, expense_type, note)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, amount, expense_type, expense_date, note, created_at`,
      [null, amount, expense_type, note]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('POST /expenses error:', err);
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

/**
 * GET /limit  -> returns current month's limit (month_year = YYYY-MM)
 */
app.get('/limit', async (req, res) => {
  try {
    const monthYear = new Date().toISOString().slice(0, 7);
    const result = await pool.query(
      'SELECT month_year, limit_amount FROM monthly_limit WHERE month_year = $1 LIMIT 1',
      [monthYear]
    );
    if (result.rows.length) {
      res.json(result.rows[0]);
    } else {
      res.json({ month_year: monthYear, limit_amount: 0 });
    }
  } catch (err) {
    console.error('GET /limit error:', err);
    res.status(500).json({ error: 'Error fetching monthly limit' });
  }
});

/**
 * POST /limit
 * body: { limit_amount }
 * inserts or updates current month
 */
app.post('/limit', async (req, res) => {
  try {
    const { limit_amount } = req.body;
    if (limit_amount === undefined || limit_amount === null) {
      return res.status(400).json({ error: 'limit_amount required' });
    }
    const monthYear = new Date().toISOString().slice(0, 7);
    const result = await pool.query(
      `INSERT INTO monthly_limit (month_year, limit_amount)
       VALUES ($1, $2)
       ON CONFLICT (month_year)
       DO UPDATE SET limit_amount = EXCLUDED.limit_amount
       RETURNING month_year, limit_amount`,
      [monthYear, limit_amount]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('POST /limit error:', err);
    res.status(500).json({ error: 'Error setting monthly limit' });
  }
});

// serve frontend default
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
