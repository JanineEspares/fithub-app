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
        ]
    });
};

exports.createCart = async (userId) => {
    return await db.Cart.create({
        user_id: userId,
        status: 'active'
    });
};

exports.addItem = async (cartId, productId, quantity) => {
    return await db.CartItem.create({
        cart_id: cartId,
        product_id: productId,
        quantity
    });
};

exports.findCartItem = async (id) => {
    return await db.CartItem.findByPk(id);
};

exports.updateItem = async (item, quantity) => {
    return await item.update({
        quantity
    });
};

exports.removeItem = async (item) => {
    return await item.destroy();
};