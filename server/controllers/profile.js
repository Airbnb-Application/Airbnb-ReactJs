const User = require("../models/user");
const {ObjectId} = require("mongoose").Types;
const aes256 = require("../utils/aes-crypto");
const bcrypt = require("bcryptjs");
const Reservation = require("../models/reservation");
const Place = require("../models/place");

exports.getProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            const error = new Error("User not found.");
            error.statusCode = 404;
            throw error;
        }
        let userId = req.userId;
        if (user.role === "admin") {
            if (!req.query.userId) {
                const error = new Error("User ID is required.");
                error.statusCode = 400;
                throw error;
            }
            userId = aes256.decryptData(req.query.userId);
            if (!ObjectId.isValid(userId)) {
                const error = new Error("Invalid user ID.");
                error.statusCode = 400;
                throw error;
            }
        }

        const profile = await User.findById(userId)
            .populate({
                path: "places",
                select: "title imageSrc category",
            })
            .select("-_id email places name provider");
        if (!profile) {
            const error = new Error("Profile not found.");
            error.statusCode = 404;
            throw error;
        }
        const formattedProfile = {
            email: profile.email,
            name: profile.name,
            places: profile.places.map((place) => {
                return {
                    _id: aes256.encryptData(place._id.toString()),
                    title: place.title,
                    imageSrc: place.imageSrc,
                    category: place.category,
                };
            }),
            provider: profile.provider,
        }
        res.status(200).json({
            message: "Profile fetched.",
            profile: formattedProfile,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.updateProfile = async (req, res, next) => {
    const {name, email} = req.body;
    try {
        let profile = await User.findById(req.userId);
        if (!profile) {
            const error = new Error("Profile not found.");
            error.statusCode = 404;
            throw error;
        }
        if (profile.provider === "google") {
            const error = new Error("Google profile cannot be updated.");
            error.statusCode = 400;
            throw error;
        }
        if (profile.role === "admin") {
            const userId = req.query.userId;
            if (!userId) {
                const error = new Error("User ID is required.");
                error.statusCode = 400;
                throw error;
            }
            const decryptedUserId = aes256.decryptData(userId);
            if (!ObjectId.isValid(decryptedUserId)) {
                const error = new Error("Invalid user ID.");
                error.statusCode = 400;
                throw error;
            }
            profile = await User.findById(decryptedUserId);
        }
        if (name) profile.name = name;
        if (email) {
            const existingUser = await User.findOne({email: email});
            if (existingUser && existingUser._id.toString() !== req.userId) {
                const error = new Error("Email already exists.");
                error.statusCode = 400;
                throw error;
            }
            profile.email = email;
        }
        await profile.save();
        const formattedProfile = {
            name: profile.name,
            email: profile.email,
            provider: profile.provider,
        }
        res.status(200).json({
            message: "Profile updated.",
            profile: formattedProfile,
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.changePassword = async (req, res, next) => {
    const {oldPassword, newPassword} = req.body;
    try {
        let profile = await User.findById(req.userId);
        if (!profile) {
            const error = new Error("Profile not found.");
            error.statusCode = 404;
            throw error;
        }
        if (profile.provider === "google") {
            const error = new Error("Google profile cannot change password.");
            error.statusCode = 400;
            throw error;
        }
        if (profile.role === "admin") {
            const userId = req.query.userId;
            if (!userId) {
                const error = new Error("User ID is required.");
                error.statusCode = 400;
                throw error;
            }
            const decryptedUserId = aes256.decryptData(userId);
            if (!ObjectId.isValid(decryptedUserId)) {
                const error = new Error("Invalid user ID.");
                error.statusCode = 400;
                throw error;
            }
            profile = await User.findById(decryptedUserId);
        }
        if (!oldPassword || !newPassword) {
            const error = new Error("Old password and new password are required.");
            error.statusCode = 400;
            throw error;
        }
        const isMatch = await bcrypt.compare(oldPassword, profile.hashedPassword);
        if (!isMatch) {
            const error = new Error("Wrong password.");
            error.statusCode = 401;
            throw error;
        }
        profile.hashedPassword = await bcrypt.hash(newPassword, 12);
        await profile.save();
        res.status(200).json({
            message: "Password changed.",
        });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getTotalData = async (req, res, next) => {
    try {
        const userId = req.userId;
        const places = await User.findById(userId);
        const placeIds = places.places.map((place) => place._id.toString());
        const totalReservation = await Reservation.countDocuments({placeId: {$in: placeIds}});
        const totalPaymentData = await Reservation.find({placeId: {$in: placeIds}}).exec();

        let totalPayment = 0;
        totalPaymentData.forEach((payment) => {
            const startDate = new Date(payment.startDate);
            const endDate = new Date(payment.endDate);
            totalPayment += (((endDate - startDate) / (3600 * 1000 * 24)) + 1) * payment.totalPrice;
        })

        const formatData = {
            message: "Fetched total data successfully.",
            totalReservation: totalReservation,
            totalPayment: totalPayment,
        };


        res.status(200).json(formatData);
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}

exports.getLineChartData = async (req, res, next) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId);
        const placeData = await Place.aggregate([
            {
                $match: {
                    _id: {$in: user.places}
                }
            },
            {
                $group: {
                    _id: "$locationValue",
                    count: {$sum: 1}
                }
            }
        ]).exec();
        // format data for line chart
        placeData.forEach((place) => {
            place.x = place._id;
            place.y = place.count;
            delete place._id;
            delete place.count;
        });
        res.status(200).json([{
            // message: "Fetched line chart data successfully.",
            id: "places",
            color: "hsla(233, 100%, 68%, 1)",
            data: placeData
        }]);
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }
        next(error);
    }
}