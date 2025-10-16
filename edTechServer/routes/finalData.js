const express = require('express');
const router = express.Router();
const {
  getFinalData,
  getSingleFinalData,
  createFinalData,
  updateFinalData,
  deleteFinalData,
  searchFinalData
} = require('../controllers/finalDataController');

// Import middleware
const { protect, authorize } = require('../middlewares/auth');

// All routes are protected and require admin/superadmin role
router.use(protect);
router.use(authorize('admin', 'superadmin'));

// Base route: /api/v1/final-data

// Search final data
router.get('/search', searchFinalData);

// Get all final data entries with pagination
router.get('/', getFinalData);

// Get single final data entry
router.get('/:id', getSingleFinalData);

// Create new final data entry
router.post('/', createFinalData);

// Update final data entry
router.put('/:id', updateFinalData);

// Delete final data entry
router.delete('/:id', deleteFinalData);

module.exports = router;
