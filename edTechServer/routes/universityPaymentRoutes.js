const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { 
  recordPayment, 
  getPaymentHistory, 
  getFeeDetails,
  getPaymentReceipt,
  assignFeesToStudent
} = require('../controllers/universityPaymentController');
const UniversityPayment = require('../models/UniversityPayment');

// Apply protect middleware to all routes
router.use(protect);

// @route   POST /api/v1/university/payments/:studentId
// @desc    Record a new payment for a student
// @access  Private/Admin,Accountant,SuperAdmin
router.post('/:studentId', authorize('admin', 'accountant', 'SuperAdmin'), recordPayment);

// @route   GET /api/v1/university/payments/:studentId/history
// @desc    Get payment history for a student
// @access  Private/Admin,Accountant,Student,SuperAdmin
router.get('/:studentId/history', authorize('admin', 'accountant', 'student', 'SuperAdmin'), getPaymentHistory);

// @route   GET /api/v1/university/payments/receipts/:paymentId
// @desc    Get payment receipt by ID
// @access  Private/Admin,Accountant,Student,SuperAdmin
router.get('/receipts/:paymentId', authorize('admin', 'accountant', 'student', 'SuperAdmin'), getPaymentReceipt);

// @route   GET /api/v1/university/payments/fee-details/:studentId
// @desc    Get fee details for a student
// @access  Private/Admin,Accountant,Student,SuperAdmin
router.get('/fee-details/:studentId', authorize('admin', 'accountant', 'student', 'SuperAdmin'), async (req, res) => {
  try {
    console.log('Fee details route hit with params:', req.params);
    await getFeeDetails(req, res);
  } catch (error) {
    console.error('Error in fee details route:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// @route   POST /api/v1/university/payments/assign-fees/:studentId
router.post('/assign-fees/:studentId', authorize('admin', 'accountant', 'SuperAdmin'), (req, res, next) => {
  assignFeesToStudent(req, res, next);
});

// @route   GET /api/v1/university/payments
// @desc    Get all payments with filters (for reporting)
// @access  Private/Admin,Accountant,SuperAdmin
router.get('/', authorize('admin', 'accountant', 'SuperAdmin'), async (req, res, next) => {
  try {
    const { 
      startDate, 
      endDate, 
      feeType, 
      status, 
      paymentMethod, 
      page = 1, 
      limit = 10,
      studentId
    } = req.query;
    
    const query = {};
    
    // Filter by student if provided
    if (studentId) {
      query.student = studentId;
    }
    
    // Date range filter
    if (startDate || endDate) {
      query.paymentDate = {};
      if (startDate) query.paymentDate.$gte = new Date(startDate);
      if (endDate) query.paymentDate.$lte = new Date(endDate);
    }
    
    // Other filters
    if (feeType) query.feeType = feeType;
    if (status) query.status = status;
    if (paymentMethod) query.modeOfPayment = paymentMethod;
    
    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { paymentDate: -1 },
      populate: [
        { path: 'student', select: 'firstName lastName registrationNumber' },
        { path: 'createdBy', select: 'firstName lastName' },
        { path: 'feeAssignment', select: 'feeType totalAmount' }
      ]
    };
    
    const payments = await UniversityPayment.paginate(query, options);
    
    res.status(200).json({
      success: true,
      data: payments
    });
    
  } catch (error) {
    next(error);
  }
});

module.exports = router;
