const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
    // Personal Details
    name: { type: String, required: true },
    dob: { type: Date },
    age: { type: Number },
    gender: { type: String },
    bloodGroup: { type: String },
    mobile: { type: String },
    email: { type: String },
    address: { type: String },
    state: { type: String },
    city: { type: String },

    // Family Details
    fatherName: { type: String },
    motherName: { type: String },
    spouseName: { type: String },
    familyIncome: { type: Number },

    // Education Details
    qualification: { type: String },
    university: { type: String },
    passingYear: { type: String },
    percentage: { type: String },

    // Declaration
    assetsValue: { type: Number }, // Total value of assets
    criminalRecord: { type: String }, // "Yes" or "No" / Details

    // Identity Details
    aadhaar: { type: String },
    voterId: { type: String },
    pan: { type: String },

    // Election Details
    party: { type: String, required: true },
    manifesto: { type: String },
    constituency: { type: String },
    symbolPreference: { type: String },

    // Uploads (Paths)
    photoUrl: { type: String },
    signatureUrl: { type: String },
    idProofUrl: { type: String },
    educationCertUrl: { type: String },
    incomeCertUrl: { type: String },
    communityCertUrl: { type: String },

    electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to user account
    isApproved: { type: Boolean, default: false },
    symbol: { type: String }, // Assigned symbol icon/image name
    rejectionReason: { type: String }, // Reason if rejected
    faceDescriptor: { type: Array } // Store biometrics in candidate application too
}, {
    timestamps: true
});

module.exports = mongoose.model('Candidate', candidateSchema);
