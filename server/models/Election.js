const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: String, enum: ['upcoming', 'ongoing', 'ended'], default: 'upcoming' },
    candidateLimit: { type: Number, default: 0 }, // 0 means no limit
    resultsPublished: { type: Boolean, default: false },
    showLiveResults: { type: Boolean, default: false }
}, {
    timestamps: true
});

module.exports = mongoose.model('Election', electionSchema);
