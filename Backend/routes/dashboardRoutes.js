const express = require('express');
const { getStats, getUpcoming } = require('../controllers/dashboardController');

const router = express.Router();

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard statistics
 */
router.get('/stats', getStats);

/**
 * @swagger
 * /api/dashboard/upcoming:
 *   get:
 *     summary: Get upcoming scheduled posts
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: List of upcoming posts
 */
router.get('/upcoming', getUpcoming);

module.exports = router;
