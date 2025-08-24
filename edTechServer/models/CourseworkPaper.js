const mongoose = require('mongoose')

const CourseworkPaperSchema = new mongoose.Schema({
  code: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  theoryMax: { type: Number, required: true },
  theoryMinPass: { type: Number, required: true },
  iaMax: { type: Number, required: true },
  iaMinPass: { type: Number, required: true },
  credit: { type: Number, required: true },
  paperType: { type: String, enum: ['Elective', 'Core', 'Compulsory'], default: 'Elective' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('CourseworkPaper', CourseworkPaperSchema)
