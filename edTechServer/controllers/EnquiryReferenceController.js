const EnquiryReference = require('../models/EnquiryReference');
const { validationResult } = require('express-validator');

// @desc    Get all enquiry references
// @route   GET /api/enquiry-references
// @access  Private/Admin
const getAllEnquiryReferences = async (req, res) => {
  try {
    const { search, status, sort = '-createdAt', page = 1, limit = 10 } = req.query;
    
    const query = {};
    
    // Search filter
    if (search) {
      query.$text = { $search: search };
    }
    
    // Status filter
    if (status) {
      query.status = status;
    }
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort,
      populate: 'createdBy',
      select: '-__v'
    };
    
    const result = await EnquiryReference.paginate(query, options);
    
    res.json({
      success: true,
      data: result.docs,
      pagination: {
        total: result.totalDocs,
        page: result.page,
        pages: result.totalPages,
        limit: result.limit
      }
    });
  } catch (error) {
    console.error('Error fetching enquiry references:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single enquiry reference
// @route   GET /api/enquiry-references/:id
// @access  Private/Admin
const getEnquiryReferenceById = async (req, res) => {
  try {
    const enquiry = await EnquiryReference.findById(req.params.id)
      .populate('createdBy', 'name email')
      .select('-__v');
      
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry reference not found'
      });
    }
    
    res.json({
      success: true,
      data: enquiry
    });
  } catch (error) {
    console.error('Error fetching enquiry reference:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new enquiry reference
// @route   POST /api/enquiry-references
// @access  Private/Admin
const createEnquiryReference = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const { name, email, contact, reference, status, notes } = req.body;
    
    const newEnquiry = new EnquiryReference({
      name,
      email,
      contact,
      reference,
      status: status || 'Pending',
      notes,
      createdBy: req.user.id
    });
    
    const savedEnquiry = await newEnquiry.save();
    
    res.status(201).json({
      success: true,
      data: savedEnquiry
    });
  } catch (error) {
    console.error('Error creating enquiry reference:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update enquiry reference
// @route   PUT /api/enquiry-references/:id
// @access  Private/Admin
const updateEnquiryReference = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array()
    });
  }
  
  try {
    const { name, email, contact, reference, status, notes } = req.body;
    
    const enquiry = await EnquiryReference.findById(req.params.id);
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry reference not found'
      });
    }
    
    // Update fields
    enquiry.name = name || enquiry.name;
    enquiry.email = email || enquiry.email;
    enquiry.contact = contact || enquiry.contact;
    enquiry.reference = reference || enquiry.reference;
    if (status) enquiry.status = status;
    if (notes !== undefined) enquiry.notes = notes;
    
    const updatedEnquiry = await enquiry.save();
    
    res.json({
      success: true,
      data: updatedEnquiry
    });
  } catch (error) {
    console.error('Error updating enquiry reference:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete enquiry reference
// @route   DELETE /api/enquiry-references/:id
// @access  Private/Admin
const deleteEnquiryReference = async (req, res) => {
  try {
    const enquiry = await EnquiryReference.findById(req.params.id);
    
    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: 'Enquiry reference not found'
      });
    }
    
    await enquiry.remove();
    
    res.json({
      success: true,
      message: 'Enquiry reference deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting enquiry reference:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getAllEnquiryReferences,
  getEnquiryReferenceById,
  createEnquiryReference,
  updateEnquiryReference,
  deleteEnquiryReference
};
