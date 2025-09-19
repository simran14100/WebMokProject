const mongoose = require('mongoose');

const universityPaymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UniversityRegisteredStudent',
    required: true
  },
  registrationNumber: {
    type: String,
    required: true
  },
  session: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  semester: {
    type: Number,
    required: true
  },
  feeType: {
    type: String,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    required: true
  },
  balanceAmount: {
    type: Number,
    default: 0
  },
  scholarshipAmount: {
    type: Number,
    default: 0
  },
  discountAmount: {
    type: Number,
    default: 0
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  receiptNo: {
    type: String,
    required: true,
    unique: true
  },
  receiptDate: {
    type: Date,
    default: Date.now
  },
  modeOfPayment: {
    type: String,
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque', 'DD'],
    required: true
  },
  transactionId: {
    type: String
  },
  status: {
    type: String,
    enum: ['Paid', 'Pending', 'Partial', 'Refunded'],
    default: 'Paid'
  },
  remarks: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  feeAssignment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeAssignment',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
universityPaymentSchema.index({ registrationNumber: 1 });
universityPaymentSchema.index({ receiptNo: 1 }, { unique: true });
universityPaymentSchema.index({ student: 1, feeAssignment: 1 });

// Virtual for student details
universityPaymentSchema.virtual('studentDetails', {
  ref: 'UniversityRegisteredStudent',
  localField: 'student',
  foreignField: '_id',
  justOne: true
});

// Virtual for fee assignment details
universityPaymentSchema.virtual('feeDetails', {
  ref: 'FeeAssignment',
  localField: 'feeAssignment',
  foreignField: '_id',
  justOne: true
});

// Pre-save hook to generate receipt number if not provided
universityPaymentSchema.pre('save', async function(next) {
  if (!this.receiptNo) {
    const count = await this.constructor.countDocuments();
    this.receiptNo = `RCPT-${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

const UniversityPayment = mongoose.model('UniversityPayment', universityPaymentSchema);

module.exports = UniversityPayment;
