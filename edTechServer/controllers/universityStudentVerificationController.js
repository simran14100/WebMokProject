// controllers/universityStudentVerificationController.js
const UniversityRegisteredStudent = require('../models/UniversityRegisteredStudent');
const asyncHandler = require('express-async-handler');

// Update student verification status
const updateStudentStatus = asyncHandler(async (req, res) => {
  const { status, remarks, verifiedBy } = req.body;
  
  const validStatuses = ['pending', 'approved', 'rejected'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be one of: pending, approved, rejected'
    });
  }
  
  const student = await UniversityRegisteredStudent.findById(req.params.id);
  
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // If status is being changed to 'approved', validate required fields
  if (status === 'approved') {
    const requiredFields = ['photo', 'signature'];
    const missingCriticalFields = requiredFields.filter(field => !student[field]);
    
    if (missingCriticalFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot approve student. Missing required fields: ${missingCriticalFields.join(', ')}`,
        code: 'MISSING_REQUIRED_FIELDS',
        missingFields: missingCriticalFields
      });
    }
  }
  
  // Update status and remarks
  student.status = status;
  if (remarks) student.remarks = remarks;
  
  // If being approved, set verification details
  if (status === 'approved') {
    student.verificationDetails = {
      verifiedBy: verifiedBy || req.user.name,
      verifiedById: req.user.id,
      verifiedAt: new Date(),
      remarks: remarks || 'Student verified and approved'
    };
  }
  
  const updatedStudent = await student.save();
  
  res.json({
    success: true,
    message: `Student ${status} successfully`,
    data: updatedStudent
  });
});

// Complete student verification with all details
const completeVerification = asyncHandler(async (req, res) => {
  const {
    photoVerified,
    signatureVerified,
    documents,
    verifiedBy,
    remarks
  } = req.body;

  const student = await UniversityRegisteredStudent.findById(req.params.id);
  
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  // Validate required verification fields
  if (typeof photoVerified !== 'boolean' || typeof signatureVerified !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'Photo and signature verification status are required'
    });
  }

  // Validate documents object
  if (!documents || typeof documents !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Documents verification data is required'
    });
  }

  // Update verification details
  student.verificationDetails = {
    photoVerified,
    signatureVerified,
    documents: {
      registrationFee: documents.registrationFee || false,
      srSecondaryMarksheet: documents.srSecondaryMarksheet || false,
      graduationMarksheet: documents.graduationMarksheet || false,
      matricMarksheet: documents.matricMarksheet || false,
      pgMarksheet: documents.pgMarksheet || false,
      idProof: documents.idProof || false,
      isEligible: documents.isEligible || false
    },
    verifiedBy: verifiedBy || req.user.name,
    verifiedById: req.user.id,
    verifiedAt: new Date(),
    remarks: remarks || ''
  };

  // Update student status based on verification
  if (documents.isEligible && photoVerified && signatureVerified) {
    student.status = 'approved';
  } else {
    student.status = 'rejected';
  }

  const updatedStudent = await student.save();

  res.json({
    success: true,
    message: 'Student verification completed successfully',
    data: updatedStudent
  });
});

// Get student details for verification
const getStudentForVerification = asyncHandler(async (req, res) => {
  const student = await UniversityRegisteredStudent.findById(req.params.id);
  
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  res.json({
    success: true,
    data: student
  });
});

module.exports = {
  updateStudentStatus,
  completeVerification,
  getStudentForVerification
};