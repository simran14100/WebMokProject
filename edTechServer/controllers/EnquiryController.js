const Enquiry = require('../models/Enquiry');
const asyncHandler = require('express-async-handler');

// @desc    Get all enquiries
// @route   GET /api/v1/enquiries
// @access  Private/Admin
exports.getEnquiries = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  
  // Filter by status if provided
  if (req.query.status) {
    query.status = req.query.status;
  }
  
  // Filter by source if provided
  if (req.query.source) {
    query.source = req.query.source;
  }

  const [enquiries, total] = await Promise.all([
    Enquiry.find(query)
      .populate('course', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Enquiry.countDocuments(query)
  ]);

  res.status(200).json({
    success: true,
    count: enquiries.length,
    total,
    data: enquiries
  });
});

// @desc    Get single enquiry
// @route   GET /api/v1/enquiries/:id
// @access  Private/Admin
exports.getEnquiry = asyncHandler(async (req, res, next) => {
  const enquiry = await Enquiry.findById(req.params.id)
    .populate('course', 'name description')
    .populate('createdBy', 'name email');

  if (!enquiry) {
    return res.status(404).json({
      success: false,
      message: `No enquiry found with id of ${req.params.id}`
    });
  }

  res.status(200).json({
    success: true,
    data: enquiry
  });
});

// @desc    Create new enquiry
// @route   POST /api/v1/enquiries
// @access  Public
exports.createEnquiry = asyncHandler(async (req, res) => {
  // Add user to req.body if user is logged in
  if (req.user) {
    req.body.createdBy = req.user.id;
  }

  const enquiry = await Enquiry.create(req.body);

  res.status(201).json({
    success: true,
    data: enquiry
  });
});

// @desc    Update enquiry
// @route   PUT /api/v1/enquiries/:id
// @access  Private/Admin
exports.updateEnquiry = asyncHandler(async (req, res, next) => {
  let enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    return res.status(404).json({
      success: false,
      message: `No enquiry found with id of ${req.params.id}`
    });
  }

  enquiry = await Enquiry.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    success: true,
    data: enquiry
  });
});

// @desc    Delete enquiry
// @route   DELETE /api/v1/enquiries/:id
// @access  Private/Admin
exports.deleteEnquiry = asyncHandler(async (req, res, next) => {
  const enquiry = await Enquiry.findById(req.params.id);

  if (!enquiry) {
    return res.status(404).json({
      success: false,
      message: `No enquiry found with id of ${req.params.id}`
    });
  }

  await enquiry.remove();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Get enquiry stats
// @route   GET /api/v1/enquiries/stats
// @access  Private/Admin
exports.getEnquiryStats = asyncHandler(async (req, res) => {
  const stats = await Enquiry.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$count' },
        stats: {
          $push: {
            status: '$_id',
            count: '$count'
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        total: 1,
        stats: 1
      }
    }
  ]);

  res.status(200).json({
    success: true,
    data: stats[0] || { total: 0, stats: [] }
  });
});
