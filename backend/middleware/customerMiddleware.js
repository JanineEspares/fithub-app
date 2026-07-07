/**
 * ============================================
 * CUSTOMER MIDDLEWARE
 * ============================================
 * Ensures the authenticated user is a customer
 * and has access to customer-specific features
 */

const apiResponse = require('../utils/apiResponse');

/**
 * Verify customer role
 * Used on routes that only customers should access
 * Example: /api/cart, /api/orders, /api/reviews
 */
exports.customerOnly = (req, res, next) => {
    try {
        // Ensure user is authenticated (authMiddleware runs first)
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. Please sign in to continue.'
            });
        }

        // Ensure user is a customer, not an admin
        if (req.user.role !== 'customer') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. This feature is for customers only.'
            });
        }

        // Ensure account is active
        if (req.user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated. Please contact support.'
            });
        }

        next();
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Authorization check failed.'
        });
    }
};

/**
 * Verify data ownership
 * Ensures customer can only access their own data
 * Used when accessing cart, orders, profile by ID
 * 
 * Example usage: app.get('/api/cart', authMiddleware, customerMiddleware, customerOwner('cartId'), controller)
 */
exports.ownsData = (paramName = 'userId') => {
    return (req, res, next) => {
        try {
            const requestedUserId = parseInt(req.params[paramName]);
            const authenticatedUserId = req.user.id;

            // Customer can only access their own data
            if (requestedUserId !== authenticatedUserId) {
                return res.status(403).json({
                    success: false,
                    message: 'You do not have permission to access this resource.'
                });
            }

            next();
        } catch (err) {
            res.status(500).json({
                success: false,
                message: 'Authorization check failed.'
            });
        }
    };
};

/**
 * Optional authentication
 * Allows both authenticated and guest users
 * Used on pages like product listing, search
 * 
 * Sets req.user if authenticated, otherwise null
 * req.isGuest will be true for unauthenticated users
 */
exports.optionalAuth = (req, res, next) => {
    try {
        // If authMiddleware already ran, user is already in req.user
        if (req.user) {
            req.isGuest = false;
        } else {
            req.isGuest = true;
            req.user = null;
        }
        next();
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Authentication check failed.'
        });
    }
};

/**
 * Guest only
 * Prevents authenticated users from accessing guest pages
 * Example: Redirect logged-in users from login page to home
 */
exports.guestOnly = (req, res, next) => {
    try {
        if (req.user && req.user.role === 'customer') {
            return res.status(403).json({
                success: false,
                message: 'You are already logged in.'
            });
        }
        next();
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Authorization check failed.'
        });
    }
};

module.exports = exports;
