const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

const VoterOTP = require('../models/VoterOTP');
const crypto = require('crypto');
const { sendOTPEmail } = require('../utils/emailService');

// Request OTP for voting
router.post('/send-otp', async (req, res) => {
    try {
        const { identifier, electionId } = req.body; // Email or Phone

        // Check if user is registered as a voter
        const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
        if (!user || user.role !== 'voter') {
            return res.status(404).json({ message: 'Voter not found in registry. Please contact the Election Commission or your administrator.' });
        }

        // Check if already voted in this election
        const existingVote = await Vote.findOne({ voterIdentifier: identifier, electionId });
        if (existingVote) {
            return res.status(400).json({ message: 'You have already cast your vote in this election.' });
        }

        // Check if election is ongoing
        const election = await Election.findById(electionId);
        if (!election || election.status !== 'ongoing') {
            return res.status(400).json({ message: 'Voting is not open for this election.' });
        }

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // Save OTP (upsert)
        await VoterOTP.findOneAndUpdate(
            { identifier },
            { otp, expiresAt },
            { upsert: true, new: true }
        );

        // Send OTP via Email (or handle phone)
        if (identifier.includes('@')) {
            await sendOTPEmail(identifier, otp);
        } else {
            console.log(`OTP for ${identifier}: ${otp}`);
        }

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify OTP and return Face Descriptor
router.post('/verify-otp', async (req, res) => {
    try {
        const { identifier, otp } = req.body;

        // Verify OTP
        const otpRecord = await VoterOTP.findOne({ identifier, otp });
        if (!otpRecord || otpRecord.expiresAt < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Get user face data
        const user = await User.findOne({ $or: [{ email: identifier }, { phone: identifier }] });
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            message: 'OTP verified',
            faceDescriptor: user.faceDescriptor,
            name: user.name
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify OTP and Cast Vote
router.post('/verify-and-cast', async (req, res) => {
    try {
        const { identifier, otp, electionId, candidateId } = req.body;

        // Verify OTP
        const otpRecord = await VoterOTP.findOne({ identifier, otp });
        if (!otpRecord || otpRecord.expiresAt < Date.now()) {
            return res.status(400).json({ message: 'Invalid or expired OTP' });
        }

        // Check again if already voted (concurrency protection)
        const existingVote = await Vote.findOne({ voterIdentifier: identifier, electionId });
        if (existingVote) {
            return res.status(400).json({ message: 'You have already cast your vote in this election.' });
        }

        // Check election status
        const election = await Election.findById(electionId);
        if (!election || election.status !== 'ongoing') {
            return res.status(400).json({ message: 'Election is no longer active' });
        }

        // Cast Vote
        const vote = new Vote({
            voterIdentifier: identifier,
            candidateId,
            electionId
        });
        await vote.save();

        // Clear OTP
        await VoterOTP.deleteOne({ _id: otpRecord._id });

        res.status(201).json({ message: 'Vote cast successfully! Your voice has been heard.' });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already voted in this election' });
        }
        res.status(500).json({ error: error.message });
    }
});

// Get results for an election
router.get('/results/:electionId', async (req, res) => {
    try {
        const { electionId } = req.params;

        // Get election details
        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        // Check if user is admin (if token provided)
        const token = req.headers.authorization?.split(' ')[1];
        let isAdmin = false;
        if (token) {
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id);
                isAdmin = user?.role === 'admin';
            } catch (err) {
                // Token invalid or expired, treat as non-admin
            }
        }

        // Access Control:
        // 1. Admin: Always can view (implicit in isAdmin check above)
        // 2. Published: Everyone can view
        // 3. Ongoing + showLiveResults: Public can view live trends
        const canView = isAdmin || election.resultsPublished || (election.status === 'ongoing' && election.showLiveResults);

        if (!canView) {
            return res.json({
                published: false,
                election: {
                    title: election.title,
                    status: election.status,
                    resultsPublished: election.resultsPublished
                },
                results: [],
                message: 'Results will be released after admin approval.'
            });
        }

        // Aggregation to count votes per candidate
        const results = await Vote.aggregate([
            { $match: { electionId: new mongoose.Types.ObjectId(electionId) } },
            { $group: { _id: '$candidateId', count: { $sum: 1 } } },
            { $lookup: { from: 'candidates', localField: '_id', foreignField: '_id', as: 'candidateDetails' } },
            { $unwind: '$candidateDetails' },
            { $sort: { count: -1 } },
            {
                $project: {
                    candidateId: '$_id',
                    count: 1,
                    candidateDetails: {
                        name: 1,
                        party: 1,
                        photoUrl: 1,
                        constituency: 1
                    }
                }
            }
        ]);

        res.json({
            published: election.resultsPublished,
            election: {
                title: election.title,
                status: election.status,
                resultsPublished: election.resultsPublished
            },
            results
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
