const mongoose = require("mongoose");

const BatchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Students assigned to this batch (optional, can be empty)
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Temporary students (not persisted as Users). Used when admin chooses to add student only to batch.
    tempStudents: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
        name: { type: String, required: true, trim: true },
        email: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        enrollmentFeePaid: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    // Trainers (instructors) assigned to this batch
    trainers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Courses assigned to this batch (optional, can be empty)
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    // Live classes scheduled for this batch
    liveClasses: [
      {
        title: { type: String, required: true, trim: true },
        description: { type: String, default: "" },
        link: { type: String, default: "" },
        startTime: { type: Date, required: true },
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        attendees: [
          { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        ],
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Batch", BatchSchema);
