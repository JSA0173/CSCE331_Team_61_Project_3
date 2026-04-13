const express = require('express');
const router = express.Router();

router.post('/', async (req, res) => {
    const { message, menuContext } = req.body;
    const systemPrompt = `You are a friendly boba tea shop assistant. Help customers with menu information, recommendations, and ordering questions. Keep responses concise (2-3 sentences). Here is the current menu: ${menuContext || 'Menu not loaded'}`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: {
                    parts: [{ text: systemPrompt }]
                },
                contents: [{
                    role: 'user',
                    parts: [{ text: message }]
                }],
                generationConfig: {
                    maxOutputTokens: 2048
                }
            })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || JSON.stringify(data));
        const reply = data.candidates[0].content.parts[0].text;
        res.json({ reply });
    } catch (err) {
        console.error('Chat error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;