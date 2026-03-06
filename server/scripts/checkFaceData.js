const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

const checkUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting-app');
        console.log('Connected to MongoDB');

        const emails = [
            'sandhiya.smart2004@gmail.com',
            'thalapathykaviyarasan8@gmail.com',
            'shalinicharles9629@gmail.com'
        ];

        for (const email of emails) {
            const user = await User.findOne({ email });
            if (user) {
                console.log(`User: ${user.name}`);
                console.log(`- Email: ${user.email}`);
                console.log(`- Role: ${user.role}`);
                console.log(`- Photo: ${user.photo}`);
                console.log(`- FaceDescriptor Length: ${user.faceDescriptor ? user.faceDescriptor.length : 'N/A'}`);
                console.log('---');
            } else {
                console.log(`User with email ${email} not found.`);
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkUsers();
