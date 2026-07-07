const db = require('../models');

exports.createReview = async (req, res, next) => {
    try {
        const productId = parseInt(req.body.product_id, 10);
        const rating = parseInt(req.body.rating, 10);
        const comment = req.body.comment?.trim() || '';

        if (!productId || !rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Product and a valid rating are required.'
            });
        }

        const product = await db.Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found.'
            });
        }

        const hasPurchased = await db.OrderItem.findOne({
            include: [
                {
                    model: db.Order,
                    as: 'order',
                    where: {
                        user_id: req.user.id,
                        status: 'delivered'
                    }
                },
                {
                    model: db.ProductVariant,
                    as: 'productVariant',
                    where: { product_id: productId }
                }
            ]
        });

        if (!hasPurchased) {
            return res.status(403).json({
                success: false,
                message: 'Reviews may only be submitted for products you have received.'
            });
        }

        const existingReview = await db.Review.findOne({
            where: {
                user_id: req.user.id,
                product_id: productId
            }
        });

        if (existingReview) {
            return res.status(409).json({
                success: false,
                message: 'You have already submitted a review for this product.'
            });
        }

        const review = await db.Review.create({
            user_id: req.user.id,
            product_id: productId,
            rating,
            comment
        });

        res.status(201).json({
            success: true,
            message: 'Review submitted successfully.',
            data: review
        });
    } catch (error) {
        next(error);
    }
};

exports.checkEligibility = async (req, res, next) => {
    try {
        const productId = parseInt(req.params.productId, 10);
        if (!productId) {
            return res.status(400).json({ success: false, message: 'Invalid product id.' });
        }

        const product = await db.Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found.' });
        }

        const hasPurchased = await db.OrderItem.findOne({
            include: [
                {
                    model: db.Order,
                    as: 'order',
                    where: {
                        user_id: req.user.id,
                        status: 'delivered'
                    }
                },
                {
                    model: db.ProductVariant,
                    as: 'productVariant',
                    where: { product_id: productId }
                }
            ]
        });

        return res.json({
            success: true,
            data: { eligible: !!hasPurchased },
            message: hasPurchased ? 'Eligible to review.' : 'Not eligible to review.'
        });
    } catch (error) {
        next(error);
    }
};
