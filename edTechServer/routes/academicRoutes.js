const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const { 
  getSchools, 
  getSubjectsBySchool, 
  getAcademicSessions 
} = require('../controllers/academicController');

const router = express.Router();


// Routes
router.get('/schools', getSchools);
router.get('/subjects/:schoolId', getSubjectsBySchool);
router.get('/sessions', getAcademicSessions);

module.exports = router;


