const User = require("../models/user");
const aes256 = require("../utils/aes-crypto");
const {validationResult} = require("express-validator");

exports.getFavourites = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId).populate('favouritePlaces');
        if (!user) {
            const error = new Error('Could not find user.');
            error.statusCode = 404;
            throw error;
        }
        // encrypt all id
        user.favouritePlaces = user.favouritePlaces.map(place => {
            return {
                ...place,
                _id: aes256.encryptData(place._id.toString())
            }
        });
        res.status(200).json({message: 'Favourites fetched.', favouritePlaces: user.favouritePlaces});
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
}

exports.newFavouriteId = async (req, res, next) => {
    try {
        const placeId = aes256.decryptData(req.params.placeId);
        if (!placeId) {
            const error = new Error('Place ID is required.');
            error.statusCode = 400;
            throw error;
        }
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('Could not find user.');
            error.statusCode = 404;
            throw error;
        }
        user.favouritePlaces.push(placeId);
        await user.save();
        res.status(200).json({message: 'Favourite added.'});
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
}

exports.deleteFavouriteId = async (req, res, next) => {
    const placeId = aes256.decryptData(req.params.placeId);
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error('Could not find user.');
            error.statusCode = 404;
            throw error;
        }
        user.favouritePlaces.pull(placeId);
        await user.save();
        res.status(200).json({message: 'Favourite removed.'});
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
}