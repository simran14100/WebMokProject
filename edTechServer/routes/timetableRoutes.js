const express = require('express');
const {
  getTimetables,
  getTimetable,
  createTimetable,
  updateTimetable,
  deleteTimetable
} = require('../controllers/timetableController');
const { protect, authorize } = require('../middlewares/auth');

const router = express.Router();

// Public routes
router
  .route('/')
  .get(getTimetables)
  .post(protect, authorize('Admin', 'SuperAdmin'), createTimetable);

router
  .route('/:id')
  .get(getTimetable)
  .put(protect, authorize('Admin', 'SuperAdmin'), updateTimetable)
  .delete(protect, authorize('Admin', 'SuperAdmin'), deleteTimetable);

module.exports = router;
