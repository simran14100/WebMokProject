const mongoose = require('mongoose')

const CourseworkResultSchema = new mongoose.Schema({
  studentId: { type: String, required: true, index: true },
  studentName: { type: String, required: true, index: true },
  paperCode: { type: String, required: true, index: true },
  paperName: { type: String, required: true, index: true },
  theoryObt: { type: Number, default: 0 },
  iaObt: { type: Number, default: 0 },
  passMarks: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  result: { type: String, enum: ['Pass', 'Fail', 'Pending'], default: 'Pending' },
  grade: { type: String, default: '' },
  remarks: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('CourseworkResult', CourseworkResultSchema)
