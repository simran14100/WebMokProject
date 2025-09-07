const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middlewares/auth');
const {
    getAllApprovedStudents,
    
    updateEnrollmentStatus
} = require('../controllers/universityEnrolledStudentController');

// Get all approved students (Admin only)
router.get('/', auth, isAdmin, getAllApprovedStudents);



// Update enrollment status (Admin only)
router.put('/:id/status', auth, isAdmin, updateEnrollmentStatus);

module.exports = router;
