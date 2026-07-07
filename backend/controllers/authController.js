const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const apiResponse = require('../utils/apiResponse');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');

/**
 * ============================================
 * USER REGISTRATION CONTROLLER
 * ============================================
 * POST /api/auth/register
 * Register a new user account (Customer by default)
 */
exports.register = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed.',
            errors: errors.array()
        });
    }

    try {
        // Check if user already exists
        const existingUser = await authService.findUserByEmail(req.body.email);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email address is already registered.'
            });
        }

        // Hash password with bcrypt
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create new user (default role: customer)
        const user = await authService.registerUser({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: hashedPassword,
            phone_number: req.body.phone_number || null,
            address: req.body.address || null
        });

        return apiResponse.success(
            res,
            201,
            'User registered successfully.',
            {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone_number: user.phone_number,
                address: user.address,
                role: user.role,
                status: user.status,
                created_at: user.created_at
            }
        );

    } catch (err) {
        next(err);
    }
};

/**
 * ============================================
 * USER LOGIN CONTROLLER
 * ============================================
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
exports.login = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed.',
            errors: errors.array()
        });
    }

    try {
        // Call login service
        const result = await authService.loginUser(req.body.email, req.body.password);

        if (!result) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        // Check if admin and inactive
        if (result.user.role === 'admin' && result.user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Your admin account has been deactivated. Please contact support.'
            });
        }

        return apiResponse.success(
            res,
            200,
            'Login successful.',
            {
                token: result.token,
                user: {
                    id: result.user.id,
                    first_name: result.user.first_name,
                    last_name: result.user.last_name,
                    email: result.user.email,
                    role: result.user.role,
                    status: result.user.status
                }
            }
        );
    } catch (err) {
        next(err);
    }
};

/**
 * ============================================
 * USER LOGOUT CONTROLLER
 * ============================================
 * POST /api/auth/logout
 * Clear JWT token from database
 */
exports.logout = async (req, res, next) => {
    try {
        const userId = req.user.id;

        // Clear JWT token from database
        await db.User.update(
            { jwt_token: null },
            { where: { id: userId } }
        );

        return apiResponse.success(
            res,
            200,
            'Logout successful. Your session has been terminated.'
        );
    } catch (err) {
        next(err);
    }
};

/**
 * ============================================
 * GET USER PROFILE CONTROLLER
 * ============================================
 * GET /api/auth/profile
 * Get the authenticated user's profile
 */
exports.profile = async (req, res, next) => {
    try {
        const user = await db.User.findByPk(req.user.id, {
            attributes: [
                'id',
                'first_name',
                'last_name',
                'email',
                'role',
                'status',
                'created_at',
                'updated_at'
            ]
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        return apiResponse.success(
            res,
            200,
            'User profile retrieved successfully.',
            user
        );
    } catch (err) {
        next(err);
    }
};

/**
 * ============================================
 * REFRESH JWT TOKEN CONTROLLER
 * ============================================
 * POST /api/auth/refresh-token
 * Generate a new JWT token
 */
exports.refreshToken = async (req, res, next) => {
    try {
        const user = await db.User.findByPk(req.user.id);

        if (!user || user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Cannot refresh token for inactive user.'
            });
        }

        // Generate new token
        const newToken = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        // Save new token to database
        await user.update({
            jwt_token: newToken
        });

        return apiResponse.success(
            res,
            200,
            'Token refreshed successfully.',
            {
                token: newToken,
                user: {
                    id: user.id,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    role: user.role
                }
            }
        );
    } catch (err) {
        next(err);
    }
};

/**
 * ============================================
 * UPDATE CUSTOMER PROFILE
 * ============================================
 * PUT /api/customer/profile
 * Update customer's profile information
 * Authenticated customers only
 */
exports.updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { first_name, last_name, phone_number, address } = req.body;

        // Find user
        const user = await db.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Update allowed fields only
        const updateData = {};
        if (first_name) updateData.first_name = first_name;
        if (last_name) updateData.last_name = last_name;
        if (phone_number) updateData.phone_number = phone_number;
        if (address) updateData.address = address;

        await user.update(updateData);

        return apiResponse.success(
            res,
            200,
            'Profile updated successfully.',
            {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone_number: user.phone_number,
                address: user.address,
                role: user.role,
                status: user.status
            }
        );
    } catch (err) {
        next(err);
    }
};

/**
 * ============================================
 * CHANGE CUSTOMER PASSWORD
 * ============================================
 * POST /api/customer/change-password
 * Change customer's password
 * Authenticated customers only
 */
exports.changePassword = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required.'
            });
        }

        // Find user
        const user = await db.User.findByPk(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        // Verify current password
        const passwordMatch = await bcrypt.compare(current_password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect.'
            });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(new_password, 10);

        // Update password
        await user.update({ password: hashedPassword });

        return apiResponse.success(
            res,
            200,
            'Password changed successfully. Please log in again.'
        );
    } catch (err) {
        next(err);
    }
};
