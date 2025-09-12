const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middlewares/auth');
const {
  createLeaveRequest,
  getAllLeaveRequests,
  updateLeaveRequestStatus,
  getMyLeaveRequests
} = require('../controllers/leaveRequestController');

// Student routes
router.post('/', auth, createLeaveRequest);
router.get('/my-requests', auth, getMyLeaveRequests);

// Admin routes
router.get('/', auth, isAdmin, getAllLeaveRequests);
router.patch('/:id/status', auth, isAdmin, updateLeaveRequestStatus);

module.exports = router;
