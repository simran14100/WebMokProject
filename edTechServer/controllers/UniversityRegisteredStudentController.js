

const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;
const path = require('path');
const UniversityRegisteredStudent = require('../models/UniversityRegisteredStudent');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to upload file to Cloudinary
const uploadToCloudinary = async (file, folder) => {
  try {
    if (!file || !file.tempFilePath) {
      throw new Error('Invalid file object');
    }

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: `edtech/${folder}`,
      resource_type: 'image',
      quality: 'auto:good',
      fetch_format: 'auto'
    });

    console.log(`Uploaded to Cloudinary:`, {
      url: result.secure_url,
      public_id: result.public_id,
      format: result.format,
      bytes: result.bytes
    });

    // Delete the temporary file after upload
    try {
      await fs.unlink(file.tempFilePath);
      console.log(`Temporary file deleted: ${file.tempFilePath}`);
    } catch (error) {
      console.error('Error deleting temporary file:', error);
    }

    return {
      url: result.secure_url,
      public_id: result.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    
    // Clean up temporary file even if upload fails
    if (file && file.tempFilePath) {
      try {
        await fs.unlink(file.tempFilePath);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }
    
    throw error;
  }
};

// @desc    Register a new student
// @route   POST /api/university/registered-students/register
// @access  Private/Admin
const registerStudent = asyncHandler(async (req, res) => {
  let photoUpload = null;
  let signatureUpload = null;
  
  try {
    console.log('\n=== New Student Registration Request ===');
    
    // Debug: Log what's actually received
    console.log('Request files:', req.files ? Object.keys(req.files) : 'No files');
    console.log('Request body keys:', Object.keys(req.body));
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'course'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }
    
    // Get files from req.files - handle both single file and array
    const { photo, signature } = req.files || {};
    
    // Debug: Log what files were received
    if (photo) {
      console.log('Photo received:', {
        isArray: Array.isArray(photo),
        type: typeof photo,
        details: Array.isArray(photo) ? photo[0] : photo
      });
    }
    
    if (signature) {
      console.log('Signature received:', {
        isArray: Array.isArray(signature),
        type: typeof signature,
        details: Array.isArray(signature) ? signature[0] : signature
      });
    }
    
    // Handle files - express-fileupload can return single object or array
    let photoFile, signatureFile;
    
    if (!photo) {
      return res.status(400).json({
        success: false,
        message: 'Photo file is required',
        code: 'MISSING_PHOTO'
      });
    } else {
      photoFile = Array.isArray(photo) ? photo[0] : photo;
    }
    
    if (!signature) {
      return res.status(400).json({
        success: false,
        message: 'Signature file is required',
        code: 'MISSING_SIGNATURE'
      });
    } else {
      signatureFile = Array.isArray(signature) ? signature[0] : signature;
    }
    
    // Validate file types
    const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validImageTypes.includes(photoFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Photo must be a JPEG or PNG image',
        code: 'INVALID_PHOTO_TYPE'
      });
    }
    
    if (!validImageTypes.includes(signatureFile.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Signature must be a JPEG or PNG image',
        code: 'INVALID_SIGNATURE_TYPE'
      });
    }
    
    // Log request body (excluding sensitive data)
    const { password, confirmPassword, ...safeBody } = req.body;
    console.log('Request body:', JSON.stringify(safeBody, null, 2));
    
    console.log('Processing files:', {
      photo: { 
        name: photoFile.name, 
        size: photoFile.size, 
        mimetype: photoFile.mimetype,
        tempFilePath: photoFile.tempFilePath
      },
      signature: { 
        name: signatureFile.name, 
        size: signatureFile.size, 
        mimetype: signatureFile.mimetype,
        tempFilePath: signatureFile.tempFilePath
      }
    });
    
    // Upload files to Cloudinary
    console.log('\nUploading files to Cloudinary...');
    
    try {
      // Upload files in parallel
      [photoUpload, signatureUpload] = await Promise.all([
        uploadToCloudinary(photoFile, 'student-photos'),
        uploadToCloudinary(signatureFile, 'student-signatures')
      ]);
      
      console.log('Files uploaded successfully:', {
        photo: photoUpload?.url || 'Failed',
        signature: signatureUpload?.url || 'Failed'
      });
      
    } catch (uploadError) {
      console.error('Cloudinary upload error:', uploadError);
      
      // Clean up any partial uploads
      const cleanupPromises = [];
      if (photoUpload?.public_id) {
        cleanupPromises.push(cloudinary.uploader.destroy(photoUpload.public_id));
      }
      if (signatureUpload?.public_id) {
        cleanupPromises.push(cloudinary.uploader.destroy(signatureUpload.public_id));
      }
      
      await Promise.all(cleanupPromises);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to upload files. Please try again.',
        error: process.env.NODE_ENV === 'development' ? uploadError.message : undefined
      });
    }
    
    // Check if files were uploaded successfully
    if (!photoUpload?.url || !signatureUpload?.url) {
      // Clean up any successful uploads
      const cleanupPromises = [];
      if (photoUpload?.public_id) {
        cleanupPromises.push(cloudinary.uploader.destroy(photoUpload.public_id));
      }
      if (signatureUpload?.public_id) {
        cleanupPromises.push(cloudinary.uploader.destroy(signatureUpload.public_id));
      }
      await Promise.all(cleanupPromises);
      
      return res.status(500).json({
        success: false,
        message: 'Failed to process file uploads. Please try again.'
      });
    }
    
    // Check if student with this Aadhar number already exists
    const existingStudent = await UniversityRegisteredStudent.findOne({ 
      aadharNumber: req.body.aadharNumber 
    });

    if (existingStudent) {
      // Clean up any uploaded files
      if (photoUpload?.public_id) await cloudinary.uploader.destroy(photoUpload.public_id);
      if (signatureUpload?.public_id) await cloudinary.uploader.destroy(signatureUpload.public_id);
      
      return res.status(400).json({
        success: false,
        message: 'A student with this Aadhar number is already registered',
        aadharNumber: req.body.aadharNumber
      });
    }

    // Create student data
    const studentData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      dateOfBirth: req.body.dateOfBirth,
      // Payment Information
      paymentMode: req.body.paymentMode || 'online',
      paymentStatus: req.body.paymentMode === 'cash' ? 'pending' : 'pending',
      paymentDetails: req.body.paymentMode === 'online' ? {
        amount: 1000,
        currency: 'INR',
        status: 'pending'
      } : undefined,
      
      gender: req.body.gender,
      aadharNumber: req.body.aadharNumber,
      email: req.body.email,
      phone: req.body.phone,
      alternatePhone: req.body.alternatePhone,
      source: req.body.source,
      referenceName: req.body.referenceName,
      referenceContact: req.body.referenceContact,
      referenceRelation: req.body.referenceRelation,
      address: {
        line1: req.body['address.line1'],
        line2: req.body['address.line2'],
        city: req.body['address.city'],
        state: req.body['address.state'],
        country: req.body['address.country'],
        pincode: req.body['address.pincode']
      },
      // lastQualification: req.body.lastQualification,
      // boardUniversity: req.body.boardUniversity,
      // yearOfPassing: req.body.yearOfPassing,
      // percentage: req.body.percentage,
      // New fields
      programType: req.body.programType,
      category: req.body.category,
      employment: {
        isEmployed: req.body['employment.isEmployed'] === 'true' || req.body?.employment?.isEmployed === true,
        designation: req.body['employment.designation'] || req.body?.employment?.designation || ''
      },
      academics: Array.isArray(req.body.academics) ? req.body.academics : [],
      course: req.body.course,
      specialization: req.body.specialization,
      isScholarship: req.body.isScholarship || false,
      hostelFacility: req.body.hostelFacility === 'true' || req.body.hostelFacility === true,
      transportFacility: req.body.transportFacility === 'true' || req.body.transportFacility === true,
      undertakingAccepted: req.body.undertakingAccepted === 'true' || req.body.undertakingAccepted === true,
      parent: {
        fatherName: req.body.fatherName || req.body['parent.fatherName'],
        fatherOccupation: req.body.fatherOccupation || req.body['parent.fatherOccupation'] || '',
      },
      motherName: req.body.motherName,
      
      motherOccupation: req.body.motherOccupation,
      parentPhone: req.body.parentPhone,
      parentEmail: req.body.parentEmail,
      guardianName: req.body.guardianName,
      relationWithGuardian: req.body.relationWithGuardian,
      guardianPhone: req.body.guardianPhone,
      guardianEmail: req.body.guardianEmail,
      additionalInfo: req.body.additionalInfo,
      photo: photoUpload.url,
      photoId: photoUpload.public_id,
      signature: signatureUpload.url,
      signatureId: signatureUpload.public_id,
      status: 'pending',
      registeredBy: req.user?.id || 'system'
    };
    
    // Remove undefined fields
    Object.keys(studentData).forEach(key => {
      if (studentData[key] === undefined) {
        delete studentData[key];
      }
    });
    
    // Log the final data being saved
    console.log('Student data to save:', JSON.stringify(studentData, null, 2));
    
    // Save to database
    const student = await UniversityRegisteredStudent.create(studentData);
    
    console.log('Student registered successfully:', {
      id: student._id,
      email: student.email,
      name: `${student.firstName} ${student.lastName}`,
      course: student.course,
      status: student.status
    });
    
    return res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: student
    });
    
  } catch (error) {
    console.error('Error in registerStudent:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Clean up any Cloudinary uploads if there was an error after upload
    const cleanupPromises = [];
    if (photoUpload?.public_id) {
      cleanupPromises.push(cloudinary.uploader.destroy(photoUpload.public_id));
    }
    if (signatureUpload?.public_id) {
      cleanupPromises.push(cloudinary.uploader.destroy(signatureUpload.public_id));
    }
    
    // Clean up temporary files
    if (req.files) {
      Object.values(req.files).forEach(file => {
        const files = Array.isArray(file) ? file : [file];
        files.forEach(singleFile => {
          if (singleFile && singleFile.tempFilePath) {
            cleanupPromises.push(
              fs.unlink(singleFile.tempFilePath).catch(console.error)
            );
          }
        });
      });
    }
    
    await Promise.allSettled(cleanupPromises);
    
    // Handle duplicate key errors (like duplicate email)
    if (error.name === 'MongoError' && error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`,
        field: field,
        code: 'DUPLICATE_ENTRY'
      });
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors,
        code: 'VALIDATION_ERROR'
      });
    }
    
    return res.status(500).json({
      success: false,
      message: 'Failed to register student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
      code: 'SERVER_ERROR'
    });
  }
});

// @desc    Check if a student with the given Aadhar number exists
// @route   GET /api/university/registered-students/check-aadhar/:aadhar
// @access  Private
const checkAadharExists = asyncHandler(async (req, res) => {
  try {
    const { aadhar } = req.params;
    
    // Log the user's role for debugging
    console.log('User checking Aadhar:', {
      userId: req.user?._id,
      role: req.user?.role || req.user?.accountType,
      aadhar: aadhar
    });
    
    if (!aadhar) {
      return res.status(400).json({
        success: false,
        message: 'Aadhar number is required'
      });
    }
    
    // Check if a student with this Aadhar number already exists
    const existingStudent = await UniversityRegisteredStudent.findOne({ 
      aadharNumber: aadhar
    });
    
    return res.status(200).json({
      success: true,
      exists: !!existingStudent
    });
    
  } catch (error) {
    console.error('Error checking Aadhar existence:', error);
    return res.status(500).json({
      success: false,
      message: 'Error checking Aadhar existence',
      error: error.message
    });
  }
});

// @desc    Get all registered students
// @route   GET /api/university/registered-students
// @access  Private/Admin
const getRegisteredStudents = asyncHandler(async (req, res) => {
  console.log('=== getRegisteredStudents called ===');
  console.log('Query params:', req.query);
  
  const { page = 1, limit = 10, status, search, registrationNumber } = req.query;
  
  // Create query object to filter students
  const query = {};
  
  // Filter by specific registration number if provided
  if (registrationNumber) {
    query.registrationNumber = { 
      $regex: registrationNumber, 
      $options: 'i'
    };
  }
  
  // Filter by status if specified, otherwise get all statuses
  if (status && status !== 'all') {
    query.status = status;
  } else {
    // Get all statuses for now to debug
    console.log('No status filter applied - getting all students regardless of status');
    // Remove status filter entirely to get all students
    delete query.status;
  }
  
  // Log the final query before execution
  console.log('Final query before execution:', JSON.stringify(query, null, 2));
  
  // Log all statuses in the database for debugging
  try {
    const statusCounts = await UniversityRegisteredStudent.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    console.log('Status counts in database:', statusCounts);
  } catch (err) {
    console.error('Error getting status counts:', err);
  }
  
  // Search by name, email, phone, or registration number
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { registrationNumber: { $regex: search, $options: 'i' } },
      { 'course.courseName': { $regex: search, $options: 'i' } },
      { courseName: { $regex: search, $options: 'i' } }
    ];
  }
  
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { createdAt: -1 },
    select: '-__v -updatedAt', // Removed -__v twice and kept it once
    populate: [
      {
        path: 'course',
        select: 'courseName courseType durationYear category',
        model: 'UGPGCourse'
      }
    ]
  };
  
  console.log('Final query:', JSON.stringify(query, null, 2));
  console.log('Options:', JSON.stringify(options, null, 2));
  
  try {
    // Execute the query with pagination
    const students = await UniversityRegisteredStudent.paginate(query, options);
    
    console.log('Query results - total students:', students.totalDocs);
    console.log('Students found:', students.docs.map(s => ({
      _id: s._id,
      name: `${s.firstName} ${s.lastName}`,
      email: s.email,
      status: s.status,
      course: s.course ? s.course.courseName : 'N/A'
    })));
    
    // Process the students to include courseName
    const processedStudents = students.docs.map(student => {
      const studentObj = student.toObject();
      return {
        ...studentObj,
        courseName: student.course?.courseName || 'N/A',
        courseType: student.course?.courseType || 'N/A'
      };
    });
    
    res.json({
      success: true,
      data: {
        students: processedStudents,
        pagination: {
          page: students.page,
          limit: students.limit,
          total: students.totalDocs,
          pages: students.totalPages,
          hasNext: students.hasNextPage,
          hasPrev: students.hasPrevPage
        }
      }
    });
  } catch (error) {
    console.error('Error in getRegisteredStudents:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching students',
      error: error.message
    });
  }
});
// @desc    Get single student
// @route   GET /api/university/registered-students/:id
// @access  Private/Admin
const getStudent = asyncHandler(async (req, res) => {
  const student = await UniversityRegisteredStudent.findById(req.params.id)
    .select('-__v');
  
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

// @desc    Update student status
// @route   PUT /api/university/registered-students/:id/status
// @access  Private/Admin
// const updateStudentStatus = asyncHandler(async (req, res) => {
//   const { status, remarks, verifiedBy } = req.body;
  
//   const validStatuses = ['pending', 'approved', 'rejected', 'completed'];
//   if (!validStatuses.includes(status)) {
//     return res.status(400).json({
//       success: false,
//       message: 'Invalid status. Must be one of: pending, approved, rejected, completed'
//     });
//   }
  
//   const student = await UniversityRegisteredStudent.findById(req.params.id);
  
//   if (!student) {
//     return res.status(404).json({
//       success: false,
//       message: 'Student not found'
//     });
//   }

//   // If status is being changed to 'approved', validate required fields
//   if (status === 'approved') {
//     // Only check the most critical fields
//     const requiredFields = ['photo', 'signature'];
    
//     const missingCriticalFields = requiredFields.filter(field => !student[field]);
    
//     // Special check for verification done by if status is being set to verified
//     if (verificationData.status === 'verified' && !verificationData.verifiedBy) {
//       missingCriticalFields.push('verifiedBy');
//     }

//     if (missingCriticalFields.length > 0) {
//       return res.status(400).json({
//         success: false,
//         message: `Cannot approve student. Missing required fields: ${missingCriticalFields.join(', ')}`,
//         code: 'MISSING_REQUIRED_FIELDS',
//         missingFields: missingCriticalFields
//       });
//     }
    
//     // For other fields, we'll trust the database state
//     // since the student might have been updated through other means
//   }
  
//   // Update status, remarks, and verification details
//   student.status = status;
//   if (remarks) student.remarks = remarks;
  
//   // If being approved, set verification details
//   if (status === 'approved') {
//     student.verificationDetails = {
//       verifiedBy: verifiedBy || req.user.id,
//       verifiedAt: new Date(),
//       status: 'verified',
//       remarks: remarks || 'Student verified and approved'
//     };
//     student.registrationStatus = 'completed';
//   }
  
//   const updatedStudent = await student.save();
  
//   res.json({
//     success: true,
//     message: `Student ${status} successfully`,
//     data: updatedStudent
//   });
// });

// @desc    Delete a student
// @route   DELETE /api/university/registered-students/:id
// @access  Private/Admin
const deleteStudent = asyncHandler(async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log(`Starting deletion of student ${req.params.id}...`);
    
    // Find the student to be deleted
    const student = await UniversityRegisteredStudent.findById(req.params.id).session(session);
    
    if (!student) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }
    
    // Delete from Cloudinary
    const cleanupPromises = [];
    if (student.photoId) {
      cleanupPromises.push(
        cloudinary.uploader.destroy(student.photoId).catch(err => 
          console.error('Error deleting photo from Cloudinary:', err.message)
        )
      );
    }
    if (student.signatureId) {
      cleanupPromises.push(
        cloudinary.uploader.destroy(student.signatureId).catch(err => 
          console.error('Error deleting signature from Cloudinary:', err.message)
        )
      );
    }
    
    // Wait for Cloudinary cleanup to complete
    await Promise.allSettled(cleanupPromises);
    
    // Delete the student (this will trigger the pre-remove hook to delete results)
    await UniversityRegisteredStudent.findByIdAndDelete(req.params.id).session(session);
    
    // Commit the transaction
    await session.commitTransaction();
    session.endSession();
    
    console.log(`Successfully deleted student ${req.params.id} and all associated results`);
    
    res.json({
      success: true,
      message: 'Student and all associated results deleted successfully',
      data: {}
    });
  } catch (error) {
    // If an error occurred, abort the transaction
    await session.abortTransaction();
    session.endSession();
    
    console.error('Error deleting student:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting student',
      error: error.message
    });
  }
});

// @desc    Update student information
// @route   PUT /api/university/registered-students/:id
// @access  Private/Admin
const updateStudent = asyncHandler(async (req, res) => {
  try {
    const student = await UniversityRegisteredStudent.findById(req.params.id);
    
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Handle file uploads if any
    if (req.files) {
      const uploadPromises = [];
      
      // Handle photo upload
      if (req.files.photo) {
        const photo = Array.isArray(req.files.photo) ? req.files.photo[0] : req.files.photo;
        uploadPromises.push(
          uploadToCloudinary(photo, 'photos')
            .then(uploadResult => {
              // Delete old photo from Cloudinary if exists
              if (student.photoId) {
                cloudinary.uploader.destroy(student.photoId).catch(console.error);
              }
              student.photo = uploadResult.url;
              student.photoId = uploadResult.public_id;
            })
        );
      }

      // Handle signature upload
      if (req.files.signature) {
        const signature = Array.isArray(req.files.signature) ? req.files.signature[0] : req.files.signature;
        uploadPromises.push(
          uploadToCloudinary(signature, 'signatures')
            .then(uploadResult => {
              // Delete old signature from Cloudinary if exists
              if (student.signatureId) {
                cloudinary.uploader.destroy(student.signatureId).catch(console.error);
              }
              student.signature = uploadResult.url;
              student.signatureId = uploadResult.public_id;
            })
        );
      }

      // Wait for all file uploads to complete
      await Promise.all(uploadPromises);
    }

    // Handle updates
    const updates = req.body;
    // List of allowed fields that can be updated
    const allowedUpdates = [
      // Personal Information
      'firstName', 'lastName', 'email', 'phone', 'alternatePhone', 'gender', 'dateOfBirth',
      'aadharNumber', 
      
      // Family Information
      'fatherName', 'motherName', 'guardianName', 'guardianPhone', 
      
      // Address Information
      'address', 'city', 'state', 'pincode', 'country',
      
      // Academic Information
      'lastQualification', 'lastSchool', 'boardUniversity', 'yearOfPassing', 
      'percentage', 'course', 'stream', 'specialization',
      
      // Registration Information
      'registrationNumber', 'enrollmentNumber', 'batchYear', 'semester',
      
      // Additional Information
      'isScholarship', 'source'
    ];

    // Apply updates
    Object.keys(updates).forEach(update => {
      if (allowedUpdates.includes(update)) {
        // Handle nested address object
        if (update === 'address' && typeof updates[update] === 'object') {
          // Merge the existing address with the new address fields
          student.address = student.address || {};
          Object.assign(student.address, updates[update]);
          // Remove any undefined values
          Object.keys(student.address).forEach(key => {
            if (student.address[key] === undefined) {
              delete student.address[key];
            }
          });
        } else if (updates[update] !== undefined && updates[update] !== null) {
          // Only update if the value is defined and not null
          student[update] = updates[update];
        }
      }
    });

    // Mark as modified if address was updated
    if (updates.address) {
      student.markModified('address');
    }

    // Save the updated student
    const updatedStudent = await student.save();

    res.json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent
    });

  } catch (error) {
    console.error('Error updating student:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });

    res.status(500).json({
      success: false,
      message: 'Error updating student',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error',
      code: 'UPDATE_ERROR'
    });
  }
});

module.exports = {
  registerStudent,
  checkAadharExists,
  getRegisteredStudents,
  getStudent,
  // updateStudentStatus,
  deleteStudent,
  updateStudent
};

// Export an additional function separately to avoid breaking existing exports
module.exports.getMyRegistrationStatus = asyncHandler(async (req, res) => {
  try {
    const userEmail = req.user?.email;
    const userPhone = req.user?.contactNumber || req.user?.phone;

    if (!userEmail && !userPhone) {
      return res.status(400).json({ success: false, message: 'Email or phone is required to check status' });
    }

    const query = {
      status: 'approved',
      $or: []
    };
    if (userEmail) {
      query.$or.push({ email: userEmail });
    }
    if (userPhone) {
      query.$or.push({ phone: userPhone });
    }
    if (query.$or.length === 0) delete query.$or;

    console.log('🔍 [getMyRegistrationStatus] Querying student with:', { userEmail, userPhone });
    
    // First, get the student record without population to verify the course ID
    const studentRecord = await UniversityRegisteredStudent.findOne(query).select('-__v').lean();
    
    if (!studentRecord) {
      console.log('❌ [getMyRegistrationStatus] No student record found');
      return res.json({ success: true, data: { matched: false, status: 'not_found' } });
    }
    
    console.log('✅ [getMyRegistrationStatus] Found student record. Course ID:', studentRecord.course);
    
    // Manually populate the course
    let populatedCourse = null;
    if (studentRecord.course) {
      try {
        // Try with UGGPCourse model first
        const UGGPCourse = mongoose.model('UGPGCourse');
        populatedCourse = await UGGPCourse.findById(studentRecord.course)
          .select('name code duration fee -_id')
          .lean();
          
        if (!populatedCourse) {
          console.log('⚠️ [getMyRegistrationStatus] Course not found with UGGPCourse model, trying Course model');
          // Fallback to Course model if UGGPCourse doesn't work
          const Course = mongoose.model('Course');
          populatedCourse = await Course.findById(studentRecord.course)
            .select('name code duration fee -_id')
            .lean();
        }
        
        console.log('📚 [getMyRegistrationStatus] Populated course:', populatedCourse);
      } catch (populateError) {
        console.error('❌ [getMyRegistrationStatus] Error populating course:', populateError);
      }
    }
    
    // Create the response object
    const responseData = {
      matched: true,
      status: studentRecord.status,
      firstName: studentRecord.firstName,
      lastName: studentRecord.lastName,
      email: studentRecord.email,
      registrationNumber: studentRecord.registrationNumber || null,
      registeredAt: studentRecord.registrationDate || studentRecord.createdAt,
      course: populatedCourse || null,
      ...studentRecord
    };

    console.log('📤 [getMyRegistrationStatus] Sending response with course data:', responseData.course);
    return res.json({
      success: true,
      data: responseData
    });
  } catch (error) {
    console.error('getMyRegistrationStatus error:', error);
    return res.status(500).json({ success: false, message: 'Failed to check registration status' });
  }
});