const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const LeaveRequest = require('../models/LeaveRequest');
const FeeAssignment = require('../models/feeAssignmentModel');
const UniversityRegisteredStudent = require('../models/UniversityRegisteredStudent');

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

// Debug route to check fee assignments
router.get('/debug/fee-assignments', async (req, res) => {
  try {
    // Get all fee assignments
    const feeAssignments = await FeeAssignment.find({}).limit(10);
    
    // Get all students to check references
    const students = await UniversityRegisteredStudent.find({
      _id: { $in: feeAssignments.map(fa => fa.student || fa.assigneeId).filter(Boolean) }
    });
    
    // Get student IDs for reference
    const studentIds = feeAssignments.map(fa => ({
      assignmentId: fa._id,
      studentRef: fa.student,
      assigneeRef: fa.assigneeId,
      studentType: typeof fa.student,
      assigneeType: typeof fa.assigneeId
    }));
    
    res.json({
      success: true,
      feeAssignments: feeAssignments.map(doc => ({
        _id: doc._id,
        student: doc.student,
        assigneeId: doc.assigneeId,
        feeType: doc.feeType,
        amount: doc.amount,
        course: doc.course,
        semester: doc.semester,
        session: doc.session,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt
      })),
      studentIds,
      students: students.map(s => ({
        _id: s._id,
        registrationNumber: s.registrationNumber,
        firstName: s.firstName,
        lastName: s.lastName
      }))
    });
  } catch (error) {
    console.error('Debug fee assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error',
      error: error.message,
      stack: error.stack
    });
  }
});

// Debug route to check a specific student's fee assignments
router.get('/debug/student-fee-assignments/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Try different query formats
    const assignments = await FeeAssignment.find({
      $or: [
        { student: studentId },
        { student: new mongoose.Types.ObjectId(studentId) },
        { assigneeId: studentId },
        { assigneeId: new mongoose.Types.ObjectId(studentId) }
      ]
    });
    
    // Get all fee assignments to check references
    const allAssignments = await FeeAssignment.find({}).limit(20);
    
    res.json({
      success: true,
      studentId,
      assignments,
      allAssignments: allAssignments.map(a => ({
        _id: a._id,
        student: a.student,
        assigneeId: a.assigneeId,
        feeType: a.feeType,
        amount: a.amount,
        course: a.course,
        semester: a.semester,
        session: a.session
      }))
    });
  } catch (error) {
    console.error('Debug student fee assignments error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error',
      error: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
