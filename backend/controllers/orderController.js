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

exports.create = async (req, res, next) => {
    try {
        const items = Array.isArray(req.body.items) ? req.body.items : [];

        if (!items.length) {
            return res.status(400).json({
                success: false,
                message: 'At least one item is required for checkout.'
            });
        }

        let subtotal = 0;
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

        for (const item of items) {
            const quantity = Math.max(1, Number(item.quantity || 1));
            let variant = null;

            if (item.product_variant_id) {
                variant = await db.ProductVariant.findByPk(item.product_variant_id);
            } else if (item.product_id) {
                const product = await db.Product.findByPk(item.product_id);
                if (product) {
                    variant = await db.ProductVariant.findOne({
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
                }
            }

            if (!variant) {
                continue;
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

        await order.update({ total_amount: subtotal });

        await db.Transaction.create({
            order_id: order.id,
            user_id: req.user.id,
            amount: subtotal,
            payment_method: req.body.payment_method || 'cod',
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: 'Order created successfully.',
            data: {
                order,
                total: subtotal
            }
        });
    } catch (error) {
        next(error);
    }
};
