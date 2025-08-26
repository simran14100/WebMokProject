const mongoose = require("mongoose");

const UGPGPaperSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    theoryMax: { type: Number, default: 0 },
    theoryMinPass: { type: Number, default: 0 },
    iaMax: { type: Number, default: 0 },
    iaMinPass: { type: Number, default: 0 },
    credit: { type: Number, default: 0 },
    paperType: { type: String, enum: ["Elective", "Core", "Compulsory"], default: "Elective" },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

UGPGPaperSchema.index({ code: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("UGPGPaper", UGPGPaperSchema);
