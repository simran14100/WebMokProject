const asyncHandler = require('express-async-handler');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const PDFDocument = require('pdfkit');
const UniversityRegisteredStudent = require('../models/UniversityRegisteredStudent');
const Result = require('../models/resultModel');
const UGPGSubject = require('../models/UGPGSubject');
const ExamSession = require('../models/ExamSession');
const { getExamTypeByCode } = require('../config/examTypes');
const mongoose = require('mongoose');

// @desc    Create a new result
// @route   POST /api/v1/results
// @access  Private/Admin
const createResult = asyncHandler(async (req, res) => {
  const {
    studentId,
    studentName,
    courseId,
    semester,
    examSessionId,
    subjectResults,
    remarks = ''
  } = req.body;

  // Validate required fields
  if (!studentId || !studentName || !courseId || !semester || !examSessionId || !subjectResults || !Array.isArray(subjectResults)) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Get subject details for all subjects
  const subjectIds = subjectResults.map(s => s.subject).filter(Boolean);
  console.log('Subject IDs from request:', subjectIds);
  const subjectDetails = await UGPGSubject.find({
    _id: { $in: subjectIds },
    course: courseId,
    semester: semester,
    status: 'Active'
  });

  // Create a map of subject IDs to their details for quick lookup
  const subjectMap = new Map(subjectDetails.map(sub => [sub._id.toString(), sub]));

  // Validate subject results
  const validatedSubjects = [];
  for (const subject of subjectResults) {
    const subjectId = subject.subject;
    if (!subjectId || typeof subject.marksObtained !== 'number') {
      res.status(400);
      throw new Error('Each subject must have a valid subject and marksObtained');
    }
    
    // Get subject details
    const subjectDetail = subjectMap.get(subjectId.toString());
    if (!subjectDetail) {
      console.error(`Subject not found with ID: ${subjectId} in subjectMap. Available subjects:`, [...subjectMap.keys()]);
      res.status(400);
      throw new Error(`Subject not found with ID: ${subjectId} for the selected course and semester`);
    }
    
    const examType = subject.examType || 'theory';
    const maxMarks = subject.maxMarks || 
      (examType === 'theory' ? subjectDetail.theoryMaxMarks : 
       examType === 'practical' ? subjectDetail.practicalMaxMarks : 100);
    
    const passingMarks = subject.passingMarks || Math.ceil(maxMarks * 0.4);
    const marksObtained = subject.marksObtained;
    const percentage = (marksObtained / maxMarks) * 100;
    const isPassed = marksObtained >= passingMarks;
    
    validatedSubjects.push({
      subject: subjectId,
      examType,
      marksObtained,
      maxMarks,
      passingMarks,
      percentage,
      isPassed,
      grade: calculateGrade(percentage),
      attendance: subject.attendance || 'present',
      subjectConfig: {
        hasTheory: subjectDetail.hasTheory,
        theoryMaxMarks: subjectDetail.theoryMaxMarks,
        hasPractical: subjectDetail.hasPractical,
        practicalMaxMarks: subjectDetail.practicalMaxMarks
      }
    });
  }

  // Calculate overall result
  const totalMarksObtained = validatedSubjects.reduce((sum, sub) => sum + sub.marksObtained, 0);
  const totalMaxMarks = validatedSubjects.reduce((sum, sub) => sum + (sub.maxMarks || 100), 0);
  const overallPercentage = totalMaxMarks > 0 ? parseFloat(((totalMarksObtained / totalMaxMarks) * 100).toFixed(2)) : 0;
  const isOverallPassed = validatedSubjects.every(sub => sub.isPassed);
  const overallGrade = calculateGrade(overallPercentage);

  try {
    // Verify student is approved for the course (case-insensitive check)
    const student = await mongoose.model('UniversityRegisteredStudent').aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(studentId),
          $expr: {
            $and: [
              { $eq: [{ $toString: '$course' }, courseId.toString()] },
              { $regexMatch: { input: '$status', regex: '^approved$', options: 'i' } }
            ]
          }
        }
      }
    ]).then(results => results[0] || null);

    console.log('Student verification query:', {
      studentId,
      courseId,
      studentFound: !!student,
      studentStatus: student?.status,
      studentCourse: student?.course?.toString()
    });

    if (!student) {
      // Try to find why the student wasn't found
      const studentWithoutStatusCheck = await mongoose.model('UniversityRegisteredStudent').findOne({
        _id: mongoose.Types.ObjectId(studentId)
      });

      console.log('Student record details:', {
        exists: !!studentWithoutStatusCheck,
        status: studentWithoutStatusCheck?.status,
        course: studentWithoutStatusCheck?.course?.toString(),
        courseType: typeof studentWithoutStatusCheck?.course,
        expectedCourse: courseId.toString(),
        expectedCourseType: typeof courseId,
        coursesMatch: studentWithoutStatusCheck?.course?.toString() === courseId.toString()
      });

      res.status(400);
      throw new Error('Student not found or not approved for this course');
    }

    // Check if result already exists for this student and exam session
    let result = await Result.findOne({
      student: studentId,
      examSession: examSessionId
    });

    if (result) {
      // Update existing result
      result.studentName = studentName;
      result.course = courseId;
      result.semester = semester;
      result.subjects = validatedSubjects;
      result.totalMarksObtained = totalMarksObtained;
      result.totalMaxMarks = totalMaxMarks;
      result.percentage = overallPercentage;
      result.grade = overallGrade;
      result.isPassed = isOverallPassed;
      result.status = isOverallPassed ? 'PASS' : 'FAIL';
      result.remarks = remarks;
      result.updatedAt = new Date();
      await result.save();
    } else {
      // Create new result
      result = await Result.create({
        student: studentId,
        studentName,
        course: courseId,
        semester,
        examSession: examSessionId,
        subjectResults: validatedSubjects,
        totalMarksObtained,
        totalMaxMarks,
        percentage: overallPercentage,
        grade: overallGrade,
        isPassed: isOverallPassed,
        status: isOverallPassed ? 'PASS' : 'FAIL',
        remarks,
        createdBy: req.user._id,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Populate the created result with related data
    const populatedResult = await Result.findById(result._id)
      .populate('student', 'enrollmentNumber')
      .populate('course', 'name code')
      .populate('examSession', 'name sessionYear')
      .populate('subjectResults.subject', 'name code credits');

    res.status(201).json({
      success: true,
      message: 'Result created successfully',
      data: populatedResult
    });
  } catch (error) {
    console.error('Error creating result:', error);
    res.status(500);
    throw new Error('Failed to create result. Please try again.');
  }
});

