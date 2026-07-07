const db = require('../models');
const { generateReceiptPdf } = require('../services/pdfService');
const { sendTransactionUpdate } = require('../services/emailService');

exports.index = async (req, res, next) => {
    try {
        const where = req.user.role === 'admin' ? {} : { user_id: req.user.id };

        const transactions = await db.Transaction.findAll({
            where,
            include: [
                { model: db.User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: db.Order, as: 'order', attributes: ['id', 'order_number', 'status'] }
            ],
            order: [['id', 'DESC']]
        });

        res.status(200).json({
            success: true,
            message: 'Transactions retrieved successfully.',
            data: transactions
        });
    } catch (error) {
        next(error);
    }
};

exports.show = async (req, res, next) => {
    try {
        const transaction = await db.Transaction.findByPk(req.params.id, {
            include: [
                { model: db.User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: db.Order, as: 'order', attributes: ['id', 'order_number', 'status'] }
            ]
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found.'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Transaction retrieved successfully.',
            data: transaction
        });
    } catch (error) {
        next(error);
    }
};

exports.create = async (req, res, next) => {
    try {
        const payload = {
            order_id: req.body.order_id,
            user_id: req.user.role === 'admin' && req.body.user_id ? req.body.user_id : req.user.id,
            amount: req.body.amount,
            payment_method: req.body.payment_method || 'cod',
            status: req.body.status || 'pending'
        };

        const transaction = await db.Transaction.create(payload);

        res.status(201).json({
            success: true,
            message: 'Transaction created successfully.',
            data: transaction
        });
    } catch (error) {
        next(error);
    }
};

exports.update = async (req, res, next) => {
    try {
        const transaction = await db.Transaction.findByPk(req.params.id, {
            include: [
                { model: db.User, as: 'user', attributes: ['id', 'first_name', 'last_name', 'email'] },
                { model: db.Order, as: 'order', attributes: ['id', 'order_number', 'recipient_name', 'total_amount', 'status'] }
            ]
        });

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found.'
            });
        }

        await transaction.update({
            status: req.body.status || transaction.status,
            amount: req.body.amount || transaction.amount,
            payment_method: req.body.payment_method || transaction.payment_method
        });

        if (transaction.order) {

            let orderStatus = transaction.order.status;

            switch (transaction.status) {

                case 'paid':
                    orderStatus = 'processing';
                    break;

                case 'failed':
                    orderStatus = 'cancelled';
                    break;

                case 'refunded':
                    orderStatus = 'cancelled';
                    break;

                default:
                    orderStatus = 'pending';

            }

            await transaction.order.update({
                status: orderStatus
            });

        }

        const receiptPath = await generateReceiptPdf({
            transaction,
            user: transaction.user,
            order: transaction.order
        });

        await sendTransactionUpdate({
            to: transaction.user.email,
            subject: `FitHub Transaction Update #${transaction.id}`,
            text: `Your transaction status is now ${transaction.status}.`,
            html: `<p>Your transaction status is now <strong>${transaction.status}</strong>.</p>`,
            attachments: [{
                filename: `receipt-${transaction.id}.pdf`,
                path: receiptPath
            }]
        });

        res.status(200).json({
            success: true,
            message: 'Transaction updated successfully.',
            data: transaction
        });
    } catch (error) {
        next(error);
    }
};

exports.destroy = async (req, res, next) => {
    try {
        const transaction = await db.Transaction.findByPk(req.params.id);

        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found.'
            });
        }

        await transaction.destroy();

        res.status(200).json({
            success: true,
            message: 'Transaction deleted successfully.'
        });
    } catch (error) {
        next(error);
    }
};
