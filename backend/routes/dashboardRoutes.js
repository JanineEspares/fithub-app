const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/metrics', authMiddleware, roleMiddleware('admin'), dashboardController.metrics);
router.get('/charts', authMiddleware, roleMiddleware('admin'), dashboardController.chartData);

module.exports = router;
