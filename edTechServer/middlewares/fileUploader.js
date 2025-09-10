


const fileUpload = require('express-fileupload');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { promisify } = require('util');

// Promisify fs functions for async/await
const unlinkAsync = promisify(fs.unlink);
const existsAsync = promisify(fs.exists);
const mkdirAsync = promisify(fs.mkdir);

// Create a temporary directory for file uploads
const tempDir = path.join(os.tmpdir(), 'edtech-uploads');

// Ensure temp directory exists
const ensureTempDir = async () => {
  try {
    if (!(await existsAsync(tempDir))) {
      await mkdirAsync(tempDir, { recursive: true, mode: 0o755 });
      console.log(`Created temp directory: ${tempDir}`);
    }
  } catch (error) {
    console.error('Error creating temp directory:', error);
  }
};

// Initialize temp directory
ensureTempDir().catch(console.error);

// Clean up old temp files periodically
const cleanTempFiles = () => {
  try {
    if (!fs.existsSync(tempDir)) return;
    
    const files = fs.readdirSync(tempDir);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // Clean up files older than 1 hour
    
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      try {
        const stats = fs.statSync(filePath);
        
        if (now - stats.mtime.getTime() > oneHour) {
          fs.unlinkSync(filePath);
          console.log(`Cleaned up old temp file: ${filePath}`);
        }
      } catch (error) {
        console.error('Error cleaning up temp file:', error);
      }
    });
  } catch (error) {
    console.error('Error cleaning up temp files:', error);
  }
};

// Run cleanup every hour
setInterval(cleanTempFiles, 60 * 60 * 1000);
cleanTempFiles(); // Run on startup

// Configure file upload with express-fileupload
const upload = fileUpload({
  useTempFiles: true,
  tempFileDir: tempDir,
  createParentPath: true,
  debug: process.env.NODE_ENV === 'development',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file (reduced from 50MB)
    files: 2, // Only allow 2 files (photo and signature)
    fields: 50, // Max 50 fields
    fieldSize: 1024 * 1024, // 1MB max field size
    fieldNameSize: 100, // Max field name size
    headerPairs: 2000, // Max 2000 headers
    parts: 100, // Max 100 parts (fields + files)
    preservePath: false
  },
  uploadTimeout: 300000, // 5 minutes
  abortOnLimit: true, // Abort on limit
  preserveExtension: 4, // Preserve file extensions (max 4 chars)
  safeFileNames: false, // Allow any file names
  parseNested: true, // Parse nested form fields
  
  // File filter to validate file types
  fileFilter: (req, file, cb) => {
    try {
      // Validate image files only
      const validImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      
      if (!validImageTypes.includes(file.mimetype)) {
        console.error(`Invalid file type: ${file.mimetype} for ${file.name}`);
        return cb(new Error('Only JPEG and PNG images are allowed'), false);
      }
      
      return cb(null, true);
      
    } catch (error) {
      console.error('Error in file filter:', error);
      return cb(error, false);
    }
  }
});

// Helper function to clean up temporary files
const cleanupFile = async (file) => {
  if (!file?.tempFilePath) return;
  
  try {
    if (await existsAsync(file.tempFilePath)) {
      await unlinkAsync(file.tempFilePath);
      console.log(`Cleaned up temp file: ${file.tempFilePath}`);
    }
  } catch (err) {
    console.error('Error cleaning up temp file:', err);
  }
};

// Clean up all files in request
const cleanupAllFiles = async (files) => {
  if (!files) return;
  
  const cleanupPromises = Object.values(files)
    .flat()
    .map(file => cleanupFile(file));
  
  await Promise.allSettled(cleanupPromises);
};

