const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/hostelManagement', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB Connected...');
    } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;