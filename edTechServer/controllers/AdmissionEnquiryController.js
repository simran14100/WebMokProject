const Enquiry = require('../models/Enquiry');
const asyncHandler = require('express-async-handler');
const { default: mongoose } = require('mongoose');

// @desc    Get admission enquiries by program type (UG/PG)
// @route   GET /api/v1/admission-enquiries/program/:programType
// @access  Private/Admin
exports.getEnquiriesByProgramType = asyncHandler(async (req, res, next) => {
  const { programType } = req.params;
  
  // Validate program type
  if (!['UG', 'PG', 'PHD'].includes(programType.toUpperCase())) {
    return next(new ErrorResponse('Invalid program type. Must be UG, PG, or PHD', 400));
  }

  const enquiries = await Enquiry.find({ 
    programType: programType.toUpperCase() 
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: enquiries.length,
    data: enquiries
  });
});

// @desc    Get all admission enquiries
// @route   GET /api/v1/admission/enquiries
// @access  Private/Admin
exports.getAllAdmissionEnquiries = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = '',
    status = '',
    sort = '-createdAt',
  } = req.query;

  const query = {};

  // Search filter
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  // Status filter
  if (status) {
    query.status = status;
  }

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sort,
    populate: 'course',
  };

  const result = await Enquiry.paginate(query, options);

  res.status(200).json({
    success: true,
    data: {
      enquiries: result.docs,
      total: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      limit: result.limit,
    },
  });
});

// @desc    Get single admission enquiry
// @route   GET /api/v1/admission/enquiries/:id
// @access  Private/Admin
exports.getAdmissionEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findById(req.params.id).populate('course');

  if (!enquiry) {
    return res.status(404).json({
      success: false,
      message: 'Enquiry not found',
    });
  }

  res.status(200).json({
    success: true,
    data: enquiry,
  });
});

// @desc    Update admission enquiry status
// @route   PUT /api/v1/admission/enquiries/:id/status
// @access  Private/Admin
exports.updateEnquiryStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  
  const enquiry = await Enquiry.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!enquiry) {
    return res.status(404).json({
      success: false,
      message: 'Enquiry not found',
    });
  }

  res.status(200).json({
    success: true,
    data: enquiry,
  });
});

// @desc    Delete admission enquiry
// @route   DELETE /api/v1/admission/enquiries/:id
// @access  Private/Admin
exports.deleteEnquiry = asyncHandler(async (req, res) => {
  const enquiry = await Enquiry.findByIdAndDelete(req.params.id);

  if (!enquiry) {
    return res.status(404).json({
      success: false,
      message: 'Enquiry not found',
    });
  }

  res.status(200).json({
    success: true,
    data: {},
  });
});
