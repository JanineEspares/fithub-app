const { body } = require('express-validator');

const registerValidator = [

    body('first_name')
        .trim()
        .notEmpty()
        .withMessage('First name is required.'),

    body('last_name')
        .trim()
        .notEmpty()
        .withMessage('Last name is required.'),

    body('email')
        .trim()
        .isEmail()
        .withMessage('A valid email address is required.')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long.'),

    body('phone_number')
        .optional()
        .trim()
        .matches(/^[0-9+\-\s()]*$/)
        .withMessage('Phone number format is invalid.'),

    body('address')
        .optional()
        .trim()

];

module.exports = registerValidator;