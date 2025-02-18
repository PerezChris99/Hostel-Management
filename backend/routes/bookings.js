const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const Room = require('../models/room');
const twilio = require('twilio'); // Import Twilio

// Twilio credentials (replace with your actual credentials)
const accountSid = 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'; // Your Account SID from twilio.com
const authToken = 'your_auth_token'; // Your Auth Token from twilio.com

const client = twilio(accountSid, authToken);

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

// Book a room
router.post('/book', async (req, res) => {
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
            groupSize
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

        const booking = new Booking({
            name,
            course,
            university,
            courseDuration,
            studentId,
            personalPhone,
            caretakerPhone,
            room: roomId,
            price, // Store the calculated price
            groupSize
        });

        await booking.save();

        // Update room availability
        room.available = false;
        await room.save();

        // Send SMS confirmation
        client.messages
            .create({
                body: `Your booking for Room ${room.number} is confirmed. Price: $${price.toFixed(2)}`,
                to: personalPhone, // Student's phone number
                from: '+15017250604' // Your Twilio phone number
            })
            .then(message => console.log(message.sid))
            .catch(error => console.error('Twilio Error:', error));

        res.status(201).send(booking);
    } catch (err) {
        console.error(err);
        res.status(400).send(err.message); // Send specific error message
    }
});

module.exports = router;