const crypto = require('crypto');
const mongoose = require('mongoose');
const UniversityRegisteredStudent = require('../models/UniversityRegisteredStudent');
const instance = require('../config/razorpay');
const mailSender = require('../utils/mailSender');
require('dotenv').config();

/**
 * @desc    Get Razorpay key for client
 * @route   GET /api/v1/payments/razorpay-key
 * @access  Public
 */
exports.getRazorpayKey = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay key is not set',
        code: 'RAZORPAY_KEY_NOT_SET'
      });
    }
    
    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error getting Razorpay key:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to get Razorpay key',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Create Razorpay order
 * @route   POST /api/v1/payments/create-order
 * @access  Private
 */
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, aadharNumber } = req.body;
    
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    // Check if Aadhar number is provided and if a student with this Aadhar already exists
    if (aadharNumber) {
      const existingStudent = await UniversityRegisteredStudent.findOne({ 
        aadharNumber: aadharNumber 
      });

      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: 'A student with this Aadhar number is already registered',
          aadharNumber,
          isDuplicate: true
        });
      }
    }

    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `rcpt_${Date.now()}`,
      payment_capture: 1
    };

    const order = await instance.orders.create(options);
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @desc    Verify payment and update student record
 * @route   POST /api/v1/payments/verify
 * @access  Private
 */
exports.verifyPayment = async (req, res, next) => {
  try {
    // Get data from both body and files
    const { orderId, paymentId, signature, studentData: studentDataRaw, ...formValues } = req.body;
    
    // Check if studentData is a string and needs parsing, otherwise use as is
    const studentData = typeof studentDataRaw === 'string' 
      ? JSON.parse(studentDataRaw) 
      : studentDataRaw || formValues;
    
    // Debug log
    console.log('Payment verification request received:', {
      orderId,
      paymentId,
      hasSignature: !!signature,
      hasFiles: !!req.files,
      fileFields: req.files ? Object.keys(req.files) : 'No files',
      studentDataKeys: Object.keys(studentData || {})
    });
    
    // Check if student with this Aadhar number already exists
    if (studentData?.aadharNumber) {
      const existingStudentByAadhar = await UniversityRegisteredStudent.findOne({ 
        aadharNumber: studentData.aadharNumber 
      });

      if (existingStudentByAadhar) {
        return res.status(400).json({
          success: false,
          message: 'A student with this Aadhar number is already registered',
          aadharNumber: studentData.aadharNumber,
          isDuplicate: true
        });
      }
    }
    
    // Check if student with this email already exists
    if (studentData?.email) {
      const existingStudentByEmail = await UniversityRegisteredStudent.findOne({ 
        email: studentData.email 
      });

      if (existingStudentByEmail) {
        return res.status(400).json({
          success: false,
          message: 'This email address is already registered',
          email: studentData.email,
          isDuplicate: true
        });
      }
    }
    
    // Verify the payment signature if paymentId is provided (online payment)
    if (paymentId) {
      const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
      hmac.update(orderId + '|' + paymentId);
      const generatedSignature = hmac.digest('hex');
      
      if (generatedSignature !== signature) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid payment signature',
          code: 'INVALID_SIGNATURE'
        });
      }
    }

    // Attach payment and student data to request object for the next middleware
    req.paymentData = {
      paymentStatus: 'paid',
      paymentMode: 'online',
      paymentDetails: {
        orderId,
        paymentId,
        amount: studentData.amount || 0,
        currency: 'INR',
        status: 'captured',
        method: 'razorpay',
        timestamp: new Date()
      },
      ...studentData
    };
    
    // Attach files to request object for the next middleware
    if (req.files) {
      req.paymentData.files = req.files;
    }
    
    console.log('Payment verified successfully, proceeding to student registration');
    
    // Call next middleware (registerStudent)
    next();
  } catch (error) {
    console.error('Error in verifyPayment middleware:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name
    });
    
    // Handle specific error cases
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors ? Object.values(error.errors).map(err => err.message) : [error.message],
        code: 'VALIDATION_ERROR'
      });
    }
    
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)?.[0] || 'field';
      const value = error.keyValue?.[field] || 'unknown';
      return res.status(400).json({
        success: false,
        message: `A student with this ${field} already exists`,
        field,
        value,
        code: 'DUPLICATE_ENTRY'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'An unexpected error occurred during payment verification',
      code: 'INTERNAL_SERVER_ERROR',
      ...(process.env.NODE_ENV === 'development' && {
        error: error.message,
        stack: error.stack
      })
    });
  }
};

