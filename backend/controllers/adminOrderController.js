const db = require('../models');

exports.updateStatus = async (req, res, next) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        const { status, tracking_number, shipment_provider } = req.body;

        if (!orderId) return res.status(400).json({ success: false, message: 'Invalid order id.' });

        const order = await db.Order.findByPk(orderId);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

        const allowedStatuses = ['pending','confirmed','preparing','packing','shipped','delivered','cancelled'];
        if (status && !allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value.' });
        }

        const updates = {};
        if (status) updates.status = status;
        if (tracking_number) updates.tracking_number = tracking_number;
        if (shipment_provider) updates.shipment_provider = shipment_provider;

        await order.update(updates);

        return res.json({ success: true, message: 'Order updated successfully.', data: order });
    } catch (error) {
        next(error);
    }
};

exports.addShipment = async (req, res, next) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        const { tracking_number, shipment_provider } = req.body;

        if (!orderId) return res.status(400).json({ success: false, message: 'Invalid order id.' });

        const order = await db.Order.findByPk(orderId);
        if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

        await order.update({ tracking_number: tracking_number || null, shipment_provider: shipment_provider || null, status: 'shipped' });

        return res.json({ success: true, message: 'Shipment info recorded and order marked shipped.', data: order });
    } catch (error) {
        next(error);
    }
};
