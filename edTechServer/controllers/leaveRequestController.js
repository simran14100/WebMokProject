const LeaveRequest = require('../models/LeaveRequest');
const ExamSession = require('../models/ExamSession');

// Create a new leave request
exports.createLeaveRequest = async (req, res) => {
  try {
    const { examSession, leaveType, reason, startDate, endDate } = req.body;
    
    // Validate required fields
    if (!examSession || !leaveType || !reason || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate date range
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }

    // Check for overlapping leave requests
    const existingRequest = await LeaveRequest.findOne({
      student: req.user.id,
      status: 'Pending',
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ]
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending leave request for this exam'
      });
    }

    console.log('Creating leave request with user:', {
      userId: req.user._id || req.user.id,
      userType: typeof req.user._id
    });
    
    // Ensure we're using the correct user ID format
    const studentId = req.user._id || req.user.id;
    
    if (!studentId) {
      console.error('No user ID found in request');
      return res.status(400).json({
        success: false,
        message: 'User ID not found in request'
      });
    }
    
    const leaveRequest = await LeaveRequest.create({
      student: studentId,
      examSession,
      leaveType,
      reason,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status: 'Pending'
    });
    
    console.log('Created leave request:', leaveRequest);

    // Return the created leave request with student details
    const populatedRequest = await leaveRequest.populate({
      path: 'student',
      select: 'firstName lastName email'
    });
    
    res.status(201).json({
      success: true,
      data: populatedRequest
    });
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create leave request',
      error: error.message
    });
  }
};

// Get all leave requests (for admin)
exports.getAllLeaveRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    
    if (status) {
      query.status = status;
    }

    const requests = await LeaveRequest.find(query)
      .populate({
        path: 'student',
        select: 'firstName lastName email'
      })
      .populate({
        path: 'examSession',
        populate: [
          { path: 'subjectId', select: 'name' },
          { path: 'courseId', select: 'courseName' }
        ]
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching leave requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leave requests',
      error: error.message
    });
  }
};

// Update leave request status (for admin)
exports.updateLeaveRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminComment } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: Approved, Rejected, Pending'
      });
    }

    const updateData = { status };
    if (adminComment) {
      updateData.adminComment = adminComment;
    }

    const updatedRequest = await LeaveRequest.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate({
      path: 'student',
      select: 'firstName lastName email'
    })
    .populate({
      path: 'examSession',
      populate: [
        { path: 'subjectId', select: 'name' },
        { path: 'courseId', select: 'courseName' }
      ]
    });

    if (!updatedRequest) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    res.json({
      success: true,
      data: updatedRequest
    });
  } catch (error) {
    console.error('Error updating leave request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update leave request',
      error: error.message
    });
  }
};

// Get leave requests for current student
exports.getMyLeaveRequests = async (req, res) => {
  try {
    console.log('=== getMyLeaveRequests called ===');
    console.log('User making request:', {
      userId: req.user._id,
      userType: req.user.accountType,
      email: req.user.email
    });

    // Convert user._id to string for comparison
    const userIdString = req.user._id.toString();
    
    // Try to find requests where student matches either as ObjectId or string
    let requests = await LeaveRequest.find({
      $or: [
        { student: req.user._id },  // Match as ObjectId
        { student: userIdString }   // Match as string
      ]
    })
    .populate({
      path: 'student',
      select: 'firstName lastName email'
    })
    .populate({
      path: 'examSession',
      populate: [
        { path: 'subjectId', select: 'name' },
        { path: 'courseId', select: 'courseName' }
      ]
    })
    .sort({ createdAt: -1 });

    console.log(`Found ${requests.length} leave requests for user ${userIdString}`);
    
    // If still no requests found, log the first few requests to debug
    if (requests.length === 0) {
      console.log('No matching leave requests found. Checking database...');
      const allRequests = await LeaveRequest.find({}).limit(5);
      console.log('First 5 leave requests in database:', allRequests.map(req => ({
        _id: req._id,
        student: req.student,
        studentType: typeof req.student,
        status: req.status,
        createdAt: req.createdAt
      })));
    }
    
    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching my leave requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your leave requests',
      error: error.message
    });
  }
};
