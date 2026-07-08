const db = require('../models');
const orderService = require('../services/orderService');
const apiResponse = require('../utils/apiResponse');

exports.index = async (req, res, next) => {
    try {
        const orders = await db.Order.findAll({
            where: {
                user_id: req.user.id
            },
            include: [{
                model: db.OrderItem,
                as: 'items',
                include: [{ model: db.Product, as: 'product' }]
            }],
            order: [['created_at', 'DESC']]
        });

        return apiResponse.success(
            res,
            200,
            'Orders retrieved successfully.',
            orders
        );
    } catch (error) {
        next(error);
    }
};

exports.show = async (req, res, next) => {
    try {
        const orderId = parseInt(req.params.id, 10);
        const order = await db.Order.findOne({
            where: {
                id: orderId,
                user_id: req.user.id
            },
            include: [{
                model: db.OrderItem,
                as: 'items',
                include: [{ model: db.Product, as: 'product' }]
            }]
        });

        if (!order) {
            return apiResponse.error(res, 404, 'Order not found.');
        }

        return apiResponse.success(
            res,
            200,
            'Order retrieved successfully.',
            order
        );
    } catch (error) {
        next(error);
    }
};

exports.customerOrders = async (req, res, next) => {
    return exports.index(req, res, next);
};

exports.checkout = async (req, res, next) => {

    try {
        const order = await orderService.checkout(
            req.user.id,
            req.body
        );

        return apiResponse.success(
            res,
            201,
            'Checkout completed successfully.',
            order
        );

    } catch (error) {
        if (error.message === 'Cart is empty.' || error.message === 'Insufficient stock for one or more items.' || error.message === 'One or more items are no longer available.') {
            return apiResponse.error(res, 400, error.message);
        }

        next(error);
    }

};
