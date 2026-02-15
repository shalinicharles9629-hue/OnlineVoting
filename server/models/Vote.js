const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
    voterIdentifier: { type: String, required: true }, // Email or Phone number
    candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
    electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true }
}, {
    timestamps: true
});

// Ensure an identifier can only vote once per election
voteSchema.index({ voterIdentifier: 1, electionId: 1 }, { unique: true });

module.exports = mongoose.model('Vote', voteSchema);
