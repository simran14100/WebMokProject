const mongoose = require('mongoose');
mongoose.plugin(require('mongoose-paginate-v2'));

const honoraryEnquirySchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: [true, 'Student name is required'],
        trim: true
    },
    fatherName: {
        type: String,
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    },
    address: {
        type: String,
        trim: true
    },
    qualification: {
        type: String,
        trim: true
    },
    department: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
        required: [true, 'Department is required']
    },
    status: {
        type: String,
        enum: ['pending', 'contacted', 'accepted', 'rejected'],
        default: 'pending'
    },
    notes: [{
        content: String,
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Add text index for search
honoraryEnquirySchema.index({
    studentName: 'text',
    email: 'text',
    phone: 'text',
    qualification: 'text'
});

// Populate department when querying
honoraryEnquirySchema.pre(/^find/, function(next) {
    this.populate({
        path: 'department',
        select: 'name'
    });
    next();
});

module.exports = mongoose.model('HonoraryEnquiry', honoraryEnquirySchema);
