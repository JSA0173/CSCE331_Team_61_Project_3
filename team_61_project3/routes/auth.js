const express = require('express');
const router = express.Router();
const pool = require('../db');
router.post('/login', async (req, res) => {
  const username = (req.body.username || '').trim();
  const password = (req.body.password || '').trim();
  console.log('Login attempt:', username);
  try {
    const sql = 'SELECT "password", "view" FROM public."Employees" WHERE "username" = $1';
    const { rows } = await pool.query(sql, [username]);
    console.log('DB result rows:', rows.length);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid username' });
    if (rows[0].password !== password) return res.status(401).json({ error: 'Incorrect password' });
    res.json({ view: rows[0].view });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
