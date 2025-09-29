const Timetable = require('../models/Timetable');
const UGPGCourse = require('../models/UGPGCourse');
const asyncHandler = require('express-async-handler');
const ApiError = require('../utils/ApiError');
const UniversityRegisteredStudent = require('../models/UniversityRegisteredStudent');

// @desc    Create a new timetable entry
// @route   POST /api/v1/timetable
// @access  Private/Admin
exports.createTimetable = asyncHandler(async (req, res, next) => {
  // Validate course exists
  const course = await UGPGCourse.findById(req.body.course);
  if (!course) {
    return next(new ApiError(`No course found with id ${req.body.course}`, 404));
  }

  const timetable = await Timetable.create(req.body);
  
  // Populate the course field in the response
  await timetable.populate('course', 'name code');
  
  res.status(201).json({
    success: true,
    data: timetable
  });
});

// @desc    Get all timetable entries
// @route   GET /api/v1/timetable
// @access  Private
exports.getTimetables = asyncHandler(async (req, res) => {
  // Filtering
  const { courseType, course, school, session, day, ...otherFilters } = req.query;
  
  // Build query with proper ObjectId conversion
  const { ObjectId } = require('mongoose').Types;
  let query = {};
  
  // Handle each query parameter with proper type conversion
  if (courseType) query.courseType = courseType;
  if (course) query.course = ObjectId.isValid(course) ? new ObjectId(course) : course;
  if (school) query.school = ObjectId.isValid(school) ? new ObjectId(school) : school;
  if (session) query.session = ObjectId.isValid(session) ? new ObjectId(session) : session;
  if (day) query.day = day;
  
  // Log the final query
  console.log('Final query:', JSON.stringify(query, null, 2));

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  // Sorting
  let sort = {};
  if (req.query.sortBy) {
    const [field, order] = req.query.sortBy.split(':');
    sort[field] = order === 'desc' ? -1 : 1;
  } else {
    sort = { createdAt: -1 }; // Default sort by newest
  }

  // Log the query for debugging
  console.log('Executing query:', JSON.stringify(query, null, 2));
  
  // Execute query with pagination
  const [timetables, total] = await Promise.all([
    Timetable.find(query)
      .populate({
        path: 'school',
        select: 'name',
        strictPopulate: false
      })
      .populate({
        path: 'session',
        select: 'name',
        strictPopulate: false
      })
      .populate({
        path: 'course',
        select: 'courseName courseType durationYear semester',
        strictPopulate: false,
        transform: doc => {
          if (!doc) return null;
          return {
            _id: doc._id,
            name: doc.courseName,
            type: doc.courseType,
            durationYear: doc.durationYear,
            semester: doc.semester
          };
        }
      })
      .populate({
        path: 'subject',
        select: 'name code',
        strictPopulate: false
      })
      .populate({
        path: 'faculty',
        select: 'name email',
        strictPopulate: false
      })
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(), // Convert to plain JavaScript objects
    Timetable.countDocuments(query)
  ]);
  
  console.log(`Found ${timetables.length} timetables out of ${total} total`);
  console.log('Sample timetable:', timetables[0]);

  // Calculate pagination values
  const pages = Math.ceil(total / limit);
  const hasNextPage = page < pages;
  const hasPreviousPage = page > 1;

  // Set pagination headers
  res.set({
    'X-Total-Count': total,
    'X-Total-Pages': pages,
    'X-Current-Page': page,
    'X-Per-Page': limit,
    'X-Has-Next-Page': hasNextPage,
    'X-Has-Previous-Page': hasPreviousPage
  });

  res.status(200).json({
    success: true,
    count: timetables.length,
    total,
    pagination: {
      total,
      pages,
      page,
      limit,
      hasNextPage,
      hasPreviousPage
    },
    data: timetables
  });
});

