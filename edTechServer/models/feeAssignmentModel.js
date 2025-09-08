import mongoose from 'mongoose';

const feeAssignmentSchema = new mongoose.Schema({
  feeType: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeeType',
    required: [true, 'Fee type is required']
  },
  session: {
    type: String,
    required: [true, 'Session is required'],
    match: [/^\d{4}-\d{2}$/, 'Please enter a valid session in format YYYY-YY']
  },
  course: {
    type: String,
    required: [true, 'Course is required']
  },
  assigneeId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Assignee ID is required'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
    set: v => parseFloat(v).toFixed(2)
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true, versionKey: false },
  toObject: { virtuals: true, versionKey: false }
});

// Virtual for formatted amount
feeAssignmentSchema.virtual('formattedAmount').get(function() {
  return `₹${this.amount.toLocaleString('en-IN')}`;
});

// Indexes for common queries
feeAssignmentSchema.index({ feeType: 1, course: 1, session: 1 }, { unique: true });

const FeeAssignment = mongoose.model('FeeAssignment', feeAssignmentSchema);

export default FeeAssignment;
