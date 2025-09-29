const mongoose = require("mongoose");

const UGPGSubjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    school: { type: mongoose.Schema.Types.ObjectId, ref: "UGPGSchool", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "UGPGCourse", required: true },
    semester: { type: Number, required: true },
    
    // Theory marks configuration
    hasTheory: { type: Boolean, default: true },
    theoryMaxMarks: { 
      type: Number, 
      default: 100,
      min: 0,
      max: 100,
      validate: {
        validator: function(v) {
          // If hasTheory is true, theoryMaxMarks is required
          return !this.hasTheory || v !== undefined;
        },
        message: 'Theory max marks is required when hasTheory is true'
      }
    },
    
    // Practical marks configuration
    hasPractical: { type: Boolean, default: false },
    practicalMaxMarks: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 100,
      validate: {
        validator: function(v) {
          // If hasPractical is true, practicalMaxMarks is required and must be > 0
          if (this.hasPractical) {
            return v > 0 && v <= 100;
          }
          return true;
        },
        message: 'Practical max marks must be between 1-100 when hasPractical is true'
      }
    },
    
    // Total marks (virtual field)
    totalMaxMarks: {
      type: Number,
      default: function() {
        let total = 0;
        if (this.hasTheory) total += this.theoryMaxMarks || 0;
        if (this.hasPractical) total += this.practicalMaxMarks || 0;
        return total;
      }
    },
    
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add pre-save hook to validate marks
UGPGSubjectSchema.pre('save', function(next) {
  if (this.hasTheory && this.theoryMaxMarks <= 0) {
    throw new Error('Theory max marks must be greater than 0 when hasTheory is true');
  }
  
  if (this.hasPractical && (!this.practicalMaxMarks || this.practicalMaxMarks <= 0)) {
    throw new Error('Practical max marks is required and must be greater than 0 when hasPractical is true');
  }
  
  // Ensure total marks don't exceed 100
  const totalMarks = (this.hasTheory ? this.theoryMaxMarks : 0) + 
                    (this.hasPractical ? this.practicalMaxMarks : 0);
                    
  if (totalMarks > 100) {
    throw new Error('Total marks (theory + practical) cannot exceed 100');
  }
  
  next();
});

UGPGSubjectSchema.index({ name: 1, course: 1, semester: 1 }, { unique: true });

// Pre-remove hook to delete associated timetable entries
UGPGSubjectSchema.pre('remove', async function(next) {
  try {
    // Remove all timetable entries referencing this subject
    await mongoose.model('Timetable').deleteMany({ subject: this._id });
    next();
  } catch (error) {
    console.error('Error removing associated timetable entries:', error);
    next(error);
  }
});

module.exports = mongoose.model("UGPGSubject", UGPGSubjectSchema);
