const mongoose = require("mongoose");

const UGPGSessionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    // Legacy field for compatibility
    series: { type: String, trim: true },
    registrationSeries: { type: String, required: true, trim: true },
    enrollmentSeries: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UGPGSession", UGPGSessionSchema);
