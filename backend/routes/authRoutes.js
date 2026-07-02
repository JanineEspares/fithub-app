const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');
const registerValidator = require('../validators/registerValidator');
const loginValidator = require('../validators/loginValidator');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post(
    '/register',
    registerValidator,
    authController.register
);

router.post(
    '/login',
    loginValidator,
    authController.login
);

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

module.exports = router;