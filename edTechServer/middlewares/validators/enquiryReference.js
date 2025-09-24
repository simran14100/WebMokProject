const { body, param } = require('express-validator');

// Validation rules for enquiry reference
const enquiryReferenceValidationRules = [
  // Required fields
  body('name', 'Name is required').notEmpty().trim(),
  body('email', 'Valid email is required').notEmpty().bail().isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('contact', 'Contact number is required').notEmpty().bail().matches(/^\d{10}$/).withMessage('Contact number must be exactly 10 digits'),
  body('reference', 'Reference is required').notEmpty().trim(),

  // Optional fields with constraints
  body('status').optional().isIn(['Pending', 'Contacted', 'Converted', 'Rejected']).withMessage('Invalid status'),
  body('notes').optional().isString().trim()
];

// Validation rules for ID parameter
const idValidationRules = [
  param('id', 'Invalid ID').isMongoId()
];

module.exports = {
  enquiryReferenceValidationRules,
  idValidationRules
};
