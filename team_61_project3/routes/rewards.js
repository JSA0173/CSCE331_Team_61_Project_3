const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
    try {
        let { phoneNumber, pointsToAdd } = req.body;

        // Normalize phone number (remove dashes, spaces, etc.)
        phoneNumber = phoneNumber.replace(/\D/g, '');

        const query = `
            INSERT INTO public."Rewards" ("phone_number", "points")
            VALUES ($1, $2)
            ON CONFLICT ("phone_number")
            DO UPDATE SET
            "points" = public."Rewards"."points" + EXCLUDED."points"
        `;

        await pool.query(query, [phoneNumber, pointsToAdd]);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;