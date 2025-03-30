const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Room = require('../../models/room');
const Booking = require('../../models/booking');

// @route   GET api/bookings/rooms
// @desc    Get all available rooms
// @access  Public
router.get('/rooms', async (req, res) => {
    try {
        const rooms = await Room.find({ available: true });
        res.json(rooms);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/bookings/book
// @desc    Book a room
// @access  Public (can be changed to protected if needed)
router.post('/book', async (req, res) => {
    try {
        const { 
            name, course, university, courseDuration, 
            studentId, personalPhone, caretakerPhone, room, groupSize 
        } = req.body;

        // Validate required fields
        if (!name || !course || !university || !courseDuration || 
            !studentId || !personalPhone || !caretakerPhone || !room) {
            return res.status(400).json({ msg: 'All fields are required' });
        }

        // Check if room exists and is available
        const roomData = await Room.findById(room);
        if (!roomData) {
            return res.status(404).json({ msg: 'Room not found' });
        }

        if (!roomData.available) {
            return res.status(400).json({ msg: 'Room is not available' });
        }

        // Calculate price
        const price = roomData.seasonalPrice || roomData.basePrice;

        // Create booking
        const startDate = new Date();
        const booking = new Booking({
            name,
            course,
            university,
            courseDuration,
            studentId,
            personalPhone,
            caretakerPhone,
            room: roomData._id,
            startDate,
            price,
            groupSize: parseInt(groupSize) || 1
        });

        await booking.save();

        // Update room availability
        roomData.available = false;
        await roomData.save();

        res.json({ success: true, booking });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/bookings/
// @desc    Get all bookings for a user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user.id }).populate('room', 'number type');
        res.json(bookings);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/bookings/:id
// @desc    Get booking by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id).populate('room', 'number type beds floor balcony');
        
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Check if booking belongs to user
        if (booking.user && booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        res.json(booking);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Booking not found' });
        }
        res.status(500).send('Server Error');
    }
});

// @route   DELETE api/bookings/:id
// @desc    Delete a booking
// @access  Private
router.delete('/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).json({ msg: 'Booking not found' });
        }

        // Check if booking belongs to user or user is admin
        if (booking.user && booking.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        // If booking is confirmed, make room available again
        if (booking.status === 'confirmed' || booking.status === 'pending') {
            await Room.findByIdAndUpdate(booking.room, { available: true });
        }

        await booking.remove();
        res.json({ msg: 'Booking removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Booking not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
