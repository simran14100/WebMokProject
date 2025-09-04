const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
  registerStudent,
  getRegisteredStudents,
  getStudent,
  updateStudentStatus,
  deleteStudent
} = require('../controllers/UniversityRegisteredStudentController');

const fileUpload = require('express-fileupload');

// File upload configuration - using temp files for better memory management
const uploadMiddleware = (req, res, next) => {
    // Log incoming request headers for debugging
    console.log('Incoming request headers:', {
        'content-type': req.headers['content-type'],
        'content-length': req.headers['content-length'],
        'content-encoding': req.headers['content-encoding'],
        'transfer-encoding': req.headers['transfer-encoding']
    });

    // Configure file upload middleware with temp files
    return fileUpload({
        useTempFiles: true, // Use temp files instead of memory
        tempFileDir: '/tmp/uploads', // Use system temp directory
        limits: { 
            fileSize: 20 * 1024 * 1024, // 20MB limit per file
            files: 2, // Maximum 2 files (photo and signature)
            fields: 200, // Increased number of fields
            parts: 400, // Increased total parts (fields + files)
            headerPairs: 200 // Increased header pairs
        },
        createParentPath: true,
        abortOnLimit: true, // Abort on limit to prevent hanging connections
        safeFileNames: true,
        preserveExtension: 4, // Keep up to 4 characters of extension
        parseNested: true, // Parse nested JSON fields
        debug: process.env.NODE_ENV !== 'production',
        
        // Handle various upload errors
        limitHandler: (req, res) => {
            console.error('File upload limit exceeded');
            return res.status(413).json({
                success: false,
                message: 'File size is too large. Maximum 20MB per file allowed.'
            });
        },
        
        // Handle other upload errors
        responseOnLimit: JSON.stringify({
            success: false,
            message: 'File upload limit reached. Please try smaller files.'
        })
    })(req, res, (err) => {
        if (err) {
            console.error('File upload middleware error:', {
                message: err.message,
                code: err.code,
                stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
            });
            
            if (err.code === 'LIMIT_FILE_SIZE') {
                return res.status(413).json({
                    success: false,
                    message: 'File size is too large. Maximum 10MB per file allowed.'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Error processing file upload',
                error: process.env.NODE_ENV === 'development' ? err.message : undefined
            });
        }
        next();
    });
};

// File validation middleware with enhanced error handling and logging
const validateFiles = (req, res, next) => {
    try {
        // Log request files for debugging
        console.log('Request files:', req.files ? Object.keys(req.files) : 'No files found');
        
        // Check if files exist in the request
        if (!req.files || Object.keys(req.files).length === 0) {
            console.log('No files were uploaded');
            return next(); // No files to validate
        }

        const { photo, signature } = req.files;
        
        // Log file information for debugging
        if (photo) {
            console.log('Photo file info:', {
                name: photo.name,
                size: photo.size,
                mimetype: photo.mimetype,
                tempFilePath: photo.tempFilePath,
                truncated: photo.truncated,
                md5: photo.md5
            });
            
            // Validate photo file
            const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
            if (!validImageTypes.includes(photo.mimetype)) {
                console.error('Invalid photo file type:', photo.mimetype);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid file type for photo. Only JPG, JPEG, PNG, and WebP are allowed.'
                });
            }
            
            // Check file size
            const maxFileSize = 20 * 1024 * 1024; // 20MB
            if (photo.size > maxFileSize) {
                console.error('Photo file size exceeds limit:', photo.size);
                return res.status(413).json({
                    success: false,
                    message: `Photo size (${(photo.size / (1024 * 1024)).toFixed(2)}MB) exceeds the 20MB limit.`
                });
            }
            
            // Ensure the file was not truncated during upload
            if (photo.truncated) {
                console.error('Photo file was truncated during upload');
                return res.status(400).json({
                    success: false,
                    message: 'The photo file was not fully uploaded. Please try again.'
                });
            }
        }
        
        // Validate signature if present
        if (signature) {
            console.log('Signature file info:', {
                name: signature.name,
                size: signature.size,
                mimetype: signature.mimetype,
                tempFilePath: signature.tempFilePath,
                truncated: signature.truncated,
                md5: signature.md5
            });
            
            const validSignatureTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/svg+xml', 'image/webp'];
            if (!validSignatureTypes.includes(signature.mimetype)) {
                console.error('Invalid signature file type:', signature.mimetype);
                return res.status(400).json({
                    success: false,
                    message: 'Invalid file type for signature. Only JPG, JPEG, PNG, SVG, and WebP are allowed.'
                });
            }
            
            // Check file size
            const maxFileSize = 20 * 1024 * 1024; // 20MB
            if (signature.size > maxFileSize) {
                console.error('Signature file size exceeds limit:', signature.size);
                return res.status(413).json({
                    success: false,
                    message: `Signature size (${(signature.size / (1024 * 1024)).toFixed(2)}MB) exceeds the 20MB limit.`
                });
            }
            
            // Ensure the file was not truncated during upload
            if (signature.truncated) {
                console.error('Signature file was truncated during upload');
                return res.status(400).json({
                    success: false,
                    message: 'The signature file was not fully uploaded. Please try again.'
                });
            }
        }
        
        // If we got here, all validations passed
        console.log('File validation passed');
        next();
        
    } catch (error) {
        console.error('Error in file validation middleware:', {
            message: error.message,
            stack: error.stack,
            name: error.name
        });
        
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing the uploaded files.',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Protected routes - require authentication
router.use(protect);

// Only admin can access these routes
router.use(authorize('admin', 'superadmin'));

// Handle student registration and listing
router.route('/')
  .get(getRegisteredStudents)
  .post(
    // Log incoming request
    (req, res, next) => {
      console.log('=== New Student Registration Request ===');
      console.log('Content-Type:', req.headers['content-type']);
      console.log('Content-Length:', req.headers['content-length']);
      console.log('Method:', req.method);
      
      // Log headers for debugging
      console.log('Request Headers:', {
        'content-type': req.headers['content-type'],
        'content-length': req.headers['content-length']
      });
      
      // Ensure we have a proper content-type for multipart
      if (!req.headers['content-type'] || 
          !req.headers['content-type'].includes('multipart/form-data')) {
        console.warn('Invalid content-type for file upload');
      }
      
      next();
    },
    
    // Apply file upload middleware with error handling
    (req, res, next) => {
      // Log before processing files
      console.log('Processing file upload...');
      
      uploadMiddleware(req, res, (err) => {
        if (err) {
          console.error('File upload middleware error:', {
            error: err.message,
            stack: err.stack,
            headers: req.headers,
            body: Object.keys(req.body || {})
          });
          
          return res.status(400).json({
            success: false,
            message: 'File upload error: ' + (err.message || 'Unknown error'),
            code: 'FILE_UPLOAD_ERROR'
          });
        }
        next();
      });
    },
    
    // Log upload results
    (req, res, next) => {
      console.log('=== Upload Processing Complete ===');
      console.log('Request body fields:', Object.keys(req.body || {}));
      
      if (req.files) {
        console.log(`Received ${Object.keys(req.files).length} file(s):`, 
          Object.keys(req.files));
          
        Object.entries(req.files).forEach(([field, file]) => {
          const fileObj = Array.isArray(file) ? file[0] : file;
          console.log(`File [${field}]:`, {
            name: fileObj.name,
            size: fileObj.size,
            mimetype: fileObj.mimetype,
            encoding: fileObj.encoding,
            truncated: fileObj.truncated,
            data: fileObj.data ? `${fileObj.data.length} bytes` : 'No data',
            tempFilePath: fileObj.tempFilePath || 'In memory'
          });
        });
      } else {
        console.log('No files were uploaded');
      }
      
      next();
    },
    
    // Validate files
    validateFiles,
    
    // Process the registration
    registerStudent,
    
    // Error handler for the route
    (err, req, res, next) => {
      console.error('Error in registration route:', {
        error: err.message,
        stack: err.stack,
        body: req.body,
        files: req.files ? Object.keys(req.files) : 'No files'
      });
      
      res.status(500).json({
        success: false,
        message: 'Internal server error during registration',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  );

// Get single student by ID
router.get('/:id', getStudent);

// Update student status
router.put('/:id/status', updateStudentStatus);

// Delete a student
router.delete('/:id', deleteStudent);

module.exports = router;
