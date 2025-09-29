const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
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

// Parse JSON strings in request body
const parseRequestBody = (req, res, next) => {
  try {
    // If content-type is multipart/form-data, we don't need to parse JSON
    if (req.headers['content-type'] && req.headers['content-type'].startsWith('multipart/form-data')) {
      return next();
    }

    // If body is already parsed (e.g., by express.json())
    if (typeof req.body === 'object' && req.body !== null) {
      return next();
    }

    // Try to parse body as JSON if it's a string
    if (typeof req.body === 'string' || req.body instanceof String) {
      try {
        req.body = JSON.parse(req.body);
      } catch (parseError) {
        console.error('Error parsing request body:', parseError);
        return res.status(400).json({
          success: false,
          message: 'Invalid JSON in request body',
          code: 'INVALID_JSON'
        });
      }
    }
    next();
  } catch (error) {
    console.error('Error in parseRequestBody:', error);
    next(error);
  }
};

// File upload configuration
const fileUploadOptions = {
  useTempFiles: true,
  tempFileDir: tempDir,
  createParentPath: true,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
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
    res.status(413).json({
      success: false,
      message: 'File size exceeds 5MB limit',
      code: 'FILE_TOO_LARGE'
    });
  }
};

// File upload validation middleware
const validateFileUpload = (req, res, next) => {
  const requestId = `[${Math.random().toString(36).substr(2, 9)}]`;
  console.log(`\n${requestId} Starting file upload validation`);
  
  if (!req.files) {
    console.log(`${requestId} No files found in request`);
    return next();
  }

  const { photo, signature } = req.files;
  const errors = [];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  
  // Validate photo
  if (photo) {
    const photoFile = Array.isArray(photo) ? photo[0] : photo;
    console.log(`${requestId} Photo file:`, {
      name: photoFile.name,
      mimetype: photoFile.mimetype,
      size: photoFile.size
    });
    
    if (!photoFile.mimetype.startsWith('image/')) {
      errors.push('Photo must be an image file');
    } else if (!allowedMimeTypes.includes(photoFile.mimetype.toLowerCase())) {
      errors.push('Photo must be a JPG, JPEG, or PNG file');
    }
  } else {
    errors.push('Photo is required');
  }
  
  // Validate signature
  if (signature) {
    const sigFile = Array.isArray(signature) ? signature[0] : signature;
    console.log(`${requestId} Signature file:`, {
      name: sigFile.name,
      mimetype: sigFile.mimetype,
      size: sigFile.size
    });
    
    if (!sigFile.mimetype.startsWith('image/')) {
      errors.push('Signature must be an image file');
    } else if (!allowedMimeTypes.includes(sigFile.mimetype.toLowerCase())) {
      errors.push('Signature must be a JPG, JPEG, or PNG file');
    }
  } else {
    errors.push('Signature is required');
  }
  
  if (errors.length > 0) {
    console.log(`${requestId} Validation failed:`, errors);
    // Clean up uploaded files
    if (req.files) {
      Object.values(req.files).forEach(file => {
        const files = Array.isArray(file) ? file : [file];
        files.forEach(f => {
          if (f.tempFilePath) {
            unlinkAsync(f.tempFilePath).catch(console.error);
          }
        });
      });
    }
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
      code: 'VALIDATION_ERROR'
    });
  }
  
  console.log(`${requestId} File validation passed`);
  next();
};

const {
  getRazorpayKey,
  createOrder,
  verifyPayment
} = require('../controllers/paymentController');

// Import student registration controller
const { registerStudent } = require('../controllers/UniversityRegisteredStudentController');

// @route   GET /api/v1/payments/razorpay-key
// @desc    Get Razorpay key for client
// @access  Public
router.get('/razorpay-key', getRazorpayKey);

// @route   POST /api/v1/payments/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-order', auth, createOrder);

// @route   POST /api/v1/payments/verify
// @desc    Verify payment and register student with file uploads
// @access  Private
router.post('/verify', [
  auth,
  parseRequestBody,
  // File upload middleware
  (req, res, next) => {
    const upload = fileUpload(fileUploadOptions);
    
    upload(req, res, (err) => {
      if (err) {
        console.error('File upload error:', {
          message: err.message,
          code: err.code,
          stack: err.stack
        });
        
        let message = 'Error processing file upload';
        let status = 400;
        let code = 'UPLOAD_ERROR';
        
        if (err.message.includes('maxFileSize') || err.code === 'LIMIT_FILE_SIZE') {
          message = 'File size exceeds 5MB limit';
          status = 413;
          code = 'FILE_TOO_LARGE';
        } else if (err.message.includes('Unexpected field')) {
          message = 'Invalid file field name. Please use "photo" and "signature" as field names';
          code = 'INVALID_FIELD_NAME';
        } else if (err.message.includes('Unexpected end of form')) {
          message = 'The upload was interrupted. Please try again.';
          code = 'UPLOAD_INTERRUPTED';
        } else if (err.code === 'LIMIT_FILE_COUNT') {
          message = 'Maximum number of files exceeded. Please upload only photo and signature.';
          code = 'TOO_MANY_FILES';
        } else if (err.code === 'LIMIT_FIELD_KEY') {
          message = 'Field name too long';
          code = 'FIELD_NAME_TOO_LONG';
        } else if (err.code === 'LIMIT_FIELD_VALUE') {
          message = 'Field value too large';
          code = 'FIELD_VALUE_TOO_LARGE';
        } else if (err.code === 'LIMIT_FIELD_COUNT') {
          message = 'Too many fields';
          code = 'TOO_MANY_FIELDS';
        } else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          message = 'Unexpected file field';
          code = 'UNEXPECTED_FILE_FIELD';
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
  // File validation
  validateFileUpload,
  // Cleanup middleware
  (req, res, next) => {
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
  },
  // Verify payment
  verifyPayment,
  // Register student
  registerStudent
]);

module.exports = router;
