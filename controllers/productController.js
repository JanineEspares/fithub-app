const productService = require('../services/productService');
const apiResponse = require('../utils/apiResponse');
const { validationResult } = require('express-validator');

exports.index = async (req, res, next) => {

    try {

        const products = await productService.getAllProducts();

        return apiResponse.success(
            res,
            200,
            'Products retrieved successfully.',
            products
        );

    } catch (err) {

        next(err);

    }

};

exports.createProduct = async (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {

        return apiResponse.error(
            res,
            400,
            'Validation failed.',
            errors.array()
        );

    }

    try {

        const product = await productService.createProduct(req.body);

        return apiResponse.success(
            res,
            201,
            'Product created successfully.',
            product
        );

    } catch (err) {

        next(err);

    }

};