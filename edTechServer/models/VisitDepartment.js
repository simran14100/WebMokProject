const mongoose = require('mongoose');

const VisitDepartmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
  },
}, { timestamps: true });

VisitDepartmentSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.model('VisitDepartment', VisitDepartmentSchema);
