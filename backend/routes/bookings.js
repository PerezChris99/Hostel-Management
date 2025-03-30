const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const Room = require('../models/room');
const { auth } = require('../middleware/auth');

// Twilio setup (optional)
let twilioClient = null;
try {
    const twilio = require('twilio');
    // Twilio credentials (replace with your actual credentials)
    const accountSid = 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx';
    const authToken = 'your_auth_token';
    twilioClient = twilio(accountSid, authToken);
    console.log('Twilio client initialized successfully');
} catch (err) {
    console.log('Twilio is not installed or configured. SMS notifications will be disabled.');
}

// Get available rooms
router.get('/rooms', async (req, res) => {
    try {
        const rooms = await Room.find({
            available: true
        });
        res.send(rooms);
    } catch (err) {
        res.status(500).send(err);
    }
});

// Get student's bookings
router.get('/my-bookings', auth, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.user.id })
            .populate('room')
            .sort({ bookingDate: -1 });
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// Book a room
router.post('/book', auth, async (req, res) => {
    try {
        const {
            name,
            course,
            university,
            courseDuration,
            studentId,
            personalPhone,
            caretakerPhone,
            room: roomId,
            groupSize,
            startDate,
            endDate
        } = req.body;

        // Validate room ID
        if (!roomId) {
            return res.status(400).send('Room ID is required');
        }

        // Check if the room exists and is available
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).send('Room not found');
        }
        if (!room.available) {
            return res.status(400).send('Room is not available');
        }

        // Check room capacity
        if (groupSize > room.beds) {
            return res.status(400).send('Group size exceeds room capacity');
        }

        // Calculate price
        let price = room.basePrice;
        const now = new Date();
        const month = now.getMonth(); // 0-11
        if (month >= 5 && month <= 7) { // June, July, August (Summer)
            if (room.seasonalPrice) {
                price = room.seasonalPrice;
            } else {
                price *= 1.2; // Increase by 20%
            }
        }

        // Calculate total price based on duration
        let totalPrice = price;
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            totalPrice = price * days;
        }

        const booking = new Booking({
            userId: req.user.id, // Link booking to user
            name,
            course,
            university,
            courseDuration,
            studentId,
            personalPhone,
            caretakerPhone,
            room: roomId,
            price: totalPrice,
            groupSize,
            startDate,
            endDate,
            status: 'pending'
        });

        await booking.save();

        // Update room availability
        room.available = false;
        await room.save();

        // Send SMS confirmation if Twilio is configured
        if (twilioClient && personalPhone) {
            twilioClient.messages
                .create({
                    body: `Your booking for Room ${room.number} is confirmed. Price: $${totalPrice.toFixed(2)}`,
                    to: personalPhone,
                    from: '+15017250604'
                })
                .then(message => console.log('SMS sent:', message.sid))
                .catch(error => console.error('Twilio Error:', error));
        }

        res.status(201).send(booking);
    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
});

// Cancel a booking
router.put('/cancel/:id', auth, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).send('Booking not found');
        }
        
        // Check if user owns this booking
        if (booking.userId.toString() !== req.user.id) {
            return res.status(403).send('Not authorized to cancel this booking');
        }
        
        // Only allow cancellation of pending or confirmed bookings
        if (!['pending', 'confirmed'].includes(booking.status)) {
            return res.status(400).send('Cannot cancel booking with status: ' + booking.status);
        }
        
        booking.status = 'cancelled';
        await booking.save();
        
        // Make the room available again
        const room = await Room.findById(booking.room);
        if (room) {
            room.available = true;
            await room.save();
        }
        
        res.json(booking);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// Extend a booking
router.put('/extend/:id', auth, async (req, res) => {
    try {
        const { newEndDate } = req.body;
        const booking = await Booking.findById(req.params.id);
        
        if (!booking) {
            return res.status(404).send('Booking not found');
        }
        
        // Check if user owns this booking
        if (booking.userId.toString() !== req.user.id) {
            return res.status(403).send('Not authorized to extend this booking');
        }
        
        if (booking.status !== 'confirmed') {
            return res.status(400).send('Can only extend confirmed bookings');
        }
        
        // Calculate additional cost
        const currentEnd = new Date(booking.endDate);
        const newEnd = new Date(newEndDate);
        
        if (newEnd <= currentEnd) {
            return res.status(400).send('New end date must be after current end date');
        }
        
        const additionalDays = Math.ceil((newEnd - currentEnd) / (1000 * 60 * 60 * 24));
        const dailyRate = booking.price / Math.ceil((currentEnd - new Date(booking.startDate)) / (1000 * 60 * 60 * 24));
        const additionalCost = dailyRate * additionalDays;
        
        booking.endDate = newEndDate;
        booking.price += additionalCost;
        booking.extensionHistory = booking.extensionHistory || [];
        booking.extensionHistory.push({
            previousEndDate: booking.endDate,
            newEndDate,
            additionalCost,
            extensionDate: Date.now()
        });
        
        await booking.save();
        res.json(booking);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

module.exports = router;