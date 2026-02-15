const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Election = require('./models/Election');

async function checkElections() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting-app');
        console.log('MongoDB connected');

        const elections = await Election.find({});
        console.log('Elections found:', elections.length);
        elections.forEach(e => {
            console.log(`- Title: ${e.title}`);
            console.log(`  ID: ${e._id}`);
            console.log(`  Status: ${e.status}`);
            console.log(`  Start: ${e.startDate}`);
            console.log(`  End: ${e.endDate}`);
            console.log(`  Current Date: ${new Date()}`);

            const now = new Date();
            const isWithin = now >= e.startDate && now <= e.endDate;
            console.log(`  Is within dates: ${isWithin}`);
            console.log('-------------------');
        });

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkElections();
