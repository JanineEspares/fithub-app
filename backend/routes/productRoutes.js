const express = require('express');

const router = express.Router();

const productController = require('../controllers/productController');

const authenticate = require('../middleware/authMiddleware');
const authorizeAdmin = require('../middleware/adminMiddleware');
const upload = require('../middleware/uploadMiddleware');

const productValidator = require('../validators/productValidator');

router.get(
    '/',
    productController.index
);

router.get(
    '/:id',
    productController.show
);

router.post(
    '/',
    authenticate,
    authorizeAdmin,
    upload.array('images', 5),
    productValidator,
    productController.createProduct
);

router.put(
    '/:id',
    authenticate,
    authorizeAdmin,
    productValidator,
    productController.update
);

router.delete(
    '/:id',
    authenticate,
    authorizeAdmin,
    productController.deleteProduct
);

module.exports = router;