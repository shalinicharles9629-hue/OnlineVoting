
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const Election = require('../models/Election');

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting-app');
        console.log('Connected to MongoDB');


        // Set start date to yesterday, end date to 7 days from now
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(9, 0, 0, 0);

        const nextWeek = new Date(yesterday);
        nextWeek.setDate(nextWeek.getDate() + 7);

        const result = await Election.updateMany({}, {
            $set: {
                status: 'ongoing',
                startDate: yesterday,
                endDate: nextWeek
            }
        });

        console.log(`Updated ${result.modifiedCount} elections to 'ongoing' status.`);
        console.log(`New Start Date: ${yesterday}`);
        console.log(`New End Date: ${nextWeek}`);


        process.exit(0);
    } catch (error) {
        console.error('Error updating elections:', error);
        process.exit(1);
    }
};

run();
