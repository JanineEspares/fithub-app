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

exports.show = async (req, res, next) => {

    try {

        const product = await productService.getProductById(req.params.id);

        if (!product) {

            return apiResponse.error(
                res,
                404,
                'Product not found.'
            );

        }

        return apiResponse.success(
            res,
            200,
            'Product retrieved successfully.',
            product
        );

    } catch (err) {

        next(err);

    }

};

exports.update = async (req, res, next) => {

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

        const product = await productService.updateProduct(
            req.params.id,
            req.body
        );

        if (!product) {

            return apiResponse.error(
                res,
                404,
                'Product not found.'
            );

        }

        return apiResponse.success(
            res,
            200,
            'Product updated successfully.',
            product
        );

    } catch (err) {

        next(err);

    }

};

exports.deleteProduct = async (req, res, next) => {

    try {

        const deleted = await productService.deleteProduct(
            req.params.id
        );

        if (!deleted) {

            return apiResponse.error(
                res,
                404,
                'Product not found.'
            );

        }

        return apiResponse.success(
            res,
            200,
            'Product deleted successfully.'
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

        if (req.files && req.files.length > 0) {
            const images = req.files.map((file, index) => ({
                product_id: product.id,
                image_path: file.path,
                is_primary: index === 0
            }));

            await productService.attachProductImages(images);
        }

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