const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Result = require('./resultModel');


// Add these schemas at the top of your file
const documentVerificationSchema = new mongoose.Schema({
  registrationFee: { type: Boolean, default: false },
  srSecondaryMarksheet: { type: Boolean, default: false },
  graduationMarksheet: { type: Boolean, default: false },
  matricMarksheet: { type: Boolean, default: false },
  pgMarksheet: { type: Boolean, default: false },
  idProof: { type: Boolean, default: false },
  isEligible: { type: Boolean, default: false }
});

const verificationDetailsSchema = new mongoose.Schema({
  photoVerified: { type: Boolean, default: false },
  signatureVerified: { type: Boolean, default: false },
  documents: documentVerificationSchema,
  verifiedBy: { type: String },
  verifiedById: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifiedAt: { type: Date },
  remarks: { type: String, default: '' }
});

const registeredStudentSchema = new mongoose.Schema({
  // Payments
  payments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentPayment'
  }],
  
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
    city: { 
      type: String, 
      required: true,
      enum: [
        'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad',
        'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
        'Lucknow', 'Kanpur', 'Nagpur', 'Visakhapatnam', 'Indore',
        'Thane', 'Bhopal', 'Patna', 'Vadodara', 'Ghaziabad'
      ],
      trim: true
    },
    state: { 
      type: String, 
      required: true,
      enum: [
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
        'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
      ],
      trim: true
    },
    pincode: { 
      type: String, 
      required: true,
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid 6-digit pincode']
    },
    country: { 
      type: String, 
      required: true,
      enum: [
        'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
        'Germany', 'France', 'Japan', 'China', 'Russia',
        'Brazil', 'Mexico', 'Italy', 'Spain', 'South Korea',
        'Singapore', 'Malaysia', 'Saudi Arabia', 'United Arab Emirates', 'South Africa'
      ],
      default: 'India'
    }
  },
  
  // Academic Information
  // lastQualification: { type: String, required: true },
  // boardUniversity: { type: String, required: true },
  // yearOfPassing: { 
  //   type: Number, 
  //   required: true,
  //   min: 1950,
  //   max: new Date().getFullYear()
  // },
  // percentage: { 
  //   type: Number,
  //   required: true,
  //   min: 0,
  //   max: 100
  // },

  // Program and Category
  programType: { type: String, enum: ['UG', 'PG', 'PhD'], default: 'UG' },
  category: { type: String, enum: ['General', 'SC', 'ST', 'OBC', 'EWS', 'Other'], default: 'General' },

  // Employment info
  employment: {
    isEmployed: { type: Boolean, default: false },
    designation: { type: String, default: '' }
  },

  // Detailed Academics Table
  academics: [
    new mongoose.Schema({
      level: { type: String, enum: ['Secondary', 'Sr Secondary', 'Graduation', 'Post Graduation'] },
      year: { type: Number, min: 1950, max: new Date().getFullYear() },
      boardUniversity: { type: String },
      percentage: { type: Number, min: 0, max: 100 }
    }, { _id: false })
  ],

  // Course reference
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UGPGCourse',
    required: true 
  },
  
  // Keep courseName as a string for easier access
  courseName: { type: String },

// Parent/Guardian Information
parent: {
  fatherName: { type: String, required: [true, 'Father\'s name is required'], trim: true },
  fatherOccupation: { type: String, trim: true },
  
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
  
  photo: { type: String }, // URL to the uploaded photo
  signature: { type: String }, // URL to the uploaded signature
  notes: { type: String },

  // Facilities
  hostelRequired: { type: Boolean, default: false },
  hostelType: {
    type: String,
    enum: ['ac', 'non_ac', 'deluxe', 'standard'],
    required: [
      function() { return this.hostelRequired === true; },
      'Hostel type is required when hostel is required'
    ]
  },
  transportFacility: { type: Boolean, default: false },

  // Undertaking acceptance
  undertakingAccepted: { type: Boolean, default: false, required: true },
  
  // Payment Information
  paymentMode: {
    type: String,
    enum: ['online', 'cash'],
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  paymentDetails: {
    orderId: String,
    paymentId: String,
    signature: String,
    amount: Number,
    currency: String,
    status: String,
    receipt: String
  },
  // System Fields
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected', 'enrolled'],
    default: 'pending'
  },
  registrationDate: { type: Date, default: Date.now },
  registrationNumber: { type: String, unique: true },

  // ADD VERIFICATION DETAILS FIELD HERE
  verificationDetails: verificationDetailsSchema,
  
  // Audit Fields
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  updatedAt: { type: Date }
}, { timestamps: true });

// Generate unique registration number before saving
registeredStudentSchema.pre('save', async function(next) {
  if (!this.registrationNumber) {
    let registrationNumber;
    let isUnique = false;
    let attempt = 1;
    
    // Try up to 5 times to generate a unique registration number
    while (!isUnique && attempt <= 5) {
      try {
        const count = await this.constructor.countDocuments();
        registrationNumber = `REG${(count + 1).toString().padStart(5, '0')}${new Date().getFullYear().toString().slice(-2)}`;
        
        // Check if this registration number already exists
        const exists = await this.constructor.findOne({ registrationNumber });
        if (!exists) {
          isUnique = true;
          this.registrationNumber = registrationNumber;
        } else {
          attempt++;
        }
      } catch (error) {
        console.error('Error generating registration number:', error);
        attempt++;
      }
    }
    
    // If we couldn't generate a unique number, use a timestamp-based one
    if (!isUnique) {
      this.registrationNumber = `TEMP-${Date.now()}`;
      console.warn('Using fallback registration number generation');
    }
  }
  next();
});

// Indexes for better query performance
registeredStudentSchema.index({ aadharNumber: 1 });
registeredStudentSchema.index({ email: 1 });
registeredStudentSchema.index({ 'phone': 1 });
registeredStudentSchema.index({ registrationNumber: 1 });

// Add the pagination plugin to the schema
registeredStudentSchema.plugin(mongoosePaginate);

// Pre-remove hook to delete associated results when a student is deleted
registeredStudentSchema.pre('findOneAndDelete', async function(next) {
  try {
    const studentId = this.getQuery()._id;
    console.log(`Deleting all results for student ${studentId}...`);
    
    // Delete all results associated with this student
    const result = await Result.deleteMany({ student: studentId });
    
    console.log(`Successfully deleted ${result.deletedCount} results for student ${studentId}`);
    next();
  } catch (error) {
    console.error('Error deleting student results:', error);
    next(error);
  }
});

const UniversityRegisteredStudent = mongoose.model('UniversityRegisteredStudent', registeredStudentSchema);

module.exports = UniversityRegisteredStudent;
