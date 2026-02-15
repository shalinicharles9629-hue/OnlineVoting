const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const Vote = require('../models/Vote');
const Election = require('../models/Election');
const VoterOTP = require('../models/VoterOTP');

// Helper to check vote status
async function getUserWithVoteStatus(user) {
    try {
        const ongoingElections = await Election.find({ status: 'ongoing' });
        const ongoingElectionIds = ongoingElections.map(e => e._id);

        let hasVoted = false;
        if (ongoingElectionIds.length > 0) {
            const vote = await Vote.findOne({
                voterId: user._id,
                electionId: { $in: ongoingElectionIds }
            });
            hasVoted = !!vote;
        }

        const userObj = user.toObject();
        userObj.hasVoted = hasVoted;
        return userObj;
    } catch (err) {
        console.error("Error checking vote status:", err);
        return user.toObject();
    }
}

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const userWithStatus = await getUserWithVoteStatus(user);
        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
        res.send({ user: userWithStatus, token });
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// ... (Register remains mostly same but doesn't need hasVoted as new users haven't voted)

const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Register Voter Disabled (Manual DB entry required)
/*
router.post('/register-voter', upload.single('photo'), async (req, res) => {
    ...
});
*/


// Original Register (mostly for candidates/admin)
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        // Check if user already exists (email or phone)
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Email or Phone already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role: role || 'voter'
        });

        await user.save();

        const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
        // New user hasn't voted
        const userObj = user.toObject();
        userObj.hasVoted = false;
        res.status(201).send({ user: userObj, token });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Configure Nodemailer Logic
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send OTP (For Login OR Registration)
router.post('/send-otp', async (req, res) => {
    try {
        const { identifier } = req.body; // email or phone

        // Find user by email or phone
        const user = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        });

        if (!user) {
            return res.status(404).json({ error: 'Identity not found in voter registry. Please contact admin.' });
        }

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Use VoterOTP for all requests for consistency
        await VoterOTP.findOneAndUpdate(
            { identifier },
            { otp, expiresAt },
            { upsert: true, new: true }
        );

        // Target email
        const targetEmail = user.email;

        if (targetEmail) {
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: targetEmail,
                    subject: 'Your Election OTP',
                    text: `Your OTP is ${otp}. It is valid for 10 minutes.`
                });
                console.log(`[OTP] Email sent to ${targetEmail}`);
            } catch (emailError) {
                console.error("Error sending email:", emailError);
                return res.status(500).json({ error: 'Failed to send OTP email' });
            }
        } else {
            // SMS logic for phone
            console.log(`[OTP] for ${identifier}: ${otp}`);
        }

        res.json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error sending OTP' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { identifier, otp } = req.body;

        const otpRecord = await VoterOTP.findOne({ identifier, otp });
        if (!otpRecord || otpRecord.expiresAt < Date.now()) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Clear OTP
        await VoterOTP.deleteOne({ _id: otpRecord._id });

        // Check if user already exists
        const user = await User.findOne({
            $or: [{ email: identifier }, { phone: identifier }]
        });

        if (user) {
            const userWithStatus = await getUserWithVoteStatus(user);
            const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET);
            return res.json({ user: userWithStatus, token, exists: true });
        }

        res.json({ message: 'OTP verified', exists: false });
    } catch (error) {
        res.status(500).json({ error: 'Server error verifying OTP' });
    }
});

module.exports = router;