// @desc    Update a result
// @route   PUT /api/v1/results/:id
// @access  Private/Admin
const updateResult = asyncHandler(async (req, res) => {
  console.log('=== Update Result Request ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  const result = await Result.findById(req.params.id);

  if (!result) {
    res.status(404);
    throw new Error('Result not found');
  }

  // Check if the user has permission to update this result
  if (result.createdBy.toString() !== req.user._id && req.user.role !== 'SuperAdmin') {
    res.status(403);
    throw new Error('Not authorized to update this result');
  }

  // Update fields
  const {
    studentId,
    studentName,
    courseId,
    semester,
    examSessionId,
    subjectResults,
    remarks,
    totalMarksObtained,
    totalMaxMarks,
    percentage,
    status
  } = req.body;

  console.log('Updating result with:', {
    studentId,
    courseId,
    semester,
    subjectResultsLength: subjectResults?.length,
    totalMarksObtained,
    totalMaxMarks,
    percentage,
    status
  });

  // Update fields if provided
  if (studentId) result.student = studentId;
  if (studentName) result.studentName = studentName;
  if (courseId) result.course = courseId;
  if (semester) result.semester = semester;
  if (examSessionId) result.examSession = examSessionId;
  if (remarks) result.remarks = remarks;

  // Update subjectResults if provided
  if (subjectResults && Array.isArray(subjectResults)) {
    console.log('Processing subject results update');
    console.log('Received subjectResults:', JSON.stringify(subjectResults, null, 2));
    
    // Clear existing subjects if this is a full update
    if (!req.body.partialUpdate) {
      result.subjectResults = [];
    }
    try {
      console.log('=== Processing subject results ===');
      
      // Process each subject result
      for (const [index, subject] of subjectResults.entries()) {
        try {
          console.log(`\n=== Processing subject ${index + 1}/${subjectResults.length} ===`);
          console.log('Subject data:', JSON.stringify(subject, null, 2));
          
          const subjectId = subject.subject?._id || subject.subject;
          console.log(`Extracted subject ID: ${subjectId}`);
          
          if (!subjectId) {
            console.error('❌ Missing subject ID, skipping...');
            continue;
          }
          
          // Get subject details
          const subjectDetail = await mongoose.model('UGPGSubject').findById(subjectId).lean();
          
          if (!subjectDetail) {
            console.warn(`⚠️ Subject not found with ID: ${subjectId}, skipping...`);
            continue;
          }
          
          // Verify subject belongs to the correct course and semester
          if (subjectDetail.course.toString() !== result.course.toString()) {
            console.warn(`⚠️ Subject ${subjectId} (${subjectDetail.name}) does not belong to course ${result.course}, skipping...`);
            continue;
          }
          
          if (subjectDetail.semester !== result.semester) {
            console.warn(`⚠️ Subject ${subjectId} (${subjectDetail.name}) is for semester ${subjectDetail.semester} but result is for semester ${result.semester}, skipping...`);
            continue;
          }
          
          console.log(`✅ Found subject: ${subjectDetail.name} (${subjectDetail._id})`);
          
          // Add the subject result
          result.subjectResults.push({
            subject: subjectId,
            subjectName: subjectDetail.name,
            examType: subject.examType || 'theory',
            marksObtained: subject.marksObtained,
            maxMarks: subject.maxMarks,
            passingMarks: subject.passingMarks,
            percentage: subject.percentage,
            isPassed: subject.isPassed,
            grade: subject.grade,
            attendance: subject.attendance || 'present',
            subjectConfig: {
              hasTheory: subjectDetail.hasTheory,
              theoryMaxMarks: subjectDetail.theoryMaxMarks,
              hasPractical: subjectDetail.hasPractical,
              practicalMaxMarks: subjectDetail.practicalMaxMarks
            }
          });
          
          console.log(`Added subject result: ${subjectDetail.name} (${subject.examType || 'theory'})`, {
            marksObtained: subject.marksObtained,
            maxMarks: subject.maxMarks,
            percentage: subject.percentage,
            grade: subject.grade,
            isPassed: subject.isPassed
          });
          
        } catch (error) {
          console.error(`❌ Error processing subject ${index + 1}:`, error);
          // Continue with next subject
        }
      }
      
      // Update the result with the calculated values if provided
      if (totalMarksObtained !== undefined) result.totalMarksObtained = totalMarksObtained;
      if (totalMaxMarks !== undefined) result.totalMaxMarks = totalMaxMarks;
      if (percentage !== undefined) result.percentage = percentage;
      if (status) result.status = status;
      
      // Log processing summary
      console.log('\n=== Subject Processing Summary ===');
      console.log(`✅ Successfully processed: ${result.subjectResults?.length || 0}/${subjectResults.length} subjects`);
      
      if (result.subjectResults.length === 0) {
        console.warn('⚠️ No valid subjects were processed');
      } else {
        console.log('Final subject results to be saved:', JSON.stringify(result.subjectResults, null, 2));
      }
      
      // Update the result with calculated values if not provided
      if (totalMarksObtained === undefined) {
        result.totalMarksObtained = result.subjectResults.reduce((sum, sub) => sum + (sub.marksObtained || 0), 0);
      }
      
      if (totalMaxMarks === undefined) {
        result.totalMaxMarks = result.subjectResults.reduce((sum, sub) => sum + (sub.maxMarks || 0), 0);
      }
      
      if (percentage === undefined && result.totalMaxMarks > 0) {
        result.percentage = parseFloat(((result.totalMarksObtained / result.totalMaxMarks) * 100).toFixed(2));
      }
      
      if (!status) {
        result.status = result.subjectResults.every(sub => sub.isPassed) ? 'PASS' : 'FAIL';
      }
      
      // Calculate overall result if not provided
      if (!result.isPassed) {
        result.isPassed = result.subjectResults.every(sub => sub.isPassed);
      }
      
      // Calculate grade if not provided
      if (!result.grade && result.percentage !== undefined) {
        result.grade = calculateGrade(result.percentage);
      }
      
      // Set updated timestamp
      result.updatedAt = new Date();
      result.updatedBy = req.user._id;
      
      console.log('Final result object to save:', {
        subjectResultsCount: result.subjectResults?.length || 0,
        totalMarksObtained: result.totalMarksObtained,
        totalMaxMarks: result.totalMaxMarks,
        percentage: result.percentage,
        isPassed: result.isPassed,
        grade: result.grade,
        status: result.status
      });
      
      try {
        // Save the updated result
        const updatedResult = await result.save();
        console.log('Result updated successfully:', updatedResult);
        
        if (!updatedResult) {
          throw new Error('Failed to update result: document not found after update');
        }
        
        console.log('Successfully updated result with', result.subjectResults?.length || 0, 'subjects');
        
        return res.status(200).json({
          success: true,
          data: updatedResult
        });
      } catch (saveError) {
        console.error('Error saving result:', saveError);
        if (saveError.name === 'ValidationError') {
          return res.status(400).json({
            success: false,
            message: 'Validation Error',
            error: saveError.message
          });
        }
        throw saveError; // Let the outer catch handle it
      }
      
    } catch (error) {
      console.error('Error updating subject results:', error);
      throw error; // Let the outer catch handle it
    }
  }

  try {
    // If we reach here, it means we're doing a non-subject update
    result.updatedAt = new Date();
    result.updatedBy = req.user._id;
    
    console.log('Saving non-subject updates to result:', result);
    const updatedResult = await result.save();
    console.log('Result saved successfully:', updatedResult);
    
    res.status(200).json({
      success: true,
      data: updatedResult
    });
  } catch (error) {
    console.error('Error saving result:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern || {})[0] || 'field';
      const value = error.keyValue ? error.keyValue[field] : 'unknown';
      return res.status(400).json({
        success: false,
        message: `Duplicate key error: A result with ${field} '${value}' already exists`,
        field,
        value
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: messages
      });
    }
    
    // Handle other errors
    res.status(500).json({
      success: false,
      message: 'Failed to save result',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// @desc    Get a single result by ID
// @route   GET /api/v1/results/:id
// @access  Private/Admin
const getResultById = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id)
    .populate('student', 'name enrollmentNo email')
    .populate('course', 'name code')
    .populate('examSession', 'name session');

  if (!result) {
    res.status(404);
    throw new Error('Result not found');
  }

  res.json({
    success: true,
    data: result
  });
});

// @desc    Get results for a specific student
// @route   GET /api/v1/results/student/:studentId
// @access  Private/Admin
const getResultsByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  
  const results = await Result.find({ student: studentId })
    .populate('course', 'name code')
    .populate('examSession', 'name session')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: results.length,
    data: results
  });
});

