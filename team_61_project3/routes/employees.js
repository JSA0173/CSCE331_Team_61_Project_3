const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const sql = `SELECT "employeeId", "name", "salary", "date_hired", "job_title"
                 FROM public."Employees" ORDER BY "employeeId"`;
    const { rows } = await pool.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { employeeId, name, salary, date_hired, job_title, username, password, view } = req.body;
  try {
    const sql = `INSERT INTO public."Employees"
                 ("employeeId", "name", "salary", "date_hired", "job_title", "username", "password", "view")
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`;
    const { rows } = await pool.query(sql, [employeeId, name, salary, date_hired, job_title, username, password, view]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const fields = req.body;
  const id = req.params.id;
  const sets = [];
  const vals = [];
  let i = 1;
  if (fields.name)       { sets.push(`"name" = $${i++}`);       vals.push(fields.name); }
  if (fields.salary)     { sets.push(`"salary" = $${i++}`);     vals.push(fields.salary); }
  if (fields.job_title)  { sets.push(`"job_title" = $${i++}`);  vals.push(fields.job_title); }
  if (fields.date_hired) { sets.push(`"date_hired" = $${i++}`); vals.push(fields.date_hired); }
  if (fields.username)   { sets.push(`"username" = $${i++}`);   vals.push(fields.username); }
  if (fields.password)   { sets.push(`"password" = $${i++}`);   vals.push(fields.password); }
  if (fields.view)       { sets.push(`"view" = $${i++}`);       vals.push(fields.view); }
  if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });
  vals.push(id);
  try {
    const sql = `UPDATE public."Employees" SET ${sets.join(', ')} WHERE "employeeId" = $${i} RETURNING *`;
    const { rows } = await pool.query(sql, vals);
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const sql = `DELETE FROM public."Employees" WHERE "employeeId" = $1`;
    await pool.query(sql, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const sql = `
      SELECT * 
      FROM public."Employees" 
      WHERE "username" = $1 AND "password" = $2
    `;

    const { rows } = await pool.query(sql, [username, password]);

    if (rows.length > 0) {
      res.json({ success: true, user: rows[0] });
    } else {
      res.status(401).json({ message: 'Invalid username or password' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
