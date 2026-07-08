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
    return await db.sequelize.transaction(async (transaction) => {
        const cart = await exports.getActiveCart(userId);

        if (!cart || cart.items.length === 0) {
            throw new Error('Cart is empty.');
        }

        let totalAmount = 0;
        for (const item of cart.items) {
            const product = item.product;
            if (!product || product.status !== 'active') {
                throw new Error('One or more items are no longer available.');
            }

            const variant = await db.ProductVariant.findOne({
                where: { product_id: product.id, status: 'active' },
                transaction
            });

            const inventory = await db.Inventory.findOne({
                where: { product_variant_id: variant?.id },
                transaction
            });

            const availableStock = Number((inventory?.current_stock || 0) - (inventory?.reserved_stock || 0));
            if (variant && inventory && availableStock < item.quantity) {
                throw new Error('Insufficient stock for one or more items.');
            }

            totalAmount += Number(product.base_price) * item.quantity;
        }

        const order = await db.Order.create({
            user_id: userId,
            order_number: `ORD-${Date.now()}`,
            recipient_name: orderData.recipient_name,
            contact_number: orderData.contact_number,
            address_line: orderData.address_line,
            city: orderData.city,
            province: orderData.province,
            postal_code: orderData.postal_code,
            total_amount: totalAmount,
            status: 'pending'
        }, { transaction });

        for (const item of cart.items) {
            const product = item.product;
            const variant = await db.ProductVariant.findOne({
                where: { product_id: product.id, status: 'active' },
                transaction
            });
            const inventory = await db.Inventory.findOne({
                where: { product_variant_id: variant?.id },
                transaction
            });

            await db.OrderItem.create({
                order_id: order.id,
                product_id: product.id,
                quantity: item.quantity,
                unit_price: product.base_price,
                subtotal: Number(product.base_price) * item.quantity
            }, { transaction });

            if (inventory) {
                await inventory.update({
                    current_stock: Number(inventory.current_stock) - item.quantity,
                    reserved_stock: Number(inventory.reserved_stock)
                }, { transaction });
            }
        }

        await db.Transaction.create({
            order_id: order.id,
            user_id: userId,
            amount: totalAmount,
            payment_method: orderData.payment_method || 'cod',
            status: 'pending'
        }, { transaction });

        await cart.update({
            status: 'checked_out'
        }, { transaction });

        return order;
    });
};