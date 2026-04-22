require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

// Route modules
app.use('/api',             require('./routes/auth'));
app.use('/api/items',       require('./routes/items'));
app.use('/api/inventory',   require('./routes/inventory'));
app.use('/api/employees',   require('./routes/employees'));
app.use('/api/orders',      require('./routes/orders'));
app.use('/api/reports',     require('./routes/reports'));
app.use('/api/ingredients', require('./routes/ingredients'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/chat', require('./routes/chat'));


// Reset sequences on startup
async function resetSequences() {
  const sqls = [
    `SELECT setval(pg_get_serial_sequence('public."Order"', 'orderId'), COALESCE((SELECT MAX("orderId") FROM public."Order"), 0))`,
    `SELECT setval(pg_get_serial_sequence('public."Inventory"', 'inventoryId'), COALESCE((SELECT MAX("inventoryId") FROM public."Inventory"), 0))`,
    `SELECT setval(pg_get_serial_sequence('public."Item"', 'itemId'), COALESCE((SELECT MAX("itemId") FROM public."Item"), 0))`,
    `SELECT setval(pg_get_serial_sequence('public."OrderLineItem"', 'orderLineId'), COALESCE((SELECT MAX("orderLineId") FROM public."OrderLineItem"), 0))`
  ];
  try {
    for (const sql of sqls) await pool.query(sql);
    console.log('Sequences reset OK');
  } catch (err) {
    console.warn('Sequence reset warning:', err.message);
  }
}

// Catch-all: serve React frontend for any non-API route
app.get('/{0,}', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Boba POS running on http://localhost:${PORT}`);
  await resetSequences();
});