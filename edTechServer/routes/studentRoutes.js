const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { handleStudentFiles, handleUploadErrors } = require('../middleware/fileUpload');
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
  // Handle file uploads with multer
  handleStudentFiles,
  // Handle upload errors
  handleUploadErrors,
  // Process the registration
  registerStudent
);

// Get all registered students
router.get('/', getRegisteredStudents);

// Get a single student by ID
router.get('/:id', getStudent);

// Update student status
router.put('/:id', updateStudentStatus);

// Delete a student
router.delete('/:id', deleteStudent);

module.exports = router;
