const express = require('express');

const router = express.Router();

const orderController = require('../controllers/orderController');

const authMiddleware = require('../middleware/authMiddleware');
const customerMiddleware = require('../middleware/customerMiddleware');

router.get(
    '/',
    authMiddleware,
    customerMiddleware.customerOnly,
    orderController.index
);

router.get(
    '/:id',
    authMiddleware,
    customerMiddleware.customerOnly,
    orderController.show
);

router.post(
    '/checkout',
    authMiddleware,
    customerMiddleware.customerOnly,
    orderController.checkout
);

module.exports = router;
