const express = require('express');
const router = express.Router();
const Election = require('../models/Election');
const { auth, isAdmin } = require('../middleware/auth');

// Create Election (Admin only)
router.post('/create', auth, isAdmin, async (req, res) => {
    try {
        const election = new Election(req.body);
        await election.save();
        res.status(201).json(election);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Update Election Status (Admin only)
router.patch('/:id/status', auth, isAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const election = await Election.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!election) return res.status(404).json({ message: 'Election not found' });
        res.json(election);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Publish/Unpublish Election Results (Admin only)
router.patch('/:id/publish-results', auth, isAdmin, async (req, res) => {
    try {
        const { publish } = req.body; // true to publish, false to unpublish
        const election = await Election.findByIdAndUpdate(
            req.params.id,
            { resultsPublished: publish },
            { new: true }
        );
        if (!election) return res.status(404).json({ message: 'Election not found' });
        res.json({
            message: publish ? 'Results published successfully' : 'Results unpublished successfully',
            election
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Toggle Live Results Visibility (Admin only)
router.patch('/:id/toggle-live-results', auth, isAdmin, async (req, res) => {
    try {
        const { showLiveResults } = req.body;
        const election = await Election.findByIdAndUpdate(
            req.params.id,
            { showLiveResults },
            { new: true }
        );
        if (!election) return res.status(404).json({ message: 'Election not found' });
        res.json({
            message: showLiveResults ? 'Live trends are now public' : 'Live trends are now hidden',
            election
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

const Candidate = require('../models/Candidate');

// Get all elections
router.get('/', async (req, res) => {
    try {
        const elections = await Election.find();

        // Add candidate count for each election
        const electionsWithCounts = await Promise.all(elections.map(async (e) => {
            const count = await Candidate.countDocuments({ electionId: e._id });
            return {
                ...e.toObject(),
                candidateCount: count
            };
        }));

        res.json(electionsWithCounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get election by ID
router.get('/:id', async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);
        if (!election) return res.status(404).json({ message: 'Election not found' });
        res.json(election);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
