const User = require('../models/User');
const OTP = require('../models/OTP');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Helper function to validate OTP
async function validateOTP(email, otp) {
  const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
  
  if (response.length === 0) {
    return { valid: false, message: "The OTP is not valid" };
  }
  
  if (otp !== response[0].otp) {
    return { valid: false, message: "The OTP is not valid" };
  }
  
  return { valid: true };
}

// University student login
const universityLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email, id: user._id, accountType: user.accountType },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in cookie
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
    };

    return res.cookie('token', token, options).status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        accountType: user.accountType,
        firstName: user.firstName,
        lastName: user.lastName
      },
      message: 'Login successful',
      redirectTo: '/university/dashboard'
    });

  } catch (error) {
    console.error('Error in university login:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update user's program type
const updateProgram = async (req, res) => {
  console.log('Update program request received:', {
    userId: req.user?.id,
    body: req.body,
    headers: req.headers
  });

  try {
    const { programType } = req.body;
    const userId = req.user?.id;

    // Validate request
    if (!userId) {
      console.error('No user ID in request');
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: No user ID provided'
      });
    }

    if (!programType) {
      return res.status(400).json({
        success: false,
        message: 'Program type is required'
      });
    }

    // Validate program type
    const validProgramTypes = ['UG', 'PG', 'PhD'];
    if (!validProgramTypes.includes(programType)) {
      return res.status(400).json({
        success: false,
        message: `Invalid program type. Must be one of: ${validProgramTypes.join(', ')}`,
        received: programType
      });
    }

    // Find existing user
    const existingUser = await User.findById(userId);
    if (!existingUser) {
      console.error(`User not found with ID: ${userId}`);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Updating user program:', {
      userId,
      fromProgram: existingUser.programType,
      toProgram: programType,
      fromAccountType: existingUser.accountType,
      toAccountType: 'Student' // Updated to match the valid enum value
    });

    // Update user's program type (keeping accountType as 'Student')
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        programType,
        accountType: 'Student', // Use a valid enum value
        $addToSet: { roles: programType } // Add to roles array if not already present
      },
      { 
        new: true,
        runValidators: true
      }
    ).select('-password -refreshToken');

    if (!updatedUser) {
      throw new Error('Failed to update user program');
    }

    console.log('Successfully updated user program:', {
      userId,
      programType: updatedUser.programType,
      accountType: updatedUser.accountType
    });

    // Create response object with user details including programType
    const userResponse = {
      _id: updatedUser._id,
      email: updatedUser.email,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      accountType: updatedUser.accountType,
      programType: updatedUser.programType,
      roles: updatedUser.roles
    };

    res.status(200).json({
      success: true,
      message: 'Program updated successfully',
      user: userResponse
    });

  } catch (error) {
    console.error('Error in updateProgram:', {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      body: req.body
    });

    res.status(500).json({
      success: false,
      message: 'Failed to update program',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get current user
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('additionalDetails')
      .exec();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error getting current user:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// University student signup (UG/PG/PhD)
const universitySignup = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      contactNumber,
      otp,
      programType,
      degreeLevel,
      department,
      program,
      accountType = 'Student' // Default to Student if not provided
    } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Validate OTP
    const otpValidation = await validateOTP(email, otp);
    if (!otpValidation.valid) {
      return res.status(400).json({
        success: false,
        message: otpValidation.message
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      if (existingUser.verified) {
        return res.status(400).json({
          success: false,
          message: 'User already registered. Please login.',
          redirectTo: '/university/login'
        });
      } else {
        // Delete existing unverified user and their profile
        await User.findByIdAndDelete(existingUser._id);
        if (existingUser.additionalDetails?.profile) {
          await Profile.findByIdAndDelete(existingUser.additionalDetails.profile);
        }
      }
    }

    // Create profile
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber,
    });

    // Determine account type based on program type if not provided
    const userAccountType = programType?.toLowerCase() === 'phd' ? 'PhDStudent' : accountType;

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: await bcrypt.hash(password, 10),
      accountType: userAccountType,
      additionalDetails: {
        programType,
        degreeLevel,
        ...(department && { department }),
        ...(program && { program }),
        profile: profileDetails._id
      },
      verified: true
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        email: user.email, 
        id: user._id, 
        accountType: user.accountType 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set token in cookie
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days
    };

    // Return success response
    return res.cookie('token', token, cookieOptions).status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        accountType: user.accountType,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token,
      redirectTo: '/university/dashboard'
    });

  } catch (error) {
    console.error('Error in university signup:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Export all functions
module.exports = {
  universitySignup,
  universityLogin,
  getCurrentUser,
  updateProgram
};
