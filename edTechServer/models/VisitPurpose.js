const mongoose = require('mongoose');

const visitPurposeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Purpose name is required'],
        trim: true,
        unique: true
    },
    description: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Text index for search
visitPurposeSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('VisitPurpose', visitPurposeSchema);
