const mongoose = require("mongoose");

const CourseCategorySchema = new mongoose.Schema(
  {
    name: { 
      type: String, 
      required: true, 
      trim: true,
      unique: true 
    },
    description: { 
      type: String, 
      trim: true 
    },
    status: { 
      type: String, 
      enum: ["Active", "Inactive"], 
      default: "Active" 
    },
    createdBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    },
  },
  { timestamps: true }
);

// Index for faster queries
CourseCategorySchema.index({ name: 1 });
CourseCategorySchema.index({ status: 1 });

module.exports = mongoose.model("CourseCategory", CourseCategorySchema);
