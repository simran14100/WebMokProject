import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import FeeType from '../models/feeTypeModel.js';
import FeeAssignment from '../models/feeAssignmentModel.js';
import UGPGCourse from '../models/UGPGCourse.js';
import { validateCreateFeeType, validateUpdateFeeType } from '../validations/feeTypeValidation.js';

// @desc    Create a new fee type
// @route   POST /api/v1/university/fee-types
// @access  Private/University
const createFeeType = asyncHandler(async (req, res) => {
  const { error } = validateCreateFeeType(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const { name, category, type, refundable } = req.body;
  
  // Check if fee type already exists for this university
  const feeTypeExists = await FeeType.findOne({
    name,
    university: req.user.university,
  });

  if (feeTypeExists) {
    return res.status(400).json({
      success: false,
      message: 'Fee type with this name already exists for your university',
    });
  }

  const feeType = await FeeType.create({
    name,
    category,
    type,
    refundable: refundable === 'true' || refundable === true,
    createdBy: req.user._id,
    university: req.user.university,
  });

  res.status(201).json({
    success: true,
    data: feeType,
  });
});

// @desc    Get all fee types for a university
// @route   GET /api/v1/university/fee-types
// @access  Private/University
const getFeeTypes = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search = '', status } = req.query;
  
  const query = {
    university: req.user.university,
  };

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { type: { $regex: search, $options: 'i' } },
    ];
  }

  const feeTypes = await FeeType.find(query)
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .populate('createdBy', 'name email');

  const count = await FeeType.countDocuments(query);

  res.json({
    success: true,
    data: feeTypes,
    pagination: {
      total: count,
      page: +page,
      limit: +limit,
      pages: Math.ceil(count / limit),
    },
  });
});

// @desc    Get single fee type
// @route   GET /api/v1/university/fee-types/:id
// @access  Private/University
const getFeeType = asyncHandler(async (req, res) => {
  const feeType = await FeeType.findOne({
    _id: req.params.id,
    university: req.user.university,
  }).populate('createdBy', 'name email');

  if (!feeType) {
    return res.status(404).json({
      success: false,
      message: 'Fee type not found',
    });
  }

  res.json({
    success: true,
    data: feeType,
  });
});

// @desc    Update fee type
// @route   PUT /api/v1/university/fee-types/:id
// @access  Private/University
const updateFeeType = asyncHandler(async (req, res) => {
  const { error } = validateUpdateFeeType(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  const { name, category, type, refundable, status } = req.body;
  
  let feeType = await FeeType.findOne({
    _id: req.params.id,
    university: req.user.university,
  });

  if (!feeType) {
    return res.status(404).json({
      success: false,
      message: 'Fee type not found',
    });
  }

  // Check if name is being updated and if it already exists
  if (name && name !== feeType.name) {
    const feeTypeExists = await FeeType.findOne({
      name,
      university: req.user.university,
      _id: { $ne: req.params.id },
    });

    if (feeTypeExists) {
      return res.status(400).json({
        success: false,
        message: 'Fee type with this name already exists for your university',
      });
    }
  }

  feeType.name = name || feeType.name;
  feeType.category = category || feeType.category;
  feeType.type = type || feeType.type;
  feeType.refundable = refundable !== undefined ? (refundable === 'true' || refundable === true) : feeType.refundable;
  feeType.status = status || feeType.status;

  await feeType.save();

  res.json({
    success: true,
    data: feeType,
  });
});

// @desc    Delete fee type
// @route   DELETE /api/v1/university/fee-types/:id
// @access  Private/University
const deleteFeeType = asyncHandler(async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid fee type ID format',
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // First check if fee type exists
    const feeType = await FeeType.findOne({
      _id: req.params.id,
      university: req.user.university,
    }).session(session);

    if (!feeType) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Fee type not found',
      });
    }

    // Check if fee type is used in any fee structures
    try {
      const FeeStructure = mongoose.model('FeeStructure');
      const feeStructureUsingType = await FeeStructure.findOne({
        'components.feeType': req.params.id,
        university: req.user.university,
      }).session(session);

      if (feeStructureUsingType) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: 'Cannot delete fee type as it is being used in one or more fee structures',
        });
      }
    } catch (error) {
      console.warn('Could not check FeeStructure references:', error.message);
    }

    // Delete all fee assignments for this fee type
    const deleteResult = await FeeAssignment.deleteMany({
      feeType: req.params.id,
      university: req.user.university
    }).session(session);

    // Delete the fee type
    await FeeType.findByIdAndDelete(req.params.id).session(session);
    
    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      message: 'Fee type and its assignments deleted successfully',
      deletedAssignmentsCount: deleteResult.deletedCount
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error deleting fee type:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting fee type',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

