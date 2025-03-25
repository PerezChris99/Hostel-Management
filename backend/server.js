const express = require('express');
const connectDB = require('./config/db');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path'); // Import the 'path' module

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the 'frontend' directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/admin', require('./routes/admin'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/auth', require('./routes/auth')); // Add authentication routes
app.use('/api/reports', require('./routes/reports'));
app.use('/api/users', require('./routes/users')); // Add user routes

// For any routes that don't match API routes, serve the frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`); // Display the address and port
});