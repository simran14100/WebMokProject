const mongoose = require('mongoose');

const registeredStudentSchema = new mongoose.Schema({
  // Personal Information
  firstName: { type: String, required: true, trim: true },
  middleName: { type: String, trim: true },
  lastName: { type: String, required: true, trim: true },
  dateOfBirth: { type: Date, required: true },
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  aadharNumber: { 
    type: String, 
    required: true, 
    unique: true,
    match: [/^[2-9]{1}[0-9]{11}$/, 'Please enter a valid 12-digit Aadhar number']
  },
  
  // Contact Information
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phone: { 
    type: String, 
    required: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  alternatePhone: { 
    type: String,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  
  // Address Information
  address: {
    line1: { type: String, required: true },
    line2: { type: String },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { 
      type: String, 
      required: true,
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit pincode']
    },
    country: { type: String, default: 'India' }
  },
  
  // Academic Information
  lastQualification: { type: String, required: true },
  boardUniversity: { type: String, required: true },
  yearOfPassing: { 
    type: Number, 
    required: true,
    min: 1950,
    max: new Date().getFullYear()
  },
  percentage: { 
    type: Number, 
    required: true,
    min: 0,
    max: 100
  },
  
   // In your model, change these fields:
course: { 
  type: String, // Changed from ObjectId to String
  required: true 
},

// Remove the nested parent requirement or make fields optional
parent: {
  fatherName: { type: String }, // removed required: true
  fatherOccupation: { type: String },
  motherName: { type: String }, // removed required: true
  motherOccupation: { type: String },
  // ... other parent fields
},
  specialization: { type: String },
  isScholarship: { 
    type: Boolean, 
    default: false 
  },
  
  // Reference Information
  source: { 
    type: String, 
    enum: ['newspaper', 'social_media', 'friend', 'hoarding', 'website', 'other'],
    required: true 
  },
  reference: {
    name: { type: String },
    contact: { 
      type: String,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
    },
    relation: { type: String }
  },
  
  // Additional Information
  photo: { type: String }, // URL to the uploaded photo
  signature: { type: String }, // URL to the uploaded signature
  notes: { type: String },
  
  // System Fields
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'enrolled'],
    default: 'pending'
  },
  registrationDate: { type: Date, default: Date.now },
  registrationNumber: { type: String, unique: true },
  
  // Audit Fields
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date }
}, { timestamps: true });

// Generate registration number before saving
registeredStudentSchema.pre('save', async function(next) {
  if (!this.registrationNumber) {
    const count = await this.constructor.countDocuments();
    this.registrationNumber = `REG${(count + 1).toString().padStart(5, '0')}${new Date().getFullYear().toString().slice(-2)}`;
  }
  next();
});

// Indexes for better query performance
registeredStudentSchema.index({ aadharNumber: 1 });
registeredStudentSchema.index({ email: 1 });
registeredStudentSchema.index({ 'phone': 1 });
registeredStudentSchema.index({ registrationNumber: 1 });

module.exports = mongoose.model('UniversityRegisteredStudent', registeredStudentSchema);
