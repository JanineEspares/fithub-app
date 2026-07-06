const db = require('../models');

exports.getCart = async (req, res, next) => {
    try {
        const cart = await db.Cart.findOne({
            where: { user_id: req.user.id, status: 'active' },
            include: [{
                model: db.CartItem,
                as: 'items',
                include: [{
                    model: db.ProductVariant,
                    as: 'productVariant'
                }]
            }]
        });

        res.status(200).json({
            success: true,
            message: 'Cart retrieved successfully.',
            data: cart
        });
    } catch (error) {
        next(error);
    }
};

exports.addToCart = async (req, res, next) => {
    try {
        let cart = await db.Cart.findOne({
            where: { user_id: req.user.id, status: 'active' }
        });

        if (!cart) {
            cart = await db.Cart.create({
                user_id: req.user.id,
                status: 'active'
            });
        }

        const item = await db.CartItem.create({
            cart_id: cart.id,
            product_variant_id: req.body.product_variant_id,
            quantity: req.body.quantity || 1
        });

        res.status(201).json({
            success: true,
            message: 'Item added to cart.',
            data: item
        });
    } catch (error) {
        next(error);
    }
};

exports.updateCartItem = async (req, res, next) => {
    try {
        const item = await db.CartItem.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found.'
            });
        }

        await item.update({
            quantity: req.body.quantity
        });

        res.status(200).json({
            success: true,
            message: 'Cart item updated.',
            data: item
        });
    } catch (error) {
        next(error);
    }
};

exports.removeCartItem = async (req, res, next) => {
    try {
        const item = await db.CartItem.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found.'
            });
        }

        await item.destroy();

        res.status(200).json({
            success: true,
            message: 'Cart item removed.'
        });
    } catch (error) {
        next(error);
    }
};
