const express = require('express');
const router = express.Router();
const {
  createResult,
  updateResult,
  getResults,
  getResultById,
  getResultsByStudent,
  deleteResult
} = require('../controllers/resultController');
const { protect, authorize } = require('../middlewares/auth');

// Apply protect and authorize middleware to all routes
router.use(protect);
router.use(authorize('admin', 'SuperAdmin'));

// @route   POST /api/v1/results
// @desc    Create a new result
// @access  Private/Admin
router.post('/', createResult);

// @route   PUT /api/v1/results/:id
// @desc    Update a result
// @access  Private/Admin
router.put('/:id', updateResult);

// @route   GET /api/v1/results
// @desc    Get all results with optional filters
// @access  Private/Admin
router.get('/', getResults);

// @route   GET /api/v1/results/student/:studentId
// @desc    Get results for a specific student
// @access  Private/Admin
router.get('/student/:studentId', getResultsByStudent);

// @route   GET /api/v1/results/:id
// @desc    Get a single result by ID
// @access  Private/Admin
router.get('/:id', getResultById);

// @route   DELETE /api/v1/results/:id
// @desc    Delete a result
// @access  Private/Admin
router.delete('/:id', deleteResult);

module.exports = router;
