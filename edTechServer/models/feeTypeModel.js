const mongoose = require('mongoose');

const feeTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a fee type name'],
    trim: true,
    maxlength: [100, 'Fee type name cannot be more than 100 characters'],
    unique: true
  },
  category: {
    type: String,
    required: [true, 'Please provide a fee category'],
    enum: {
      values: ['Course', 'Registration', 'Miscellaneous', 'Other'],
      message: 'Please select a valid fee category'
    }
  },
  type: {
    type: String,
    required: [true, 'Please provide a fee type'],
    enum: {
      values: ['Semester Wise', 'Yearly', 'Before Course'],
      message: 'Please select a valid fee type (Semester Wise, Yearly, or Before Course)'
    }
  },
  refundable: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Prevent duplicate fee type names
feeTypeSchema.index({ name: 1 }, { unique: true });

const FeeType = mongoose.model('FeeType', feeTypeSchema);

module.exports = FeeType;
