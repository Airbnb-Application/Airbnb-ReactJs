const express = require('express');
const {body} = require('express-validator');

const favouriteController = require('../controllers/favourite');
const {isAuth} = require('../utils/isAuth');

const router = express.Router();

// Get all favorites
// /api/v1/favorite => GET
router.get('/favourites', isAuth, favouriteController.getFavourites);

// Add a favourite
// /api/v1/favourite => POST
router.post(
    '/favourite/new/:placeId',
    isAuth,
    favouriteController.newFavouriteId
);

// Delete a favourite by ID
// /api/v1/favourite/:favouriteId => DELETE
router.delete('/favourite/:placeId', isAuth, favouriteController.deleteFavouriteId);

module.exports = router;