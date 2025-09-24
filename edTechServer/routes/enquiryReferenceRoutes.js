const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const EnquiryReference = require('../models/EnquiryReference');
const {
  getAllEnquiryReferences,
  getEnquiryReferenceById,
  createEnquiryReference,
  updateEnquiryReference,
  deleteEnquiryReference
} = require('../controllers/EnquiryReferenceController');
const {
  enquiryReferenceValidationRules,
  idValidationRules
} = require('../middlewares/validators/enquiryReference');
const { validate } = require('../middlewares/validate');

// Apply auth middleware to all routes
router.use(protect);

// Backward-compat: ensure req.user.id exists if only _id is set
router.use((req, res, next) => {
  if (req.user && !req.user.id && req.user._id) {
    req.user.id = req.user._id;
  }
  next();
});

// Apply role check for admin, frontdesk, and superAdmin
router.use(authorize('Admin', 'FrontDesk', 'SuperAdmin'));

// Routes
router
  .route('/')
  .get(getAllEnquiryReferences)
  .post(validate(enquiryReferenceValidationRules), createEnquiryReference);

router
  .route('/:id')
  .get(validate(idValidationRules), getEnquiryReferenceById)
  .put(validate([...idValidationRules, ...enquiryReferenceValidationRules]), updateEnquiryReference)
  .delete(validate(idValidationRules), async (req, res) => {
    try {
      const deleted = await EnquiryReference.findByIdAndDelete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Enquiry reference not found' });
      }
      return res.json({ success: true, message: 'Enquiry reference deleted successfully' });
    } catch (error) {
      console.error('Error deleting enquiry reference:', error);
      return res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  });

module.exports = router;