// @desc    Get fee type statistics
// @route   GET /api/v1/university/fee-types/statistics
// @access  Private/University
const getFeeTypeStatistics = asyncHandler(async (req, res) => {
  try {
    const universityId = req.user.university;
    
    const stats = await FeeType.aggregate([
      {
        $match: { university: new mongoose.Types.ObjectId(universityId) }
      },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error getting fee type statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting fee type statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @desc    Assign a fee type to a course/student
// @route   POST /api/v1/university/fee-assignments
// @access  Private/University
const assignFeeType = asyncHandler(async (req, res) => {
  const { feeType, session, course, amount, semester } = req.body;
  const universityId = req.user.university;

  // Validate input
  if (!feeType || !session || !course || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: feeType, session, course, and amount',
    });
  }
  
  // If semester is provided, validate it's a valid number between 1 and 12
  if (semester !== undefined) {
    const semesterNum = parseInt(semester);
    if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 12) {
      return res.status(400).json({
        success: false,
        message: 'Semester must be a number between 1 and 12',
      });
    }
  }

  // Validate session format (YYYY-YY)
  const sessionRegex = /^\d{4}-\d{2}$/;
  if (!sessionRegex.test(session)) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid session in format YYYY-YY (e.g., 2023-24)'
    });
  }

  // Validate amount is a positive number
  const amountValue = parseFloat(amount);
  if (isNaN(amountValue) || amountValue <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Please enter a valid positive amount'
    });
  }

  try {
    // Check if fee type exists and belongs to the university
    const feeTypeExists = await FeeType.findOne({
      _id: feeType,
      university: universityId
    });

    if (!feeTypeExists) {
      return res.status(404).json({
        success: false,
        message: 'Fee type not found or does not belong to your university'
      });
    }

    // Check for duplicate assignment
    const query = {
      feeType,
      session,
      course,
      university: universityId
    };

    // Include semester in the query if it's provided
    if (semester !== undefined) {
      query.semester = semester;
    } else {
      // If semester is not provided, only match documents where semester doesn't exist
      query.semester = { $exists: false };
    }

    const existingAssignment = await FeeAssignment.findOne(query);

    if (existingAssignment) {
      const errorMessage = semester 
        ? `This fee type is already assigned to the selected course for session ${session}, semester ${semester}`
        : `This fee type is already assigned to the selected course for session ${session}`;
        
      return res.status(400).json({
        success: false,
        message: errorMessage
      });
    }

    // Create assignment data object
    const assignmentData = {
      feeType,
      session,
      course,
      amount: amountValue,
      assigneeId: req.user._id,
      university: universityId
    };
    
    // Add semester to the assignment if provided
    if (semester !== undefined) {
      assignmentData.semester = parseInt(semester);
    }
    
    // Create new assignment
    const assignment = await FeeAssignment.create(assignmentData);

    // Populate the feeType field for the response
    await assignment.populate('feeType', 'name type category');

    res.status(201).json({
      success: true,
      message: 'Fee assigned successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error creating fee assignment:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      keyValue: error.keyValue,
      errors: error.errors,
      body: req.body,
      user: req.user ? { _id: req.user._id, university: req.user.university } : 'No user in request'
    });
    
    // More specific error messages for common issues
    let errorMessage = 'Error creating fee assignment';
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
    } else if (error.code === 11000) {
      errorMessage = 'Duplicate fee assignment. This fee type is already assigned with the same parameters.';
    }
    
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development' ? errorMessage : 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        details: error.keyValue || error.errors || error.name
      } : undefined
    });
  }
});

// @desc    Get all fee assignments for a university
// @route   GET /api/v1/university/fee-assignments
// @access  Private/University
const getFeeAssignments = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', search = '' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Initialize query object
    const query = {};
    
    // Add search functionality if search term is provided
    if (search && typeof search === 'string') {
      // First try to find matching courses by name
      const matchingCourses = await UGPGCourse.find({
        courseName: { $regex: search, $options: 'i' }
      }).select('_id');
      
      const courseIds = matchingCourses.map(course => course._id);
      
      query.$or = [
        { 'feeType.name': { $regex: search, $options: 'i' } },
        { course: { $in: courseIds } },
        { session: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get total count for pagination
    const total = await FeeAssignment.countDocuments(query);
    
    // Validate sort field to prevent NoSQL injection
    const sortField = ['createdAt', 'updatedAt', 'amount', 'session', 'course'].includes(sortBy) 
      ? sortBy 
      : 'createdAt';
    
    // Get fee assignments with pagination and sorting
    const feeAssignments = await FeeAssignment.find(query)
      .populate('feeType', 'name type category refundable')
      .populate({
        path: 'course',
        select: 'courseName courseCode courseType durationYear semester',
        model: 'UGPGCourse' // Using UGPGCourse model instead of Course
      })
      .sort({ [sortField]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit) || 10);
    
    // Filter out any null feeTypes
    const filteredAssignments = feeAssignments.filter(assignment => assignment.feeType);
    
    res.status(200).json({
      success: true,
      count: filteredAssignments.length,
      total,
      totalPages: Math.ceil(total / (parseInt(limit) || 10)),
      currentPage: parseInt(page) || 1,
      data: filteredAssignments,
    });
  } catch (error) {
    console.error('Error fetching fee assignments:', error);
    
    // More specific error messages
    let errorMessage = 'Error fetching fee assignments';
    let statusCode = 500;
    
    if (error.name === 'CastError') {
      errorMessage = 'Invalid data format';
      statusCode = 400;
    } else if (error.name === 'ValidationError') {
      errorMessage = 'Validation error';
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : undefined,
    });
  }
});

// @desc    Delete a fee assignment
// @route   DELETE /api/v1/university/fee-assignments/:id
// @access  Private/University
const deleteFeeAssignment = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const universityId = req.user.university;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid fee assignment ID format'
      });
    }

    // Find and delete the fee assignment
    const assignment = await FeeAssignment.findOneAndDelete({
      _id: id,
      university: universityId
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Fee assignment not found or you do not have permission to delete it'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Fee assignment deleted successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error deleting fee assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting fee assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export {
  createFeeType,
  getFeeTypes,
  getFeeType,
  updateFeeType,
  deleteFeeType,
  assignFeeType,
  getFeeAssignments,
  deleteFeeAssignment,
  getFeeTypeStatistics
};
