const express = require('express');

const router = express.Router();

const productController = require('../controllers/productController');

const authenticate = require('../middleware/authMiddleware');
const authorizeAdmin = require('../middleware/adminMiddleware');

const productValidator = require('../validators/productValidator');

router.get(
    '/',
    productController.index
);

router.post(
    '/',
    authenticate,
    authorizeAdmin,
    productValidator,
    productController.createProduct
);

module.exports = router;