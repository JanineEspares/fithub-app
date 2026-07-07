const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, orderController.index);
router.get('/:id', authMiddleware, orderController.show);
router.post('/', authMiddleware, orderController.create);

module.exports = router;
