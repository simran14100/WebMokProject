const mongoose = require('mongoose')

const CourseworkSlotSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  startDate: { type: Date, required: true },
  lateFeeDate: { type: Date, required: true },
  lateFee: { type: Number, default: 0 },
  marksheetSeries: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model('CourseworkSlot', CourseworkSlotSchema)
