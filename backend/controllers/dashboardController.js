const db = require('../models');

exports.metrics = async (req, res, next) => {
    try {
        const [userCount, productCount, orderCount, transactionCount] = await Promise.all([
            db.User.count(),
            db.Product.count(),
            db.Order.count(),
            db.Transaction.count()
        ]);

        res.status(200).json({
            success: true,
            message: 'Dashboard metrics retrieved successfully.',
            data: {
                users: userCount,
                products: productCount,
                orders: orderCount,
                transactions: transactionCount
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.chartData = async (req, res, next) => {
    try {
        const statuses = ['pending', 'paid', 'failed', 'refunded'];

        const statusCounts = await Promise.all(
            statuses.map(async (status) => {
                const count = await db.Transaction.count({ where: { status } });
                return { status, count };
            })
        );

        res.status(200).json({
            success: true,
            message: 'Dashboard chart data retrieved successfully.',
            data: {
                transactionStatus: statusCounts
            }
        });
    } catch (error) {
        next(error);
    }
};
