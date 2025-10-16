const express = require('express');
const router = express.Router();

console.log('Result routes initialized');

const {
  createResult,
  updateResult,
  getResults,
  getResultById,
  getResultsByStudent,
  getMyResults,
  deleteResult,
  getResultPdf
} = require('../controllers/resultController');
const { protect, authorize } = require('../middlewares/auth');

// Apply protect middleware to all routes
router.use(protect);

// Student routes
console.log('Registering GET /my-results route');
router.get('/my-results', (req, res, next) => {
  console.log('GET /my-results route hit');
  next();
}, getMyResults);

// Download result PDF (accessible to student who owns the result or admin)
router.get('/:id/download', getResultPdf);

// Admin routes
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
// @desc    Get results for a specific student (Admin only)
// @access  Private/Admin
router.get('/student/:studentId', getResultsByStudent);

// @route   GET /api/v1/results/:id
// @desc    Get a single result by ID
// @access  Private/Admin
router.get('/:id', getResultById);

// @route   DELETE /api/v1/results/:id
// @desc    Delete a result
// @access  Private/Admin
router.delete(
  '/:id', 
  protect, 
  authorize('Admin', 'SuperAdmin'), 
  deleteResult
);

module.exports = router;
