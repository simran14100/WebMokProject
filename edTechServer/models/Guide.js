const mongoose = require("mongoose");

const GuideSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    contactNumber: { type: String, required: true, trim: true },
    institute: { type: String, required: true, trim: true },
    address: { type: String, required: false, trim: true, default: '' },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

GuideSchema.index({ name: 1, email: 1 }, { unique: true });

module.exports = mongoose.model("Guide", GuideSchema);
