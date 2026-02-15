const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['voter', 'admin', 'candidate'], default: 'voter' },
    isVerified: { type: Boolean, default: false },
    phone: { type: String, unique: true, sparse: true },
    photo: { type: String }, // URL or Base64 of the voter's photo
    faceDescriptor: { type: Array }, // To store face features for recognition
    otp: { type: String },
    otpExpires: { type: Date }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);
