const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');
const orderController = require('../controllers/orderController');
const registerValidator = require('../validators/registerValidator');
const loginValidator = require('../validators/loginValidator');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const customerMiddleware = require('../middleware/customerMiddleware');

// ============================================
// PUBLIC ROUTES (No Authentication Required)
// ============================================

/**
 * POST /api/auth/register
 * Register a new customer account
 */
router.post(
    '/register',
    registerValidator,
    authController.register
);

/**
 * POST /api/auth/login
 * Login with email and password
 * Returns JWT token and user info
 */
router.post(
    '/login',
    loginValidator,
    authController.login
);

// ============================================
// PROTECTED ROUTES (Authentication Required)
// ============================================

/**
 * GET /api/auth/admin
 * Verify admin access (protected route)
 * Returns success if user is admin
 */
router.get(
    '/admin',
    authMiddleware,
    adminMiddleware,
    (req, res) => {
        res.json({
            success: true,
            message: 'Welcome, Admin!',
            user: req.user
        });
    }
);

/**
 * POST /api/auth/logout
 * Logout the current user
 * Clears the JWT token from the database
 */
router.post(
    '/logout',
    authMiddleware,
    authController.logout
);

/**
 * GET /api/auth/profile
 * Get the current user's profile
 * Requires authentication
 */
router.get(
    '/profile',
    authMiddleware,
    authController.profile
);

/**
 * POST /api/auth/refresh-token
 * Refresh the JWT token
 * Requires a valid existing token
 */
router.post(
    '/refresh-token',
    authMiddleware,
    authController.refreshToken
);

// ============================================
// CUSTOMER-SPECIFIC ROUTES
// ============================================

/**
 * PUT /api/customer/profile
 * Update customer's profile information
 * Requires authentication and customer role
 */
router.put(
    '/customer/profile',
    authMiddleware,
    customerMiddleware.customerOnly,
    authController.updateProfile
);

/**
 * POST /api/customer/change-password
 * Change customer's password
 * Requires authentication and customer role
 */
router.post(
    '/customer/change-password',
    authMiddleware,
    customerMiddleware.customerOnly,
    authController.changePassword
);

router.get(
    '/customer/orders',
    authMiddleware,
    customerMiddleware.customerOnly,
    orderController.customerOrders
);

module.exports = router;