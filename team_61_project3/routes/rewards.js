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

router.post('/getPoints', async (req, res) => {
    try {
        let { phoneNumber } = req.body;

        phoneNumber = phoneNumber.replace(/\D/g, '');

        const result = await pool.query(
            `SELECT "points"
             FROM public."Rewards"
             WHERE "phone_number" = $1`,
            [phoneNumber]
        );

        res.json({ points: Number(result.rows[0]?.points) || 0 });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;