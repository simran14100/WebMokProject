const mongoose = require("mongoose");

const ExamSessionSchema = new mongoose.Schema(
  {
    batchName: { type: String, required: true, trim: true },
    month: { type: String, required: true, trim: true },
    year: { type: String, required: true, trim: true },
    lateFeeDate: { type: Date },
    lateFee: { type: Number, default: 0 },
    resultDate: { type: Date },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExamSession", ExamSessionSchema);
