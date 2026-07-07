const express = require('express');

const router = express.Router();

const productController = require('../controllers/productController');

const authenticate = require('../middleware/authMiddleware');
const authorizeAdmin = require('../middleware/adminMiddleware');
const { customerMiddleware } = require('../middleware/customerMiddleware');
const upload = require('../middleware/uploadMiddleware');

const productValidator = require('../validators/productValidator');

// ===== CUSTOMER-FACING ENDPOINTS (PUBLIC/GUEST ALLOWED) =====

/**
 * List products with search, filter, sort, pagination
 * GET /api/products?search=&category_id=&sort=price&order=asc&page=1&limit=12&min_price=&max_price=
 */
router.get(
    '/',
    productController.listProducts
);

/**
 * Get featured/best-selling products
 * GET /api/products/featured
 */
router.get(
    '/featured',
    productController.getFeatured
);

/**
 * Get products by category
 * GET /api/products/category/:id?page=1&limit=12
 */
router.get(
    '/category/:id',
    productController.getByCategory
);

/**
 * Get product details with reviews
 * GET /api/products/:id
 */
router.get(
    '/:id',
    productController.show
);

// ===== ADMIN-ONLY ENDPOINTS =====

/**
 * Create new product
 * POST /api/products
 */
router.post(
    '/',
    authenticate,
    authorizeAdmin,
    upload.array('images', 5),
    productValidator,
    productController.createProduct
);

/**
 * Update product
 * PUT /api/products/:id
 */
router.put(
    '/:id',
    authenticate,
    authorizeAdmin,
    productValidator,
    productController.update
);

/**
 * Delete product
 * DELETE /api/products/:id
 */
router.delete(
    '/:id',
    authenticate,
    authorizeAdmin,
    productController.deleteProduct
);

module.exports = router;