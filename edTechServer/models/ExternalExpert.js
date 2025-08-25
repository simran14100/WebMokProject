const mongoose = require("mongoose");

const ExternalExpertSchema = new mongoose.Schema(
  {
    subject: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: false, trim: true },
    designation: { type: String, required: false, trim: true },
    institute: { type: String, required: false, trim: true },
    address: { type: String, required: false, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExternalExpert", ExternalExpertSchema);
