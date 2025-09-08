import asyncHandler from 'express-async-handler';
import FeeType from '../models/feeTypeModel.js';
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
  const feeType = await FeeType.findOneAndDelete({
    _id: req.params.id,
    university: req.user.university,
  });

  if (!feeType) {
    return res.status(404).json({
      success: false,
      message: 'Fee type not found',
    });
  }

  res.json({
    success: true,
    message: 'Fee type deleted successfully',
  });
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
// @route   POST /api/v1/university/fee-types/:id/assign
// @access  Private/University
const assignFeeType = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { course, student, amount, dueDate } = req.body;

  // Validate input
  if (!course || !amount) {
    return res.status(400).json({
      success: false,
      message: 'Please provide course and amount',
    });
  }

  // Check if fee type exists
  const feeType = await FeeType.findById(id);
  if (!feeType) {
    return res.status(404).json({
      success: false,
      message: 'Fee type not found',
    });
  }

  // Create assignment (you'll need to implement this in your model)
  // This is a basic implementation - adjust according to your schema
  const assignment = {
    feeType: id,
    course,
    student,
    amount,
    dueDate: dueDate || new Date(),
    status: 'pending',
    assignedBy: req.user._id,
  };

  // Save assignment (you'll need to implement this in your model)
  // For example: const feeAssignment = await FeeAssignment.create(assignment);

  res.status(201).json({
    success: true,
    data: assignment, // Replace with feeAssignment when model is implemented
    message: 'Fee type assigned successfully',
  });
});

export {
  createFeeType,
  getFeeTypes,
  getFeeType,
  updateFeeType,
  deleteFeeType,
  getFeeTypeStatistics,
  assignFeeType,
};
