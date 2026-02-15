const mongoose = require('mongoose');
const Election = require('./models/Election');
const dotenv = require('dotenv');

dotenv.config();

const seedElections = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting-app');

        await Election.deleteMany(); // Clear existing

        const elections = [
            {
                title: 'General Elections 2026',
                description: 'Nationwide general elections for the parliament.',
                startDate: new Date('2026-05-01'),
                endDate: new Date('2026-05-15'),
                status: 'ongoing'
            },
            {
                title: 'State Assembly Elections',
                description: 'Elections for the state legislative assembly.',
                startDate: new Date('2026-06-10'),
                endDate: new Date('2026-06-20'),
                status: 'upcoming'
            },
            {
                title: 'Municipal Corporation Elections',
                description: 'Local body elections for city management.',
                startDate: new Date('2026-04-15'),
                endDate: new Date('2026-04-20'),
                status: 'ongoing'
            }
        ];

        await Election.insertMany(elections);
        console.log('Elections seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding elections:', error);
        process.exit(1);
    }
};

seedElections();
