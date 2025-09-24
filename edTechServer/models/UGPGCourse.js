const mongoose = require("mongoose");

const UGPGCourseSchema = new mongoose.Schema(
  {
    school: { type: mongoose.Schema.Types.ObjectId, ref: "UGPGSchool", required: true },
    session: { type: mongoose.Schema.Types.ObjectId, ref: "UGPGSession", required: true },
    // Allow dynamic course categories managed separately
    category: { type: String, required: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    courseType: { type: String, enum: ["Yearly", "Semester"], default: "Yearly" },
    durationYear: { type: Number, default: 1 },
    semester: { type: Number, default: 0 },
    totalCredit: { type: Number, default: 0 },
    totalPapers: { type: Number, default: 0 },
    seats: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

UGPGCourseSchema.index({ school: 1, courseName: 1 }, { unique: true });

module.exports = mongoose.model("UGPGCourse", UGPGCourseSchema);
