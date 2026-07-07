const productService = require('../services/productService');
const apiResponse = require('../utils/apiResponse');
const { validationResult } = require('express-validator');

/**
 * List products with search, filter, sort, and pagination (customer-friendly)
 * GET /api/products?search=&category_id=&sort=&order=&page=&limit=&min_price=&max_price=
 */
exports.listProducts = async (req, res, next) => {
    try {
        const {
            search = '',
            category_id = null,
            sort = 'name',
            order = 'asc',
            page = 1,
            limit = 12,
            min_price = null,
            max_price = null
        } = req.query;

        const products = await productService.getAllProducts(req.query);

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

/**
 * Get product with full details and reviews
 * GET /api/products/:id
 */
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

        // Include average rating if there are reviews
        const reviews = product.reviews || [];
        const avgRating = reviews.length > 0
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : 0;

        // Format product response
        const productData = {
            ...product.toJSON(),
            average_rating: parseFloat(avgRating),
            review_count: reviews.length,
            in_stock: product.inventory && product.inventory.quantity > 0
        };

        return apiResponse.success(
            res,
            200,
            'Product retrieved successfully.',
            productData
        );
    } catch (err) {
        next(err);
    }
};

/**
 * Get featured/best-selling products
 * GET /api/products/featured
 */
exports.getFeatured = async (req, res, next) => {
    try {
        const { limit = 6 } = req.query;

        const products = await productService.getFeaturedProducts(
            Math.min(parseInt(limit) || 6, 20)
        );

        return apiResponse.success(
            res,
            200,
            'Featured products retrieved successfully.',
            products
        );
    } catch (err) {
        next(err);
    }
};

/**
 * Get products by category
 * GET /api/products/category/:id
 */
exports.getByCategory = async (req, res, next) => {
    try {
        const { page = 1, limit = 12 } = req.query;

        const result = await productService.getProductsByCategory(
            req.params.id,
            {
                page: parseInt(page) || 1,
                limit: Math.min(parseInt(limit) || 12, 50)
            }
        );

        return apiResponse.success(
            res,
            200,
            'Category products retrieved successfully.',
            result
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