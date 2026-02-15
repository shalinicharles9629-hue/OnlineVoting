const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Election = require('./models/Election');

async function createNewElection() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting-app');
        console.log('MongoDB connected');

        // First, check existing elections
        const existingElections = await Election.find({});
        console.log('\n=== EXISTING ELECTIONS ===');
        existingElections.forEach(e => {
            console.log(`\nTitle: ${e.title}`);
            console.log(`ID: ${e._id}`);
            console.log(`Status: ${e.status}`);
            console.log(`Start: ${e.startDate}`);
            console.log(`End: ${e.endDate}`);
        });

        // Create a new election for 2026
        const newElection = new Election({
            title: 'General Elections 2026',
            description: 'National Parliamentary Elections for the year 2026',
            startDate: new Date('2026-02-12'), // Tomorrow
            endDate: new Date('2026-03-15'),   // One month duration
            status: 'upcoming'
        });

        await newElection.save();
        console.log('\n=== NEW ELECTION CREATED ===');
        console.log(`Title: ${newElection.title}`);
        console.log(`ID: ${newElection._id}`);
        console.log(`Status: ${newElection.status}`);
        console.log(`Start: ${newElection.startDate}`);
        console.log(`End: ${newElection.endDate}`);
        console.log('\nCandidates can now apply for this election!');

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

createNewElection();
