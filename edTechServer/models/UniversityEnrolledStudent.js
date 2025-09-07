const mongoose = require('mongoose');

const universityEnrolledStudentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    enrollmentNumber: {
        type: String,
        required: true,
        unique: true
    },
    enrollmentDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['active', 'graduated', 'suspended', 'withdrawn'],
        default: 'active'
    },
    program: {
        type: String,
        required: true
    },
    batch: {
        type: String,
        required: true
    },
    // Add any additional fields specific to university enrollment
}, { timestamps: true });

module.exports = mongoose.model('UniversityEnrolledStudent', universityEnrolledStudentSchema);
