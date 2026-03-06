const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const manageAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting-app');
        console.log('Connected to MongoDB');

        const adminUser = await User.findOne({ role: 'admin' });

        if (adminUser) {
            console.log('Admin user already exists:');
            console.log('Email:', adminUser.email);
            // We can't show the password as it's hashed
            console.log('If you do not know the password, you may want to reset it.');
        } else {
            console.log('No admin user found. Creating one...');
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const newAdmin = new User({
                name: 'System Admin',
                email: 'admin@votingapp.com',
                phone: '0000000000',
                password: hashedPassword,
                role: 'admin'
            });
            await newAdmin.save();
            console.log('Admin user created successfully.');
            console.log('Email: admin@votingapp.com');
            console.log('Password: admin123');
        }
        process.exit();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

manageAdmin();
