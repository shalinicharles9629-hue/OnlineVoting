const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const { auth } = require('../middleware/auth');
const multer = require('multer');

// Multer setup for multiple file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            cb(new Error('Only images and PDFs are allowed'));
        }
    }
});

// Configure upload fields
const uploadFields = upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'signature', maxCount: 1 },
    { name: 'idProof', maxCount: 1 },
    { name: 'educationCert', maxCount: 1 },
    { name: 'incomeCert', maxCount: 1 },
    { name: 'communityCert', maxCount: 1 }
]);

// Apply for candidacy
router.post('/apply', auth, uploadFields, async (req, res) => {
    try {
        console.log("Received application data:", req.body);
        const {
            name, dob, age, gender, bloodGroup, mobile, email, address, state, city,
            fatherName, motherName, spouseName, familyIncome,
            qualification, university, passingYear, percentage,
            assetsValue, criminalRecord,
            aadhaar, voterId, pan,
            party, manifesto, constituency, symbolPreference, electionId
        } = req.body;

        // Fetch election details
        const election = await Election.findById(electionId);
        if (!election) {
            return res.status(404).json({ message: 'Election not found' });
        }

        // Rule 1: Cannot apply if election has already started
        if (election.status !== 'upcoming') {
            return res.status(400).json({ message: `Applications are closed. This election is currently ${election.status}.` });
        }

        // Rule 2: Cannot apply if candidate limit reached
        if (election.candidateLimit > 0) {
            const currentApplications = await Candidate.countDocuments({ electionId });
            if (currentApplications >= election.candidateLimit) {
                return res.status(400).json({ message: `The candidate limit of ${election.candidateLimit} for this election has been reached.` });
            }
        }

        // Check if already applied for this election
        const existingApplication = await Candidate.findOne({ userId: req.user._id, electionId });
        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this election' });
        }

        // Helper to get file path
        const getFilePath = (fieldName) => {
            return req.files && req.files[fieldName] ? `/uploads/${req.files[fieldName][0].filename}` : '';
        };

        const candidate = new Candidate({
            userId: req.user._id,
            electionId,
            // Personal
            name, dob, age, gender, bloodGroup, mobile, email, address, state, city,
            // Family
            fatherName, motherName, spouseName, familyIncome,
            // Education
            qualification, university, passingYear, percentage,
            // Declaration
            assetsValue, criminalRecord,
            // Identity
            aadhaar, voterId, pan,
            // Election
            party, manifesto, constituency, symbolPreference,
            // Uploads
            photoUrl: getFilePath('photo'),
            signatureUrl: getFilePath('signature'),
            idProofUrl: getFilePath('idProof'),
            educationCertUrl: getFilePath('educationCert'),
            incomeCertUrl: getFilePath('incomeCert'),
            communityCertUrl: getFilePath('communityCert')
        });

        await candidate.save();
        res.status(201).json(candidate);
    } catch (error) {
        console.error("Error saving candidate:", error);
        res.status(400).json({ error: error.message });
    }
});

// Get candidates for an election
router.get('/election/:electionId', async (req, res) => {
    try {
        const candidates = await Candidate.find({ electionId: req.params.electionId, isApproved: true });
        res.json(candidates);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin: Approve candidate
router.patch('/approve/:id', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const candidate = await Candidate.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
        res.json(candidate);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get current user's candidate application
router.get('/me', auth, async (req, res) => {
    try {
        const application = await Candidate.findOne({ userId: req.user._id });
        if (!application) {
            return res.status(404).json({ message: 'No application found' });
        }
        res.json(application);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
