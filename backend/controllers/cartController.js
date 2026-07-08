const cartService = require('../services/cartService');
const apiResponse = require('../utils/apiResponse');
const db = require('../models');

exports.getCart = async (req, res, next) => {
    try {

        const cart = await cartService.getActiveCart(req.user.id);

        return apiResponse.success(
            res,
            200,
            'Cart retrieved successfully.',
            cart
        );

    } catch (error) {
        next(error);
    }
};

exports.addToCart = async (req, res, next) => {

    try {
        const productId = parseInt(req.body.product_id, 10);
        const quantity = parseInt(req.body.quantity || 1, 10);

        if (!productId) {
            return apiResponse.error(res, 400, 'A valid product id is required.');
        }

        let cart = await cartService.getActiveCart(req.user.id);

        if (!cart) {
            cart = await cartService.createCart(req.user.id);
        }

        const item = await cartService.addItem(
            cart.id,
            productId,
            quantity
        );

        return apiResponse.success(
            res,
            201,
            'Item added to cart.',
            item
        );

    } catch (error) {
        next(error);
    }

};

exports.updateCartItem = async (req, res, next) => {

    try {
        const item = await cartService.findCartItem(req.params.id);

        if (!item) {
            return apiResponse.error(
                res,
                404,
                'Cart item not found.'
            );
        }

        if (!item.cart || item.cart.user_id !== req.user.id) {
            return apiResponse.error(res, 403, 'You do not have access to this cart item.');
        }

        const updatedItem = await cartService.updateItem(
            item,
            parseInt(req.body.quantity, 10)
        );

        return apiResponse.success(
            res,
            200,
            'Cart item updated.',
            updatedItem
        );

    } catch (error) {
        next(error);
    }

};

exports.removeCartItem = async (req, res, next) => {

    try {
        const item = await cartService.findCartItem(req.params.id);

        if (!item) {
            return apiResponse.error(
                res,
                404,
                'Cart item not found.'
            );
        }

        if (!item.cart || item.cart.user_id !== req.user.id) {
            return apiResponse.error(res, 403, 'You do not have access to this cart item.');
        }

        await cartService.removeItem(item);

        return apiResponse.success(
            res,
            200,
            'Cart item removed.'
        );

    } catch (error) {
        next(error);
    }

};
