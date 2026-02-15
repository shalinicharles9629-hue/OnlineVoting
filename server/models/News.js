const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
    content: { type: String, required: true },
    type: {
        type: String,
        enum: ['announcement', 'registration', 'update', 'election'],
        default: 'announcement'
    },
    active: { type: Boolean, default: true }
}, {
    timestamps: true
});

module.exports = mongoose.model('News', newsSchema);
