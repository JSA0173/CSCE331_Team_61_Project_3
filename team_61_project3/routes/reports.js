const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/daily', async (req, res) => {
  try {
    const sql = `SELECT "orderId", "customerName", status, "totalAmount", "orderDate"
                 FROM public."Order" WHERE DATE("orderDate") = CURRENT_DATE ORDER BY "orderId"`;
    const { rows } = await pool.query(sql);
    const total = rows.reduce((s, r) => s + parseFloat(r.totalAmount), 0);
    res.json({ orders: rows, totalRevenue: total, count: rows.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/x-report', async (req, res) => {
  try {
    const sql = `SELECT EXTRACT(HOUR FROM "orderDate") AS order_hour, SUM("totalAmount") AS revenue
                 FROM "Order" WHERE DATE("orderDate") = CURRENT_DATE
                 GROUP BY EXTRACT(HOUR FROM "orderDate") ORDER BY order_hour`;
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/z-report', async (req, res) => {
  try {
    const sql = `SELECT
      (SELECT COUNT("orderId") FROM "Order" WHERE DATE("orderDate") = CURRENT_DATE) AS total_orders,
      (SELECT COALESCE(SUM("totalAmount"), 0) FROM "Order" WHERE DATE("orderDate") = CURRENT_DATE) AS total_sales,
      (SELECT COALESCE(SUM(oli."quantity"), 0)
       FROM "Order" o JOIN "OrderLineItem" oli ON o."orderId" = oli."orderId"
       WHERE DATE(o."orderDate") = CURRENT_DATE) AS total_items`;
    const { rows } = await pool.query(sql);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/sales', async (req, res) => {
  const { startDate, startTime, endDate, endTime } = req.body;
  try {
    const start = `${startDate} ${startTime}`;
    const end = `${endDate} ${endTime}`;
    const sql = `SELECT i."itemId", i."name", SUM(oli."quantity") AS total,
                        SUM(oli."quantity" * i."basePrice") AS total_revenue
                 FROM "Order" o
                 JOIN "OrderLineItem" oli ON o."orderId" = oli."orderId"
                 JOIN "Item" i ON oli."itemId" = i."itemId"
                 WHERE o."orderDate" BETWEEN $1 AND $2
                 GROUP BY i."itemId", i."name" ORDER BY total DESC`;
    const { rows } = await pool.query(sql, [start, end]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/product-usage', async (req, res) => {
  const { startDate, startTime, endDate, endTime } = req.body;
  try {
    const start = `${startDate} ${startTime}`;
    const end = `${endDate} ${endTime}`;
    const sql = `SELECT inv."inventoryId" AS item_id, inv.name AS inventory_name,
                        SUM(oli.quantity * ing."quantityUsed") AS total_used
                 FROM public."Order" o
                 JOIN public."OrderLineItem" oli ON o."orderId" = oli."orderId"
                 JOIN public."Ingredients" ing ON oli."itemId" = ing."itemId"
                 JOIN public."Inventory" inv ON ing."inventoryId" = inv."inventoryId"
                 WHERE o."orderDate" BETWEEN $1 AND $2
                 GROUP BY inv."inventoryId", inv.name ORDER BY total_used DESC`;
    const { rows } = await pool.query(sql, [start, end]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
