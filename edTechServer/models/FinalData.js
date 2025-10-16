const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const finalDataSchema = new mongoose.Schema({
  // Basic Information
  panel: { type: String, required: true },
  awardYear: { type: String },
  status: { 
    type: String, 
    enum: ['Active', 'Completed', 'Discontinued', 'On Hold'],
    default: 'Active'
  },
  regDate: { type: Date },
  drcDate: { type: Date },
  proEnrollmentNo: { type: String },
  batch: { type: String },
  
  // Student Information
  studentName: { type: String, required: true },
  addressEmailContact: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  pgPercent: { type: Number },
  university: { type: String },
  entranceType: { type: String },
  mode: { 
    type: String, 
    enum: ['Full-time', 'Part-time', '']
  },
  enrollmentNo: { type: String, unique: true },
  allocationProcess: { type: String },
  
  // Supervisor Information
  supervisorName: { type: String },
  supervisorDesignation: { type: String },
  supervisorDepartment: { type: String },
  isRegularTeacher: { 
    type: String, 
    enum: ['Yes', 'No', '']
  },
  totalPhDNo: { type: Number },
  
  // Co-Supervisor Information
  coSupervisorName: { type: String },
  coSupervisorDesignation: { type: String },
  coSupervisorDepartment: { type: String },
  
  // Coursework Details
  courseworkDate: { type: Date },
  courseworkStartDate: { type: Date },
  courseworkEndDate: { type: Date },
  courseworkReport: { type: String },
  
  // RAC and Research Details
  rac: { 
    type: String, 
    enum: ['Yes', 'No', '']
  },
  researchProposalFinalizationReport: { type: String },
  periodicalReviewReport: { type: String },
  
  // Thesis and Viva Details
  presentationDate: { type: Date },
  papersPublished: { type: Number, default: 0 },
  thesisSubmissionDate: { type: Date },
  examinerName: { type: String },
  examinerState: { type: String },
  plagiarismReport: { type: String },
  thesisSendingDate: { type: Date },
  thesisReceivingDate: { type: Date },
  thesisSuggestion: { type: String },
  vivaDate: { type: Date },
  vivaReport: { type: String },
  awardDate: { type: Date },
  
  // Additional Information
  shodhgangaLink: { type: String },
  provisionalCertificateDate: { type: Date },
  otherInformation: { type: String },
  guideChange: { type: String },
  
  // Personal Information
  motherName: { type: String },
  fatherName: { type: String },
  aadharNo: { type: String },
  category: { type: String },
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other', '']
  },
  title: { type: String },
  
  // System Fields
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  updatedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
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

// Add pagination plugin
finalDataSchema.plugin(mongoosePaginate);

// Create text index for search
finalDataSchema.index({
  studentName: 'text',
  enrollmentNo: 'text',
  supervisorName: 'text',
  university: 'text'
}, {
  weights: {
    studentName: 5,
    enrollmentNo: 10,
    supervisorName: 3,
    university: 2
  }
});

// Virtual for student's full name with title
finalDataSchema.virtual('fullName').get(function() {
  return this.title ? `${this.title} ${this.studentName}` : this.studentName;
});

// Pre-save hook to handle any data transformation
finalDataSchema.pre('save', function(next) {
  // Convert empty strings to null for number fields
  if (this.pgPercent === '') this.pgPercent = null;
  if (this.totalPhDNo === '') this.totalPhDNo = null;
  if (this.papersPublished === '') this.papersPublished = null;
  
  next();
});

// Static method for search
finalDataSchema.statics.search = async function(query, options = {}) {
  const { page = 1, limit = 10, sort = { createdAt: -1 } } = options;
  
  return await this.paginate(
    { $text: { $search: query } },
    {
      page,
      limit,
      sort,
      select: 'studentName enrollmentNo panel status supervisorName university',
      collation: { locale: 'en', strength: 2 }
    }
  );
};

const FinalData = mongoose.model('FinalData', finalDataSchema);

module.exports = FinalData;
