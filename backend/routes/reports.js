const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const Room = require('../models/room');
const {
    adminAuth
} = require('../middleware/auth');

// Get occupancy rate
router.get('/occupancy', adminAuth, async (req, res) => {
    try {
        const totalRooms = await Room.countDocuments();
        const bookedRooms = await Room.countDocuments({
            available: false
        });
        const occupancyRate = (bookedRooms / totalRooms) * 100;
        res.json({
            occupancyRate
        });
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

module.exports = router;