
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Hardcoded URI to avoid dotenv issues if any
const mongoURI = 'mongodb://127.0.0.1:27017/voting-app';

const electionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['upcoming', 'ongoing', 'ended'], default: 'upcoming' },
    candidateLimit: { type: Number, default: 0 },
    resultsPublished: { type: Boolean, default: false },
    showLiveResults: { type: Boolean, default: false }
}, { timestamps: true });

const Election = mongoose.model('Election', electionSchema);

async function check() {
    try {
        await mongoose.connect(mongoURI);
        const elections = await Election.find({});

        let output = `Found ${elections.length} elections.\n`;
        elections.forEach(e => {
            output += `ID: ${e._id}\n`;
            output += `Title: ${e.title}\n`;
            output += `Status: ${e.status}\n`;
            output += `showLiveResults: ${e.showLiveResults}\n`;
            output += `resultsPublished: ${e.resultsPublished}\n`;
            output += `----------------\n`;
        });

        fs.writeFileSync(path.join(__dirname, 'election_debug_output.txt'), output);
        console.log('Done');
        process.exit(0);
    } catch (err) {
        fs.writeFileSync(path.join(__dirname, 'election_debug_error.txt'), JSON.stringify(err, null, 2));
        console.error(err);
        process.exit(1);
    }
}

check();
