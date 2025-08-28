const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
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
} = require('../middleware/validators/enquiryReference');
const { validate } = require('../middleware/validate');

// Apply auth middleware to all routes
router.use(protect);

// Apply role check for admin, frontdesk, and superAdmin
router.use(authorize('admin', 'frontdesk', 'superAdmin'));

// Routes
router
  .route('/')
  .get(getAllEnquiryReferences)
  .post(validate(enquiryReferenceValidationRules), createEnquiryReference);

router
  .route('/:id')
  .get(validate(idValidationRules), getEnquiryReferenceById)
  .put(validate([...idValidationRules, ...enquiryReferenceValidationRules]), updateEnquiryReference)
  .delete(validate(idValidationRules), deleteEnquiryReference);

module.exports = router;
