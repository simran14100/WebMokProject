const mongoose = require('mongoose');

const studentPaymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['created', 'captured', 'failed', 'refunded'],
    default: 'created'
  },
  feeType: {
    type: String,
    required: true
  },
  academicYear: {
    type: String,
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'razorpay'
  },
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  receipt: {
    type: String,
    unique: true
  },
  refunds: [{
    amount: Number,
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed']
    },
    reason: String,
    processedAt: Date
  }], 
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
studentPaymentSchema.index({ student: 1, createdAt: -1 });
studentPaymentSchema.index({ status: 1 });
studentPaymentSchema.index({ feeType: 1 });

// Virtual for formatted amount
studentPaymentSchema.virtual('formattedAmount').get(function() {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: this.currency || 'INR'
  }).format(this.amount);
});

// Pre-save hook to generate receipt number
studentPaymentSchema.pre('save', function(next) {
  if (!this.receipt) {
    this.receipt = `STUPAY${Date.now().toString().slice(-8)}`;
  }
  next();
});

// Static method to get total payments by student
studentPaymentSchema.statics.getTotalPaid = async function(studentId) {
  const result = await this.aggregate([
    {
      $match: {
        student: mongoose.Types.ObjectId(studentId),
        status: 'captured'
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);
  
  return result.length > 0 ? result[0].total : 0;
};

const StudentPayment = mongoose.model('StudentPayment', studentPaymentSchema);

module.exports = StudentPayment;
