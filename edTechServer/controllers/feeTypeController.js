import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import FeeType from '../models/feeTypeModel.js';
import FeeAssignment from '../models/feeAssignmentModel.js';
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

  try {
    // First check if fee type exists
    const feeType = await FeeType.findOne({
      _id: req.params.id,
      university: req.user.university,
    });

    if (!feeType) {
      return res.status(404).json({
        success: false,
        message: 'Fee type not found',
      });
    }

    try {
      // Try to check if FeeStructure model exists and has references
      const FeeStructure = mongoose.model('FeeStructure');
      const feeStructureUsingType = await FeeStructure.findOne({
        'components.feeType': req.params.id,
        university: req.user.university,
      });

      if (feeStructureUsingType) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete fee type as it is being used in one or more fee structures',
        });
      }
    } catch (error) {
      // If FeeStructure model doesn't exist or there's an error, log it but continue with deletion
      console.warn('Could not check FeeStructure references:', error.message);
    }

    // Proceed with deletion
    await FeeType.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: 'Fee type deleted successfully',
    });
  } catch (error) {
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
  const stats = await FeeType.aggregate([
    {
      $match: {
        university: req.user.university,
      },
    },
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
      },
    },
  ]);

  const total = await FeeType.countDocuments({ university: req.user.university });
  const active = await FeeType.countDocuments({
    university: req.user.university,
    status: 'Active',
  });

  res.json({
    success: true,
    data: {
      total,
      active,
      inactive: total - active,
      byCategory: stats,
    },
  });
});

// @desc    Assign a fee type to a course/student
// @route   POST /api/v1/university/fee-assignments
// @access  Private/University
const assignFeeType = asyncHandler(async (req, res) => {
  const { feeType, session, course, amount } = req.body;
  const universityId = req.user.university;

  // Validate input
  if (!feeType || !session || !course || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: feeType, session, course, and amount',
    });
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
    const existingAssignment = await FeeAssignment.findOne({
      feeType,
      session,
      course,
      university: universityId
    });

    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'This fee type is already assigned to the selected course for this session'
      });
    }

    // Create new assignment
    const assignment = await FeeAssignment.create({
      feeType,
      session,
      course,
      amount: amountValue,
      assigneeId: req.user._id,
      university: universityId
    });

    // Populate the feeType field for the response
    await assignment.populate('feeType', 'name type category');

    res.status(201).json({
      success: true,
      message: 'Fee assigned successfully',
      data: assignment
    });
  } catch (error) {
    console.error('Error creating fee assignment:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating fee assignment',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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
    
    // Build the query
    const query = { university: req.user.university };
    
    // Add search functionality if search term is provided
    if (search) {
      query.$or = [
        { 'feeType.name': { $regex: search, $options: 'i' } },
        { 'course.name': { $regex: search, $options: 'i' } },
        { session: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Get total count for pagination
    const total = await FeeAssignment.countDocuments(query);
    
    // Get fee assignments with pagination and sorting
    const feeAssignments = await FeeAssignment.find(query)
      .populate('feeType', 'name type category refundable')
      .populate('course', 'name code')
      .populate('assignedBy', 'name email')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      count: feeAssignments.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: feeAssignments,
    });
  } catch (error) {
    console.error('Error fetching fee assignments:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching fee assignments',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
});

export {
  createFeeType,
  getFeeTypes,
  getFeeType,
  updateFeeType,
  deleteFeeType,
  getFeeTypeStatistics,
  assignFeeType,
  getFeeAssignments,
};
