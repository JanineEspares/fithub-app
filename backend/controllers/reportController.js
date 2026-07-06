const { Op } = require('sequelize');
const db = require('../models');

exports.salesSummary = async (req, res, next) => {
    try {
        const from = req.query.from ? new Date(req.query.from) : new Date('2000-01-01');
        const to = req.query.to ? new Date(req.query.to) : new Date();

        const transactions = await db.Transaction.findAll({
            where: {
                status: 'paid',
                created_at: {
                    [Op.between]: [from, to]
                }
            }
        });

        const totalSales = transactions.reduce((sum, t) => sum + Number(t.amount), 0);

        res.status(200).json({
            success: true,
            message: 'Sales summary generated successfully.',
            data: {
                from,
                to,
                transaction_count: transactions.length,
                total_sales: totalSales
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.inventorySummary = async (req, res, next) => {
    try {
        const inventory = await db.Inventory.findAll({
            include: [{ model: db.ProductVariant, as: 'productVariant' }]
        });

        res.status(200).json({
            success: true,
            message: 'Inventory summary generated successfully.',
            data: inventory
        });
    } catch (error) {
        next(error);
    }
};
