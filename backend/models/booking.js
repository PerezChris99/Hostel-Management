const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
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
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    startDate: {
        type: Date,
        required: true
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
    bookingDate: {
        type: Date,
        default: Date.now
    },
    specialRequests: {
        type: String
    },
    paymentDetails: {
        method: String,
        transactionId: String,
        amountPaid: Number,
        paidDate: Date
    }
});

module.exports = mongoose.model('Booking', BookingSchema);