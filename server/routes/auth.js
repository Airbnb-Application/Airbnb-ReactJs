const express = require('express');
const {body} = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');
const router = express.Router();

// Test
router.post('/test', authController.test);

// SIGNUP
// /api/v1/auth/signup => POST
router.post(
    '/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .custom((value, {req}) => {
                return User.findOne({email: value})
                    .then(doc => {
                        if (doc) return Promise.reject('Email address already exists.');
                    })
            })
            .normalizeEmail(),
        body('password')
            .trim()
            .isLength({min: 8})
            .withMessage('Password must be at least 8 characters long.'),
        body('name')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Name cannot be empty.')
    ],
    authController.signup
);

// LOGIN
// /api/v1/auth/login => POST
router.post('/login', authController.login);

// REFRESH TOKEN
// /api/v1/auth/refresh => POST
router.post('/refresh', authController.refresh);

//--------------------------------------------------------------------------------------------

// GOOGLE AUTH
// /api/v1/auth/google => GET
router.get('/google', authController.google);

// GOOGLE AUTH CALLBACK
// /api/v1/auth/google/callback => GET
router.get('/google/callback', authController.googleCallback);

// GOOGLE AUTH SUCCESS
// /api/v1/auth/google/success => GET
router.get('/google/success', authController.googleSuccess);

// GOOGLE AUTH REFRESH TOKEN
// /api/v1/auth/google/refresh => POST
router.post('/google/refresh', authController.googleRenew);

// GOOGLE AUTH LOGOUT
// /api/v1/auth/google/logout => GET
router.delete('/google/logout', authController.googleLogout);

module.exports = router;