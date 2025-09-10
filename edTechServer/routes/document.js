const express = require('express');
const router = express.Router();
const { handleDocumentUpload, cleanupUploads } = require('../middlewares/documentUploader');
const { protect } = require('../middlewares/auth');
const {
  uploadDocument,
  getStudentDocuments,
  deleteDocument
} = require('../controllers/documentController');

// Protected routes (require authentication)
router.use(protect);

// Upload document
router.post('/upload', 
  (req, res, next) => {
    console.log('Starting document upload...');
    next();
  },
  handleDocumentUpload,
  (req, res, next) => {
    console.log('Document upload middleware completed, proceeding to controller...');
    next();
  },
  uploadDocument,
  (err, req, res, next) => {
    console.error('Error in document upload:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Internal server error during document upload',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },
  cleanupUploads
);

// Get all documents for logged-in student
router.get('/my-documents', getStudentDocuments);

// Delete a document
router.delete('/:documentId', deleteDocument);

module.exports = router;
