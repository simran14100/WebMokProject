const asyncHandler = require('express-async-handler');
const cloudinary = require('cloudinary').v2;
const UniversityRegisteredStudent = require('../models/UniversityRegisteredStudent');
const { uploadImageToCloudinary } = require('../utils/imageUploader');
const { v4: uuidv4 } = require('uuid');

// @desc    Register a new student
// @route   POST /api/university/registered-students
// @access  Private/Admin
const registerStudent = asyncHandler(async (req, res) => {
  console.log('=== Starting student registration ===');
  
  // Log request details
  console.log('Request method:', req.method);
  console.log('Content-Type:', req.headers['content-type']);
  console.log('Request body fields:', Object.keys(req.body || {}));
  console.log('Files received:', req.files ? Object.keys(req.files) : 'No files');
  
  // Validate request contains required fields
  const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'gender', 'email', 'phone'];
  const missingFields = requiredFields.filter(field => !req.body[field]);
  
  if (missingFields.length > 0) {
    console.error('Missing required fields:', missingFields);
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(', ')}`
    });
  }
  
  // Log file details if they exist
  if (req.files) {
    console.log('=== File Upload Details ===');
    Object.entries(req.files).forEach(([field, file]) => {
      const fileObj = Array.isArray(file) ? file[0] : file;
      console.log(`File [${field}]:`, {
        name: fileObj.name,
        size: fileObj.size,
        mimetype: fileObj.mimetype,
        tempFilePath: fileObj.tempFilePath || 'In memory',
        truncated: fileObj.truncated,
        data: fileObj.data ? `${fileObj.data.length} bytes` : 'No data',
        encoding: fileObj.encoding
      });
      
      // Check if file was truncated during upload
      if (fileObj.truncated) {
        console.error(`File ${field} was truncated during upload`);
        return res.status(400).json({
          success: false,
          message: `The ${field} file was not fully uploaded. Please try again with a smaller file.`
        });
      }
    });
  }

  try {
    // Parse JSON fields if they're strings (happens with FormData)
    const formData = { ...req.body };
    
    // Log initial form data
    console.log('Initial form data:', JSON.stringify(formData, null, 2));
    
    // Handle JSON string fields
    const jsonFields = ['parent', 'address'];
    jsonFields.forEach(field => {
      if (formData[field] && typeof formData[field] === 'string') {
        try {
          formData[field] = JSON.parse(formData[field]);
          console.log(`Parsed ${field}:`, formData[field]);
        } catch (e) {
          console.error(`Error parsing ${field}:`, e);
          // Don't fail the request, just keep the string value
        }
      }
    });

    // Extract fields from form data
    const {
      firstName, middleName, lastName, dateOfBirth, gender, aadharNumber,
      email, phone, alternatePhone,
      address,
      lastQualification, boardUniversity, yearOfPassing, percentage,
      course, specialization,
      parent,
      source, reference,
      notes
    } = formData;

    // Check if required fields are present
    if (!firstName || !lastName || !email || !aadharNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: firstName, lastName, email, aadharNumber'
      });
    }

    // Check if student already exists with same Aadhar or Email
    const existingStudent = await UniversityRegisteredStudent.findOne({
      $or: [
        { aadharNumber },
        { email: email.toLowerCase() }
      ]
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'Student with this Aadhar number or Email already exists'
      });
    }

    // Handle file uploads to Cloudinary if present
    let photoUrl = '';
    let signatureUrl = '';

    // Helper function to handle file upload
    const handleFileUpload = async (file, folder, height = null, quality = 90) => {
      if (!file) {
        console.log(`No file provided for ${folder}, skipping upload`);
        return '';
      }
      
      try {
        // Get the file (handle both single file and array of files)
        const fileToUpload = Array.isArray(file) ? file[0] : file;
        
        // Ensure we have file data
        if (!fileToUpload) {
          console.warn(`No file object found for ${folder}`);
          return '';
        }

        // Check if we have data or temp file path
        const hasData = fileToUpload.data && fileToUpload.data.length > 0;
        const hasTempPath = fileToUpload.tempFilePath;
        
        if (!hasData && !hasTempPath) {
          console.warn(`No file data or temp file path available for ${folder}`);
          return '';
        }

        console.log(`Uploading ${folder} (${fileToUpload.name}, ${fileToUpload.size} bytes, ${fileToUpload.mimetype})`);
        
        const uploadResult = await uploadImageToCloudinary(
          fileToUpload,
          `university/students/${folder}`,
          height,
          quality
        );
        
        if (!uploadResult || !uploadResult.secure_url) {
          console.error(`Upload result is invalid for ${folder}:`, uploadResult);
          throw new Error(`Failed to upload ${folder}: Invalid response from Cloudinary`);
        }
        
        console.log(`Successfully uploaded ${folder} to:`, uploadResult.secure_url);
        return uploadResult.secure_url;
      } catch (error) {
        console.error(`Error uploading ${folder}:`, {
          error: error.message,
          stack: error.stack,
          file: {
            name: file?.name,
            size: file?.size,
            type: file?.mimetype,
            hasData: !!(file?.data)
          }
        });
        throw error; // Re-throw to be handled by the caller
      }
    };

    // Process file uploads if any
    const uploadResults = {
      photo: null,
      signature: null
    };

    try {
      // Process photo upload if it exists
      if (req.files?.photo) {
        const photoFile = Array.isArray(req.files.photo) ? req.files.photo[0] : req.files.photo;
        console.log('Processing photo upload:', {
          name: photoFile.name,
          size: photoFile.size,
          mimetype: photoFile.mimetype
        });
        
        try {
          const result = await uploadImageToCloudinary(photoFile, 'university/students/photos');
          console.log('Photo upload successful:', result.secure_url);
          uploadResults.photo = result;
        } catch (error) {
          console.error('Error uploading photo:', error);
          throw new Error(`Failed to upload photo: ${error.message}`);
        }
      } else {
        console.log('No photo file provided');
      }
      
      // Process signature upload if it exists
      if (req.files?.signature) {
        const signatureFile = Array.isArray(req.files.signature) 
          ? req.files.signature[0] 
          : req.files.signature;
          
        console.log('Processing signature upload:', {
          name: signatureFile.name,
          size: signatureFile.size,
          mimetype: signatureFile.mimetype
        });
        
        try {
          const result = await uploadImageToCloudinary(
            signatureFile, 
            'university/students/signatures', 
            200, 
            90
          );
          console.log('Signature upload successful:', result.secure_url);
          uploadResults.signature = result;
        } catch (error) {
          console.error('Error uploading signature:', error);
          throw new Error(`Failed to upload signature: ${error.message}`);
        }
      } else {
        console.log('No signature file provided');
      }
    } catch (uploadError) {
      console.error('Error in file uploads:', uploadError);
      
      // Clean up any successfully uploaded files if there was an error
      if (uploadResults.photo?.public_id) {
        console.log('Cleaning up uploaded photo due to error');
        try {
          await cloudinary.uploader.destroy(uploadResults.photo.public_id);
        } catch (cleanupError) {
          console.error('Error cleaning up photo:', cleanupError);
        }
      }
      
      if (uploadResults.signature?.public_id) {
        console.log('Cleaning up uploaded signature due to error');
        try {
          await cloudinary.uploader.destroy(uploadResults.signature.public_id);
        } catch (cleanupError) {
          console.error('Error cleaning up signature:', cleanupError);
        }
      }
      
      throw uploadError; // Re-throw the error to be caught by the main try-catch
    }

    // Prepare student data object with file upload results
    const studentRecord = {
      firstName: firstName.trim(),
      middleName: middleName ? middleName.trim() : '',
      lastName: lastName.trim(),
      dateOfBirth,
      gender,
      aadharNumber: aadharNumber.toString().trim(),
      email: email.toLowerCase().trim(),
      // Add file URLs if uploads were successful
      ...(uploadResults.photo && {
        photo: uploadResults.photo.secure_url,
        photoPublicId: uploadResults.photo.public_id
      }),
      ...(uploadResults.signature && {
        signature: uploadResults.signature.secure_url,
        signaturePublicId: uploadResults.signature.public_id
      }),
      phone: phone.toString().trim(),
      alternatePhone: alternatePhone ? alternatePhone.toString().trim() : undefined,
      address,
      lastQualification,
      boardUniversity,
      yearOfPassing,
      percentage: parseFloat(percentage) || 0,
      course,
      specialization,
      parent,
      source,
      reference,
      notes,
      registrationNumber: `STU-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      ...(photoUrl && { photo: photoUrl }),
      ...(signatureUrl && { signature: signatureUrl })
    };

    console.log('Creating student record with data:', {
      ...studentRecord,
      photo: studentRecord.photo ? '*** Photo URL Set ***' : 'No Photo',
      signature: studentRecord.signature ? '*** Signature URL Set ***' : 'No Signature'
    });

    // Create new student record
    const student = await UniversityRegisteredStudent.create(studentRecord);

    console.log('Student registration successful:', student._id);
    
    res.status(201).json({
      success: true,
      message: 'Student registered successfully',
      data: student
    });
  } catch (error) {
    console.error('Error in registerStudent:', {
      error: error.message,
      stack: error.stack,
      body: req.body,
      files: req.files ? Object.keys(req.files) : 'No files'
    });
    
    // More specific error messages based on error type
    let errorMessage = 'Server error during student registration';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + Object.values(error.errors).map(e => e.message).join(', ');
      statusCode = 400;
    } else if (error.name === 'MongoError' && error.code === 11000) {
      errorMessage = 'Duplicate entry. A student with this email or Aadhar number already exists.';
      statusCode = 400;
    } else if (error.message.includes('upload failed') || error.message.includes('Cloudinary')) {
      errorMessage = 'File upload failed. Please try again with valid files.';
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: error.code
    });
  }
});

