const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    fatherName: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    qualification: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    course: {
      type: mongoose.Schema.ObjectId,
      ref: 'Course',
      required: [true, 'Course is required'],
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'follow up', 'converted', 'rejected'],
      default: 'new',
    },
    notes: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: ['website', 'phone', 'email', 'walkin', 'other'],
      default: 'website',
    },
    createdBy: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add pagination plugin
enquirySchema.plugin(require('mongoose-paginate-v2'));

module.exports = mongoose.model('Enquiry', enquirySchema);