// @desc    Get single timetable entry
// @route   GET /api/v1/timetable/:id
// @access  Private
// @desc    Get student's timetable
// @route   GET /api/v1/timetable/student
// @access  Private/Student
exports.getStudentTimetable = asyncHandler(async (req, res, next) => {
  try {
    // Get student's details
    const student = await UniversityRegisteredStudent.findOne({ user: req.user.id })
      .populate('course', 'name courseType');

    if (!student) {
      return next(new ApiError('Student not found', 404));
    }

    // Use the semester from query params if provided, otherwise use student's current semester
    const semester = req.query.semester || student.currentSemester || 'Semester 1';

    // Get timetable for student's course and selected semester
    const timetable = await Timetable.find({
      course: student.course._id,
      semester: semester,
      subject: { $exists: true, $ne: null } // Only include entries with valid subjects
    })
    .populate({
      path: 'subject',
      select: 'name code',
      match: { status: 'Active' } // Only include active subjects
    })
    .populate('faculty', 'name')
    .populate('course', 'name')
    .populate('school', 'name')
    .sort({ day: 1, timeSlot: 1 });

    // Filter out entries where subject is null after population
    const filteredTimetable = timetable.filter(entry => entry.subject !== null);

    res.status(200).json({
      success: true,
      data: filteredTimetable,
      semester: semester, // Return the actual semester used
      course: student.course
    });
  } catch (error) {
    console.error('Error fetching student timetable:', error);
    next(new ApiError('Failed to fetch student timetable', 500));
  }
});

// @desc    Get all semesters that have timetable entries
// @route   GET /api/v1/timetable/semesters
// @access  Private/Student
exports.getTimetableSemesters = asyncHandler(async (req, res, next) => {
  try {
    // Get student's details
    const student = await UniversityRegisteredStudent.findOne({ user: req.user.id })
      .populate('course', 'name courseType');

    if (!student) {
      return next(new ApiError('Student not found', 404));
    }

    // Get all unique semesters for the student's course
    const semesters = await Timetable.distinct('semester', {
      course: student.course._id
    }).sort();

    res.status(200).json({
      success: true,
      semesters
    });
  } catch (error) {
    console.error('Error fetching timetable semesters:', error);
    next(new ApiError('Failed to fetch timetable semesters', 500));
  }
});

// @desc    Get single timetable entry
exports.getTimetable = asyncHandler(async (req, res, next) => {
  const timetable = await Timetable.findById(req.params.id)
    .populate({
      path: 'school',
      select: 'name',
      strictPopulate: false
    })
    .populate({
      path: 'session',
      select: 'name',
      strictPopulate: false
    })
    .populate({
      path: 'course',
      select: 'courseName courseType durationYear semester',
      strictPopulate: false,
      transform: doc => {
        if (!doc) return null;
        return {
          _id: doc._id,
          name: doc.courseName,
          type: doc.courseType,
          durationYear: doc.durationYear,
          semester: doc.semester
        };
      }
    })
    .populate({
      path: 'subject',
      select: 'name code',
      strictPopulate: false
    })
    .populate({
      path: 'faculty',
      select: 'name email',
      strictPopulate: false
    });

  if (!timetable) {
    return next(new ApiError(`No timetable found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: timetable
  });
});

// @desc    Update timetable entry
// @route   PUT /api/v1/timetable/:id
// @access  Private/Admin
exports.updateTimetable = asyncHandler(async (req, res, next) => {
  let timetable = await Timetable.findById(req.params.id);

  if (!timetable) {
    return next(new ApiError(`No timetable found with id of ${req.params.id}`, 404));
  }

  // If course is being updated, validate it exists
  if (req.body.course) {
    const course = await UGPGCourse.findById(req.body.course);
    if (!course) {
      return next(new ApiError(`No course found with id ${req.body.course}`, 404));
    }
  }

  // First update the document
  timetable = await Timetable.findByIdAndUpdate(
    req.params.id, 
    req.body, 
    {
      new: true,
      runValidators: true
    }
  );
  
  // Then populate all necessary fields for the response
  timetable = await Timetable.findById(timetable._id)
    .populate('school', 'name')
    .populate('session', 'name')
    .populate('course', 'name code')
    .populate('subject', 'name code')
    .populate('faculty', 'name email');

  res.status(200).json({
    success: true,
    data: timetable
  });
});

// @desc    Delete timetable entry
// @route   DELETE /api/v1/ugpg/timetable/:id
// @access  Private/Admin
exports.deleteTimetable = asyncHandler(async (req, res, next) => {
  const timetable = await Timetable.findById(req.params.id);

  if (!timetable) {
    return next(new ApiError(`No timetable found with id of ${req.params.id}`, 404));
  }

  await timetable.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});
