const express = require('express');
const {body} = require('express-validator');

const placeController = require('../controllers/place');
const {isAuth} = require('../utils/isAuth');

const router = express.Router();

// Create a new place
// /api/v1/place => POST
router.post(
    '/place/new',
    isAuth,
    [
        // check fields: title, description, category, roomCount, bathroomCount, guestCount, location, price
        body('title')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Title cannot be empty.'),
        body('description')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Description cannot be empty.'),
        body('category')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Category cannot be empty.'),
        body('roomCount')
            .isNumeric()
            .withMessage('Room count must be a number.'),
        body('bathroomCount')
            .isNumeric()
            .withMessage('Bathroom count must be a number.'),
        body('guestCapacity')
            .isNumeric()
            .withMessage('Guest count must be a number.'),
        body('location')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Location cannot be empty.'),
        body('price')
            .isNumeric()
            .withMessage('Price must be a number.'),
    ],
    placeController.createPlace
);

// Get all places
// /api/v1/place => GET
router.get('/places', placeController.getPlaces);

// Get a place by ID
// /api/v1/place/:placeId => GET
router.get('/place/:placeId', placeController.getPlace);

// Update a place by ID
// /api/v1/place/:placeId => PUT
router.put(
    '/place/:placeId',
    isAuth,
    placeController.updatePlace
);

// Delete a place by ID
// /api/v1/place/:placeId => DELETE
router.delete('/place/:placeId', isAuth, placeController.deletePlace);

module.exports = router;
