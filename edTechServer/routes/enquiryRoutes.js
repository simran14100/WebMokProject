const express = require('express');
const router = express.Router();
const {
  getEnquiries,
  getEnquiry,
  createEnquiry,
  updateEnquiry,
  deleteEnquiry,
  getEnquiryStats
} = require('../controllers/EnquiryController');

const { protect, authorize } = require('../middlewares/auth');

// Public routes
router
  .route('/')
  .post(createEnquiry);

// Protected routes (admin only)
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router
  .route('/')
  .get(getEnquiries);

router
  .route('/stats')
  .get(getEnquiryStats);

router
  .route('/:id')
  .get(getEnquiry)
  .put(updateEnquiry)
  .delete(deleteEnquiry);

module.exports = router;
