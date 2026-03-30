const express = require('express');
const router = express.Router();
const pool = require('../db');
router.post('/', async (req, res) => {
  const { customerName, totalAmount, lineItems } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderSql = `INSERT INTO public."Order" ("customerName", status, "totalAmount")
                      VALUES ($1, 'NOT READY', $2) RETURNING "orderId"`;
    const orderRes = await client.query(orderSql, [customerName || 'ANONYMOUS', totalAmount]);
    const orderId = orderRes.rows[0].orderId;

    const lineSql = `INSERT INTO public."OrderLineItem"
      ("orderId", "itemId", "quantity", "sugarAmount", "iceLevel", "temperature", "baseType", "extras",
       "topping1", "topping2", "topping3", "topping4", "topping5")
      VALUES ($1,$2,1,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`;

    for (const li of lineItems) {
      const t = [...(li.toppings || [])];
      while (t.length < 5) t.push(null);
      await client.query(lineSql, [
        orderId, li.itemId, li.sugarAmount, li.iceLevel, li.temperature,
        li.baseType, li.extras, t[0], t[1], t[2], t[3], t[4]
      ]);
    }
    await client.query('COMMIT');
    res.json({ orderId, totalAmount });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