// @desc    Get all registered students
// @route   GET /api/university/registered-students
// @access  Private/Admin
const getRegisteredStudents = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status, search } = req.query;
  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { 'aadharNumber': { $regex: search } },
      { 'registrationNumber': { $regex: search, $options: 'i' } }
    ];
  }

  const students = await UniversityRegisteredStudent.find(query)
    .populate('course', 'name code')
    .populate('createdBy', 'name email')
    .sort('-createdAt')
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await UniversityRegisteredStudent.countDocuments(query);

  res.json({
    success: true,
    count,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    data: students
  });
});

// @desc    Get single registered student
// @route   GET /api/university/registered-students/:id
// @access  Private/Admin
const getStudent = asyncHandler(async (req, res) => {
  const student = await UniversityRegisteredStudent.findById(req.params.id)
    .populate('course', 'name code')
    .populate('createdBy', 'name email');

  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  res.json({
    success: true,
    data: student
  });
});

// @desc    Update student status
// @route   PUT /api/university/registered-students/:id/status
// @access  Private/Admin
const updateStudentStatus = asyncHandler(async (req, res) => {
  const { status, remarks } = req.body;
  
  const student = await UniversityRegisteredStudent.findById(req.params.id);
  
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  student.status = status;
  
  if (remarks) {
    if (!student.notes) student.notes = '';
    student.notes += `\n[Status Update - ${new Date().toLocaleString()}] ${remarks}`;
  }

  student.updatedBy = req.user.id;
  student.updatedAt = Date.now();

  await student.save();

  res.json({
    success: true,
    data: student,
    message: 'Student status updated successfully'
  });
});

// @desc    Delete a registered student
// @route   DELETE /api/university/registered-students/:id
// @access  Private/Admin
const deleteStudent = asyncHandler(async (req, res) => {
  const student = await UniversityRegisteredStudent.findById(req.params.id);
  
  if (!student) {
    res.status(404);
    throw new Error('Student not found');
  }

  // Delete associated files from Cloudinary
  try {
    if (student.photo) {
      const publicId = student.photo.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`university/students/photos/${publicId}`);
    }
    
    if (student.signature) {
      const publicId = student.signature.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`university/students/signatures/${publicId}`, 
        { resource_type: 'image' });
    }
  } catch (error) {
    console.error('Error deleting files from Cloudinary:', error);
    // Continue with deletion even if file deletion fails
  }

  await student.remove();

  res.json({
    success: true,
    message: 'Student removed successfully'
  });
});

module.exports = {
  registerStudent,
  getRegisteredStudents,
  getStudent,
  updateStudentStatus,
  deleteStudent
};
