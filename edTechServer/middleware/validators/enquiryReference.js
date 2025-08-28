const { body, param } = require('express-validator');

// Validation rules for creating/updating enquiry references
const enquiryReferenceValidationRules = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
    
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
    
  body('contact')
    .trim()
    .notEmpty().withMessage('Contact number is required')
    .isMobilePhone().withMessage('Please provide a valid contact number'),
    
  body('reference')
    .trim()
    .notEmpty().withMessage('Reference is required')
    .isLength({ min: 2, max: 100 }).withMessage('Reference must be between 2 and 100 characters'),
    
  body('status')
    .optional()
    .isIn(['Pending', 'Contacted', 'Converted', 'Rejected']).withMessage('Invalid status value'),
    
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
];

// Validation rules for ID parameter
const idValidationRules = [
  param('id')
    .isMongoId().withMessage('Invalid ID format')
];

module.exports = {
  enquiryReferenceValidationRules,
  idValidationRules
};
