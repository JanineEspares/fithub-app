const db = require('../models');

exports.getActiveCart = async (userId) => {
    return await db.Cart.findOne({
        where: {
            user_id: userId,
            status: 'active'
        },
        include: [{
            model: db.CartItem,
            as: 'items',
            include: [{
                model: db.Product,
                as: 'product'
            }]
        }]
    });
};

exports.checkout = async (userId, orderData) => {
    
    const cart = await exports.getActiveCart(userId);

    if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty.');
    }

    let totalAmount = 0;
    cart.items.forEach(item => {
        totalAmount += Number(item.product.base_price) * item.quantity;
    });

    const order = await db.Order.create({
        user_id: userId,
        order_number: `ORD-${Date.now()}`,
        recipient_name: orderData.recipient_name,
        contact_number: orderData.contact_number,
        address_line: orderData.address_line,
        address_line_2: orderData.address_line_2,
        city: orderData.city,
        province: orderData.province,
        postal_code: orderData.postal_code,
        total_amount: totalAmount,
        status: 'pending'
    });

    for (const item of cart.items) {
        await db.OrderItem.create({
            order_id: order.id,
            product_id: item.product.id,
            quantity: item.quantity,
            unit_price: item.product.base_price,
            subtotal: Number(item.product.base_price) * item.quantity
        });
    }

    await db.Transaction.create({
        order_id: order.id,
        user_id: userId,
        amount: totalAmount,
        payment_method: orderData.payment_method || 'cod',
        status: 'pending'
    });

    await cart.update({
        status: 'checked_out'
    });

    return order;
};