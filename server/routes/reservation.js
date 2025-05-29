const express = require('express');
const {body} = require('express-validator');

const reservationController = require('../controllers/reservation');
const {isAuth} = require('../utils/isAuth')

const router = express.Router();

// Get all reservations
// /api/v1/reservation => GET
router.get('/reservations', isAuth, reservationController.getReservations);

// Get a reservation by ID
// /api/v1/reservation/:reservationId => GET
router.get('/reservation/:reservationId', isAuth, reservationController.getReservation);

// payment
// /api/v1/reservation/test-payment => POST
router.post('/checkout/payment', isAuth,
    [
        // check fields: placeId, startDate, endDate, totalPrice
        body('placeId')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Place ID cannot be empty.'),
        body('startDate')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Start date cannot be empty.'),
        body('endDate')
            .trim()
            .not()
            .isEmpty()
            .withMessage('End date cannot be empty.'),
        body('totalPrice')
            .isNumeric()
            .withMessage('Total price must be a number.'),
    ],
    reservationController.payment);

// Success payment
// /api/v1/reservation/success_payment => GET
router.get('/checkout/success_payment', isAuth, reservationController.checkoutSuccess);

router.delete('/checkout/cancel_payment/:reservationId', isAuth, reservationController.cancelPayment);

// Delete a reservation by ID
// /api/v1/reservation/:reservationId => DELETE
router.delete('/reservation/:reservationId', isAuth, reservationController.deleteReservation);

module.exports = router;