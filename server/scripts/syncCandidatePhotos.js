const mongoose = require('mongoose');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const syncPhotos = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting-app');
        console.log('Connected to MongoDB');

        const candidates = await Candidate.find();
        console.log(`Found ${candidates.length} candidates.`);

        let updatedCount = 0;
        for (const candidate of candidates) {
            if (candidate.photoUrl) {
                const result = await User.findByIdAndUpdate(candidate.userId, {
                    photo: candidate.photoUrl,
                    role: 'candidate' // Also ensure role is set correctly
                });
                if (result) {
                    updatedCount++;
                    console.log(`Updated user ${result.name} (${candidate.email})`);
                }
            }
        }

        console.log(`Successfully synced photos and roles for ${updatedCount} users.`);
        process.exit(0);
    } catch (error) {
        console.error('Error syncing photos:', error);
        process.exit(1);
    }
};

syncPhotos();
