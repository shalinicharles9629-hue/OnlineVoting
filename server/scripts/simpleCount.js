const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const countAll = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting-app');
        console.log('Connected to MongoDB');

        const db = mongoose.connection.db;
        const usersCount = await db.collection('users').countDocuments();
        const candidatesCount = await db.collection('candidates').countDocuments();

        console.log(`Users: ${usersCount}`);
        console.log(`Candidates: ${candidatesCount}`);

        process.exit(0);
    } catch (error) {
        console.log('Error:', error.message);
        process.exit(1);
    }
};

countAll();
