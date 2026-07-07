const express = require('express');
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const customerMiddleware = require('../middleware/customerMiddleware');

const router = express.Router();

// Process payment (mock). Customers and admins can call this.
router.post('/process', authMiddleware, paymentController.processPayment);

module.exports = router;
