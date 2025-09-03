const express = require('express');
const router = express.Router();
const {
  getAllAdmissionEnquiries,
  getAdmissionEnquiry,
  updateEnquiryStatus,
  deleteEnquiry,
  getEnquiriesByProgramType,
  createAdmissionEnquiry,
  debugListAllEnquiries
} = require('../controllers/AdmissionEnquiryController');
const { protect, authorize } = require('../middlewares/auth');

// Public routes
router.post('/', createAdmissionEnquiry); // Public route for submitting enquiries

// Protected routes (require authentication)
router.use(protect);

// Debug route - list all enquiries (temporary, admin/superadmin only)
router.get('/debug', authorize('admin', 'superadmin'), debugListAllEnquiries);

// Admin routes
router.route('/')
  .get(authorize('admin', 'superadmin'), getAllAdmissionEnquiries);

// Get enquiries by program type (UG/PG)
router.route('/program/:programType')
  .get(authorize('admin', 'superadmin'), getEnquiriesByProgramType);

// Enquiry-specific routes
router.route('/:id')
  .get(authorize('admin', 'superadmin'), getAdmissionEnquiry)
  .delete(authorize('admin', 'superadmin'), deleteEnquiry);

// Status update route
router.route('/:id/status')
  .put(authorize('admin', 'superadmin'), updateEnquiryStatus);

// Export the router
module.exports = router;
