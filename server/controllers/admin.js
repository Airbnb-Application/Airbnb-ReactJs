const User = require("../models/user");
const Place = require("../models/place");
const Reservation = require("../models/reservation");
const {validationResult} = require('express-validator');
const aes256 = require('../utils/aes-crypto');

exports.getTotalData = async (req, res, next) => {
    try {
        const totalCustomer = await User.countDocuments();
        const totalReservation = await Reservation.countDocuments();
        const totalPaymentData = await Reservation.find().exec();

        let totalPayment = 0;
        totalPaymentData.forEach((payment) => {
            const startDate = new Date(payment.startDate);
            const endDate = new Date(payment.endDate);
            totalPayment += (((endDate - startDate) / (3600 * 1000 * 24)) + 1) * payment.totalPrice;
        })
        res.status(200).json({
            message: "Fetched total data successfully.",
            totalCustomer: totalCustomer,
            totalReservation: totalReservation,
            totalPayment: totalPayment,
        });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
}

exports.getLineChartData = async (req, res, next) => {
    try {
        const places = await Place.aggregate([
            {
                $group: {
                    _id: "$locationValue",
                    count: {$sum: 1}
                }
            }
        ]).exec();

        const placeData = places.map((place) => ({
            x: place._id,
            y: place.count
        }));

        res.status(200).json([{
            // message: "Fetched line chart data successfully.",
            id: "places",
            color: "hsla(233, 100%, 68%, 1)",
            data: placeData
        }]);
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
}

exports.checkRole = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);

        res.status(200).json({
            message: 'Role fetched.',
            role: user.role
        });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500
        next(err);
    }
}

exports.getAllReservations = async (req, res, next) => {
    try {
        const reservations = await Reservation.find().populate({
            path: 'userId',
            select: 'email name'
        }).populate({
            path: 'placeId',
            select: 'category location title price imageSrc'
        }).select('placeId startDate endDate totalPrice')
            .exec();
        console.log(reservations);
        if (reservations.length === 0) {
            const error = new Error('No reservation found.');
            error.statusCode = 404;
            throw error;
        }
        const encodedData = reservations.map((reservation) => {
            if (!reservation.placeId) return null;
            return {
                ...reservation,
                _id: aes256.encryptData(reservation._id.toString()),
                placeReservationParams: aes256.encryptData(reservation._id.toString())
            }
        });
        // console.log(encodedData);

        const filteredData = encodedData.filter((data) => data !== null);
        res.status(200).json({
            message: 'Fetched all reservations successfully.',
            reservations: filteredData
        });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
}

exports.getAllUsers = async (req, res, next) => {
    try {
        const name = req.query.name;
        const query = name ? {name: {$regex: name, $options: 'i'}} : {};
        const users = await User.find(query).select('name email role provider').exec();
        if (users.length === 0) {
            const error = new Error('No user found.');
            error.statusCode = 404;
            throw error;
        }
        const formattedUsers = users.map((user) => {
            return {
                ...user._doc,
                _id: aes256.encryptData(user._id.toString())
            }
        });
        res.status(200).json({
            message: 'Fetched all users successfully.',
            users: formattedUsers
        });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
}

exports.deleteUser = async (req, res, next) => {
    try {
        const userId = aes256.decryptData(req.params.userId);
        const user = await User.findById(userId);
        if (!user) {
            const error = new Error('User not found.');
            error.statusCode = 404;
            throw error;
        }
        if (user.role === 'admin') {
            const error = new Error('Cannot delete admin.');
            error.statusCode = 400;
            throw error;
        }
        await user.deleteOne();
        res.status(200).json({
            message: 'User deleted successfully.'
        });
    } catch (err) {
        if (!err.statusCode) err.statusCode = 500;
        next(err);
    }
}
