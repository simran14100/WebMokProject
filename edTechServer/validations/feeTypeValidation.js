const Joi = require('joi');

// Validation for creating a new fee type
const validateCreateFeeType = (data) => {
  const schema = Joi.object({
    name: Joi.string().required().trim().min(2).max(100).messages({
      'string.empty': 'Fee type name is required',
      'string.min': 'Fee type name must be at least 2 characters long',
      'string.max': 'Fee type name cannot be longer than 100 characters',
    }),
    category: Joi.string()
      .valid('Course', 'Registration', 'Miscellaneous', 'Other')
      .required()
      .messages({
        'any.only': 'Invalid category selected',
        'any.required': 'Category is required',
      }),
    type: Joi.string()
      .valid('Semester Wise', 'Yearly', 'Before Course')
      .required()
      .messages({
        'any.only': 'Please select a valid fee type (Semester Wise, Yearly, or Before Course)',
        'any.required': 'Fee type is required',
      }),
    refundable: Joi.boolean().default(false),
  });

  return schema.validate(data, { abortEarly: false });
};

// Validation for updating a fee type
const validateUpdateFeeType = (data) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(100).messages({
      'string.empty': 'Fee type name cannot be empty',
      'string.min': 'Fee type name must be at least 2 characters long',
      'string.max': 'Fee type name cannot be longer than 100 characters',
    }),
    category: Joi.string()
      .valid('Course', 'Registration', 'Miscellaneous', 'Other')
      .messages({
        'any.only': 'Invalid category selected',
      }),
    type: Joi.string()
      .valid('Semester Wise', 'Yearly', 'Before Course')
      .messages({
        'any.only': 'Please select a valid fee type (Semester Wise, Yearly, or Before Course)',
      }),
    refundable: Joi.boolean(),
    status: Joi.string().valid('Active', 'Inactive').messages({
      'any.only': 'Status must be either Active or Inactive',
    }),
  }).min(1); // At least one field must be provided for update

  return schema.validate(data, { abortEarly: false });
};

module.exports = {
  validateCreateFeeType,
  validateUpdateFeeType
};