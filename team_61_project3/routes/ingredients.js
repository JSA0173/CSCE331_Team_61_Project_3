const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:itemId', async (req, res) => {
  try {
    const sql = `SELECT "inventoryId" FROM public."Ingredients" WHERE "itemId" = $1`;
    const { rows } = await pool.query(sql, [req.params.itemId]);
    res.json(rows.map(r => r.inventoryId));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
