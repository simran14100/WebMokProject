// controllers/universityStudentVerificationController.js
const mongoose = require('mongoose');
const UniversityRegisteredStudent = require('../models/UniversityRegisteredStudent');

const asyncHandler = require('express-async-handler');

// Update student verification status
const updateStudentStatus = asyncHandler(async (req, res) => {
  const { status, remarks, verifiedBy } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be one of: pending, approved, rejected'
      });
    }
    
    const student = await UniversityRegisteredStudent.findById(req.params.id).session(session);
    
    if (!student) {
      await session.abortTransaction();
      session.endSession();
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
        await session.abortTransaction();
        session.endSession();
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
    
    // If being approved, set verification details and enroll student
    if (status === 'approved') {
      student.verificationDetails = {
        verifiedBy: verifiedBy || req.user.name,
        verifiedById: req.user.id,
        verifiedAt: new Date(),
        remarks: remarks || 'Student verified and approved'
      };
      
      // Check if student is already enrolled
      const existingEnrollment = await EnrolledStudent.findOne({ originalStudent: student._id }).session(session);
      
      if (!existingEnrollment) {
        // Generate enrollment number (format: MU/YY/XXXXX)
        const year = new Date().getFullYear().toString().slice(-2);
        const count = await EnrolledStudent.countDocuments().session(session) + 1;
        const enrollmentNo = `MU/${year}/${String(count).padStart(5, '0')}`;
        
        // Generate registration number (format: 25XXXXX)
        const regNo = `${year}${String(count).padStart(5, '0')}`;

        // Create enrolled student record
        const enrolledStudent = new EnrolledStudent({
          originalStudent: student._id,
          registrationNumber: regNo,
          enrollmentNumber: enrollmentNo,
          enrollmentDate: new Date(),
          course: student.course,
          status: 'active',
          personalDetails: {
            firstName: student.firstName,
            middleName: student.middleName,
            lastName: student.lastName,
            dateOfBirth: student.dateOfBirth,
            gender: student.gender,
            aadharNumber: student.aadharNumber,
            email: student.email,
            phone: student.phone,
            alternatePhone: student.alternatePhone,
            address: student.address
          },
          academicDetails: {
            lastQualification: student.lastQualification,
            boardUniversity: student.boardUniversity,
            yearOfPassing: student.yearOfPassing,
            percentage: student.percentage
          },
          parentDetails: {
            fatherName: student.parent?.fatherName,
            fatherOccupation: student.parent?.fatherOccupation,
            motherName: student.parent?.motherName,
            motherOccupation: student.parent?.motherOccupation
          },
          documents: student.documents,
          verificationDetails: {
            verifiedBy: verifiedBy || req.user.name,
            verifiedById: req.user.id,
            verifiedAt: new Date(),
            remarks: remarks || 'Student verified and enrolled'
          },
          createdBy: req.user.id
        });

        await enrolledStudent.save({ session });
        
        // Update original student with enrollment info
        student.enrollmentStatus = 'enrolled';
        student.enrollmentNumber = enrollmentNo;
        student.registrationNumber = regNo;
      }
    }
    
    const updatedStudent = await student.save({ session });
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({
      success: true,
      message: `Student ${status} successfully`,
      data: updatedStudent
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error updating student status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating student status',
      error: error.message
    });
  }
});

// Complete student verification with all details
// In universityStudentVerificationController.js

// Complete student verification with all details
const completeVerification = asyncHandler(async (req, res) => {
  try {
    const {
      photoVerified,
      signatureVerified,
      documents,
      verifiedBy,
      remarks,
      status
    } = req.body;

    console.log('Received verification data:', {
      photoVerified,
      signatureVerified,
      documents,
      verifiedBy,
      remarks,
      status
    });

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

    // Check if all required documents are submitted
    const requiredDocs = {
      registrationFee: documents.registrationFee,
      srSecondaryMarksheet: documents.srSecondaryMarksheet,
      graduationMarksheet: documents.graduationMarksheet,
      matricMarksheet: documents.matricMarksheet
    };

    const missingDocs = Object.entries(requiredDocs)
      .filter(([_, value]) => !value)
      .map(([key]) => key);

    if (missingDocs.length > 0) {
      return res.status(400).json({
        success: false,
        message: `The following documents are required: ${missingDocs.join(', ')}`,
        code: 'MISSING_REQUIRED_DOCS',
        missingDocuments: missingDocs
      });
    }

    // Update verification details
    const verificationDetails = {
      photoVerified,
      signatureVerified,
      documents: {
        registrationFee: !!documents.registrationFee,
        srSecondaryMarksheet: !!documents.srSecondaryMarksheet,
        graduationMarksheet: !!documents.graduationMarksheet,
        matricMarksheet: !!documents.matricMarksheet,
        pgMarksheet: !!documents.pgMarksheet,
        idProof: !!documents.idProof,
        isEligible: !!documents.isEligible
      },
      verifiedBy: verifiedBy || req.user?.name || 'System',
      verifiedById: req.user?.id || 'system',
      verifiedAt: new Date(),
      remarks: remarks || ''
    };

    // Update student document
    const updateData = {
      verificationDetails,
      status: status || 'approved',
      verifiedAt: new Date(),
      verifiedBy: verifiedBy || req.user?.name || 'System',
      registrationStatus: 'completed'
    };

    console.log('Updating student with:', updateData);

    const updatedStudent = await UniversityRegisteredStudent.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        success: false,
        message: 'Student not found after update'
      });
    }

    console.log('Student verification completed successfully:', updatedStudent._id);
    
    return res.status(200).json({
      success: true,
      message: 'Student verification completed successfully',
      data: updatedStudent
    });
    
  } catch (error) {
    console.error('Error in completeVerification:', error);
    return res.status(500).json({
      success: false,
      message: 'Error processing verification',
      error: error.message
    });
  }
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