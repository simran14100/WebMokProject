const express = require('express');
const {
  getTimetables,
  getTimetable,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  getStudentTimetable,
  getTimetableSemesters
} = require('../controllers/timetableController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Public routes
// Student routes
router.get('/student', protect, authorize('Student'), getStudentTimetable);
router.get('/semesters', protect, authorize('Student'), getTimetableSemesters);

// Admin routes
router
  .route('/')
  .get(protect, authorize('Admin', 'SuperAdmin'), getTimetables)
  .post(protect, authorize('Admin', 'SuperAdmin'), createTimetable);

router
  .route('/:id')
  .get(protect, getTimetable)
  .put(protect, authorize('Admin', 'SuperAdmin'), updateTimetable)
  .delete(protect, authorize('Admin', 'SuperAdmin'), deleteTimetable);

module.exports = router;
