const express = require('express');
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');
const customerMiddleware = require('../middleware/customerMiddleware');

const router = express.Router();

router.get(
    '/eligible/:productId',
    authMiddleware,
    customerMiddleware.customerOnly,
    reviewController.checkEligibility
);

router.post(
    '/',
    authMiddleware,
    customerMiddleware.customerOnly,
    reviewController.createReview
);

module.exports = router;
