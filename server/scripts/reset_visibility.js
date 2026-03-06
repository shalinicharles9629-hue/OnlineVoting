const mongoose = require('mongoose');
const mongoURI = 'mongodb://127.0.0.1:27017/voting-app';

const electionSchema = new mongoose.Schema({
    showLiveResults: { type: Boolean, default: false }
}, { strict: false });

const Election = mongoose.model('Election', electionSchema);

async function reset() {
    try {
        await mongoose.connect(mongoURI);
        const result = await Election.updateMany({}, { showLiveResults: false });
        console.log(`Updated ${result.modifiedCount} elections. Resetting showLiveResults to false.`);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

reset();