// Main upload middleware
const handleFileUpload = async (req, res, next) => {
  // Skip if not a multipart form
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    console.log('Request is not multipart/form-data. Skipping file upload processing.');
    return next();
  }

  console.log('=== File Upload Middleware ===');
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('Content-Type:', contentType);
  console.log('Content-Length:', req.headers['content-length'] || 'Unknown');

  try {
    // Handle the upload
    upload(req, res, async (err) => {
      if (err) {
        console.error('Upload error:', {
          message: err.message,
          code: err.code,
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });

        // Clean up any uploaded files
        await cleanupAllFiles(req.files);

        let statusCode = 500;
        let message = 'File upload failed';

        switch (err.code) {
          case 'LIMIT_FILE_SIZE':
            statusCode = 413;
            message = 'File size is too large. Maximum 10MB per file.';
            break;
          case 'LIMIT_FILE_COUNT':
            statusCode = 413;
            message = 'Too many files uploaded. Maximum 2 files allowed (photo and signature).';
            break;
          case 'LIMIT_FIELD_COUNT':
            statusCode = 413;
            message = 'Too many form fields.';
            break;
          default:
            if (err.message.includes('Unexpected end of form')) {
              statusCode = 400;
              message = 'The request was interrupted or incomplete. Please check your network connection.';
            } else if (err.message.includes('image')) {
              statusCode = 400;
              message = err.message;
            }
        }

        return res.status(statusCode).json({
          success: false,
          message,
          error: err.code || 'upload_failed'
        });
      }

      try {
        // Process uploaded files
        if (req.files) {
          console.log(`Received ${Object.keys(req.files).length} file fields:`, Object.keys(req.files));
          
          // Convert single files to arrays for consistency, then extract first file
          Object.keys(req.files).forEach(key => {
            if (req.files[key] && !Array.isArray(req.files[key])) {
              req.files[key] = [req.files[key]];
            }
            
            // Keep only the first file for each field (we only expect one)
            if (req.files[key] && req.files[key].length > 0) {
              req.files[key] = req.files[key][0]; // Store single file, not array
              console.log(`- ${key}:`, {
                name: req.files[key].name,
                size: req.files[key].size,
                type: req.files[key].mimetype
              });
            }
          });

          // Validate required files
          const requiredFiles = ['photo', 'signature'];
          const missingFiles = [];
          const invalidFiles = [];

          for (const field of requiredFiles) {
            const file = req.files[field];
            
            if (!file) {
              console.error(`Missing required file: ${field}`);
              missingFiles.push(field);
            } else if (file.truncated) {
              console.error(`File too large: ${field} (${file.size} bytes)`);
              invalidFiles.push(`${field} (file too large)`);
            } else if (file.size === 0) {
              console.error(`Empty file: ${field}`);
              invalidFiles.push(`${field} (empty file)`);
            } else {
              console.log(`Valid file uploaded for ${field}`);
            }
          }

          if (missingFiles.length > 0 || invalidFiles.length > 0) {
            console.error('File validation failed:', { missingFiles, invalidFiles });
            
            // Clean up uploaded files
            await cleanupAllFiles(req.files);
            
            const errorMessages = [];
            if (missingFiles.length) {
              errorMessages.push(`Missing required files: ${missingFiles.join(', ')}`);
            }
            if (invalidFiles.length) {
              errorMessages.push(`Invalid files: ${invalidFiles.join(', ')}`);
            }
            
            return res.status(400).json({
              success: false,
              message: errorMessages.join('; '),
              details: { missingFiles, invalidFiles }
            });
          }
        } else {
          console.log('No files were uploaded');
          
          // Check if this should have files
          if (req.originalUrl.includes('/register')) {
            return res.status(400).json({
              success: false,
              message: 'Photo and signature files are required'
            });
          }
        }

        // Log request body fields for debugging
        console.log('Form fields received:', Object.keys(req.body).length);
        if (Object.keys(req.body).length > 0) {
          console.log('Field names:', Object.keys(req.body));
        }

        // Proceed to the next middleware
        next();

      } catch (error) {
        console.error('Error processing uploaded files:', error);
        
        // Clean up uploaded files
        await cleanupAllFiles(req.files);
        
        res.status(500).json({
          success: false,
          message: 'Error processing file upload',
          error: process.env.NODE_ENV === 'development' ? error.message : 'internal_error'
        });
      }
    });

  } catch (error) {
    console.error('Unexpected error in file upload middleware:', error);
    
    // Clean up uploaded files
    await cleanupAllFiles(req.files);
    
    res.status(500).json({
      success: false,
      message: 'Internal server error during file upload',
      error: 'internal_error'
    });
  }
};

// Cleanup middleware to remove uploaded files after response
const cleanupUploads = (req, res, next) => {
  // Store reference to original files for cleanup
  const originalFiles = req.files ? { ...req.files } : null;
  
  // Clean up after response is sent
  const cleanup = async () => {
    if (originalFiles) {
      console.log('Cleaning up uploaded files after response');
      await cleanupAllFiles(originalFiles);
    }
  };

  res.on('finish', cleanup);
  res.on('close', cleanup);
  
  next();
};

module.exports = {
  handleFileUpload,
  cleanupUploads
};