const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const User = require('../../models/user');

// @route   GET api/auth
// @desc    Get authenticated user
// @access  Private
router.get('/', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST api/auth/register
// @desc    Register a user
// @access  Public
router.post(
    '/register',
    [
        check('username', 'Username is required').not().isEmpty(),
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
        check('fullName', 'Full name is required').not().isEmpty()
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { username, email, password, fullName, phone } = req.body;

        try {
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
                phone
            });

            // Save user to database
            await user.save();

            // Create JWT payload
            const payload = {
                user: {
                    id: user.id,
                    role: user.role
                }
            };

            // Sign token
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 86400 }, // 24 hours
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
    '/login',
    [
        check('email', 'Please include a valid email').isEmail(),
        check('password', 'Password is required').exists()
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        try {
            // Check if user exists
            let user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

            // Check password
            const isMatch = await user.comparePassword(password);

            if (!isMatch) {
                return res.status(400).json({ msg: 'Invalid credentials' });
            }

            // Create JWT payload
            const payload = {
                user: {
                    id: user.id,
                    role: user.role
                }
            };

            // Sign token
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 86400 }, // 24 hours
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   POST api/auth/forgot-password
// @desc    Request password reset
// @access  Public
router.post(
    '/forgot-password',
    [
        check('email', 'Please include a valid email').isEmail()
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        try {
            // Find user by email
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(404).json({ msg: 'User not found' });
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(20).toString('hex');

            // Set token and expiry on user model
            user.resetPasswordToken = resetToken;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

            await user.save();

            // Send email with reset link (would implement email sending here)
            // For now, just return the token
            res.json({ 
                msg: 'Password reset email sent',
                resetToken
            });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

// @route   POST api/auth/reset-password/:token
// @desc    Reset password
// @access  Public
router.post(
    '/reset-password/:token',
    [
        check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
    ],
    async (req, res) => {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { password } = req.body;
        const resetPasswordToken = req.params.token;

        try {
            // Find user with the given reset token and verify it hasn't expired
            const user = await User.findOne({
                resetPasswordToken,
                resetPasswordExpires: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({ msg: 'Password reset token is invalid or has expired' });
            }

            // Update user password and clear reset token fields
            user.password = password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            await user.save();

            res.json({ msg: 'Password has been reset' });

        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server Error');
        }
    }
);

module.exports = router;
