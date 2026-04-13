const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const sql = `SELECT "itemId", name, "basePrice", size, enabled
                 FROM public."Item" ORDER BY "itemId"`;
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/menu', async (req, res) => {
  try {
    const sql = `SELECT "itemId", name, "basePrice", size, enabled
                 FROM public."Item" WHERE enabled = TRUE AND size = 'Normal' ORDER BY "itemId"`;
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, basePrice, size } = req.body;
  try {
    const sql = `INSERT INTO public."Item" (name, "basePrice", size, enabled) VALUES ($1, $2, $3, true) RETURNING *`;
    const { rows } = await pool.query(sql, [name, basePrice, size || 'Normal']);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/price', async (req, res) => {
  const { basePrice } = req.body;
  try {
    const sql = `UPDATE public."Item" SET "basePrice" = $1 WHERE "itemId" = $2 RETURNING *`;
    const { rows } = await pool.query(sql, [basePrice, req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/toggle', async (req, res) => {
  try {
    const sql = `UPDATE public."Item" SET enabled = NOT enabled WHERE "itemId" = $1 RETURNING *`;
    const { rows } = await pool.query(sql, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
