const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const admin = require('../../middleware/admin');
const Room = require('../../models/room');
const Booking = require('../../models/booking');

// Admin middleware for all report routes
router.use(auth);
router.use(admin);

// @route   GET api/reports/occupancy
// @desc    Get current occupancy rate
// @access  Private/Admin
router.get('/occupancy', async (req, res) => {
    try {
        const totalRooms = await Room.countDocuments();
        const occupiedRooms = await Room.countDocuments({ available: false });
        
        const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
        
        res.json({
            totalRooms,
            occupiedRooms,
            occupancyRate
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/reports/revenue
// @desc    Get revenue statistics
// @access  Private/Admin
router.get('/revenue', async (req, res) => {
    try {
        // Get current date
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        // Calculate date ranges
        const monthStart = new Date(currentYear, currentMonth, 1);
        const quarterStart = new Date(currentYear, Math.floor(currentMonth / 3) * 3, 1);
        const yearStart = new Date(currentYear, 0, 1);
        
        // Get bookings with payment status 'paid'
        const paidBookings = await Booking.find({
            paymentStatus: 'paid',
            bookingDate: { $lte: now }
        });
        
        // Calculate revenue
        let monthly = 0;
        let quarterly = 0;
        let annual = 0;
        
        // Monthly breakdown for chart
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthlyBreakdown = Array(12).fill(0).map((_, index) => ({
            month: monthNames[index],
            amount: 0
        }));
        
        paidBookings.forEach(booking => {
            const bookingDate = new Date(booking.bookingDate);
            const bookingMonth = bookingDate.getMonth();
            const bookingYear = bookingDate.getFullYear();
            
            // Add to monthly revenue if booking is from current month
            if (bookingYear === currentYear && bookingMonth === currentMonth) {
                monthly += booking.price;
            }
            
            // Add to quarterly revenue if booking is from current quarter
            if (bookingYear === currentYear && bookingDate >= quarterStart) {
                quarterly += booking.price;
            }
            
            // Add to annual revenue if booking is from current year
            if (bookingYear === currentYear) {
                annual += booking.price;
                
                // Add to monthly breakdown for chart
                monthlyBreakdown[bookingMonth].amount += booking.price;
            }
        });
        
        res.json({
            monthly,
            quarterly,
            annual,
            monthlyBreakdown
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/reports/booked-rooms
// @desc    Get currently booked rooms with details
// @access  Private/Admin
router.get('/booked-rooms', async (req, res) => {
    try {
        const today = new Date();
        
        // Find active bookings
        const activeBookings = await Booking.find({
            status: { $in: ['confirmed', 'pending'] },
            startDate: { $lte: today }
        }).populate('room', 'number');
        
        const bookedRooms = activeBookings.map(booking => {
            const checkOut = booking.endDate || new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
            const daysLeft = Math.ceil((checkOut - today) / (1000 * 60 * 60 * 24));
            
            return {
                roomNumber: booking.room.number,
                occupantName: booking.name,
                checkIn: booking.startDate,
                checkOut: booking.endDate || 'No end date',
                daysLeft: booking.endDate ? daysLeft : 'Indefinite'
            };
        });
        
        res.json(bookedRooms);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET api/reports/popular-rooms
// @desc    Get most popular rooms
// @access  Private/Admin
router.get('/popular-rooms', async (req, res) => {
    try {
        // Aggregate bookings by room to find most popular
        const popularRooms = await Booking.aggregate([
            { $group: { 
                _id: '$room', 
                bookingCount: { $sum: 1 },
                revenue: { $sum: '$price' }
            }},
            { $sort: { bookingCount: -1 }},
            { $limit: 5 }
        ]);
        
        // Populate room details
        const result = await Room.populate(popularRooms, { path: '_id', select: 'number type beds floor' });
        
        res.json(result.map(item => ({
            room: item._id,
            bookingCount: item.bookingCount,
            revenue: item.revenue
        })));
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;