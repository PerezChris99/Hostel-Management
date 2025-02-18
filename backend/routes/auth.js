const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // You'll need to install jsonwebtoken
const User = require('../models/user');

// Login route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({
                msg: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(400).json({
                msg: 'Invalid credentials'
            });
        }

        // Create JWT Payload
        const payload = {
            user: {
                id: user.id,
                role: user.role // Include the user's role
            }
        };

        // Sign token
        jwt.sign(
            payload,
            'your-secret-key', // Replace with a secure secret key
            {
                expiresIn: '1h'
            },
            (err, token) => {
                if (err) throw err;
                res.json({
                    token
                });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;