const { body, param } = require('express-validator');

// Common validation rules for create and update
const visitPurposeValidationRules = [
    body('name')
        .trim()
        .notEmpty().withMessage('Purpose name is required')
        .isLength({ max: 100 }).withMessage('Purpose name must be less than 100 characters'),
    
    body('description')
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
    
    body('isActive')
        .optional()
        .isBoolean().withMessage('isActive must be a boolean')
];

// Validation for ID parameter
const idParamValidation = [
    param('id')
        .notEmpty().withMessage('ID is required')
        .isMongoId().withMessage('Invalid ID format')
];

module.exports = {
    createVisitPurpose: visitPurposeValidationRules,
    updateVisitPurpose: [
        ...idParamValidation,
        ...visitPurposeValidationRules
    ],
    getVisitPurpose: idParamValidation,
    deleteVisitPurpose: idParamValidation
};
