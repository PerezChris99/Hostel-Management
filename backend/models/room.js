const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    number: { type: String, required: true },
    beds: { type: Number, required: true },
    type: { type: String, required: true }, // single/double
    selfContained: { type: Boolean, required: true },
    floor: { type: Number, required: true },
    balcony: { type: Boolean, required: true },
    available: { type: Boolean, default: true }
});

module.exports = mongoose.model('Room', RoomSchema);
