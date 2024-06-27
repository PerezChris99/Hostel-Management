const express = require('express');
const router = express.Router();
const Room = require('../models/room');

// Create a new room
router.post('/rooms', async (req, res) => {
    try {
        const room = new Room(req.body);
        await room.save();
        res.status(201).send(room);
    } catch (err) {
        res.status(400).send(err);
    }
});

// Update room availability
router.put('/rooms/:id', async (req, res) => {
    try {
        const room = await Room.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!room) {
            return res.status(404).send();
        }
        res.send(room);
    } catch (err) {
        res.status(400).send(err);
    }
});

module.exports = router;
