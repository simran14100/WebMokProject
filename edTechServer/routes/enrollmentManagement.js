const express = require('express');
const router = express.Router();
const { auth, isStudent } = require('../middlewares/auth');
const { 
    checkEnrollment, 
    createAdmissionEnquiry, 
    getEnrollmentStatus 
} = require('../controllers/enrollmentController');

// Check enrollment status
router.get('/check', auth, isStudent, checkEnrollment);

// Create admission enquiry
router.post('/enquiry', auth, isStudent, createAdmissionEnquiry);

// Get enrollment status
router.get('/status', auth, isStudent, getEnrollmentStatus);

module.exports = router;
