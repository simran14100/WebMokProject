const ExamSession = require("../models/ExamSession");

// Create a new Exam Session
exports.createExamSession = async (req, res) => {
  try {
    const { sessionId, schoolId, courseId, subjectId, semester, examDate, examType, status } = req.body;

    // Validate required fields
    if (!sessionId || !schoolId || !courseId || !subjectId || !semester || !examDate) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required: session, school, course, subject, semester, and exam date" 
      });
    }

    // Check if exam session already exists for this subject and date
    const existingSession = await ExamSession.findOne({
      subjectId,
      examDate: new Date(examDate),
      status: { $ne: 'Inactive' }
    });

    if (existingSession) {
      return res.status(409).json({ 
        success: false, 
        message: "An active exam session already exists for this subject on the selected date" 
      });
    }

    // Create new exam session
    // Ensure status is in the correct format
    const formattedStatus = status 
      ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()
      : 'Active';
      
    const doc = await ExamSession.create({
      sessionId,
      schoolId,
      courseId,
      subjectId,
      semester: Number(semester),
      examDate: new Date(examDate),
      examType: examType || "theory",
      status: formattedStatus,
      createdBy: req.user ? req.user.id : undefined,
    });

    // Populate the response with related data
    const populatedDoc = await ExamSession.findById(doc._id)
      .populate({
        path: 'sessionId',
        select: 'name',
        model: 'UGPGSession'
      })
      .populate({
        path: 'schoolId',
        select: 'name',
        model: 'UGPGSchool'
      })
      .populate({
        path: 'courseId',
        select: 'courseName',
        model: 'UGPGCourse'
      })
      .populate({
        path: 'subjectId',
        select: 'name',
        model: 'UGPGSubject'
      });

    return res.status(201).json({ 
      success: true, 
      data: populatedDoc 
    });
  } catch (err) {
    console.error("ExamSession create error", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to create exam session" 
    });
  }
};

// List exam sessions with advanced filtering and pagination
exports.listExamSessions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      schoolId,
      courseId,
      subjectId,
      sessionId,
      status,
      examType
    } = req.query;
    
    // Build query based on filters
    const query = {};
    
    // Text search across multiple fields
    if (search) {
      query.$or = [
        { 'sessionId.name': { $regex: search, $options: 'i' } },
        { 'schoolId.name': { $regex: search, $options: 'i' } },
        { 'courseId.courseName': { $regex: search, $options: 'i' } },
        { 'subjectId.name': { $regex: search, $options: 'i' } },
        { examType: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add filter conditions if provided
    if (schoolId) query.schoolId = schoolId;
    if (courseId) query.courseId = courseId;
    if (subjectId) query.subjectId = subjectId;
    if (sessionId) query.sessionId = sessionId;
    if (status) query.status = status;
    if (examType) query.examType = examType;

    // Execute query with population and pagination
    const [list, count] = await Promise.all([
      ExamSession.find(query)
        .populate({
          path: 'sessionId',
          select: 'name',
          model: 'UGPGSession'
        })
        .populate({
          path: 'schoolId',
          select: 'name',
          model: 'UGPGSchool'
        })
        .populate({
          path: 'courseId',
          select: 'courseName',
          model: 'UGPGCourse'
        })
        .populate({
          path: 'subjectId',
          select: 'name',
          model: 'UGPGSubject'
        })
        .sort({ examDate: -1, createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .lean(),
      ExamSession.countDocuments(query)
    ]);

    // Format the response data
    const formattedList = list.map(session => ({
      ...session,
      semester: `Semester ${session.semester}`
    }));

    return res.json({ 
      success: true, 
      data: formattedList,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        limit: Number(limit)
      }
    });
  } catch (err) {
    console.error("ExamSession list error", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to fetch exam sessions" 
    });
  }
};

// Update exam session
exports.updateExamSession = async (req, res) => {
  try {
    const { id } = req.params;
    const { sessionId, schoolId, courseId, subjectId, semester, examDate, examType, status } = req.body;

    // Check if exam session exists
    const existingSession = await ExamSession.findById(id);
    if (!existingSession) {
      return res.status(404).json({ 
        success: false, 
        message: "Exam session not found" 
      });
    }

    // Check for duplicate exam session (same subject and date)
    if (subjectId || examDate) {
      const duplicate = await ExamSession.findOne({
        _id: { $ne: id },
        subjectId: subjectId || existingSession.subjectId,
        examDate: examDate ? new Date(examDate) : existingSession.examDate,
        status: { $ne: 'Inactive' }
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "An active exam session already exists for this subject on the selected date"
        });
      }
    }

    // Prepare update object
    const update = {};
    if (sessionId) update.sessionId = sessionId;
    if (schoolId) update.schoolId = schoolId;
    if (courseId) update.courseId = courseId;
    if (subjectId) update.subjectId = subjectId;
    if (semester) update.semester = Number(semester);
    if (examDate) update.examDate = new Date(examDate);
    if (examType) update.examType = examType;
    if (status) {
      // Ensure status is in the correct format (Title Case to match enum)
      update.status = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    }

    // Update the exam session
    const updated = await ExamSession.findByIdAndUpdate(
      id,
      { $set: update },
      { new: true, runValidators: true }
    )
    .populate({
      path: 'sessionId',
      select: 'name',
      model: 'UGPGSession'
    })
    .populate({
      path: 'schoolId',
      select: 'name',
      model: 'UGPGSchool'
    })
    .populate({
      path: 'courseId',
      select: 'courseName',
      model: 'UGPGCourse'
    })
    .populate({
      path: 'subjectId',
      select: 'name',
      model: 'UGPGSubject'
    });

    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        message: "Failed to update exam session" 
      });
    }

    // Format the response
    const response = {
      ...updated.toObject(),
      semester: `Semester ${updated.semester}`
    };

    return res.json({ 
      success: true, 
      data: response 
    });
  } catch (err) {
    console.error("ExamSession update error", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to update exam session" 
    });
  }
};

