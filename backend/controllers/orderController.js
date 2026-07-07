const orderService = require('../services/orderService');
const apiResponse = require('../utils/apiResponse');

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
        next(error);
    }

};
