const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { auth } = require('../middleware/auth');
const crypto = require('crypto');
const { sendEmail } = require('../utils/emailService'); // Use the utility instead of direct import

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, fullName, phone } = req.body;

        // Check if user already exists
        let user = await User.findOne({ $or: [{ email }, { username }] });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Create new user
        user = new User({
            username,
            email,
            password,
            fullName,
            phone,
            role: 'student'
        });

        await user.save();

        // Create JWT Payload
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        // Sign token
        jwt.sign(
            payload,
            'your-secret-key',
            { expiresIn: '1h' },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { fullName, phone, email } = req.body;
        
        // Build profile object
        const profileFields = {};
        if (fullName) profileFields.fullName = fullName;
        if (phone) profileFields.phone = phone;
        if (email) profileFields.email = email;

        // Update user
        let user = await User.findByIdAndUpdate(
            req.user.id,
            { $set: profileFields },
            { new: true }
        ).select('-password');

        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Request password reset
router.post('/reset-password-request', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ msg: 'User with this email does not exist' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email with reset link
        const resetUrl = `http://localhost:5000/reset-password/${resetToken}`;
        const emailText = `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
                           Please click on the following link, or paste this into your browser to complete the process:\n\n
                           ${resetUrl}\n\n
                           If you did not request this, please ignore this email and your password will remain unchanged.\n`;
        const emailHtml = `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                           <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                           <p><a href="${resetUrl}">${resetUrl}</a></p>
                           <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;

        try {
            await sendEmail(user.email, 'Password Reset', emailText, emailHtml);
            res.json({ msg: 'Password reset email sent' });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ msg: 'Error sending email' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Reset password with token
router.post('/reset-password/:token', async (req, res) => {
    try {
        const { password } = req.body;
        const { token } = req.params;
        
        // Find user with valid token
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ msg: 'Password reset token is invalid or has expired' });
        }

        // Update password
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        // Send confirmation email
        const emailText = `This is a confirmation that the password for your account ${user.email} has just been changed.`;
        const emailHtml = `<p>This is a confirmation that the password for your account ${user.email} has just been changed.</p>`;

        try {
            await sendEmail(user.email, 'Your password has been changed', emailText, emailHtml);
            res.json({ msg: 'Password updated successfully' });
        } catch (err) {
            console.error(err.message);
            res.status(500).json({ msg: 'Error sending confirmation email' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
