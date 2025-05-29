const mongoose = require('mongoose');
const {models} = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    image: {
        type: String,
    },
    provider: {
        type: String,
    },
    providerId: {
        type: String,
    },
    hashedPassword: {
        type: String,
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
    },
    favouritePlaces: [{
        type: Schema.Types.ObjectId,
        ref: 'Place',
        required: true,
    }],
    places: [{
        type: Schema.Types.ObjectId,
        ref: 'Place',
        required: true,
    }],
    reservations: [{
        type: Schema.Types.ObjectId,
        ref: 'Reservation',
        required: true,
    }]
}, {timestamps: true});

userSchema.pre('deleteOne', async function (next) {
    const Place = require('./place');
    const Reservation = require('./reservation');
    const userId = this.getQuery()["_id"];
    await Place.deleteMany({userId: userId});
    const reservations = await Reservation.find({userId: userId});
    for (const reservation of reservations) {
        // delete field userId from reservation
        reservation.userId = null;
        await reservation.save();
    }
    next();
})

module.exports = mongoose.model('User', userSchema);