// @desc    Delete a result
// @route   DELETE /api/v1/results/:id
// @access  Private/Admin
const deleteResult = asyncHandler(async (req, res) => {
  const result = await Result.findById(req.params.id);

  if (!result) {
    res.status(404);
    throw new Error('Result not found');
  }

  // Check if the user has permission to delete this result
  if (result.createdBy.toString() !== req.user.id && req.user.role !== 'super_admin') {
    res.status(403);
    throw new Error('Not authorized to delete this result');
  }
  
  await result.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// Define grade order for comparison
const GRADE_ORDER = ['F', 'D', 'C', 'B', 'B+', 'A', 'A+'];

// Helper function to get the higher of two grades
const getHigherGrade = (grade1, grade2) => {
  if (!grade1 && !grade2) return '';
  if (!grade1) return grade2;
  if (!grade2) return grade1;
  
  const index1 = GRADE_ORDER.indexOf(grade1.toUpperCase());
  const index2 = GRADE_ORDER.indexOf(grade2.toUpperCase());
  
  if (index1 === -1 && index2 === -1) return '';
  if (index1 === -1) return grade2;
  if (index2 === -1) return grade1;
  
  return index1 > index2 ? grade1 : grade2;
};

// Helper function to calculate grade based on percentage
const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B+';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  if (percentage >= 40) return 'D';
  return 'F';
};


// @route   POST /api/results
// @access  Private/Admin
const createOrUpdateResult = asyncHandler(async (req, res) => {
  const { studentId, courseId, semester, examSessionId, subjects, remarks } = req.body;

  // Validate input
  if (!studentId || !courseId || !semester || !examSessionId || !subjects || !Array.isArray(subjects) || subjects.length === 0) {
    res.status(400);
    throw new Error('Please provide all required fields');
  }

  // Check if student exists and is approved
  const student = await UniversityRegisteredStudent.findOne({
    _id: studentId,
    status: 'approved'
  }).populate({
    path: 'user',
    select: 'name email'
  }).populate({
    path: 'course',
    select: 'name code'
  });

  if (!student) {
    res.status(404);
    throw new Error('Student not found or not approved');
  }

  // Check if exam session exists
  const examSession = await ExamSession.findById(examSessionId)
    .populate('school', 'name')
    .populate('course', 'name code')
    .populate('subject', 'name code');

  if (!examSession) {
    res.status(404);
    throw new Error('Exam session not found');
  }

  // Get subject details for all subjects
  const subjectIds = subjects.map(s => s.subjectId || s.subject?._id).filter(Boolean);
  const subjectDetails = await UGPGSubject.find({
    _id: { $in: subjectIds }
  });

  // Create a map of subject IDs to their details for quick lookup
  const subjectMap = new Map(subjectDetails.map(sub => [sub._id.toString(), sub]));

  // Process subjects and calculate totals
  let totalMarks = 0;
  let maxMarks = 0;
  let isPassed = true;
  
  const processedSubjects = [];
  
  for (const subject of subjects) {
    const subjectId = subject.subjectId || subject.subject?._id;
    // Validate subject data
    if (!subjectId || typeof subject.marksObtained !== 'number') {
      throw new Error('Each subject must have a valid subjectId and marksObtained');
    }
    
    // Get subject details
    const subjectDetail = subjectMap.get(subjectId.toString());
    if (!subjectDetail) {
      throw new Error(`Subject not found with ID: ${subjectId}`);
    }
    
    const examType = subject.examType || 'theory';
    const subjectMaxMarks = subject.maxMarks || 
      (examType === 'theory' ? subjectDetail.theoryMaxMarks : 
       examType === 'practical' ? subjectDetail.practicalMaxMarks : 100);
    
    const passingMarks = subject.passingMarks || Math.ceil(subjectMaxMarks * 0.4);
    
    // Validate exam type
    const examTypeConfig = getExamTypeByCode(examType);
    if (!examTypeConfig) {
      throw new Error(`Invalid exam type: ${examType}`);
    }

    // Calculate percentage and passing status
    const marksObtained = subject.marksObtained;
    const percentage = (marksObtained / subjectMaxMarks) * 100;
    const isSubjectPassed = marksObtained >= passingMarks;
    
    // Update overall pass/fail status
    if (!isSubjectPassed) {
      isPassed = false;
    }
    
    // Update totals
    totalMarks += marksObtained;
    maxMarks += subjectMaxMarks;
    
    // Add to processed subjects
    const processedSubject = {
      subject: subjectId,
      examType,
      marksObtained,
      maxMarks: subjectMaxMarks,
      passingMarks,
      percentage,
      isPassed: isSubjectPassed,
      grade: calculateGrade(percentage),
      attendance: subject.attendance || 'present',
      subjectConfig: {
        hasTheory: subjectDetail.hasTheory,
        theoryMaxMarks: subjectDetail.theoryMaxMarks,
        hasPractical: subjectDetail.hasPractical,
        practicalMaxMarks: subjectDetail.practicalMaxMarks
      }
    };
    
    processedSubjects.push(processedSubject);
    
    // Validate marks based on exam type
    if (examType === 'theory' || examType === 'practical') {
      const maxAllowedMarks = examType === 'theory' 
        ? (subjectDetail.theoryMaxMarks || 0) 
        : (subjectDetail.practicalMaxMarks || 0);
      
      if (subjectMaxMarks > maxAllowedMarks) {
        throw new Error(`Maximum marks (${subjectMaxMarks}) exceed the allowed limit (${maxAllowedMarks}) for ${examType} in ${subjectDetail.name}`);
      }
      
      if (marksObtained < 0 || marksObtained > maxAllowedMarks) {
        throw new Error(`Marks obtained must be between 0 and ${maxAllowedMarks} for ${examType} in ${subjectDetail.name}`);
      }
    } else {
      // For other exam types (viva, project, assignment)
      if (marksObtained < 0 || marksObtained > subjectMaxMarks) {
        throw new Error(`Marks obtained must be between 0 and ${subjectMaxMarks} for ${examType} in ${subjectDetail.name}`);
      }
    }
  }

  // Calculate percentage
  const percentage = maxMarks > 0 ? parseFloat(((totalMarks / maxMarks) * 100).toFixed(2)) : 0;

  // Create result data
  const resultData = {
    student: studentId,
    course: courseId,
    semester,
    examSession: examSessionId,
    subjectResults: processedSubjects,
    totalMarks,
    maxMarks,
    percentage,
    isPassed,
    status: isPassed ? 'Pass' : 'Fail',
    remarks: remarks || '',
    publishedBy: req.user._id,
    publishedAt: new Date(),
    isPublished: true
  };

  // Find and update or create result
  const options = {
    new: true,
    upsert: true,
    runValidators: true,
    setDefaultsOnInsert: true
  };

  let result = await Result.findOneAndUpdate(
    {
      student: studentId,
      course: courseId,
      semester,
      examSession: examSessionId
    },
    resultData,
    options
  )
  .populate({
    path: 'student',
    select: 'enrollmentNumber',
    populate: {
      path: 'user',
      select: 'name email'
    }
  })
  .populate('course', 'name code')
  .populate('examSession', 'name examType examDate')
  .populate('subjectResults.subject', 'name code credits');

  // Generate PDF marksheet
  try {
    const marksheetData = {
      student: {
        name: result.student.user?.name || 'N/A',
        enrollmentNo: result.student.enrollmentNumber || 'N/A',
        course: result.course?.name || 'N/A'
      },
      semester: result.semester,
      examSession: result.examSession?.name || 'N/A',
      subjects: result.subjectResults.map(sub => ({
        subjectCode: sub.subject?.code || 'N/A',
        subjectName: sub.subject?.name || 'Unknown Subject',
        marksObtained: sub.marksObtained,
        maxMarks: sub.maxMarks,
        grade: sub.grade
      })),
      totalMarks: result.totalMarks,
      maxMarks: result.maxMarks,
      percentage: result.percentage,
      status: result.status
    };

    const marksheetPath = await generateMarksheet(marksheetData);
    
    // Update result with marksheet path
    result.marksheetPath = marksheetPath;
    await result.save();
  } catch (error) {
    console.error('Error generating marksheet:', error);
    // Don't fail the request if marksheet generation fails
  }

  res.status(201).json({
    success: true,
    data: result,
    message: 'Result saved successfully',
    marksheetGenerated: !!result.marksheetPath
  });
});

// @desc    Upload results via Excel/CSV
// @route   POST /api/results/upload
// @access  Private/Admin
const uploadResults = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload a file');
  }

  let data;
  try {
    const workbook = xlsx.readFile(req.file.path);
    if (!workbook || !workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('No sheets found in the uploaded file');
    }
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error('Could not read the first sheet from the file');
    }
    data = xlsx.utils.sheet_to_json(worksheet);
    if (!data || data.length === 0) {
      throw new Error('No data found in the sheet');
    }
  } catch (error) {
    res.status(400);
    throw new Error(`Error processing file: ${error.message}`);
  }

  const results = [];
  const errors = [];
  const userId = req.user._id;

  // Process each row in the uploaded file
  for (const [index, row] of data.entries()) {
    try {
      // Validate required fields
      if (!row.studentId || !row.examSessionId || !row.subjectId) {
        throw new Error('Missing required fields: studentId, examSessionId, or subjectId');
      }

      // Get exam session
      const examSession = await ExamSession.findById(row.examSessionId)
        .populate('courseId', 'name code')
        .populate('subjectId', 'name code credits');

      if (!examSession) {
        throw new Error(`Exam session not found: ${row.examSessionId}`);
      }

      // Get student
      const student = await UniversityRegisteredStudent.findOne({
        _id: row.studentId,
        course: examSession.courseId,
        status: 'approved'
      }).populate('user', 'name email');

      if (!student) {
        throw new Error('Student not found or not approved for this course');
      }

      // Prepare subject result
      const marksObtained = parseFloat(row.marksObtained) || 0;
      const maxMarks = parseFloat(row.maxMarks) || 100;
      const passingMarks = parseFloat(row.passingMarks) || (maxMarks * 0.4); // Default 40% passing
      const percentage = (marksObtained / maxMarks) * 100;
      const isPassed = marksObtained >= passingMarks;

      const subjectResult = {
        subject: row.subjectId,
        subjectCode: examSession.subjectId?.code || 'N/A',
        examType: row.examType || 'theory',
        marksObtained,
        maxMarks,
        passingMarks,
        percentage: parseFloat(percentage.toFixed(2)),
        grade: calculateGrade(percentage),
        isPassed,
        credits: examSession.subjectId?.credits || 4
      };

      // Check if result already exists for this student and exam session
      let result = await Result.findOne({
        student: student._id,
        examSession: examSession._id
      });

      if (result) {
        // Update existing result
        const subjectIndex = result.subjectResults.findIndex(
          sr => sr.subject.toString() === row.subjectId && sr.examType === (row.examType || 'theory')
        );

        if (subjectIndex >= 0) {
          // Update existing subject result
          result.subjectResults[subjectIndex] = subjectResult;
        } else {
          // Add new subject result
          result.subjectResults.push(subjectResult);
        }
      } else {
        // Create new result
        result = new Result({
          student: student._id,
          course: examSession.courseId._id,
          semester: examSession.semester,
          examSession: examSession._id,
          subjectResults: [subjectResult],
          totalMarksObtained: marksObtained,
          totalMaxMarks: maxMarks,
          percentage: parseFloat(percentage.toFixed(2)),
          status: isPassed ? 'PASS' : 'FAIL',
          createdBy: userId,
          updatedBy: userId,
          isPublished: false
        });
      }

      // Recalculate totals and status
      const calculated = result.subjectResults.reduce(
        (acc, sr) => {
          acc.totalMarksObtained += sr.marksObtained;
          acc.totalMaxMarks += sr.maxMarks;
          if (!sr.isPassed) acc.allPassed = false;
          return acc;
        },
        { totalMarksObtained: 0, totalMaxMarks: 0, allPassed: true }
      );

      result.totalMarksObtained = calculated.totalMarksObtained;
      result.totalMaxMarks = calculated.totalMaxMarks;
      result.percentage = parseFloat((calculated.totalMarksObtained / calculated.totalMaxMarks * 100).toFixed(2));
      result.status = calculated.allPassed ? 'PASS' : 'FAIL';
      result.updatedBy = userId;

      // Generate marksheet if not exists
      if (!result.marksheetPath) {
        result.marksheetPath = await generateMarksheet({
          student: {
            name: student.user.name,
            enrollmentNo: student.enrollmentNumber,
            course: examSession.courseId.name
          },
          semester: examSession.semester,
          examSession: examSession.name || `Semester ${examSession.semester} - ${examSession.examType}`,
          subjects: result.subjectResults,
          totalMarks: result.totalMarksObtained,
          maxMarks: result.totalMaxMarks,
          percentage: result.percentage,
          status: result.status
        });
      }

      // Save the result
      const savedResult = await result.save();
      
      // Populate the result for the response
      const populatedResult = await Result.findById(savedResult._id)
        .populate({
          path: 'student',
          select: 'enrollmentNumber',
          populate: { path: 'user', select: 'name email' }
        })
        .populate('course', 'name code')
        .populate('examSession', 'name examType examDate')
        .populate('subjectResults.subject', 'name code');

      results.push(populatedResult);
    } catch (error) {
      errors.push({
        row: index + 2, // +2 because of 0-based index and header row
        error: error.message,
        data: row
      });
    }
  }

  // Delete the uploaded file
  fs.unlinkSync(req.file.path);

  res.status(200).json({
    success: results.length > 0,
    processed: results.length,
    failed: errors.length,
    results,
    errors,
    message: `Processed ${results.length} results with ${errors.length} errors`
  });
});

