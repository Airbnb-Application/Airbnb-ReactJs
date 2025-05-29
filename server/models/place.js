const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const placeSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    imageSrc: {
        type: String,
        required: true,
    },
    imagePublicId: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },
    roomCount: {
        type: Number,
        required: true,
    },
    bathroomCount: {
        type: Number,
        required: true,
    },
    guestCapacity: {
        type: Number,
        required: true,
    },
    locationValue: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    // amenities
    amenities: {
        wifi: {
            type: Boolean,
            required: false,
        },
        tv: {
            type: Boolean,
            required: false,
        },
        kitchen: {
            type: Boolean,
            required: false,
        },
        washer: {
            type: Boolean,
            required: false,
        },
        parking: {
            type: Boolean,
            required: false,
        },
        ac: {
            type: Boolean,
            required: false,
        },
        pool: {
            type: Boolean,
            required: false,
        },
        hotTub: {
            type: Boolean,
            required: false,
        },
        workspace: {
            type: Boolean,
            required: false,
        },
        balcony: {
            type: Boolean,
            required: false,
        },
        grill: {
            type: Boolean,
            required: false,
        },
        campFire: {
            type: Boolean,
            required: false,
        },
        billiards: {
            type: Boolean,
            required: false,
        },
        gym: {
            type: Boolean,
            required: false,
        },
        piano: {
            type: Boolean,
            required: false,
        },
        shower: {
            type: Boolean,
            required: false,
        },
        firstAid: {
            type: Boolean,
            required: false,
        },
        fireExtinguisher: {
            type: Boolean,
            required: false,
        },
    },

    reservations: [{
        type: Schema.Types.ObjectId,
        ref: 'Reservation',
        required: true,
    }]
}, {timestamps: true});

placeSchema.pre('deleteOne', {document: true, query: false},
    async function (next) {
        console.log('deleteOne');
        const User = require('./user');
        const user = await User.findById(this.userId);
        user.places.pull(this);
        await user.save();
        const Reservation = require('./reservation');
        const reservations = await Reservation.find({placeId: this._id});
        for (let reservation of reservations) {
            const user = await User.findById(reservation.userId);
            user.reservations.pull(reservation);
            await user.save();
            reservation.placeId = null;
            reservation.userId = null;
            await reservation.save();
        }
        next();
    })

module.exports = mongoose.model('Place', placeSchema);