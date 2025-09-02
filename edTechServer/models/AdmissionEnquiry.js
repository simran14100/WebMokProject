const mongoose = require('mongoose');

const admissionEnquirySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    fatherName: {
        type: String,
        trim: true
    },
    programType: {
        type: String,
        enum: ['UG', 'PG', 'PHD'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'converted', 'rejected'],
        default: 'pending'
    },
    notes: [{
        content: String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('AdmissionEnquiry', admissionEnquirySchema);
