const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const aiService = require('../services/aiService');

// @route   POST /api/interview/chat
// @desc    Process a chat message for a smart interview
// @access  Private 
router.post('/chat', authMiddleware, async (req, res) => {
    const { messages, company, jobRole } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ message: "Messages array is required" });
    }

    try {
        const aiResponse = await aiService.conductInterview(messages, company, jobRole);
        res.json({ reply: aiResponse });
    } catch (err) {
        console.error("Interview Chat Error: ", err);
        res.status(500).json({ message: "Error processing interview chat" });
    }
});

module.exports = router;
