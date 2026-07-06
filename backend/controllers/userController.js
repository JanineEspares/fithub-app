const db = require('../models');

exports.profile = async (req, res) => {

    res.status(200).json({

        success: true,

        message: 'User profile retrieved successfully.',

        user: req.user

    });

};

exports.listUsers = async (req, res, next) => {
    try {
        const users = await db.User.findAll({
            attributes: [
                'id',
                'first_name',
                'last_name',
                'email',
                'role',
                'status',
                'created_at'
            ],
            order: [['id', 'DESC']]
        });

        res.status(200).json({
            success: true,
            message: 'Users retrieved successfully.',
            data: users
        });
    } catch (error) {
        next(error);
    }
};

exports.updateRole = async (req, res, next) => {
    try {
        const user = await db.User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        if (!['admin', 'customer'].includes(req.body.role)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role value.'
            });
        }

        await user.update({
            role: req.body.role
        });

        res.status(200).json({
            success: true,
            message: 'User role updated successfully.',
            data: {
                id: user.id,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
};

exports.deactivateUser = async (req, res, next) => {
    try {
        const user = await db.User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found.'
            });
        }

        await user.update({
            status: 'inactive',
            jwt_token: null
        });

        res.status(200).json({
            success: true,
            message: 'User deactivated successfully.',
            data: {
                id: user.id,
                status: user.status
            }
        });
    } catch (error) {
        next(error);
    }
};