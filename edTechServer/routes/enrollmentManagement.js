const express = require('express');
const router = express.Router();
const { auth, isStudent } = require('../middlewares/auth');
const { checkEnrollment, getEnrollmentStatus } = require('../controllers/enrollmentController');
const { createAdmissionEnquiry } = require('../controllers/AdmissionEnquiryController');

// Check enrollment status
router.get('/check', auth, isStudent, checkEnrollment);

// Create admission enquiry
router.post('/enquiry', auth, isStudent, createAdmissionEnquiry);

// Get enrollment status
router.get('/status', auth, isStudent, getEnrollmentStatus);

module.exports = router;
