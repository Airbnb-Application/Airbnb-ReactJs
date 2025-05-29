const Place = require("../models/place");
const aes256 = require("../utils/aes-crypto");
const {validationResult} = require("express-validator");
const User = require("../models/user");
const {imageUpload, imageDelete} = require("../utils/upload-image");
const Reservation = require("../models/reservation");

exports.getPlaces = async (req, res, next) => {
    const {
        roomCount,
        bathroomCount,
        guestCount,
        locationValue,
        startDate,
        endDate,
        category,
    } = req.query;
    // console.log(req.query)
    let query = {};
    if (roomCount) query.roomCount = roomCount;
    if (bathroomCount) query.bathroomCount = bathroomCount;
    if (guestCount) query.guestCapacity = {$gte: guestCount};
    if (locationValue) query.locationValue = locationValue;
    if (category) query.category = category;
    // check place that is not reserved in the date range of startDate and endDate
    if (startDate && endDate) {
        // search for places that are not reserved in the date range
        const reservations = await Reservation.find({
            $or: [
                {
                    startDate: {$gte: startDate, $lte: endDate},
                },
                {
                    endDate: {$gte: startDate, $lte: endDate},
                },
            ],
        });
        const placeIds = reservations.map((reservation) => reservation.placeId);
        query._id = {$nin: placeIds};
    }
    // console.log(query);
    try {
        const places = await Place.find(query, null, {sort: {createdAt: -1}});
        // encrypt placeId for security and save the original id in _id
        const placesFormatted = places.map((place) => {
            return {
                _id: aes256.encryptData(place._id.toString()),
                title: place.title,
                imageSrc: place.imageSrc,
                price: place.price,
                locationValue: place.locationValue,
                category: place.category,
            };
        });
        res.status(200).json({
            message: "Fetched places successfully.",
            places: placesFormatted,
        });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};

exports.getPlace = async (req, res, next) => {
    try {
        const placeId = aes256.decryptData(req.params.placeId.toString());
        if (!placeId) {
            const error = new Error("Place ID is missing or invalid.");
            error.statusCode = 404;
            throw error;
        }
        const place = await Place.findById(placeId)
            .populate("userId")
            .populate("reservations");
        if (!place) {
            const error = new Error("Could not find place.");
            error.statusCode = 404;
            throw error;
        }
        const bookedDate = place.reservations.map((reservation) => {
            return {
                startDate: reservation.startDate,
                endDate: reservation.endDate,
            };
        });
        const placeFormatted = {
            _id: aes256.encryptData(place._id.toString()),
            title: place.title,
            description: place.description,
            imageSrc: place.imageSrc,
            category: place.category,
            roomCount: place.roomCount,
            bathroomCount: place.bathroomCount,
            guestCapacity: place.guestCapacity,
            locationValue: place.locationValue,
            price: place.price,
            amenities: {
                wifi: place.amenities.wifi,
                tv: place.amenities.tv,
                kitchen: place.amenities.kitchen,
                washer: place.amenities.washer,
                parking: place.amenities.parking,
                ac: place.amenities.ac,
                pool: place.amenities.pool,
                hotTub: place.amenities.hotTub,
                workspace: place.amenities.workspace,
                balcony: place.amenities.balcony,
                grill: place.amenities.grill,
                campfire: place.amenities.campFire,
                billiards: place.amenities.billiards,
                gym: place.amenities.gym,
                piano: place.amenities.piano,
                shower: place.amenities.shower,
                firstAid: place.amenities.firstAid,
                fireExtinguisher: place.amenities.fireExtinguisher,
            },
            reservedDate: bookedDate,
            creator: {
                name: place.userId.name,
                image: place.userId.image,
            },
        };
        res.status(200).json({message: "Place fetched.", place: placeFormatted});
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};

exports.createPlace = async (req, res, next) => {
    const err = validationResult(req);
    try {
        if (!err.isEmpty()) {
            const errs = new Error("Validation failed, entered data is incorrect!");
            errs.statusCode = 422;
            errs.data = err.array();
            throw errs;
        }
        // Create place in db
        const title = req.body.title;
        const description = req.body.description;
        const imageSrc = req.body.imageSrc;
        const category = req.body.category;
        const roomCount = req.body.roomCount;
        const bathroomCount = req.body.bathroomCount;
        const guestCapacity = req.body.guestCapacity;
        const location = req.body.location;
        const price = req.body.price;

        // amenities
        const wifi = req.body.amenities.wifi;
        const tv = req.body.amenities.tv;
        const kitchen = req.body.amenities.kitchen;
        const washer = req.body.amenities.washer;
        const parking = req.body.amenities.parking;
        const ac = req.body.amenities.ac;
        const pool = req.body.amenities.pool;
        const hotTub = req.body.amenities.hotTub;
        const workspace = req.body.amenities.workspace;
        const balcony = req.body.amenities.balcony;
        const grill = req.body.amenities.grill;
        const campFire = req.body.amenities.campFire;
        const billiards = req.body.amenities.billiards;
        const gym = req.body.amenities.gym;
        const piano = req.body.amenities.piano;
        const shower = req.body.amenities.shower;
        const firstAid = req.body.amenities.firstAid;
        const fireExtinguisher = req.body.amenities.fireExtinguisher;

        if (!imageSrc) {
            const error = new Error("Image source is missing.");
            error.statusCode = 422;
            throw error;
        }
        const uploadResponse = await imageUpload(imageSrc, "reservationPlace");
        if (!uploadResponse) {
            const error = new Error("Image upload failed.");
            error.statusCode = 422;
            throw error;
        }
        const place = new Place({
            title: title,
            description: description,
            imageSrc: uploadResponse.secureUrl,
            imagePublicId: uploadResponse.publicId,
            category: category,
            roomCount: roomCount,
            bathroomCount: bathroomCount,
            guestCapacity: guestCapacity,
            locationValue: location,
            price: parseInt(price, 10),
            amenities: {
                wifi: wifi,
                tv: tv,
                kitchen: kitchen,
                washer: washer,
                parking: parking,
                ac: ac,
                pool: pool,
                hotTub: hotTub,
                workspace: workspace,
                balcony: balcony,
                grill: grill,
                campFire: campFire,
                billiards: billiards,
                gym: gym,
                piano: piano,
                shower: shower,
                firstAid: firstAid,
                fireExtinguisher: fireExtinguisher,
            },
            userId: req.userId,
        });
        await place.save();
        const user = await User.findById(req.userId);
        user.places.push(place);
        await user.save();
        const placeFormatted = {
            _id: aes256.encryptData(place._id.toString()),
            title: place.title,
            description: place.description,
            imageSrc: place.imageSrc,
            category: place.category,
            roomCount: place.roomCount,
            bathroomCount: place.bathroomCount,
            guestCapacity: place.guestCapacity,
            locationValue: place.locationValue,
            price: place.price,
            amenities: {
                wifi: place.amenities.wifi,
                tv: place.amenities.tv,
                kitchen: place.amenities.kitchen,
                washer: place.amenities.washer,
                parking: place.amenities.parking,
                ac: place.amenities.ac,
                pool: place.amenities.pool,
                hotTub: place.amenities.hotTub,
                workspace: place.amenities.workspace,
                balcony: place.amenities.balcony,
                grill: place.amenities.grill,
                campFire: place.amenities.campFire,
                billiards: place.amenities.billiards,
                gym: place.amenities.gym,
                piano: place.amenities.piano,
                shower: place.amenities.shower,
                firstAid: place.amenities.firstAid,
                fireExtinguisher: place.amenities.fireExtinguisher,
            },
        };
        res.status(201).json({
            message: "Post created successfully!",
            place: placeFormatted,
        });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};

exports.updatePlace = async (req, res, next) => {
    const placeId = aes256.decryptData(req.params.placeId);
    const err = validationResult(req);
    try {
        if (!err.isEmpty()) {
            const errs = new Error("Validation failed, entered data is incorrect!");
            errs.statusCode = 422;
            errs.data = err.array();
            throw errs;
        }
        const title = req.body.title;
        const description = req.body.description;
        const imageSrc = req.body.imageSrc;
        const category = req.body.category;
        const roomCount = req.body.roomCount;
        const bathroomCount = req.body.bathroomCount;
        const guestCapacity = req.body.guestCapacity;
        const location = req.body.location;
        const price = req.body.price;
        const amenities = req.body.amenities;
        const place = await Place.findById(placeId).populate("userId");
        if (!place) {
            const error = new Error("Could not find place.");
            error.statusCode = 404;
            throw error;
        }
        const user = await User.findById(req.userId);
        if (place.userId._id.toString() !== req.userId.toString() && user.role !== "admin") {
            const error = new Error("Not authorized!");
            error.statusCode = 403;
            throw error;
        }
        if (imageSrc) {
            const uploadResponse = await imageUpload(imageSrc, "reservationPlace");
            console.log(uploadResponse);
            if (!uploadResponse) {
                const error = new Error("Image upload failed.");
                error.statusCode = 422;
                throw error;
            }
            await imageDelete(place.imagePublicId);
            place.imageSrc = uploadResponse.secureUrl;
            place.imagePublicId = uploadResponse.publicId;
        }
        if (title) place.title = title;
        if (description) place.description = description;
        if (category) place.category = category;
        if (roomCount) place.roomCount = roomCount;
        if (bathroomCount) place.bathroomCount = bathroomCount;
        if (guestCapacity) place.guestCapacity = guestCapacity;
        if (location) place.locationValue = location;
        if (price) place.price = parseInt(price, 10);
        if (amenities) {
            console.log(amenities.campfire);
            place.amenities = {
                wifi: amenities.wifi,
                tv: amenities.tv,
                kitchen: amenities.kitchen,
                washer: amenities.washer,
                parking: amenities.parking,
                ac: amenities.ac,
                pool: amenities.pool,
                hotTub: amenities.hotTub,
                workspace: amenities.workspace,
                balcony: amenities.balcony,
                grill: amenities.grill,
                campFire: amenities.campfire,
                billiards: amenities.billiards,
                gym: amenities.gym,
                piano: amenities.piano,
                shower: amenities.shower,
                firstAid: amenities.firstAid,
                fireExtinguisher: amenities.fireExtinguisher,
            };
        }
        const result = await place.save();

        const placeFormatted = {
            _id: aes256.encryptData(result._id.toString()),
            title: result.title,
            description: result.description,
            imageSrc: result.imageSrc,
            category: result.category,
            roomCount: result.roomCount,
            bathroomCount: result.bathroomCount,
            guestCapacity: result.guestCapacity,
            locationValue: result.locationValue,
            price: result.price,
            amenities: {
                wifi: result.amenities.wifi,
                tv: result.amenities.tv,
                kitchen: result.amenities.kitchen,
                washer: result.amenities.washer,
                parking: result.amenities.parking,
                ac: result.amenities.ac,
                pool: result.amenities.pool,
                hotTub: result.amenities.hotTub,
                workspace: result.amenities.workspace,
                balcony: result.amenities.balcony,
                grill: result.amenities.grill,
                campFire: result.amenities.campFire,
                billiards: result.amenities.billiards,
                gym: result.amenities.gym,
                piano: result.amenities.piano,
                shower: result.amenities.shower,
                firstAid: result.amenities.firstAid,
                fireExtinguisher: result.amenities.fireExtinguisher,
            },
        };
        res.status(200).json({
            message: "Place updated!",
            place: placeFormatted,
        });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};

exports.deletePlace = async (req, res, next) => {
    const placeId = aes256.decryptData(req.params.placeId);
    try {
        const place = await Place.findById(placeId);
        if (!place) {
            const error = new Error("Could not find place.");
            error.statusCode = 404;
            throw error;
        }
        const user = await User.findById(req.userId);
        if (place.userId.toString() !== req.userId.toString() && user.role !== "admin") {
            const error = new Error("Not authorized!");
            error.statusCode = 403;
            throw error;
        }
        const imagePublicId = place.imagePublicId;
        const deleteResponse = await imageDelete(imagePublicId);
        if (!deleteResponse) {
            const error = new Error("Image delete failed.");
            error.statusCode = 422;
            throw error;
        }
        await place.deleteOne();
        res.status(200).json({message: "Deleted place."});
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
};

