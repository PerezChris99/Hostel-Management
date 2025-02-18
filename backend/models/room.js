const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true
    },
    beds: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        required: true
    }, // single/double
    selfContained: {
        type: Boolean,
        required: true
    },
    floor: {
        type: Number,
        required: true
    },
    balcony: {
        type: Boolean,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    },
    basePrice: {
        type: Number,
        required: true,
        default: 100 // Default base price
    },
    seasonalPrice: {
        type: Number
    } // Optional seasonal price
});

module.exports = mongoose.model('Room', RoomSchema);