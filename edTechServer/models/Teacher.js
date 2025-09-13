const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'],
    trim: true
  },
  email: { 
    type: String, 
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phone: { 
    type: String,
    trim: true,
    match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit phone number']
  },
  school: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UGPGSchool', 
    required: [true, 'School is required'] 
  },
  designation: { 
    type: String, 
    enum: ["Assistant Professor", "Professor", "Lecturer"], 
    required: [true, 'Designation is required'] 
  },
  subjects: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'UGPGSubject' 
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Add text index for search
teacherSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.model('Teacher', teacherSchema);
