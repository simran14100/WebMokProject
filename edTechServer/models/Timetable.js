const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  courseType: { 
    type: String, 
    enum: ["Certificate", "Diploma", "Bachelor Degree", "Master Degree"], 
    required: true 
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UGPGCourse',
    required: true
  },
  school: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "UGPGSchool", 
    required: true 
  },
  session: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "UGPGSession", 
    required: true 
  },
  subject: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "UGPGSubject", 
    required: true 
  },
  day: { 
    type: String, 
    enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], 
    required: true 
  },
  timeSlot: { 
    type: String, 
    required: true 
  },
  room: { 
    type: String, 
    required: true 
  },
  semester: {
    type: String,
    required: true
  },
  faculty: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Teacher", 
    required: true 
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Timetable', timetableSchema);
