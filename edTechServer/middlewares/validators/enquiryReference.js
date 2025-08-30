const { body, param } = require('express-validator');

// Validation rules for enquiry reference
const enquiryReferenceValidationRules = [
  body('name', 'Name is required').notEmpty().trim(),
  body('description', 'Description is required').notEmpty().trim(),
  body('status', 'Status is required').isIn(['active', 'inactive']).withMessage('Invalid status')
];

// Validation rules for ID parameter
const idValidationRules = [
  param('id', 'Invalid ID').isMongoId()
];

module.exports = {
  enquiryReferenceValidationRules,
  idValidationRules
};
