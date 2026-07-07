const db = require('../models');

// Mock payment processor: records a transaction and updates order status
exports.processPayment = async (req, res, next) => {
    try {
        const { order_id, payment_method, payment_reference } = req.body;
        const orderId = parseInt(order_id, 10);

        if (!orderId || !payment_method) {
            return res.status(400).json({ success: false, message: 'order_id and payment_method are required.' });
        }

        const order = await db.Order.findByPk(orderId);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

        // If customer, ensure they own the order
        if (req.user.role === 'customer' && order.user_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You do not have permission to pay for this order.' });
        }

        // Create transaction record
        const tx = await db.Transaction.create({
            order_id: order.id,
            user_id: req.user.id,
            amount: order.total_amount,
            payment_method: payment_method,
            status: 'paid'
        });

        // Update order status to confirmed
        await order.update({ status: 'confirmed' });

        return res.json({ success: true, message: 'Payment processed (mock).', data: { transaction: tx, order } });
    } catch (error) {
        next(error);
    }
};