// List exam sessions for students (identical to admin version for now)
exports.listStudentExamSessions = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search = '',
      schoolId,
      courseId,
      subjectId,
      sessionId,
      status,
      examType
    } = req.query;
    
    // Build query based on filters
    const query = {};
    
    // Text search across multiple fields
    if (search) {
      query.$or = [
        { 'sessionId.name': { $regex: search, $options: 'i' } },
        { 'schoolId.name': { $regex: search, $options: 'i' } },
        { 'courseId.courseName': { $regex: search, $options: 'i' } },
        { 'subjectId.name': { $regex: search, $options: 'i' } },
        { examType: { $regex: search, $options: 'i' } },
        { status: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add filter conditions if provided
    if (schoolId) query.schoolId = schoolId;
    if (courseId) query.courseId = courseId;
    if (subjectId) query.subjectId = subjectId;
    if (sessionId) query.sessionId = sessionId;
    if (status) query.status = status;
    if (examType) query.examType = examType;

    // Execute query with population and pagination
    const [list, count] = await Promise.all([
      ExamSession.find(query)
        .populate({
          path: 'sessionId',
          select: 'name',
          model: 'UGPGSession'
        })
        .populate({
          path: 'schoolId',
          select: 'name',
          model: 'UGPGSchool'
        })
        .populate({
          path: 'courseId',
          select: 'courseName',
          model: 'UGPGCourse'
        })
        .populate({
          path: 'subjectId',
          select: 'name',
          model: 'UGPGSubject'
        })
        .sort({ examDate: -1, createdAt: -1 })
        .limit(Number(limit))
        .skip((Number(page) - 1) * Number(limit))
        .lean(),
      ExamSession.countDocuments(query)
    ]);

    // Format the response data
    const formattedList = list.map(session => ({
      ...session,
      semester: `Semester ${session.semester}`
    }));

    return res.json({ 
      success: true, 
      data: formattedList,
      pagination: {
        total: count,
        totalPages: Math.ceil(count / limit),
        currentPage: Number(page),
        limit: Number(limit)
      }
    });
  } catch (err) {
    console.error("Student ExamSession list error", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to fetch student exam sessions" 
    });
  }
};

// Delete exam session (soft delete)
exports.deleteExamSession = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Instead of hard delete, we'll mark as inactive
    const deleted = await ExamSession.findByIdAndUpdate(
      id,
      { status: 'Inactive' },
      { new: true }
    )
    .populate({
      path: 'sessionId',
      select: 'name',
      model: 'UGPGSession'
    })
    .populate({
      path: 'schoolId',
      select: 'name',
      model: 'UGPGSchool'
    })
    .populate({
      path: 'courseId',
      select: 'courseName',
      model: 'UGPGCourse'
    })
    .populate({
      path: 'subjectId',
      select: 'name',
      model: 'UGPGSubject'
    });

    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: "Exam session not found" 
      });
    }

    // Format the response
    const response = {
      ...deleted.toObject(),
      semester: `Semester ${deleted.semester}`
    };

    return res.json({ 
      success: true, 
      message: "Exam session marked as inactive",
      data: response
    });
  } catch (err) {
    console.error("ExamSession delete error", err);
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to delete exam session" 
    });
  }
};
