const mongoose = require('mongoose');

const paymentInstallmentSchema = new mongoose.Schema({
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
    totalAmount: {
        type: Number,
        required: true
    },
    paidAmount: {
        type: Number,
        default: 0
    },
    remainingAmount: {
        type: Number,
        required: true
    },
    installmentDetails: [{
        installmentNumber: {
            type: Number,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        dueDate: {
            type: Date,
            required: true
        },
        status: {
            type: String,
            enum: ['Pending', 'Paid', 'Overdue'],
            default: 'Pending'
        },
        paidAt: {
            type: Date
        },
        paymentId: {
            type: String
        },
        orderId: {
            type: String
        }
    }],
    status: {
        type: String,
        enum: ['Active', 'Completed', 'Defaulted'],
        default: 'Active'
    },
    paymentMethod: {
        type: String,
        enum: ['Full', 'Installment'],
        required: true
    },
    installmentCount: {
        type: Number,
        required: true
    },
    reminderSent: [{
        installmentNumber: Number,
        sentAt: Date,
        reminderType: {
            type: String,
            enum: ['Due', 'Overdue', 'Final'],
            required: true
        }
    }],
    lastReminderSent: {
        type: Date
    },
    nextReminderDate: {
        type: Date
    },
    gracePeriod: {
        type: Number,
        default: 7 // days after due date
    }
}, {
    timestamps: true
});

// Index for efficient querying
paymentInstallmentSchema.index({ student: 1, course: 1 });
paymentInstallmentSchema.index({ status: 1 });
paymentInstallmentSchema.index({ 'installmentDetails.dueDate': 1 });
paymentInstallmentSchema.index({ nextReminderDate: 1 });

// Virtual for calculating overdue installments
paymentInstallmentSchema.virtual('overdueInstallments').get(function() {
    const today = new Date();
    return this.installmentDetails.filter(installment => 
        installment.status === 'Pending' && installment.dueDate < today
    );
});

// Virtual for calculating pending installments
paymentInstallmentSchema.virtual('pendingInstallments').get(function() {
    return this.installmentDetails.filter(installment => 
        installment.status === 'Pending'
    );
});

// Method to calculate next reminder date
paymentInstallmentSchema.methods.calculateNextReminder = function() {
    const pendingInstallments = this.pendingInstallments;
    if (pendingInstallments.length === 0) return null;
    
    const nextDue = pendingInstallments.reduce((earliest, current) => 
        current.dueDate < earliest.dueDate ? current : earliest
    );
    
    // Send reminder 3 days before due date
    const reminderDate = new Date(nextDue.dueDate);
    reminderDate.setDate(reminderDate.getDate() - 3);
    
    return reminderDate;
};

// Method to update installment status
paymentInstallmentSchema.methods.updateInstallmentStatus = function() {
    const today = new Date();
    
    this.installmentDetails.forEach(installment => {
        if (installment.status === 'Pending' && installment.dueDate < today) {
            installment.status = 'Overdue';
        }
    });
    
    // Update overall status
    if (this.remainingAmount === 0) {
        this.status = 'Completed';
    } else if (this.overdueInstallments.length > 0) {
        this.status = 'Defaulted';
    }
    
    return this.save();
};

module.exports = mongoose.model('PaymentInstallment', paymentInstallmentSchema); 