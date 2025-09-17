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
  const result = await Result.findById(req.params.id);

  if (!result) {
    res.status(404);
    throw new Error('Result not found');
  }

  // Check if the user has permission to update this result
  if (result.createdBy.toString() !== req.user.id && req.user.role !== 'super_admin') {
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
    subjects,
    remarks
  } = req.body;

  // Update fields if provided
  if (studentId) result.student = studentId;
  if (studentName) result.studentName = studentName;
  if (courseId) result.course = courseId;
  if (semester) result.semester = semester;
  if (examSessionId) result.examSession = examSessionId;
  if (remarks) result.remarks = remarks;

  // Update subjects if provided
  if (subjects && Array.isArray(subjects)) {
    // Get subject details for all subjects
    const subjectIds = subjects.map(s => s.subjectId || s.subject?._id).filter(Boolean);
    const subjectDetails = await mongoose.model('UGPGSubject').find({
      _id: { $in: subjectIds }
    });

    // Create a map of subject IDs to their details for quick lookup
    const subjectMap = new Map(subjectDetails.map(sub => [sub._id.toString(), sub]));
    
    result.subjects = [];
    
    for (const subject of subjects) {
      const subjectId = subject.subjectId || subject.subject?._id;
      if (!subjectId || typeof subject.marksObtained !== 'number') {
        res.status(400);
        throw new Error('Each subject must have a valid subjectId and marksObtained');
      }

      const subjectDetail = subjectMap.get(subjectId.toString());
      if (!subjectDetail) {
        res.status(400);
        throw new Error(`Subject not found with ID: ${subjectId}`);
      }

      const examType = subject.examType || 'theory';
      const maxMarks = subject.maxMarks || 
        (examType === 'theory' ? subjectDetail.theoryMaxMarks : 
         examType === 'practical' ? subjectDetail.practicalMaxMarks : 100);
      
      const passingMarks = subject.passingMarks || Math.ceil(maxMarks * 0.4);
      const marksObtained = subject.marksObtained;
      const percentage = (marksObtained / maxMarks) * 100;
      const isPassed = marksObtained >= passingMarks;
      
      result.subjects.push({
        subject: subjectId,
        examType,
        marksObtained,
        maxMarks,
        passingMarks,
        grade: calculateGrade(percentage),
        percentage,
        isPassed,
        attendance: subject.attendance || 'present',
        subjectConfig: {
          hasTheory: subjectDetail.hasTheory,
          theoryMaxMarks: subjectDetail.theoryMaxMarks,
          hasPractical: subjectDetail.hasPractical,
          practicalMaxMarks: subjectDetail.practicalMaxMarks
        }
      });
    }

    // Recalculate overall result
    result.totalMarksObtained = result.subjects.reduce((sum, sub) => sum + sub.marksObtained, 0);
    result.totalMaxMarks = result.subjects.reduce((sum, sub) => sum + (sub.maxMarks || 100), 0);
    result.percentage = (result.totalMarksObtained / result.totalMaxMarks) * 100;
    result.isPassed = result.subjects.every(sub => sub.isPassed);
    result.status = result.isPassed ? 'PASSED' : 'FAILED';
  }

  const updatedResult = await result.save();
  
  res.status(200).json({
    success: true,
    data: updatedResult
  });
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

// Helper function to calculate grade based on percentage
const calculateGrade = (percentage) => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  if (percentage >= 40) return 'E';
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

  // Header
  doc.fontSize(16).text('UNIVERSITY MARKSHEET', { align: 'center' }).moveDown(0.5);
  
  // Student Info
  doc.fontSize(10)
     .text(`Name: ${data.student.name}`)
     .text(`Enrollment: ${data.student.enrollmentNo}`)
     .text(`Course: ${data.student.course}`)
     .text(`Semester: ${data.semester} | Session: ${data.examSession}`)
     .moveDown(1);
  
  // Subjects Table
  const tableTop = 180;
  const colWidths = [30, 200, 80, 80, 50]; // S.No, Subject, Marks, Max, Grade
  
  // Table Header
  doc.font('Helvetica-Bold').fontSize(9)
     .text('S.No', 50, tableTop)
     .text('Subject', 80, tableTop)
     .text('Marks', 280, tableTop, { width: 80, align: 'right' })
     .text('Max', 360, tableTop, { width: 50, align: 'right' })
     .text('Grade', 410, tableTop, { width: 50, align: 'center' });
  
  // Table Rows
  doc.font('Helvetica').fontSize(9);
  data.subjects.forEach((subj, i) => {
    const y = tableTop + 20 + (i * 20);
    if (i % 2 === 0) doc.fill('#f5f5f5').rect(50, y - 5, 500, 20).fill();
    doc.fill('#000')
       .text((i + 1).toString(), 55, y)
       .text(subj.subjectCode || `Subject ${i + 1}`, 80, y)
       .text(subj.marksObtained.toString(), 280, y, { width: 80, align: 'right' })
       .text(subj.maxMarks.toString(), 360, y, { width: 50, align: 'right' })
       .text(subj.grade, 410, y, { width: 50, align: 'center' });
  });
  
  // Summary
  const summaryY = tableTop + (data.subjects.length * 20) + 30;
  doc.font('Helvetica-Bold').fontSize(10)
     .text('SUMMARY', 50, summaryY, { underline: true })
     .font('Helvetica')
     .text(`Total Marks: ${data.totalMarks} / ${data.maxMarks}`, 70, summaryY + 20)
     .text(`Percentage: ${data.percentage}%`, 70, summaryY + 40)
     .font('Helvetica-Bold')
     .text(`Result: ${data.status}`, 70, summaryY + 60);
  
  // Footer
  doc.fontSize(8)
     .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 750, { align: 'center' });
  
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
    const result = await Result.findById(req.params.id)
      .populate('student', 'name email')
      .populate('course', 'name code')
      .populate('subject', 'name code');

    if (!result) {
      res.status(404);
      throw new Error('Result not found');
    }

    // Check if the user is the student who owns this result or an admin
    if (result.student._id.toString() !== req.user.id && 
        !['admin', 'SuperAdmin'].includes(req.user.role)) {
      res.status(403);
      throw new Error('Not authorized to access this result');
    }

    // Generate PDF
    const doc = new PDFDocument();
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=result_${result._id}.pdf`);
    
    // Pipe the PDF to the response
    doc.pipe(res);
    
    // Add content to the PDF
    doc.fontSize(20).text('Result Details', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Student: ${result.student.name}`);
    doc.text(`Course: ${result.course.name} (${result.course.code})`);
    doc.text(`Subject: ${result.subject.name} (${result.subject.code})`);
    doc.text(`Marks Obtained: ${result.marksObtained}`);
    doc.text(`Total Marks: ${result.totalMarks || 100}`);
    doc.text(`Percentage: ${result.percentage || 0}%`);
    doc.text(`Grade: ${result.grade || 'N/A'}`);
    doc.text(`Status: ${result.status || 'N/A'}`);
    
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
