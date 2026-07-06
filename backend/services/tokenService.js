const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

exports.generateToken = (payload) => {
    return jwt.sign(payload, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn
    });
};
