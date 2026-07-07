const express = require('express');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');
const customerMiddleware = require('../middleware/customerMiddleware');

const router = express.Router();

router.get('/', authMiddleware, customerMiddleware.customerOnly, cartController.getCart);
router.post('/items', authMiddleware, customerMiddleware.customerOnly, cartController.addToCart);
router.patch('/items/:id', authMiddleware, customerMiddleware.customerOnly, cartController.updateCartItem);
router.delete('/items/:id', authMiddleware, customerMiddleware.customerOnly, cartController.removeCartItem);

module.exports = router;
