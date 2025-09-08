const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true }, // e.g., 2025–2026
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    series: { type: String, required: true, trim: true }, // e.g., 20250801
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Session", SessionSchema);