// @desc    Get results for a student
// @route   GET /api/results/student/:studentId
// @access  Private/Admin
const getStudentResults = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { courseId, semester, examType, isPublished } = req.query;
  
  // Build query
  const query = { student: studentId };
  
  // Apply filters
  if (courseId) query.course = courseId;
  if (semester) query.semester = semester;
  if (examType) query['subjectResults.examType'] = examType;
  if (isPublished) query.isPublished = isPublished === 'true';

  // Execute query with population
  const results = await Result.find(query)
    .populate({
      path: 'student',
      select: 'enrollmentNumber',
      populate: {
        path: 'user',
        select: 'name email'
      }
    })
    .populate('course', 'name code')
    .populate('examSession', 'name examType examDate')
    .populate('subjectResults.subject', 'name code credits')
    .sort({ 'examSession.examDate': -1 });
  
  res.json(results);
});

// @desc    Get all results with filters
// @route   GET /api/results
// @access  Private/Admin
const getResults = asyncHandler(async (req, res) => {
  const { 
    course, 
    semester, 
    status, 
    examType, 
    isPublished,
    studentName,
    enrollmentNumber,
    page = 1,
    limit = 10
  } = req.query;
  
  // Build query
  const query = {};
  
  // Apply filters
  if (course) query.course = course;
  if (semester) query.semester = semester;
  if (status) query.status = status;
  if (examType) query['subjectResults.examType'] = examType;
  if (isPublished) query.isPublished = isPublished === 'true';
  
  // Handle student name search
  if (studentName || enrollmentNumber) {
    const studentQuery = {};
    if (enrollmentNumber) {
      studentQuery.enrollmentNumber = { $regex: enrollmentNumber, $options: 'i' };
    }
    if (studentName) {
      studentQuery.$or = [
        { firstName: { $regex: studentName, $options: 'i' } },
        { lastName: { $regex: studentName, $options: 'i' } },
        { $expr: { $regexMatch: { 
          input: { $concat: ['$firstName', ' ', '$lastName'] }, 
          regex: studentName, 
          options: 'i' 
        }}}
      ];
    }
    
    // Find students matching the search criteria
    const students = await mongoose.model('UniversityRegisteredStudent').find(studentQuery)
      .select('_id')
      .lean();
    
    const studentIds = students.map(s => s._id);
    
    // If no students found, return empty result
    query.student = studentIds.length > 0 
      ? { $in: studentIds }
      : { $in: [] }; // Empty array will return no results
  }
  
  // Calculate pagination
  const pageNumber = parseInt(page, 10);
  const pageSize = parseInt(limit, 10);
  const skip = (pageNumber - 1) * pageSize;
  
  // Get total count for pagination
  const total = await Result.countDocuments(query);
  
  // Execute query with population and pagination
  const results = await Result.find(query)
    .populate({
      path: 'student',
      select: 'enrollmentNumber firstName lastName',
      model: 'UniversityRegisteredStudent'
    })
    .populate('course', 'name code')
    .populate('examSession', 'name examType examDate')
    .populate('subjectResults.subject', 'name code')
    .sort({ 'examSession.examDate': -1 })
    .skip(skip)
    .limit(pageSize);
  
  res.json({
    success: true,
    count: results.length,
    total,
    page: pageNumber,
    pages: Math.ceil(total / pageSize),
    data: results
  });
});

