const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/add-points', async (req, res) => {
    try {
        let { phoneNumber, pointsToAdd } = req.body;

        // Normalize phone number (remove dashes, spaces, etc.)
        phoneNumber = phoneNumber.replace(/\D/g, '');

        const query = `
            INSERT INTO rewards (phone_number, points)
            VALUES (?, ?)
            ON DUPLICATE KEY UPDATE
            points = points + VALUES(points)
        `;

        await pool.execute(query, [phoneNumber, pointsToAdd]);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;