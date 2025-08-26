const mongoose = require("mongoose");

const UGPGSchoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    shortcode: { type: String, trim: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UGPGSchool", UGPGSchoolSchema);
