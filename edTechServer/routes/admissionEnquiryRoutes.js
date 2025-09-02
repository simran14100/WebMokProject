const express = require('express');
const router = express.Router();
const {
  getAllAdmissionEnquiries,
  getAdmissionEnquiry,
  updateEnquiryStatus,
  deleteEnquiry,
  getEnquiriesByProgramType
} = require('../controllers/AdmissionEnquiryController');
const { protect, authorize } = require('../middlewares/auth');

// Protect all routes with authentication
router.use(protect);

// Routes for admin and superadmin
router.route('/')
  .get(authorize('admin', 'superadmin'), getAllAdmissionEnquiries);

// Get enquiries by program type (UG/PG)
router.route('/program/:programType')
  .get(authorize('admin', 'superadmin'), getEnquiriesByProgramType);

router.route('/:id')
  .get(authorize('admin', 'superadmin'), getAdmissionEnquiry)
  .delete(authorize('admin', 'superadmin'), deleteEnquiry);

router.route('/:id/status')
  .put(authorize('admin', 'superadmin'), updateEnquiryStatus);

// Export the router
module.exports = router;
