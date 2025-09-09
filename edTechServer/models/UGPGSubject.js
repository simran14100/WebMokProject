const mongoose = require("mongoose");

const UGPGSubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "UGPGSchool", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "UGPGCourse", required: true },
    semester: { type: Number, required: true },
    department: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

UGPGSubjectSchema.index({ name: 1, department: 1, course: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model("UGPGSubject", UGPGSubjectSchema);
