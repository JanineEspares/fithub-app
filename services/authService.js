const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models');

exports.findUserByEmail = async (email) => {

    return await db.User.findOne({

        where: {
            email: email
        }

    });

};

exports.registerUser = async (userData) => {

    const user = await db.User.create({

        first_name: userData.first_name,

        last_name: userData.last_name,

        email: userData.email,

        password: userData.password,

        role: 'customer',

        status: 'active'

    });

    return user;

};

exports.loginUser = async (email, password) => {
    const user = await db.User.findOne({
        where: {
            email
        }
    });

    if (!user) {
        return null;
    }

    const passwordMatch = await bcrypt.compare(
        password,
        user.password
    );

    if (!passwordMatch) {
        return null;
    }

    const token = jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role
        },

        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN
        }
    );

    return {
        token,
        user
    };
};
