const { body } = require('express-validator');

const productValidator = [

    body('category_id')
        .isInt()
        .withMessage('Category is required.'),

    body('name')
        .trim()
        .notEmpty()
        .withMessage('Product name is required.'),

    body('description')
        .optional(),

    body('base_price')
        .isFloat({ min: 0 })
        .withMessage('Base price must be a valid number.')

];

module.exports = productValidator;