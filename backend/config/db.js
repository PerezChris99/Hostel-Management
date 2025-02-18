const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://localhost:27017/hostel', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('MongoDB connected');
    } catch (err) {
        console.error(err.message);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;