const mongoose = require("mongoose");

const ExamSessionSchema = new mongoose.Schema(
  {
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "UGPGSession", required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "UGPGSchool", required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: "UGPGCourse", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "UGPGSubject", required: true },
    semester: { type: Number, required: true },
    examDate: { type: Date, required: true },
    examType: { 
      type: String, 
      enum: ["theory", "practical", "viva", "project", "assignment"], 
      default: "theory" 
    },
    status: { 
      type: String, 
      enum: ["Active", "Inactive", "Completed", "Upcoming"], 
      default: "Active" 
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ExamSession", ExamSessionSchema);