// Helper function to generate PDF marksheet
const generateMarksheet = async (data) => {
  const doc = new PDFDocument({ margin: 50 });
  const uploadsDir = path.join(__dirname, '../uploads/marksheets');
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
  
  const filename = `marksheet_${data.student.enrollmentNo}_${Date.now()}.pdf`;
  const filePath = path.join(uploadsDir, filename);
  const writeStream = fs.createWriteStream(filePath);
  doc.pipe(writeStream);

  // Set response headers
  doc.setHeader('Content-Type', 'application/pdf');
  doc.setHeader('Content-Disposition', `attachment; filename=Result_${data.student.enrollmentNo}.pdf`);
  
  // Pipe PDF to response
  doc.pipe(res);
  
  // Add WEBMOK University header
  doc
    .fontSize(16)
    .font('Helvetica-Bold')
    .fillColor('#1a365d') // Dark blue color
    .text('WEBMOK UNIVERSITY', { align: 'center' })
    .moveDown(0.3);
      
  doc
    .fontSize(12)
    .fillColor('#2d3748') // Dark gray color
    .text('Statement of Marks', { align: 'center' })
    .moveDown(0.5);
      
  // Add student details in a box
  const studentStartY = doc.y;
  doc
    .rect(50, studentStartY, 500, 100) // Reduced height since we removed course and duration
    .stroke('#e2e8f0') // Light gray border
    .fill('#f8fafc'); // Light blue background
      
  // Student details
  doc
    .fontSize(10)
    .fillColor('#1a202c') // Dark text
    .text('Name of Student:', 60, studentStartY + 15, { width: 120, align: 'left' })
    .text(data.student.name, 190, studentStartY + 15, { width: 350, align: 'left' })
      
    .text('Enrollment No.:', 60, studentStartY + 35, { width: 120, align: 'left' })
    .text(data.student.enrollmentNo, 190, studentStartY + 35, { width: 350, align: 'left' });
      
  doc.y = studentStartY + 80; // Move cursor below student details
    
  // Add semester only (removed session)
  doc
    .fontSize(10)
    .text(`Semester: ${data.semester}`, 60, doc.y, { width: 200, align: 'left' })
    .moveDown(1);
      
  // Add table header with background
  const headerY = doc.y;
  doc
    .fill('#1e40af') // Blue header background
    .rect(50, headerY, 500, 25)
    .fill();
      
  doc
    .fillColor('#ffffff') // White text
    .font('Helvetica-Bold')
    .fontSize(10)
    .text('SUBJECT', 55, headerY + 8, { width: 200, align: 'left' })
    .text('THEORY', 255, headerY + 8, { width: 60, align: 'center' })
    .text('PRACTICAL', 315, headerY + 8, { width: 80, align: 'center' })
    .text('TOTAL', 405, headerY + 8, { width: 60, align: 'center' })
    .text('GRADE', 475, headerY + 8, { width: 60, align: 'center' });
      
  doc.y = headerY + 30; // Move cursor below header
      
  // Add subject results
  doc.font('Helvetica').fontSize(10).fillColor('#1a202c');
    
  // Group subject results by subject ID
  const subjects = {};
  data.subjects.forEach(item => {
    if (!subjects[item.subject._id]) {
      subjects[item.subject._id] = {
        name: item.subject.name,
        theory: '-',
        practical: '-',
        total: 0,
        grade: '-'
      };
    }
      
    if (item.examType === 'theory') {
      subjects[item.subject._id].theory = item.marksObtained;
      subjects[item.subject._id].total += item.marksObtained;
    } else if (item.examType === 'practical') {
      subjects[item.subject._id].practical = item.marksObtained;
      subjects[item.subject._id].total += item.marksObtained;
    }
      
    if (item.grade) {
      subjects[item.subject._id].grade = item.grade;
    }
  });
    
  // Add rows for each subject
  Object.values(subjects).forEach((subject, index) => {
    const rowY = doc.y;
      
    // Alternate row background
    if (index % 2 === 0) {
      doc
        .fill('#f8fafc')
        .rect(50, rowY, 500, 20)
        .fill();
    }
      
    doc
      .fillColor('#1a202c')
      .text(subject.name, 55, rowY + 5, { width: 190, align: 'left' })
      .text(subject.theory.toString(), 255, rowY + 5, { width: 60, align: 'center' })
      .text(subject.practical.toString(), 315, rowY + 5, { width: 80, align: 'center' })
      .text(subject.total.toString(), 405, rowY + 5, { width: 60, align: 'center' })
      .text(subject.grade, 475, rowY + 5, { width: 60, align: 'center' });
        
    doc.y = rowY + 20;
  });
    
  // Add total marks and percentage
  const totalY = doc.y + 10;
  doc
    .font('Helvetica-Bold')
    .text('TOTAL', 405, totalY, { width: 60, align: 'center' })
    .text(data.totalMarks.toString(), 475, totalY, { width: 60, align: 'center' });
      
  doc
    .font('Helvetica')
    .text(`Percentage: ${data.percentage}%`, 350, totalY + 30, { align: 'right' })
    .text(`Result: ${data.status}`, 350, totalY + 50, { align: 'right' });
      
  // Add signature line
  const signY = totalY + 80;
  doc
    .moveTo(50, signY + 20)
    .lineTo(200, signY + 20)
    .stroke();
      
  doc
    .fontSize(10)
    .text('Controller of Examinations', 50, signY + 25);
      
  // Add date
  doc
    .text(`Date: ${new Date().toLocaleDateString()}`, 350, signY + 25, { align: 'right' });
      
  // Finalize PDF
  doc.end();
  
  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => resolve(`/uploads/marksheets/${filename}`));
    writeStream.on('error', reject);
  });
};

