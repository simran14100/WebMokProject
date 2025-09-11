const express = require('express');
const { protect, authorize } = require('../middlewares/auth');
const { 
  getSchools, 
  getSubjectsBySchool, 
  getAcademicSessions 
} = require('../controllers/academicController');

const router = express.Router();

// All routes are protected and require admin/superadmin access
router.use(protect);
router.use(authorize('admin', 'superadmin'));

// Routes
router.get('/schools', getSchools);
router.get('/subjects/:schoolId', getSubjectsBySchool);
router.get('/sessions', getAcademicSessions);

module.exports = router;
