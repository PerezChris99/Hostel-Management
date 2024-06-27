const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    course: { type: String, required: true },
    university: { type: String, required: true },
    courseDuration: { type: String, required: true },
    studentId: { type: String, required: true },
    personalPhone: { type: String, required: true },
    caretakerPhone: { type: String, required: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    bookingDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', BookingSchema);
