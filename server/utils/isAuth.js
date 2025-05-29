const jwt = require('jsonwebtoken');
const RefreshToken = require('../models/refresh-token');
const User = require('../models/user');

exports.isAuth = async (req, res, next) => {
    try {
        let authHeader = req.get('Authorization');
        console.log(req.user);
        if (!authHeader && !req.user) {
            const error = new Error('Not authenticated.');
            error.statusCode = 401;
            throw error;
        }
        authHeader = authHeader.split(' ')[1];

        if (req.user) {
            const checkAccess = req.user.accessToken === authHeader;
            if (!checkAccess) {
                const error = new Error('Not authenticated, token mismatch.');
                error.statusCode = 401;
                throw error;
            }
            const refreshToken = await RefreshToken.findOne({refreshToken: req.user.refreshToken});
            if (!refreshToken) {
                const error = new Error('Refresh token not found.');
                error.statusCode = 404;
                throw error;
            }
            const user = await User.findById(refreshToken.userId);
            if (!user) {
                const error = new Error('User not found.');
                error.statusCode = 404;
                throw error;
            }
            req.userId = user._id;
            return next();
        }
        let decodedToken;
        try {
            decodedToken = jwt.verify(authHeader, process.env.JWT_ACCESS_KEY);
        } catch (err) {
            err.statusCode = 500;
            throw err;
        }
        if (!decodedToken) {
            const error = new Error('Not authenticated, token not found.');
            error.statusCode = 401;
            throw error;
        }
        req.userId = decodedToken.userId;
        next();
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
}

exports.isAdmin = async (req, res, next) => {
    const userId = req.userId;
    try {
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error('User not found');
            error.statusCode = 404;
            throw error;
        }
        if (user.role !== 'admin') {
            const error = new Error('Require admin role!');
            error.statusCode = 403;
            throw error;
        }
        next();
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}