const db = require('../models');

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

        const variant = await resolveCartVariant(req.body.product_id, req.body.product_variant_id);

        if (!variant) {
            return res.status(400).json({
                success: false,
                message: 'Unable to resolve a product variant for this item.'
            });
        }

        const item = await db.CartItem.create({
            cart_id: cart.id,
            product_variant_id: variant.id,
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
