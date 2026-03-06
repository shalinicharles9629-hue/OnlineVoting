const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const listCandidatesStatus = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting-app');
        console.log('Connected to MongoDB');

        const candidates = await Candidate.find();
        console.log(`Found ${candidates.length} candidates.`);

        for (const candidate of candidates) {
            const user = await User.findById(candidate.userId);
            console.log(`Candidate: ${candidate.name} (${candidate.email})`);
            console.log(`- User exists: ${!!user}`);
            if (user) {
                console.log(`- User Bio Length: ${user.faceDescriptor ? user.faceDescriptor.length : 0}`);
                console.log(`- User Photo Present: ${!!user.photo}`);
            }
            console.log('---');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

listCandidatesStatus();
