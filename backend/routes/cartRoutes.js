const express = require('express');
const cartController = require('../controllers/cartController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, cartController.getCart);
router.post('/items', authMiddleware, cartController.addToCart);
router.patch('/items/:id', authMiddleware, cartController.updateCartItem);
router.delete('/items/:id', authMiddleware, cartController.removeCartItem);

module.exports = router;
