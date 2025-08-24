const mongoose = require("mongoose");

const EnquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    phone: { type: String, trim: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
    source: { type: String, trim: true },
    message: { type: String, trim: true },
    status: { type: String, enum: ["New", "Processed", "Converted"], default: "New" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Enquiry", EnquirySchema);
