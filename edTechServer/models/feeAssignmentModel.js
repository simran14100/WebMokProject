const mongoose = require('mongoose');

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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UGPGCourse',
    required: [true, 'Course is required']
  },
  semester: {
    type: Number,
    min: [1, 'Semester must be at least 1'],
    max: [12, 'Semester cannot be greater than 12'],
    required: false
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
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  balance: {
    type: Number,
    default: function() { return this.amount; },
    min: [0, 'Balance cannot be negative']
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  balance: {
    type: Number,
    default: function() { return this.amount; },
    min: [0, 'Balance cannot be negative']
  },
  isYearly: {
    type: Boolean,
    default: false
  },
  academicYear: {
    type: String,
    required: [
      function() { return this.isYearly; },
      'Academic year is required for yearly fees'
    ],
    match: [/^\d{4}-\d{2}$/, 'Please enter a valid academic year in format YYYY-YY']
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true, versionKey: false },
  toObject: { virtuals: true, versionKey: false }
});

// Virtual for formatted amount
feeAssignmentSchema.virtual('formattedAmount').get(function() {
  return `₹${parseFloat(this.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
});

// Virtual for formatted paid amount
feeAssignmentSchema.virtual('formattedPaidAmount').get(function() {
  return `₹${parseFloat(this.paidAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
});

// Virtual for formatted balance
feeAssignmentSchema.virtual('formattedBalance').get(function() {
  return `₹${parseFloat(this.balance || this.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
});

// Virtual for semester display
feeAssignmentSchema.virtual('semesterDisplay').get(function() {
  if (!this.semester) return 'N/A';
  return `Semester ${this.semester}`;
});

// Virtual for course name
feeAssignmentSchema.virtual('courseName', {
  ref: 'UGPGCourse',
  localField: 'course',
  foreignField: '_id',
  justOne: true,
  options: { select: 'courseName courseCode courseType' }
});

// Ensure virtuals are included when converting to JSON or Object
feeAssignmentSchema.set('toJSON', { virtuals: true });
// feeAssignmentSchema.set('toObject', { virtuals: true });

// Add a pre-find hook to always populate the course and fee type
feeAssignmentSchema.pre(/^find/, function(next) {
  this.populate([
    {
      path: 'course',
      select: 'courseName courseCode courseType durationYear semesters',
      model: 'UGPGCourse'
    },
    {
      path: 'feeType',
      select: 'name category type',
      model: 'FeeType'
    }
  ]);
  next();
});

// Pre-save hook to update balance
feeAssignmentSchema.pre('save', function(next) {
  if (this.isModified('paidAmount') || this.isNew) {
    this.balance = Math.max(0, this.amount - (this.paidAmount || 0));
  }
  next();
});

// Indexes for common queries
// Unique compound index to prevent duplicate fee assignments for same course, session, and semester
feeAssignmentSchema.index(
  { 
    feeType: 1, 
    course: 1, 
    session: 1,
    semester: 1  // Include semester in the unique index
  }, 
  { 
    unique: true,
    partialFilterExpression: { semester: { $exists: true } } // Only enforce uniqueness when semester exists
  }
);

// Add index for balance queries
feeAssignmentSchema.index({ balance: 1 });

// Add index for paid amount queries
feeAssignmentSchema.index({ paidAmount: 1 });

// Add index for academic year queries
feeAssignmentSchema.index({ academicYear: 1 });

const FeeAssignment = mongoose.model('FeeAssignment', feeAssignmentSchema);

module.exports = FeeAssignment;
