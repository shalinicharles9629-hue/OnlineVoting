const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting-app').then(async () => {
    const User = require('./models/User');
    const identifier = "9361253577";

    console.log(`Searching for identifier: ${identifier}`);
    const phoneRegex = new RegExp(identifier.split('').join('\\s*'));
    console.log(`Regex: ${phoneRegex}`);

    const user = await User.findOne({ phone: phoneRegex });
    if (user) {
        console.log("User found:", user.name, "| Phone:", user.phone);
    } else {
        console.log("User not found.");
        const allUsers = await User.find({ phone: { $exists: true } }, 'phone');
        console.log("Available phones in DB:", allUsers.map(u => `'${u.phone}'`));
    }

    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
