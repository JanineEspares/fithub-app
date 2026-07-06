const jwt = require('jsonwebtoken');
const db = require('../models');

const authenticate = async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {

        return res.status(401).json({
            success: false,
            message: 'Access token is missing.'
        });

    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await db.User.findByPk(decoded.id, {
            attributes: [
                'id',
                'first_name',
                'last_name',
                'email',
                'role',
                'status',
                'jwt_token'
            ]
        });

        if (!user || user.status !== 'active' || user.jwt_token !== token) {
            return res.status(401).json({
                success: false,
                message: 'Unauthorized access.'
            });
        }

        req.user = {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role: user.role,
            status: user.status
        };

        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token.'
        });
    }

};

module.exports = authenticate;