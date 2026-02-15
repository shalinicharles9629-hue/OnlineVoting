const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Election = require('./models/Election');

async function updateElection() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting-app');
        console.log('MongoDB connected');

        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);

        // Update State Assembly Elections (698c1fbc0427155665686e25)
        const result = await Election.findByIdAndUpdate('698c1fbc0427155665686e25', {
            startDate: yesterday,
            endDate: tomorrow,
            status: 'ongoing'
        }, { new: true });

        if (result) {
            console.log('Updated Election:', result.title);
            console.log('New Start:', result.startDate);
            console.log('New End:', result.endDate);
            console.log('New Status:', result.status);
        } else {
            console.log('Election not found');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

updateElection();
