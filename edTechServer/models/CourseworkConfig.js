const mongoose = require('mongoose')

const CourseworkConfigSchema = new mongoose.Schema({
  image1Url: { type: String, default: '' },
  image2Url: { type: String, default: '' },
  image3Url: { type: String, default: '' },
}, { timestamps: true })

module.exports = mongoose.model('CourseworkConfig', CourseworkConfigSchema)
