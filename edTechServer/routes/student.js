const express = require('express');
const router = express.Router();
const UniversityRegisteredStudent = require('../models/UniversityRegisteredStudent');

// Check if email exists
router.post('/check-email', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const existingStudent = await UniversityRegisteredStudent.findOne({ email });
    
    res.status(200).json({
      success: true,
      exists: !!existingStudent
    });
    
  } catch (error) {
    console.error('Error checking email:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking email',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
