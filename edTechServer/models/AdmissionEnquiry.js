const mongoose = require('mongoose');

const admissionEnquirySchema = new mongoose.Schema({
    // Basic Information
    name: {
        type: String,
        required: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', ''],
        lowercase: true,
        default: ''
    },
    parentName: {
        type: String,
        trim: true
    },
    
    // Contact Information
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
    alternateNumber: {
        type: String,
        trim: true
    },
    
    // Address Information
    address: {
        type: String,
        trim: true
    },
    city: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        trim: true
    },
    
    // Academic Information
    lastClass: {
        type: String,
        trim: true
    },
    boardSchoolName: {
        type: String,
        trim: true
    },
    percentage: {
        type: Number,
        min: 0,
        max: 100
    },
    academicYear: {
        type: String,
        trim: true
    },
    stream: {
        type: String,
        trim: true
    },
    graduationCourse: {
        type: String,
        trim: true,
        required: true
    },
    
    // Program Information
    programType: {
        type: String,
        enum: ['UG', 'PG', 'PHD'],
        required: true
    },
    
    // System Fields
    status: {
        type: String,
        enum: ['pending', 'contacted', 'converted', 'rejected', 'new', 'follow up', 'admitted'],
        default: 'new'
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

// Add pagination plugin
admissionEnquirySchema.plugin(require('mongoose-paginate-v2'));

module.exports = mongoose.model('AdmissionEnquiry', admissionEnquirySchema);
