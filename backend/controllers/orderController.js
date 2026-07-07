const db = require('../models');

const buildOrderNumber = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;

exports.index = async (req, res, next) => {
    try {
        const where = req.user.role === 'admin' ? {} : { user_id: req.user.id };

        const orders = await db.Order.findAll({
            where,
            order: [['id', 'DESC']]
        });

        res.status(200).json({
            success: true,
            message: 'Orders retrieved successfully.',
            data: orders
        });
    } catch (error) {
        next(error);
    }
};

exports.show = async (req, res, next) => {
    try {
        const order = await db.Order.findOne({
            where: { id: req.params.id },
            include: [{
                model: db.OrderItem,
                as: 'items',
                include: [{
                    model: db.ProductVariant,
                    as: 'productVariant',
                    include: [{ model: db.Product, as: 'product' }]
                }]
            }]
        });

        if (!order || (req.user.role !== 'admin' && order.user_id !== req.user.id)) {
            return res.status(404).json({
                success: false,
                message: 'Order not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Order retrieved successfully.',
            data: order
        });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const cart = await db.Cart.findOne({
            where: { user_id: req.user.id, status: 'active' },
            include: [{
                model: db.CartItem,
                as: 'items',
                include: [{ model: db.ProductVariant, as: 'productVariant' }]
            }]
        });

        if (!cart || !cart.items || cart.items.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Your cart is empty. Add items before checking out.'
            });
        }

        let subtotal = 0;
        const shipping = 75;
        const order = await db.Order.create({
            user_id: req.user.id,
            order_number: buildOrderNumber(),
            recipient_name: req.body.recipient_name || `${req.user.first_name} ${req.user.last_name}`,
            contact_number: req.body.contact_number || '',
            address_line: req.body.address_line || '',
            city: req.body.city || '',
            province: req.body.province || '',
            postal_code: req.body.postal_code || '',
            total_amount: 0,
            status: 'pending'
        });

        for (const cartItem of cart.items) {
            const quantity = Math.max(1, Number(cartItem.quantity || 1));
            const variant = cartItem.productVariant;

            if (!variant) {
                continue;
            }

            if (variant.stock_quantity !== undefined && quantity > variant.stock_quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${variant.variant_name || 'a product'}.`
                });
            }

            const unitPrice = Number(variant.price || 0);
            const lineSubtotal = unitPrice * quantity;
            subtotal += lineSubtotal;

            await db.OrderItem.create({
                order_id: order.id,
                product_variant_id: variant.id,
                quantity,
                unit_price: unitPrice,
                subtotal: lineSubtotal
            });

            const nextStock = Math.max(0, Number(variant.stock_quantity || 0) - quantity);
            await variant.update({ stock_quantity: nextStock });
        }

        const totalAmount = subtotal + shipping;
        await order.update({ total_amount: totalAmount });

        await db.Transaction.create({
            order_id: order.id,
            user_id: req.user.id,
            amount: totalAmount,
            payment_method: req.body.payment_method || 'cod',
            status: 'pending'
        });

        await cart.update({ status: 'checked_out' });

        res.status(201).json({
            success: true,
            message: 'Order created successfully.',
            data: {
                order,
                total: totalAmount
            }
        });
    } catch (error) {
        next(error);
    }
};
