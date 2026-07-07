const express = require('express');
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/sales', authMiddleware, roleMiddleware('admin'), reportController.salesSummary);
router.get('/inventory', authMiddleware, roleMiddleware('admin'), reportController.inventorySummary);
router.put('/inventory/:id', authMiddleware, roleMiddleware('admin'), reportController.updateInventory);

module.exports = router;
