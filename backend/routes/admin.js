const express = require('express');
const router = express.Router();
const Room = require('../models/room');
const {
    auth,
    adminAuth
} = require('../middleware/auth'); // Add authentication middleware

// Add or update room details (protected route)
router.post('/rooms', adminAuth, async (req, res) => {
    try {
        const room = new Room(req.body);
        await room.save();
        res.status(201).json(room);
    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
});

// Get all rooms for admin management (protected route)
router.get('/rooms', adminAuth, async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

// Update a room (protected route)
router.put('/rooms/:id', adminAuth, async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, {
            new: true
        });
        if (!room) {
            return res.status(404).send('Room not found');
        }
        res.json(room);
    } catch (err) {
        console.error(err);
        res.status(400).send(err.message);
    }
});

// Delete a room (protected route)
router.delete('/rooms/:id', adminAuth, async (req, res) => {
    try {
        const room = await Room.findByIdAndDelete(req.params.id);
        if (!room) {
            return res.status(404).send('Room not found');
        }
        res.send('Room deleted');
    } catch (err) {
        console.error(err);
        res.status(500).send(err.message);
    }
});

module.exports = router;