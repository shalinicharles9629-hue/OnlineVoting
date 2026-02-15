const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const News = require('../models/News');
const { auth, isAdmin } = require('../middleware/auth');
const User = require('../models/User');
const { sendApprovalEmail, sendRejectionEmail } = require('../utils/emailService');

// isAdmin is now imported from middleware/auth.js

// GET /stats: Fetch counts for total, pending, and approved candidates
router.get('/stats', auth, isAdmin, async (req, res) => {
    try {
        const totalCandidates = await Candidate.countDocuments();
        const pendingApplications = await Candidate.countDocuments({
            isApproved: false,
            $or: [
                { rejectionReason: { $exists: false } },
                { rejectionReason: "" },
                { rejectionReason: null }
            ]
        });
        const approvedCandidates = await Candidate.countDocuments({ isApproved: true });

        res.json({
            totalCandidates,
            pendingApplications,
            approvedCandidates
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /applications: List all candidate applications
router.get('/applications', auth, isAdmin, async (req, res) => {
    try {
        const applications = await Candidate.find().sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET /applications/:id: Fetch detailed information for a specific application
router.get('/applications/:id', auth, isAdmin, async (req, res) => {
    try {
        const application = await Candidate.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ message: 'Application not found' });
        }
        res.json(application);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// PATCH /applications/:id/status: Update application status (Approve/Reject)
router.patch('/applications/:id/status', auth, isAdmin, async (req, res) => {
    try {
        const { isApproved, rejectionReason } = req.body;
        const updateData = { isApproved };
        if (rejectionReason) updateData.rejectionReason = rejectionReason;
        if (isApproved) updateData.rejectionReason = undefined; // Clear rejection reason if approved

        const application = await Candidate.findByIdAndUpdate(req.params.id, updateData, { new: true });

        // Send email notification
        if (application) {
            if (isApproved) {
                // Send approval email
                await sendApprovalEmail(application.email, application.name, 'General Elections 2026');
            } else if (rejectionReason) {
                // Send rejection email
                await sendRejectionEmail(application.email, application.name, rejectionReason);
            }
        }

        res.json(application);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// PATCH /applications/:id/symbol: Assign a symbol to an approved candidate
router.patch('/applications/:id/symbol', auth, isAdmin, async (req, res) => {
    try {
        const { symbol } = req.body;

        // Find the current candidate to get their electionId
        const candidate = await Candidate.findById(req.params.id);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        // Check if the symbol is already taken in the same election
        const existingCandidate = await Candidate.findOne({
            electionId: candidate.electionId,
            symbol: symbol,
            _id: { $ne: req.params.id } // Exclude the current candidate
        });

        if (existingCandidate) {
            return res.status(400).json({ message: `The symbol '${symbol}' is already assigned to another candidate in this election.` });
        }

        const application = await Candidate.findByIdAndUpdate(req.params.id, { symbol }, { new: true });
        res.json(application);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// News Management
// GET /news: Fetch all news items
router.get('/news', async (req, res) => {
    try {
        const news = await News.find({ active: true }).sort({ createdAt: -1 });
        res.json(news);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /news: Create a new news item
router.post('/news', auth, isAdmin, async (req, res) => {
    try {
        const { content, type } = req.body;
        const news = new News({ content, type });
        await news.save();
        res.status(201).json(news);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// DELETE /news/:id: Remove a news item
router.delete('/news/:id', auth, isAdmin, async (req, res) => {
    try {
        await News.findByIdAndDelete(req.params.id);
        res.json({ message: 'News item deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Voter Management
const multer = require('multer');
const bcrypt = require('bcryptjs');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// POST /voters: Manually add a voter
router.post('/voters', auth, isAdmin, upload.single('photo'), async (req, res) => {
    try {
        const { name, email, phone, faceDescriptor } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ error: 'Voter with this Email or Phone already exists.' });
        }

        const user = new User({
            name,
            email: email || undefined,
            phone: phone || undefined,
            password: await bcrypt.hash(Math.random().toString(36), 10), // Random password
            role: 'voter',
            photo: req.file ? `/uploads/${req.file.filename}` : '',
            faceDescriptor: faceDescriptor ? JSON.parse(faceDescriptor) : []
        });

        await user.save();
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// GET /voters: Fetch all registered voters
router.get('/voters', auth, isAdmin, async (req, res) => {
    try {
        const voters = await User.find({ role: 'voter' }).select('-password').sort({ createdAt: -1 });
        res.json(voters);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
