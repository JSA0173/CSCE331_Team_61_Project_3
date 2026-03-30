const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const sql = `SELECT "inventoryId", name, "quantityOnHand", "pricePerUnit",
                        "reorderThreshold", "type"
                 FROM public."Inventory" ORDER BY "inventoryId"`;
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/bases-and-toppings', async (req, res) => {
  try {
    const basesSql = `SELECT "inventoryId", name, "pricePerUnit" FROM public."Inventory"
                      WHERE "type" IN ('Base','Flavor') ORDER BY "inventoryId"`;
    const toppingsSql = `SELECT "inventoryId", name, "pricePerUnit" FROM public."Inventory"
                         WHERE "type" = 'Topping' ORDER BY "inventoryId"`;
    const [bases, toppings] = await Promise.all([pool.query(basesSql), pool.query(toppingsSql)]);
    res.json({ bases: bases.rows, toppings: toppings.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { name, quantityOnHand, pricePerUnit, reorderThreshold, type } = req.body;
  try {
    const sql = `INSERT INTO public."Inventory" (name, "quantityOnHand", "pricePerUnit", "reorderThreshold", "type")
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const { rows } = await pool.query(sql, [name, quantityOnHand, pricePerUnit, reorderThreshold, type]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { quantityOnHand, pricePerUnit, reorderThreshold } = req.body;
  try {
    const sql = `UPDATE public."Inventory" SET "quantityOnHand" = $1, "pricePerUnit" = $2, "reorderThreshold" = $3
                 WHERE "inventoryId" = $4 RETURNING *`;
    const { rows } = await pool.query(sql, [quantityOnHand, pricePerUnit, reorderThreshold, req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
