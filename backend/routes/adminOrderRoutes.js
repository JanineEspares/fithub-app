const express = require('express');
const adminOrderController = require('../controllers/adminOrderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Update order status and optionally tracking info
router.patch('/:id/status', authMiddleware, adminMiddleware, adminOrderController.updateStatus);

// Add shipment info and mark as shipped
router.post('/:id/ship', authMiddleware, adminMiddleware, adminOrderController.addShipment);

module.exports = router;
