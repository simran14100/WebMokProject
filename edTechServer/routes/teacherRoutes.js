const express = require('express');
const router = express.Router();
const { auth, isAdminLevel } = require('../middlewares/auth');
const {
  createTeacher,
  getTeachers,
  getTeacher,
  updateTeacher,
  deleteTeacher
} = require('../controllers/teacherController');

// Apply auth middleware to all routes
router.use(auth);

// Apply admin middleware to all routes
router.use(isAdminLevel);

// Teacher routes
router.route('/')
  .post(createTeacher)
  .get(getTeachers);

router.route('/:id')
  .get(getTeacher)
  .put(updateTeacher)
  .delete(deleteTeacher);

module.exports = router;
