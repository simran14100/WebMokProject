const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const unlinkAsync = promisify(fs.unlink);

// Ensure temp directory exists
const tempDir = path.join(__dirname, '../temp/uploads');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Cleanup middleware to remove temporary files
const cleanupUploads = (req, res, next) => {
  // Store reference to files for cleanup
  const filesToCleanup = req.files ? { ...req.files } : null;
  
  // Clean up after response is sent
  res.on('finish', async () => {
    if (filesToCleanup) {
      try {
        const cleanupPromises = [];
        
        Object.values(filesToCleanup).forEach(file => {
          const files = Array.isArray(file) ? file : [file];
          
          files.forEach(singleFile => {
            if (singleFile && singleFile.tempFilePath) {
              cleanupPromises.push(
                unlinkAsync(singleFile.tempFilePath).catch(error => {
                  console.error('Error cleaning up file:', error);
                })
              );
            }
          });
        });
        
        await Promise.allSettled(cleanupPromises);
        console.log('Cleaned up temporary files');
      } catch (error) {
        console.error('Error in cleanup:', error);
      }
    }
  });
  
  next();
};

// Parse JSON strings in request body
const parseRequestBody = (req, res, next) => {
  try {
    const processedBody = {};
    
    for (const [key, value] of Object.entries(req.body)) {
      try {
        if (typeof value === 'string') {
          const trimmed = value.trim();
          if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || 
              (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
            processedBody[key] = JSON.parse(trimmed);
          } else {
            processedBody[key] = value;
          }
        } else {
          processedBody[key] = value;
        }
      } catch (e) {
        console.error(`Error parsing field ${key}:`, e);
        processedBody[key] = value;
      }
    }
    
    req.body = processedBody;
    next();
  } catch (error) {
    console.error('Error processing request body:', error);
    res.status(400).json({
      success: false,
      message: 'Error processing form data'
    });
  }
};

// File upload configuration
const fileUploadOptions = {
  useTempFiles: true,
  tempFileDir: tempDir,
  createParentPath: true,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
    files: 2, // Maximum 2 files (photo and signature)
    parts: 50, // For multipart forms
    fieldSize: 1 * 1024 * 1024, // 1MB max field size
    fieldNameSize: 100, // Max field name size
  },
  abortOnLimit: true,
  safeFileNames: true,
  preserveExtension: 4,
  uploadTimeout: 300000, // 5 minutes
  debug: process.env.NODE_ENV === 'development',
  limitHandler: (req, res) => {
    return res.status(413).json({
      success: false,
      message: 'File size is too large. Maximum size is 10MB per file.'
    });
  }
};

// File upload validation middleware
const validateFileUpload = (req, res, next) => {
  const requestId = `[${Math.random().toString(36).substr(2, 9)}]`;
  console.log(`\n${requestId} Starting file upload validation`);
  
  // Check if files were uploaded
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No files were uploaded. Please upload both photo and signature.',
      code: 'NO_FILES'
    });
  }
  
  console.log(`${requestId} Received files:`, Object.keys(req.files));
  
  // Check for required files
  const requiredFiles = ['photo', 'signature'];
  const missingFiles = requiredFiles.filter(file => !req.files[file]);
  
  if (missingFiles.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required files: ${missingFiles.join(', ')}`,
      code: 'MISSING_FILES',
      missingFiles
    });
  }
  
  // Get files (handle both single file and array)
  const photo = Array.isArray(req.files.photo) ? req.files.photo[0] : req.files.photo;
  const signature = Array.isArray(req.files.signature) ? req.files.signature[0] : req.files.signature;
  
  // Validate file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  const invalidFiles = [];
  
  if (!allowedTypes.includes(photo.mimetype)) {
    invalidFiles.push('photo');
  }
  
  if (!allowedTypes.includes(signature.mimetype)) {
    invalidFiles.push('signature');
  }
  
  if (invalidFiles.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Only JPEG and PNG images are allowed',
      code: 'INVALID_FILE_TYPE',
      invalidFiles
    });
  }
  
  // Validate file sizes
  const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_SIGNATURE_SIZE = 5 * 1024 * 1024; // 5MB
  const oversizedFiles = [];
  
  if (photo.size > MAX_PHOTO_SIZE) {
    oversizedFiles.push('photo');
  }
  
  if (signature.size > MAX_SIGNATURE_SIZE) {
    oversizedFiles.push('signature');
  }
  
  if (oversizedFiles.length > 0) {
    return res.status(413).json({
      success: false,
      message: 'File size exceeds limit',
      code: 'FILE_TOO_LARGE',
      oversizedFiles,
      limits: {
        photo: '10MB',
        signature: '5MB'
      }
    });
  }
  
  // Attach validated files to request
  req.uploadedFiles = {
    photo,
    signature
  };
  
  console.log(`${requestId} Files validated successfully`);
  next();
};

// Import controllers
const {
  registerStudent,
  getRegisteredStudents,
  getStudent,
  updateStudentStatus,
  deleteStudent
} = require('../controllers/UniversityRegisteredStudentController');

// Apply authentication and authorization middleware to all routes
router.use(protect);
router.use(authorize('admin', 'superadmin'));

// Student registration route with file uploads
router.post('/register',
  // File upload middleware - must be first
  (req, res, next) => {
    const upload = fileUpload(fileUploadOptions);
    
    upload(req, res, (err) => {
      if (err) {
        console.error('File upload error:', {
          message: err.message,
          code: err.code
        });
        
        let message = 'Error processing file upload';
        let status = 400;
        
        if (err.message.includes('maxFileSize') || err.code === 'LIMIT_FILE_SIZE') {
          message = 'File size exceeds 10MB limit';
          status = 413;
        } else if (err.message.includes('Unexpected field')) {
          message = 'Invalid file field name. Please use "photo" and "signature" as field names';
        } else if (err.message.includes('Unexpected end of form')) {
          message = 'The upload was interrupted. Please try again.';
        }
        
        return res.status(status).json({
          success: false,
          message,
          code: 'UPLOAD_ERROR'
        });
      }
      
      next();
    });
  },
  
  // Cleanup middleware
  cleanupUploads,
  
  // File validation
  validateFileUpload,
  
  // Parse request body
  parseRequestBody,
  
  // Handle registration
  registerStudent
);

// Get all registered students
router.get('/', getRegisteredStudents);

// Get a single student by ID
router.get('/:id', getStudent);

// Update student status
router.put('/:id/status', updateStudentStatus);

// Delete a student
router.delete('/:id', deleteStudent);

module.exports = router;