// @desc    Get results for the currently authenticated student
// @route   GET /api/v1/results/my-results
// @access  Private/Student
// @desc    Download result as PDF
// @route   GET /api/v1/results/:id/download
// @access  Private (Student who owns the result or Admin)
const getResultPdf = asyncHandler(async (req, res) => {
  try {
    console.log('=== PDF Download Request ===');
    console.log('Request params:', req.params);
    console.log('Authenticated user:', {
      id: req.user?._id || req.user?.id,
      email: req.user?.email,
      accountType: req.user?.accountType
    });
    
    // Get the raw result first to check the data
    const rawResult = await Result.findById(req.params.id).lean();
    console.log('Raw result data:', {
      _id: rawResult?._id,
      student: rawResult?.student,
      course: rawResult?.course,
      examSession: rawResult?.examSession,
      semester: rawResult?.semester,
      subjectResults: rawResult?.subjectResults?.map(sr => ({
        subject: sr.subject,
        examType: sr.examType,
        marksObtained: sr.marksObtained,
        maxMarks: sr.maxMarks,
        grade: sr.grade
      }))
    });

    // Verify student data exists in the database
    if (rawResult?.student) {
      const studentData = await mongoose.model('UniversityRegisteredStudent')
        .findById(rawResult.student)
        .select('firstName middleName lastName email enrollmentNumber')
        .lean();
      
      console.log('Student data from database:', studentData);
      
      if (!studentData) {
        console.error('Student not found in database for ID:', rawResult.student);
      } else {
        // Combine name fields
        const fullName = [studentData.firstName, studentData.middleName, studentData.lastName]
          .filter(Boolean)
          .join(' ');
          
        if (!fullName || !studentData.enrollmentNumber) {
          console.error('Student data is incomplete:', {
            hasName: !!fullName,
            hasEnrollment: !!studentData.enrollmentNumber,
            hasEmail: !!studentData.email,
            nameFields: {
              firstName: studentData.firstName,
              middleName: studentData.middleName,
              lastName: studentData.lastName
            }
          });
        }
      }
    }
    
    // Verify course data exists in the database
    if (rawResult?.course) {
      const courseData = await mongoose.model('UGPGCourse')
        .findById(rawResult.course)
        .select('name code')
        .lean();
      
      console.log('Course data from database:', courseData);
      
      if (!courseData) {
        console.error('Course not found in database for ID:', rawResult.course);
      } else if (!courseData.name || !courseData.code) {
        console.error('Course data is incomplete:', {
          hasName: !!courseData.name,
          hasCode: !!courseData.code
        });
      }
    }
    
    if (!rawResult) {
      console.error('Result not found for ID:', req.params.id);
      res.status(404);
      throw new Error('Result not found');
    }
    
    // First, get the result with basic population
    let result = await Result.findById(req.params.id)
      .populate({
        path: 'student',
        model: 'UniversityRegisteredStudent',
        select: 'firstName middleName lastName email enrollmentNumber',
        options: { lean: true }
      })
      .populate({
        path: 'course',
        model: 'UGPGCourse',
        select: 'name code fullName session courseName',
        populate: {
          path: 'session',
          model: 'UGPGSession',
          select: 'name startDate endDate enrollmentSeries',
          options: { lean: true }
        },
        options: { lean: true }
      })
      .populate({
        path: 'subjectResults.subject',
        model: 'UGPGSubject',
        select: 'name code',
        options: { lean: true }
      })
      .populate({
        path: 'examSession',
        model: 'ExamSession',
        select: 'name startDate endDate academicYear',
        options: { lean: true }
      })
      .lean();
      
    console.log('Course after initial population:', result?.course); // Debug log

    // If course has a session reference, populate it
    if (result?.course?.session) {
      try {
        // Check if session is already populated or just an ID
        if (typeof result.course.session === 'string' || result.course.session instanceof mongoose.Types.ObjectId) {
          const session = await mongoose.model('UGPGSession')
            .findById(result.course.session)
            .select('name startDate endDate enrollmentSeries')
            .lean();
          
          if (session) {
            result.course.session = session;
          }
        }
        
        // Also fetch course details if not already populated
        if (typeof result.course === 'string' || result.course instanceof mongoose.Types.ObjectId) {
          const course = await mongoose.model('UGPGCourse')
            .findById(result.course)
            .populate('session', 'name startDate endDate enrollmentSeries')
            .select('name fullName code session')
            .lean();
          
          if (course) {
            result.course = course;
          }
        }
      } catch (error) {
        console.error('Error populating course/session:', error);
      }
    }
    
    // Ensure we have the student's full name
    if (result.student) {
      result.student.fullName = [
        result.student.firstName,
        result.student.middleName,
        result.student.lastName
      ].filter(Boolean).join(' ');
    }

    if (!result) {
      console.error('Result not found for ID:', req.params.id);
      res.status(404);
      throw new Error('Result not found');
    }

    // Log the populated data for debugging
    const logData = {
      student: result.student ? {
        id: result.student._id,
        name: result.student.name,
        email: result.student.email,
        enrollmentNumber: result.student.enrollmentNumber
      } : 'No student data',
      course: result.course ? {
        id: result.course._id,
        name: result.course.name,
        code: result.course.code
      } : 'No course data',
      examSession: result.examSession ? {
        id: result.examSession._id,
        name: result.examSession.name,
        startDate: result.examSession.startDate,
        endDate: result.examSession.endDate
      } : 'No exam session data',
      subjectResults: result.subjectResults.map(sr => ({
        subject: sr.subject ? {
          id: sr.subject._id,
          name: sr.subject.name,
          code: sr.subject.code
        } : 'No subject data',
        examType: sr.examType,
        marksObtained: sr.marksObtained,
        maxMarks: sr.maxMarks,
        grade: sr.grade
      })),
      semester: result.semester,
      totalMarksObtained: result.totalMarksObtained,
      totalMaxMarks: result.totalMaxMarks,
      percentage: result.percentage,
      status: result.status
    };

    console.log('Populated result data:', JSON.stringify(logData, null, 2));

    // Get user ID and email from JWT payload
    const userId = req.user._id || req.user.id;
    const userEmail = req.user.email?.toLowerCase();
    
    if (!userId) {
      res.status(401);
      throw new Error('User ID not found in request');
    }

    // Get student ID and email from result
    const studentId = result.student?._id?.toString() || result.student?.toString();
    const studentEmail = result.student?.email?.toLowerCase();
    
    if (!studentId) {
      res.status(400);
      throw new Error('Invalid result: Missing student information');
    }
    
    // Check if user is admin
    const isAdmin = ['Admin', 'SuperAdmin'].includes(req.user.accountType);
    
    // Check ownership by ID or email
    const isOwnerById = studentId === userId.toString();
    const isOwnerByEmail = userEmail && studentEmail && userEmail === studentEmail;
    const isOwner = isOwnerById || isOwnerByEmail;
    
    console.log('Authorization check:', {
      studentId,
      studentEmail,
      userId: userId.toString(),
      userEmail,
      isOwner,
      isOwnerById,
      isOwnerByEmail,
      isAdmin,
      accountType: req.user.accountType
    });
    
    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to access this result');
    }

    // Generate PDF with proper margins
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Result_${result._id}.pdf`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Add WEBMOK University header
    doc
      .fontSize(18)
      .font('Helvetica-Bold')
      .fillColor('#1a365d')
      .text('WEBMOK UNIVERSITY', { align: 'center' })
      .moveDown(0.3);
      
    doc
      .fontSize(14)
      .fillColor('#2d3748')
      .text('Statement of Marks', { align: 'center' })
      .moveDown(0.5);
    
    // Student details box with fixed height
    const studentBoxHeight = 80; // Increased height to include course
    
    const studentStartY = doc.y;
    doc
      .rect(50, studentStartY, 500, studentBoxHeight)
      .stroke('#e2e8f0')
      .fill('#f8fafc');
    
    // Student details section - simplified
    doc
      .fontSize(10)
      .fillColor('#1a202c');
    
    // Student Name
    doc
      .font('Helvetica-Bold')
      .text('Name of Student:', 60, studentStartY + 10, { width: 120 })
      .font('Helvetica')
      .text(result.student?.fullName || 'Not Available', 190, studentStartY + 10, { width: 350 });
    
    // Enrollment
    doc
      .font('Helvetica-Bold')
      .text('Enrollment No:', 60, studentStartY + 30, { width: 120 })
      .font('Helvetica')
      .text(result.student?.enrollmentNumber || 'Not Available', 190, studentStartY + 30, { width: 350 });
    
    // Course
    const courseName = result.course?.courseName || result.course?.name || 'Not Available';
    doc
      .font('Helvetica-Bold')
      .text('Course:', 60, studentStartY + 50, { width: 120 })
      .font('Helvetica')
      .text(courseName, 190, studentStartY + 50, { width: 350 });
    
    // Semester information below the box
    const semesterStartY = studentStartY + studentBoxHeight + 10;
    doc
      .font('Helvetica-Bold')
      .text('Semester:', 60, semesterStartY, { width: 120 })
      .font('Helvetica')
      .text(`Semester ${result.semester || 'N/A'}`, 190, semesterStartY, { width: 350 });
    
    // Set the Y position for the next element
    doc.y = semesterStartY + 20;
    
    // Session details with better formatting and fallbacks
    const sessionY = doc.y;
    
    // Get session name from either examSession or course.session
    let sessionName = 'Not Available';
    let sessionDates = '';
    
    if (result.course?.session) {
      const session = result.course.session;
      if (typeof session === 'object') {
        sessionName = session.name || 'Not Available';
        if (session.startDate || session.endDate) {
          const start = session.startDate ? new Date(session.startDate).toLocaleDateString() : 'N/A';
          const end = session.endDate ? new Date(session.endDate).toLocaleDateString() : 'N/A';
          sessionDates = `${start} - ${end}`;
        }
      }
    } else if (result.examSession) {
      sessionName = result.examSession.name || 
                   (result.examSession.academicYear ? 
                    `Academic Year ${result.examSession.academicYear}` : 
                    'Not Available');
    }
    
    // Semester and Session info
    doc
      .fontSize(10)
      .fillColor('#1a202c')
      .font('Helvetica-Bold')
      .text('Semester:', 60, sessionY, { width: 80 })
      .font('Helvetica')
      .text(`Semester ${result.semester || 'N/A'}`, 140, sessionY, { width: 120 })
      
      .font('Helvetica-Bold')
      .text('Session:', 350, sessionY, { width: 80 })
      .font('Helvetica')
      .text(sessionName, 430, sessionY, { width: 120 });
    
    // Add session dates if available
    if (sessionDates) {
      doc
        .font('Helvetica-Bold')
        .text('Duration:', 60, sessionY + 20, { width: 80 })
        .font('Helvetica')
        .text(sessionDates, 140, sessionY + 20, { width: 300 });
    }
    
    // Add exam session date range if available
    if (result.examSession?.startDate || result.examSession?.endDate) {
      const startDate = result.examSession.startDate ? 
                       new Date(result.examSession.startDate).toLocaleDateString() : 'N/A';
      const endDate = result.examSession.endDate ? 
                     new Date(result.examSession.endDate).toLocaleDateString() : 'N/A';
      
      doc
        .font('Helvetica-Bold')
        .text('Period:', 60, sessionY + 15, { width: 80 })
        .font('Helvetica')
        .text(`${startDate} - ${endDate}`, 140, sessionY + 15, { width: 200 });
    }
    
    doc.moveDown(1);
    
    // Add a divider line
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .lineWidth(1)
      .stroke('#e2e8f0')
      .moveDown(0.5);
    
    // Table header with better styling
    const headerY = doc.y;
    doc
      .fill('#1e40af')
      .rect(50, headerY, 500, 25, { radius: 2 })
      .fill();
    
    doc
      .fillColor('#ffffff')
      .font('Helvetica-Bold')
      .fontSize(10)
      .text('SUBJECT', 55, headerY + 8, { width: 200 })
      .text('THEORY', 255, headerY + 8, { width: 60, align: 'center' })
      .text('PRACTICAL', 315, headerY + 8, { width: 80, align: 'center' })
      .text('TOTAL', 405, headerY + 8, { width: 60, align: 'center' })
      .text('GRADE', 475, headerY + 8, { width: 60, align: 'center' });
    
    doc.y = headerY + 30;
    
    // Group subject results by subject with better data handling
    const subjects = {};
    
    // First pass: Organize data by subject
    result.subjectResults.forEach(item => {
      const subjectId = item.subject?._id?.toString() || 'unknown';
      const subjectName = item.subject?.name || 'Unknown Subject';
      const subjectCode = item.subject?.code || '';
      const examType = String(item.examType || 'theory').toLowerCase();
      
      if (!subjects[subjectId]) {
        subjects[subjectId] = {
          name: subjectName,
          code: subjectCode,
          theory: { marks: null, max: null, grade: null },
          practical: { marks: null, max: null, grade: null },
          total: { marks: 0, max: 0, grade: null },
          isPassed: true
        };
      }
      
      // Handle both theory and practical marks
      if (['theory', 'practical'].includes(examType)) {
        const marks = parseFloat(item.marksObtained) || 0;
        const maxMarks = parseFloat(item.maxMarks) || 0;
        
        subjects[subjectId][examType] = {
          marks: marks,
          max: maxMarks,
          grade: item.grade || ''
        };
        
        // Update totals if we have valid numbers
        if (!isNaN(marks) && !isNaN(maxMarks)) {
          subjects[subjectId].total.marks += marks;
          subjects[subjectId].total.max += maxMarks;
        }
      }
      
      // Update pass/fail status
      if (item.isPassed === false) {
        subjects[subjectId].isPassed = false;
      }
    });
    
    // Second pass: Calculate grades if not provided
    Object.values(subjects).forEach(subject => {
      if (!subject.theory.grade && !subject.practical.grade && subject.total.max > 0) {
        const percentage = (subject.total.marks / subject.total.max) * 100;
        subject.total.grade = calculateGrade(percentage);
      } else {
        // Use the higher grade between theory and practical
        subject.total.grade = getHigherGrade(subject.theory.grade, subject.practical.grade);
      }
    });
    
    // Add subject rows with better formatting
    Object.values(subjects).forEach((subject, index) => {
      const rowY = doc.y;
      const rowHeight = 24; // Slightly taller rows for better readability
      
      // Alternate row background
      doc
        .fill(index % 2 === 0 ? '#ffffff' : '#f8fafc')
        .rect(50, rowY, 500, rowHeight)
        .fill();
      
      // Subject name and code
      doc
        .fillColor('#1a202c')
        .font('Helvetica')
        .fontSize(9)
        .text(subject.name, 55, rowY + 5, { width: 180 })
        .fontSize(8)
        .fillColor('#4a5568')
        .text(subject.code, 55, rowY + 15, { width: 180 });
      
      // Theory marks (if exists)
      if (subject.theory.marks !== null) {
        doc
          .fillColor('#1a202c')
          .fontSize(9)
          .text(
            `${subject.theory.marks}/${subject.theory.max}`, 
            255, 
            rowY + 10, 
            { width: 60, align: 'center' }
          );
      }
      
      // Practical marks (if exists)
      if (subject.practical.marks !== null) {
        doc
          .fillColor('#1a202c')
          .fontSize(9)
          .text(
            `${subject.practical.marks}/${subject.practical.max}`, 
            315, 
            rowY + 10, 
            { width: 80, align: 'center' }
          );
      }
      
      // Total marks for the subject
      doc
        .fillColor('#1a202c')
        .fontSize(9)
        .font('Helvetica-Bold')
        .text(
          `${subject.total.marks}/${subject.total.max}`, 
          405, 
          rowY + 10, 
          { width: 60, align: 'center' }
        );
      
      // Grade
      if (subject.total.grade) {
        doc
          .fillColor(subject.isPassed === false ? '#e53e3e' : '#1a202c')
          .fontSize(10)
          .font('Helvetica-Bold')
          .text(
            subject.total.grade, 
            475, 
            rowY + 10, 
            { width: 60, align: 'center' }
          );
      }
      
      // Add border
      doc
        .rect(50, rowY, 500, rowHeight)
        .stroke('#e2e8f0');
      
      doc.y = rowY + rowHeight;
    });
    
    // Add total marks with better formatting
    const totalY = doc.y + 15;
    
    // Add a horizontal line above total
    doc
      .moveTo(400, totalY - 5)
      .lineTo(540, totalY - 5)
      .lineWidth(0.5)
      .stroke('#4a5568');
    
    // Total marks obtained and max marks
    doc
      .font('Helvetica-Bold')
      .text('TOTAL', 405, totalY, { width: 60, align: 'center' })
      .text(`${result.totalMarksObtained} / ${result.totalMaxMarks}`, 475, totalY, { 
        width: 60, 
        align: 'center' 
      });
    
    // Add percentage and status with better formatting
    const resultBoxY = totalY + 25;
    
    // Result box
    doc
      .rect(350, resultBoxY, 200, 60)
      .fill('#f8fafc')
      .stroke('#e2e8f0');
    
    // Percentage
    doc
      .font('Helvetica-Bold')
      .fillColor('#2d3748')
      .text('Percentage:', 360, resultBoxY + 10, { width: 90 })
      .font('Helvetica')
      .text(`${result.percentage || '0.00'}%`, 460, resultBoxY + 10, { width: 80, align: 'right' });
    
    // Status with color coding
    const statusColor = result.status === 'PASS' ? '#38a169' : '#e53e3e';
    doc
      .font('Helvetica-Bold')
      .fillColor('#2d3748')
      .text('Result Status:', 360, resultBoxY + 35, { width: 90 })
      .fillColor(statusColor)
      .text(result.status || 'N/A', 460, resultBoxY + 35, { width: 80, align: 'right' });
    
    // Add signature line with better positioning
    const signY = resultBoxY + 70;
    doc
      .moveTo(50, signY + 20)
      .lineTo(200, signY + 20)
      .stroke();
    
    doc
      .fontSize(10)
      .text('Controller of Examinations', 50, signY + 25);
    
    // Add date
    doc
      .text(`Date: ${new Date().toLocaleDateString()}`, 350, signY + 25, { align: 'right' });
    
    // Add result summary
    const summaryY = doc.y + 20;
    doc
      .font('Helvetica-Bold')
      .fontSize(11)
      .fillColor('#1a365d')
      .text('RESULT SUMMARY', 50, summaryY, { width: 500, align: 'center' });
      
    // Summary box
    const boxY = summaryY + 15;
    doc
      .rect(50, boxY, 500, 80)
      .stroke('#e2e8f0')
      .fill('#f8fafc');
      
    // Summary content
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor('#1a202c')
      .text('Total Marks Obtained:', 60, boxY + 15, { width: 200 })
      .text(result.totalMarksObtained?.toString() || '0', 260, boxY + 15, { width: 100 })
      
      .text('Maximum Marks:', 60, boxY + 35, { width: 200 })
      .text(result.totalMaxMarks?.toString() || '0', 260, boxY + 35, { width: 100 })
      
      .text('Percentage:', 60, boxY + 55, { width: 200 })
      .text(`${result.percentage?.toFixed(2) || '0.00'}%`, 260, boxY + 55, { width: 100 })
      
      .text('Grade:', 350, boxY + 35, { width: 100 })
      .text(result.overallGrade || '', 400, boxY + 35, { width: 140 })
      
      .text('Status:', 350, boxY + 55, { width: 100 })
      .text(result.status || 'N/A', 400, boxY + 55, { width: 140 });
    
    // Finalize the PDF and end the stream
    doc.end();
    
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating PDF',
      error: process.env.NODE_ENV === 'development' ? error : {}
    });
  }
});

// @desc    Get results for the currently authenticated student
// @route   GET /api/v1/results/my-results
// @access  Private/Student
const getMyResults = asyncHandler(async (req, res) => {
  console.log('getMyResults controller called');
  console.log('Request user:', req.user);
  
  try {
    // Check if user is a student
    if (req.user.role !== 'Student') {
      console.log('Access denied - user is not a student');
      return res.status(403).json({
        success: false,
        message: 'Only students can access their results through this endpoint'
      });
    }

    // Get student record using email from authenticated user
    const student = await UniversityRegisteredStudent.findOne({
      email: req.user.email.toLowerCase()
    }).select('_id course');

    if (!student) {
      console.log('Student not found with email:', req.user.email);
      return res.status(404).json({
        success: false,
        message: 'Student record not found. Please complete your student registration.'
      });
    }

    console.log('Found student with ID:', student._id, 'and course:', student.course);
    
    // Build query to find results for this student
    const query = { 
      student: student._id,
      status: { $ne: 'draft' } // Only fetch published results
    };

    // First get the results with proper population
    let results = await Result.find(query)
      .populate({
        path: 'course',
        model: 'UGPGCourse',
        select: 'courseName code',
        // Force population even if the field is empty
        options: { allowEmptyArray: true }
      })
      .populate({
        path: 'examSession',
        model: 'ExamSession',
        select: 'name session',
        options: { allowEmptyArray: true }
      })
      .populate({
        path: 'subjectResults.subject',
        model: 'UGPGSubject',
        select: 'name code',
        options: { allowEmptyArray: true }
      })
      .sort({ examSession: -1, semester: 1 })
      .lean();

    // Process the results to ensure we have proper course data
    results = results.map(result => {
      // If course is an empty object but we have course ID in the raw data
      if (result.course && Object.keys(result.course).length === 0 && result.course.constructor === Object) {
        // Try to find the course ID in the raw data
        const courseId = result._doc?.course?.toString();
        if (courseId) {
          // Fetch the course directly with the correct field name
          return mongoose.model('UGPGCourse').findById(courseId)
            .select('courseName code')
            .lean()
            .then(course => ({
              ...result,
              course: course ? { 
                _id: courseId, 
                name: course.courseName, // Map courseName to name for frontend
                code: course.code 
              } : { _id: courseId, name: `Course ${courseId}` },
              examSession: result.examSession || { name: 'N/A' }
            }));
        }
      }
      // If course exists but has courseName instead of name, normalize it
      if (result.course && result.course.courseName) {
        result.course = {
          ...result.course,
          name: result.course.courseName
        };
      }
      return Promise.resolve({
        ...result,
        examSession: result.examSession || { name: 'N/A' }
      });
    });

    // Wait for all async operations to complete
    results = await Promise.all(results);
      
    console.log('Found', results.length, 'results for student');

    if (results.length === 0) {
      console.log('No results found for student');
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
        message: 'No results found for your account. Please check back later.'
      });
    }

    // Format the response
    const formattedResults = results.map(result => ({
      _id: result._id,
      semester: result.semester,
      course: result.course,
      examSession: result.examSession,
      subjectResults: result.subjectResults,
      totalMarks: result.totalMarks,
      percentage: result.percentage,
      grade: result.grade,
      status: result.status,
      createdAt: result.createdAt
    }));

    console.log('Sending', formattedResults.length, 'results to client');
    res.status(200).json({
      success: true,
      count: formattedResults.length,
      data: formattedResults,
      message: 'Results retrieved successfully'
    });
  } catch (error) {
    console.error('Error in getMyResults:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch student results',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = {
  createResult,
  updateResult,
  getResults,
  getResultById,
  getResultsByStudent,
  getMyResults,
  deleteResult,
  generateMarksheet,
  calculateGrade,
  getResultPdf
};
