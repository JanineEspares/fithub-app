const cartService = require('../services/cartService');
const apiResponse = require('../utils/apiResponse');

const resolveCartVariant = async (productId, fallbackVariantId) => {
    if (fallbackVariantId) {
        return await db.ProductVariant.findByPk(fallbackVariantId);
    }

    if (!productId) {
        return null;
    }

    const product = await db.Product.findByPk(productId);
    if (!product) {
        return null;
    }

    let variant = await db.ProductVariant.findOne({
        where: { product_id: product.id, status: 'active' }
    });

    if (!variant) {
        variant = await db.ProductVariant.create({
            product_id: product.id,
            variant_name: 'Default',
            sku: `SKU-${product.id}-${Date.now()}`,
            price: product.base_price,
            stock_quantity: 100,
            status: 'active'
        });
    }

    return variant;
};

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

        let cart = await cartService.getActiveCart(req.user.id);

        if (!cart) {
            cart = await cartService.createCart(req.user.id);
        }

        const item = await cartService.addItem(
            cart.id,
            req.body.product_id,
            req.body.quantity || 1
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

        const updatedItem = await cartService.updateItem(
            item,
            req.body.quantity
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
