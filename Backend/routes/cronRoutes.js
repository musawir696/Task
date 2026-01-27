const express = require('express');
const router = express.Router();
const { publishScheduledPosts } = require('../utils/scheduler');

// This endpoint will be called by Vercel Cron
router.get('/publish-posts', async (req, res) => {
    // Basic security check to prevent unauthorized external access
    // Vercel Cron sends a specific header, but checking a shared secret is safer
    // The CRON_SECRET env var must be set in Vercel project settings
    const authHeader = req.headers.authorization;
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        // Log attempt (optional)
        console.warn('Unauthorized cron attempt');
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        console.log('Vercel Cron triggered: Publishing scheduled posts...');
        const result = await publishScheduledPosts();
        res.json({ success: true, ...result });
    } catch (error) {
        console.error('Vercel Cron Error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
