const fs = require('fs');
const logFile = 'voter_verification.log';
fs.writeFileSync(logFile, 'Script started at ' + new Date().toISOString() + '\n');

const log = (msg) => {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
};

log('Loading dependencies...');
try {
    const mongoose = require('mongoose');
    const User = require('../models/User');
    const Election = require('../models/Election');
    const Vote = require('../models/Vote');
    const dotenv = require('dotenv');
    const path = require('path');

    dotenv.config({ path: path.join(__dirname, '../.env') });

    const verifyVoterStatus = async () => {
        try {
            log('Connecting to MongoDB...');
            const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/voting-app';
            await mongoose.connect(uri);
            log('Connected successfully.');

            log('Fetching relevant election...');
            let relevantElection = await Election.findOne({ status: 'ongoing' }).sort({ createdAt: -1 });
            if (!relevantElection) {
                relevantElection = await Election.findOne().sort({ createdAt: -1 });
            }

            if (relevantElection) {
                log('Relevant Election: ' + relevantElection.title + ' (ID: ' + relevantElection._id + ', Status: ' + relevantElection.status + ')');
                log('Fetching votes for this election...');
                const votes = await Vote.find({ electionId: relevantElection._id }).select('voterIdentifier');
                const votedIdentifiers = new Set(votes.map(v => v.voterIdentifier));

                log('Number of votes found: ' + votes.length);
                log('Unique voters who voted: ' + votedIdentifiers.size);
                if (votedIdentifiers.size > 0) {
                    log('Sample identifiers: ' + Array.from(votedIdentifiers).slice(0, 5).join(', '));
                }

                const voters = await User.find({ role: { $in: ['voter', 'candidate'] } }).select('name email phone').lean();

                const votedVoters = voters.filter(voter => votedIdentifiers.has(voter.email) || votedIdentifiers.has(voter.phone));

                if (votedVoters.length > 0) {
                    log('SUCCESS: Found ' + votedVoters.length + ' voters who matched the vote records.');
                    votedVoters.forEach(v => log('Voted: ' + v.name + ' (' + (v.email || v.phone) + ')'));
                } else {
                    log('WARNING: No voters matched the vote records identifier.');
                }
            } else {
                log('No elections found.');
            }

            process.exit(0);
        } catch (error) {
            log('FATAL ERROR (async): ' + error.stack);
            process.exit(1);
        }
    };

    //     if (fs.existsSync(logFile)) fs.unlinkSync(logFile);
    verifyVoterStatus();
} catch (e) {
    log('FATAL ERROR (sync): ' + e.stack);
    process.exit(1);
}
