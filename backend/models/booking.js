const mongoose = require('mongoose');

const ExtensionHistorySchema = new mongoose.Schema({
    previousEndDate: Date,
    newEndDate: Date,
    additionalCost: Number,
    extensionDate: {
        type: Date,
        default: Date.now
    }
});

const BookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    course: {
        type: String,
        required: true
    },
    university: {
        type: String,
        required: true
    },
    courseDuration: {
        type: String,
        required: true
    },
    studentId: {
        type: String,
        required: true
    },
    personalPhone: {
        type: String,
        required: true
    },
    caretakerPhone: {
        type: String,
        required: true
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    bookingDate: {
        type: Date,
        default: Date.now
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    price: {
        type: Number,
        required: true
    },
    groupSize: {
        type: Number,
        required: true,
        default: 1
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'cancelled', 'completed'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['unpaid', 'partial', 'paid'],
        default: 'unpaid'
    },
    extensionHistory: [ExtensionHistorySchema],
    specialRequests: String,
    notes: String
});

module.exports = mongoose.model('Booking', BookingSchema);