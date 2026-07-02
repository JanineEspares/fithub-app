const { validationResult } = require('express-validator');
const authService = require('../services/authService');
const apiResponse = require('../utils/apiResponse');
const bcrypt = require('bcrypt');

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

        const existingUser = await authService.findUserByEmail(req.body.email);

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email address is already registered.'
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = await authService.registerUser({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            password: hashedPassword
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
                role: user.role,
                status: user.status,
                created_at: user.created_at
            }
        );

    } catch (err) {
        next(err);
    }
};

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
        const result = await authService.loginUser(req.body.email, req.body.password);

        if (!result) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
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
