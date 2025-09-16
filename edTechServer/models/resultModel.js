const mongoose = require('mongoose');
const { getExamTypeCodes } = require('../config/examTypes');

const subjectResultSchema = new mongoose.Schema({
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UGPGSubject',
    required: true
  },
  examType: {
    type: String,
    enum: getExamTypeCodes(),
    default: 'theory',
    required: true
  },
  marksObtained: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: async function(value) {
        if (this.examType === 'theory' || this.examType === 'practical') {
          const subject = await mongoose.model('UGPGSubject').findById(this.subject);
          if (!subject) return false;
          
          const maxMarks = this.examType === 'theory' ? 
            (subject.theoryMaxMarks || 0) : 
            (subject.practicalMaxMarks || 0);
            
          return value <= maxMarks;
        }
        return true;
      },
      message: 'Marks obtained cannot exceed maximum marks for this exam type'
    }
  },
  maxMarks: {
    type: Number,
    required: true,
    min: 1,
    validate: {
      validator: async function(value) {
        if (this.examType === 'theory' || this.examType === 'practical') {
          const subject = await mongoose.model('UGPGSubject').findById(this.subject);
          if (!subject) return false;
          
          const expectedMaxMarks = this.examType === 'theory' ? 
            (subject.theoryMaxMarks || 0) : 
            (subject.practicalMaxMarks || 0);
            
          return value === expectedMaxMarks;
        }
        return true;
      },
      message: 'Maximum marks do not match subject configuration for this exam type'
    }
  },
  passingMarks: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value) {
        return value <= this.maxMarks;
      },
      message: 'Passing marks cannot exceed maximum marks'
    }
  },
  grade: {
    type: String,
    required: true,
    enum: ['A+', 'A', 'B+', 'B', 'C', 'D', 'E', 'F', 'I']
  },
  percentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  isPassed: {
    type: Boolean,
    required: true,
    default: false
  },
  // Store subject configuration at the time of result creation
  subjectConfig: {
    hasTheory: Boolean,
    theoryMaxMarks: Number,
    hasPractical: Boolean,
    practicalMaxMarks: Number
  }
});

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UniversityRegisteredStudent',
      required: true,
      validate: {
        validator: async function(studentId) {
          try {
            // Convert both course IDs to strings for comparison
            const courseId = this.course?.toString();
            if (!courseId) return false;

            // Find the student with case-insensitive status check
            const student = await mongoose.model('UniversityRegisteredStudent').findOne({
              _id: studentId,
              $expr: {
                $and: [
                  { $eq: [{ $toString: '$course' }, courseId] },
                  { $regexMatch: { input: '$status', regex: '^approved$', options: 'i' } }
                ]
              }
            });
            
            return !!student;
          } catch (error) {
            console.error('Error in student validation:', error);
            return false;
          }
        },
        message: 'Student not found or not approved for this course. Please ensure the student is enrolled and approved for this course.'
      }
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UGPGCourse',
      required: true
    },
    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 10
    },
    examSession: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExamSession',
      required: true
    },
    subjectResults: [subjectResultSchema],
    totalMarksObtained: {
      type: Number,
      required: true,
      min: 0
    },
    totalMaxMarks: {
      type: Number,
      required: true,
      min: 1
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    status: {
      type: String,
      required: true,
      enum: ['PASS', 'FAIL', 'APPEARED', 'ABSENT']
    },
    marksheetPath: {
      type: String,
      required: false
    },
    remarks: {
      type: String,
      maxlength: 500
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    publishedAt: {
      type: Date
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to ensure one result per student per exam session
resultSchema.index(
  { student: 1, examSession: 1 },
  { unique: true, name: 'student_exam_session_unique' }
);

// Index for better query performance
resultSchema.index({ student: 1, course: 1, semester: 1 });
resultSchema.index({ course: 1, semester: 1, status: 1 });

// Add text index for search
resultSchema.index(
  {
    'subjects.subject': 'text',
    'subjects.grade': 'text',
    status: 'text'
  },
  {
    weights: {
      'subjects.subject': 5,
      'subjects.grade': 3,
      status: 1
    }
  }
);

// Static method to get results by student
resultSchema.statics.findByStudent = function (studentId) {
  return this.find({ student: studentId })
    .populate('student', 'name enrollmentNo')
    .populate('course', 'name code');
};

// Static method to get results by course and semester
resultSchema.statics.findByCourseAndSemester = function (courseId, semester) {
  return this.find({ course: courseId, semester })
    .populate('student', 'name enrollmentNo')
    .populate('course', 'name code');
};

// Pre-save hook to validate and calculate results
resultSchema.pre('save', async function (next) {
  try {
    const result = this;
    
    // Populate subject configuration for each subject result
    if (result.isModified('subjectResults')) {
      for (const subResult of result.subjectResults) {
        if (subResult.isModified() || !subResult.subjectConfig) {
          const subject = await mongoose.model('UGPGSubject').findById(subResult.subject);
          if (subject) {
            subResult.subjectConfig = {
              hasTheory: subject.hasTheory,
              theoryMaxMarks: subject.theoryMaxMarks,
              hasPractical: subject.hasPractical,
              practicalMaxMarks: subject.practicalMaxMarks
            };
          }
        }
      }
    }
    
    // Calculate total marks, max marks, and check passing status
    const calculated = result.subjectResults.reduce(
      (acc, subject) => {
        acc.totalMarksObtained += subject.marksObtained;
        acc.totalMaxMarks += subject.maxMarks;
        
        // Check if subject is passed
        const isPassed = subject.marksObtained >= subject.passingMarks;
        subject.isPassed = isPassed;
        
        // If any subject is failed, overall result is failed
        if (!isPassed) {
          acc.allPassed = false;
        }
        
        return acc;
      },
      { 
        totalMarksObtained: 0, 
        totalMaxMarks: 0,
        allPassed: true
      }
    );
    
    // Calculate percentage
    const percentage = (calculated.totalMarksObtained / calculated.totalMaxMarks) * 100;
    
    // Update result fields
    result.totalMarksObtained = calculated.totalMarksObtained;
    result.totalMaxMarks = calculated.totalMaxMarks;
    result.percentage = parseFloat(percentage.toFixed(2));
    result.status = calculated.allPassed ? 'PASS' : 'FAIL';
    
    // If result is being published, set publishedAt
    if (result.isPublished && !result.publishedAt) {
      result.publishedAt = new Date();
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

// Add instance method to get grade points
resultSchema.methods.calculateGradePoints = function() {
  const gradePoints = {
    'A+': 10,
    'A': 9,
    'B': 8,
    'C': 7,
    'D': 6,
    'E': 5,
    'F': 0,
    'I': 0 // Incomplete
  };
  
  let totalCredits = 0;
  let totalGradePoints = 0;
  
  this.subjectResults.forEach(subject => {
    // Assuming each subject has a credits field, you might need to populate it
    const credits = subject.credits || 4; // Default to 4 credits if not specified
    totalCredits += credits;
    totalGradePoints += gradePoints[subject.grade] * credits;
  });
  
  return totalCredits > 0 ? (totalGradePoints / totalCredits).toFixed(2) : 0;
};

const Result = mongoose.model('Result', resultSchema);

module.exports = Result;
