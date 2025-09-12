const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const LeaveRequest = require('../models/LeaveRequest');

// Temporary debug route to check leave requests
router.get('/debug/leave-requests', async (req, res) => {
  try {
    const requests = await LeaveRequest.find({}).limit(5);
    
    // Convert to plain objects to inspect the actual data
    const plainRequests = requests.map(doc => ({
      _id: doc._id,
      student: doc.student,
      studentType: typeof doc.student,
      status: doc.status,
      createdAt: doc.createdAt,
      toObject: doc.toObject()
    }));
    
    res.json({
      success: true,
      data: plainRequests
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error',
      error: error.message
    });
  }
});

module.exports = router;
