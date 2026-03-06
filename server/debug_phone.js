const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting-app').then(async () => {
    const User = require('./models/User');
    const Vote = require('./models/Vote');

    console.log("--- Users (Phone) ---");
    const users = await User.find({ phone: { $exists: true } }, 'name email phone').limit(5);
    console.log(users);

    console.log("\n--- Votes (Identifier) ---");
    const votes = await Vote.find({}, 'voterIdentifier').limit(5);
    console.log(votes);

    process.exit();
}).catch(err => {
    console.error(err);
    process.exit(1);
});
