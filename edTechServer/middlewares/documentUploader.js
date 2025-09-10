const fileUpload = require('express-fileupload');
const path = require('path');
const os = require('os');
const fs = require('fs');
const { promisify } = require('util');

// Promisify fs functions for async/await
const unlinkAsync = promisify(fs.unlink);
const existsAsync = promisify(fs.exists);
const mkdirAsync = promisify(fs.mkdir);

// Create a temporary directory for document uploads
const tempDir = path.join(os.tmpdir(), 'edtech-documents');

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

// Configure file upload with express-fileupload
const fileUploadOptions = {
  useTempFiles: true,
  tempFileDir: tempDir,
  createParentPath: true,
  debug: process.env.NODE_ENV === 'development',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 1, // Only allow 1 file
    fields: 10, // Max 10 fields
    fieldSize: 1 * 1024 * 1024, // 1MB max field size
    preservePath: false
  },
  uploadTimeout: 300000, // 5 minutes
  abortOnLimit: true,
  preserveExtension: 8, // Preserve file extensions (up to 8 chars)
  safeFileNames: false,
  parseNested: true
};

// Initialize file upload middleware
const upload = fileUpload(fileUploadOptions);

// Allowed document types
const allowedMimeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/jpg'
];

// Helper to validate file type
const isValidFileType = (mimetype) => {
  return allowedMimeTypes.includes(mimetype);
};

// Helper function to clean up temporary files
const cleanupFile = async (file) => {
  if (!file || !file.tempFilePath) return;
  
  try {
    if (await existsAsync(file.tempFilePath)) {
      await unlinkAsync(file.tempFilePath);
      console.log(`Cleaned up temp file: ${file.tempFilePath}`);
    }
  } catch (error) {
    console.error(`Error cleaning up file ${file.tempFilePath}:`, error);
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

// Document upload middleware
const handleDocumentUpload = (req, res, next) => {
  // Skip if not a multipart form
  const contentType = req.headers['content-type'] || '';
  if (!contentType.includes('multipart/form-data')) {
    console.log('Request is not multipart/form-data. Skipping file upload processing.');
    return next();
  }

  console.log('=== Document Upload Middleware ===');
  console.log('Method:', req.method);
  console.log('URL:', req.originalUrl);
  console.log('Content-Type:', contentType);
  console.log('Content-Length:', req.headers['content-length'] || 'Unknown');

  // Handle the upload
  return upload(req, res, async (err) => {
    try {
      if (err) {
        console.error('Document upload error:', {
          message: err.message,
          code: err.code,
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });

        let statusCode = 500;
        let message = 'Document upload failed';

        if (err.message.includes('File too large')) {
          statusCode = 413;
          message = 'File size is too large. Maximum 10MB per file.';
        } else if (err.message.includes('Unexpected field')) {
          statusCode = 400;
          message = 'Invalid field name. Use \'document\' as the field name for file upload.';
        } else if (err.message.includes('Unexpected end of form')) {
          statusCode = 400;
          message = 'The request was interrupted or incomplete. Please check your network connection.';
        }

        return res.status(statusCode).json({
          success: false,
          message,
          error: err.code || 'upload_failed'
        });
      }

      // Check if file was uploaded
      if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files were uploaded.'
        });
      }

      const file = req.files.document;
      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file with field name "document" was uploaded.'
        });
      }

      // Validate file type
      if (!isValidFileType(file.mimetype)) {
        await cleanupFile(file);
        return res.status(400).json({
          success: false,
          message: 'Invalid file type. Only PDF, Word, Excel, Text, and Image files are allowed.'
        });
      }

      console.log('Document uploaded successfully:', {
        name: file.name,
        size: file.size,
        mimetype: file.mimetype
      });

      // Add file to request for the next middleware
      req.uploadedFile = file;
      next();
    } catch (error) {
      console.error('Error in document upload middleware:', error);
      await cleanupAllFiles(req.files);
      
      res.status(500).json({
        success: false,
        message: 'An error occurred while processing your upload',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
};

// Cleanup middleware to remove uploaded files after response
const cleanupUploads = (req, res, next) => {
  const cleanup = async () => {
    try {
      if (req.files && Object.keys(req.files).length > 0) {
        // Clean up all uploaded files
        await cleanupAllFiles(req.files);
      }
    } catch (error) {
      console.error('Error in cleanup middleware:', error);
    }
  };

  // Clean up after the response is sent
  res.on('finish', cleanup);
  res.on('close', cleanup);
  next();
};

module.exports = {
  handleDocumentUpload,
  cleanupUploads
};
