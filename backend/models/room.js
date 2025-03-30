const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    number: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: ['standard', 'deluxe', 'premium', 'suite']
    },
    beds: {
        type: Number,
        required: true,
        min: 1
    },
    floor: {
        type: Number,
        required: true
    },
    selfContained: {
        type: Boolean,
        default: false
    },
    balcony: {
        type: Boolean,
        default: false
    },
    available: {
        type: Boolean,
        default: true
    },
    basePrice: {
        type: Number,
        required: true
    },
    seasonalPrice: {
        type: Number
    },
    amenities: [{
        type: String
    }],
    maintenance: {
        type: Boolean,
        required: true,
        default: false
    },
    lastMaintenance: {
        type: Date
    },
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Room', RoomSchema);