const FinalData = require('../models/FinalData');
const asyncHandler = require('../middlewares/async');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all final data entries
// @route   GET /api/v1/final-data
// @access  Private/Admin
const getFinalData = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, sort = '-createdAt', ...filters } = req.query;
  
  // Copy filters
  const queryFilters = { ...filters };
  
  // Start building query
  let query = FinalData.find(queryFilters);
  
  // Sorting
  if (sort) {
    const sortBy = sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }
  
  // Pagination
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await FinalData.countDocuments(queryFilters);
  
  query = query.skip(startIndex).limit(limit);
  
  // Execute query
  const finalData = await query;
  
  // Pagination result
  const pagination = {};
  
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }
  
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  
  res.status(200).json({
    success: true,
    count: finalData.length,
    pagination,
    data: finalData
  });
});

// @desc    Get single final data entry
// @route   GET /api/v1/final-data/:id
// @access  Private/Admin
const getSingleFinalData = asyncHandler(async (req, res, next) => {
  const finalData = await FinalData.findById(req.params.id);
  
  if (!finalData) {
    return next(
      new ErrorResponse(`Final data not found with id of ${req.params.id}`, 404)
    );
  }
  
  res.status(200).json({
    success: true,
    data: finalData
  });
});

// @desc    Create new final data entry
// @route   POST /api/v1/final-data
// @access  Private/Admin
const createFinalData = asyncHandler(async (req, res, next) => {
  try {
    // Log the user object for debugging
    console.log('User from request:', req.user);
    
    // Create the final data with the user ID
    const finalData = await FinalData.create({
      ...req.body,
      createdBy: req.user._id  // Use _id from the authenticated user
    });
    
    res.status(201).json({
      success: true,
      data: finalData
    });
  } catch (error) {
    console.error('Error creating final data:', error);
    next(error);
  }
});

// @desc    Update final data entry
// @route   PUT /api/v1/final-data/:id
// @access  Private/Admin
const updateFinalData = asyncHandler(async (req, res, next) => {
  let finalData = await FinalData.findById(req.params.id);
  
  if (!finalData) {
    return next(
      new ErrorResponse(`Final data not found with id of ${req.params.id}`, 404)
    );
  }
  
  // Add updatedBy
  req.body.updatedBy = req.user.id;
  
  finalData = await FinalData.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });
  
  res.status(200).json({
    success: true,
    data: finalData
  });
});

// @desc    Delete final data entry
// @route   DELETE /api/v1/final-data/:id
// @access  Private/Admin
const deleteFinalData = asyncHandler(async (req, res, next) => {
  const finalData = await FinalData.findById(req.params.id);
  
  if (!finalData) {
    return next(
      new ErrorResponse(`Final data not found with id of ${req.params.id}`, 404)
    );
  }
  
  await finalData.remove();
  
  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Search final data
// @route   GET /api/v1/final-data/search
// @access  Private/Admin
const searchFinalData = asyncHandler(async (req, res, next) => {
  const { q, page = 1, limit = 10 } = req.query;
  
  if (!q) {
    return next(new ErrorResponse('Please provide a search query', 400));
  }
  
  const results = await FinalData.search(q, { page, limit });
  
  res.status(200).json({
    success: true,
    ...results
  });
});

module.exports = {
  getFinalData,
  getSingleFinalData,
  createFinalData,
  updateFinalData,
  deleteFinalData,
  searchFinalData
};
