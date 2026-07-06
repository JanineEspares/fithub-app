const express = require('express');
const orderController = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, orderController.index);
router.post('/', authMiddleware, orderController.create);

module.exports = router;
