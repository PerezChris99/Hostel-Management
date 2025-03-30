const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const admin = require('../../middleware/admin');
const Room = require('../../models/room');
const Booking = require('../../models/booking');
const User = require('../../models/user');

// Admin middleware to check if user is admin
router.use(auth);
router.use(admin);

// @route   GET api/admin/rooms
// @desc    Get all rooms (admin)
// @access  Private/Admin
router.get('/rooms', async (req, res) => {
    try {
        const rooms = await Room.find().sort({ number: 1 });
        res.json(rooms);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/admin/rooms
// @desc    Create a room (admin)
// @access  Private/Admin
router.post('/rooms', async (req, res) => {
    const { number, type, beds, floor, selfContained, balcony, available, basePrice, seasonalPrice } = req.body;

    try {
        // Check if room with number already exists
        let room = await Room.findOne({ number });
        if (room) {
            return res.status(400).json({ msg: 'Room with this number already exists' });
        }

        // Create new room
        room = new Room({
            number,
            type,
            beds,
            floor,
            selfContained,
            balcony,
            available,
            basePrice,
            seasonalPrice
        });

        await room.save();
        res.json(room);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/rooms/:id
// @desc    Update a room (admin)
// @access  Private/Admin
router.put('/rooms/:id', async (req, res) => {
    const { number, type, beds, floor, selfContained, balcony, available, basePrice, seasonalPrice } = req.body;

    try {
        let room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        // Check if number is being changed and if new number already exists
        if (number !== room.number) {
            const existingRoom = await Room.findOne({ number });
            if (existingRoom) {
                return res.status(400).json({ msg: 'Room with this number already exists' });
            }
        }

        // Update room fields
        room.number = number;
        room.type = type;
        room.beds = beds;
        room.floor = floor;
        room.selfContained = selfContained;
        room.balcony = balcony;
        room.available = available;
        room.basePrice = basePrice;
        if (seasonalPrice) room.seasonalPrice = seasonalPrice;

        await room.save();
        res.json(room);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Room not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/admin/rooms/:id
// @desc    Delete a room (admin)
// @access  Private/Admin
router.delete('/rooms/:id', async (req, res) => {
    try {
        // Check if room exists
        const room = await Room.findById(req.params.id);
        if (!room) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        // Check if room has active bookings
        const activeBookings = await Booking.find({
            room: req.params.id,
            status: { $in: ['pending', 'confirmed'] }
        });

        if (activeBookings.length > 0) {
            return res.status(400).json({ msg: 'Cannot delete room with active bookings' });
        }

        await room.remove();
        res.json({ msg: 'Room removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Room not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/bookings
// @desc    Get all bookings (admin)
// @access  Private/Admin
router.get('/bookings', async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('room', 'number type beds floor balcony')
            .sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT api/admin/bookings/:id
// @desc    Update booking status (admin)
// @access  Private/Admin
router.put('/bookings/:id', async (req, res) => {
    const { status, paymentStatus } = req.body;

    try {
        let booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Update booking status
        if (status) booking.status = status;
        if (paymentStatus) booking.paymentStatus = paymentStatus;

        // If booking is cancelled, make room available again
        if (status === 'cancelled' && (booking.status === 'confirmed' || booking.status === 'pending')) {
            await Room.findByIdAndUpdate(booking.room, { available: true });
        }

        // If booking is confirmed, make sure room is not available
        if (status === 'confirmed' && booking.status === 'pending') {
            await Room.findByIdAndUpdate(booking.room, { available: false });
        }

        await booking.save();
        res.json(booking);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Booking not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   GET api/admin/users
// @desc    Get all users (admin)
// @access  Private/Admin
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
