const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const enquiryReferenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  contact: {
    type: String,
    required: true,
    trim: true
  },
  reference: {
    type: String,
    required: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Contacted', 'Converted', 'Rejected'],
    default: 'Pending'
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Add text index for search functionality
enquiryReferenceSchema.index({
  name: 'text',
  email: 'text',
  contact: 'text',
  reference: 'text'
});

// Add pagination plugin
enquiryReferenceSchema.plugin(mongoosePaginate);

// Create and export the model
const EnquiryReference = mongoose.model('EnquiryReference', enquiryReferenceSchema);
module.exports = EnquiryReference;
