const mongoose = require('mongoose');

const voterOTPSchema = new mongoose.Schema({
    identifier: { type: String, required: true },
    otp: { type: String, required: true },
    expiresAt: { type: Date, required: true }
});

// Auto-delete after expiry
voterOTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('VoterOTP', voterOTPSchema);
