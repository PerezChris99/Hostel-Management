const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const Room = require('../models/room');

// Get available rooms
router.get('/rooms', async (req, res) => {
    try {
        const rooms = await Room.find({ available: true });
        res.send(rooms);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Book a room
router.post('/book', async (req, res) => {
    try {
        const booking = new Booking(req.body);
        await booking.save();
        
        const room = await Room.findById(req.body.room);
        room.available = false;
        await room.save();

        res.status(201).send(booking);
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;
