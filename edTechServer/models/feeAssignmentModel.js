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

// Add a pre-find hook to always populate the course name
feeAssignmentSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'course',
    select: 'courseName courseCode courseType durationYear semester',
    model: 'UGPGCourse'
  });
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

// Add a separate index for non-semester based fees
feeAssignmentSchema.index(
  { 
    feeType: 1, 
    course: 1, 
    session: 1
  }, 
  { 
    unique: true,
    partialFilterExpression: { semester: { $exists: false } } // Only enforce when semester doesn't exist
  }
);

const FeeAssignment = mongoose.model('FeeAssignment', feeAssignmentSchema);

export default FeeAssignment;
