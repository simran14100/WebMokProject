const express = require('express');
const router = express.Router();
const {
  getAllAdmissionEnquiries,
  getAdmissionEnquiry,
  updateEnquiryStatus,
  deleteEnquiry,
} = require('../controllers/AdmissionEnquiryController');
const { protect, authorize } = require('../middlewares/auth');

// Protect all routes with authentication and authorization
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.route('/')
  .get(getAllAdmissionEnquiries);

router.route('/:id')
  .get(getAdmissionEnquiry)
  .delete(deleteEnquiry);

router.route('/:id/status')
  .put(updateEnquiryStatus);

module.exports = router;
