const db = require('../models');

exports.getActiveCart = async (userId) => {
    return await db.Cart.findOne({
        where: {
            user_id: userId,
            status: 'active'
        },
        include: [
            {
                model: db.CartItem,
                as: 'items',
                include: [
                    {
                        model: db.Product,
                        as: 'product'
                    }
                ]
            }
        ],
        order: [[db.CartItem, 'id', 'ASC']]
    });
};

exports.createCart = async (userId) => {
    return await db.Cart.create({
        user_id: userId,
        status: 'active'
    });
};

exports.addItem = async (cartId, productId, quantity) => {
    const product = await db.Product.findByPk(productId);

    if (!product || product.status !== 'active') {
        throw new Error('Product is unavailable.');
    }

    if (quantity < 1) {
        throw new Error('Quantity must be at least 1.');
    }

    return await db.CartItem.create({
        cart_id: cartId,
        product_id: productId,
        quantity
    });
};

exports.findCartItem = async (id) => {
    return await db.CartItem.findByPk(id, {
        include: [{ model: db.Cart, as: 'cart' }]
    });
};

exports.updateItem = async (item, quantity) => {
    if (quantity < 1) {
        throw new Error('Quantity must be at least 1.');
    }

    return await item.update({
        quantity
    });
};

exports.removeItem = async (item) => {
    return await item.destroy();
};