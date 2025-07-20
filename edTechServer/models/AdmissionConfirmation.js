const mongoose = require('mongoose');

const admissionConfirmationSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    paymentDetails: {
        orderId: {
            type: String,
            required: true
        },
        paymentId: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        paidAt: {
            type: Date,
            required: true
        }
    },
    status: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Rejected'],
        default: 'Pending'
    },
    confirmedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    confirmedAt: {
        type: Date
    },
    rejectionReason: {
        type: String
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Index for efficient querying
admissionConfirmationSchema.index({ student: 1, course: 1 });
admissionConfirmationSchema.index({ status: 1 });
admissionConfirmationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AdmissionConfirmation', admissionConfirmationSchema); 