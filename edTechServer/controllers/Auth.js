const User = require('../models/User');
const UserType = require('../models/UserType');
const otpGenerator= require('otp-generator');
const OTP = require('../models/OTP');
const jwt = require('jsonwebtoken');
const mailSender = require("../utils/mailSender")
const { passwordUpdated } = require("../mail/templates/passwordUpdate")
const emailVerificationTemplate = require("../mail/templates/emailVerificationTemplate");
const bcrypt = require("bcrypt")
const Profile = require("../models/Profile")

require('dotenv').config();

// Verify user session by checking token and database
// This is a protected route that requires a valid JWT token
exports.verifySession = async (req, res) => {
    try {
        // The auth middleware has already verified the token and attached the user to req.user
        const userId = req.user.id;
        
        // Find the user in the database
        const user = await User.findById(userId).select('-password').lean();
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
                isAuthenticated: false
            });
        }
        
        // Return user data without sensitive information
        const { password, resetPasswordExpires, resetPasswordToken, ...userData } = user;
        
        return res.status(200).json({
            success: true,
            isAuthenticated: true,
            user: userData
        });
        
    } catch (error) {
        console.error('Session verification error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error verifying session',
            error: error.message,
            isAuthenticated: false
        });
    }
};

// Check if user exists by email
exports.checkUserExists = async (req, res) => {
    try {
        const { email } = req.query;
        
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required',
            });
        }

        // Check if user exists
        const user = await User.findOne({ email }, { email: 1 });
        
        return res.status(200).json({
            success: true,
            exists: !!user,
            message: user ? 'User found' : 'User not found',
        });
    } catch (error) {
        console.error('Error checking user existence:', error);
        return res.status(500).json({
            success: false,
            message: 'Error checking user existence',
            error: error.message,
        });
    }
};


//send otp
exports.sendotp = async (req, res) => {
    try {
      const { email } = req.body
      
      console.log("=== SEND OTP REQUEST ===");
      console.log("Email:", email);
      console.log("Request body:", req.body);
  
      // Check if user is already present
      // Find user with provided email
      const checkUserPresent = await User.findOne({ email })
      console.log("Existing user check:", checkUserPresent ? "User exists" : "User not found");
      // to be used in case of signup
  
      // If user found with provided email
      if (checkUserPresent) {
        // Return 401 Unauthorized status code with error message
        return res.status(401).json({
          success: false,
          message: `User is Already Registered`,
        })
      }
  
      var otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      })
      console.log("Generated OTP:", otp);
      
      const result = await OTP.findOne({ otp: otp })
      console.log("Result is Generate OTP Func")
      console.log("OTP", otp)
      console.log("Result", result)
      while (result) {
        otp = otpGenerator.generate(6, {
          upperCaseAlphabets: false,
        })
        console.log("Regenerated OTP due to collision:", otp);
      }
      
      const otpPayload = { email, otp }
      console.log("OTP Payload to save:", otpPayload);
      
      const otpBody = await OTP.create(otpPayload)
      console.log("OTP Body after save:", otpBody);
      console.log("OTP saved successfully with ID:", otpBody._id);
      
      // Verify the OTP was saved correctly
      const savedOtp = await OTP.findById(otpBody._id);
      console.log("Verification - Saved OTP from DB:", savedOtp);
      
      // Note: Email is sent by the OTP model pre-save hook to avoid duplicate sends here.

      res.status(200).json({
        success: true,
        message: `OTP sent successfully to your email address`,
      })
    } catch (error) {
      console.log("=== SEND OTP ERROR ===");
      console.log("Error message:", error.message);
      console.log("Full error:", error);
      return res.status(500).json({ success: false, error: error.message })
    }
  }
  
// signup

exports.signup = async (req, res) => {
    try {
      // Destructure fields from the request body
      const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
        accountType,
        contactNumber,
        otp
      } = req.body
      // Check if All Details are there or not
      if (
        !firstName ||
        !lastName ||
        !email ||
        !password ||
        !confirmPassword ||
        !otp
      ) {
        return res.status(403).send({
          success: false,
          message: "All Fields are required",
        })
      }
      // Check if password and confirm password match
      if (password !== confirmPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Password and Confirm Password do not match. Please try again.",
        })
      }
  
      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists. Please sign in to continue.",
        })
      }
  
      // Find the most recent OTP for the email
      const response = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1)
      console.log(response)
      if (response.length === 0) {
        // OTP not found for the email
        return res.status(400).json({
          success: false,
          message: "The OTP is not valid",
        })
      } else if (otp !== response[0].otp) {
        // Invalid OTP
        return res.status(400).json({
          success: false,
          message: "The OTP is not valid",
        })
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10)
  
      // Create the user with role-based approval logic
      let approved = true;
      let enrollmentFeePaid = false;
      let paymentStatus = "Pending";
      
      // Set approval and payment status based on account type
      if (accountType === "Instructor") {
        approved = false; // Instructors need admin approval
      } else if (accountType === "Student") {
        approved = true; // Students are auto-approved but need to pay enrollment fee
        enrollmentFeePaid = false;
        paymentStatus = "Pending";
      } else if (accountType === "Admin" || accountType === "SuperAdmin" || accountType === "Staff") {
        approved = true; // Admin roles are auto-approved
        enrollmentFeePaid = true; // No enrollment fee for admin roles
        paymentStatus = "Completed";
      }
  
      // Create the Additional Profile For User
      const profileDetails = await Profile.create({
        gender: null,
        dateOfBirth: null,
        about: null,
        contactNumber: null,
      })

      // User type is no longer used in signup

      const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password: hashedPassword,
        accountType: accountType,
        approved: approved,
        enrollmentFeePaid: enrollmentFeePaid,
        paymentStatus: paymentStatus,
        additionalDetails: profileDetails._id,
        image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
      })
  
      return res.status(200).json({
        success: true,
        user,
        message: "User registered successfully. Please login to continue.",
        requiresPayment: accountType === "Student" && !enrollmentFeePaid
      })
    } catch (error) {
      console.log(error)
      return res.status(500).json({
        success: false,
        message: "User cannot be registered. Please try again.",
      })
    }
  }


// exports.login = async(req,res)=>{
  
//     try{
  
//         //fetch data
//     const {email , password}=req.body;

//     //validate
//     if(!email || !password){
//       return res.status(403).json({
//           success:false,
//           message:"Please fill all the details",
//       });
//     }
  
//     const user= await User.findOne({email}).populate("additionalDetails");
  
//     if(!user){
//       return res.status(401).json({
//           success:false,
//           message:"User is not registered",
//       });
//     }

//     //generate jwt , after password matching

//     if(await bcrypt.compare(password , user.password)){
//         const payload={
//             email:user.email,
//             id:user._id,
//             accountType:user.accountType,
//         }
//         const token = jwt.sign(payload , process.env.JWT_SECRET,{
//            expiresIn:"24h",
//         });

//        user.token = token;
//        user.password= undefined;

//        //create cookies

//        const options={
//          expires:new Date(Date.now() + 3*24*60*60*1000),
//          httpOnly:true,
//        }

//        // Check if user is a student and hasn't paid enrollment fee
//        if(user.accountType === "Student" && !user.enrollmentFeePaid) {
//          return res.cookie("token" , token , options).status(200).json({
//            success: true,
//            message: "Login successful. Please complete enrollment fee payment.",
//            token,
//            user,
//            requiresPayment: true,
//            paymentAmount: 1000 // 1000 rupees enrollment fee
//          });
//        }

//        res.cookie("token" , token , options).status(200).json({
  
//         success:true,
//         message:"Logged in successfully",
//         token,
//         user,
//         message: `User Login Success`,
//        })

//     }else{
//         return res.status(401).json({
//             success:false,
//             message:"Password is incorrect",
//         });
//     }

//  }
//     catch(err){
//     console.log(err);
//        return res.status(500).json({
//         success:false,
//         message:"Login failure , please try again",
//        })
//     }
    

// };

exports.login = async (req, res) => {
  try {
    // Set CORS headers for all responses
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await User.findOne({ email }).populate("additionalDetails").populate("userType");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not registered",
      });
    }

    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };

      // Generate access token (24 hours)
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h"
      });

      // Generate refresh token (7 days)
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Update user with refresh token
      user.token = token;
      user.refreshToken = refreshToken;
     
      await user.save();

      // Secure cookie settings for access token (24 hours)
      const cookieOptions = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      };

      // Set refresh token in a separate cookie
      const refreshCookieOptions = {
        ...cookieOptions,
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        path: "/api/v1/auth/refresh-token",
      };

      // Set both cookies and return response
      return res
        .cookie("token", token, cookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .status(200)
        .json({
          success: true,
          message: "Login successful",
          user: {
            ...user._doc,
            password: undefined,
            userType: user.userType ? {
              _id: user.userType._id,
              name: user.userType.name,
              contentManagement: user.userType.contentManagement,
              trainerManagement: user.userType.trainerManagement,
            } : null,
          },
          token,
          refreshToken, // Also send refresh token in response body for mobile clients
        });
    }

    return res.status(401).json({
      success: false,
      message: "Incorrect password",
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};


//change password

exports.changePassword = async (req, res) => {
    try {
      console.log('Authenticated user from token:', req.user);
      
      if (!req.user || !req.user._id) {
        console.error('User ID not found in request');
        return res.status(400).json({ success: false, message: 'User not authenticated' });
      }

      // Get user data from database with password field explicitly selected
      const userDetails = await User.findById(req.user._id).select('+password');
      
      if (!userDetails) {
        console.error('User not found in database');
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      if (!userDetails.password) {
        console.error('User has no password set');
        return res.status(400).json({ 
          success: false, 
          message: 'No password set for this account. Please use password reset.' 
        });
      }
  
      // Get old password, new password, and confirm new password from req.body
      const { oldPassword, newPassword } = req.body;
      
      console.log('Received request to change password for user:', userDetails.email);
  
      // Validate old password
      const isPasswordMatch = await bcrypt.compare(
        oldPassword,
        userDetails.password
      )
      if (!isPasswordMatch) {
        // If old password does not match, return a 401 (Unauthorized) error
        return res
          .status(401)
          .json({ success: false, message: "The password is incorrect" })
      }
  
      // Update password
      const encryptedPassword = await bcrypt.hash(newPassword, 10);
      const updatedUserDetails = await User.findByIdAndUpdate(
        req.user._id,  // Use _id instead of id
        { password: encryptedPassword },
        { new: true }
      ).select('+password');  // Make sure to get the updated document
      
      if (!updatedUserDetails) {
        console.error('Failed to update user password');
        return res.status(500).json({
          success: false,
          message: 'Failed to update password. Please try again.'
        });
      }
  
      // Send notification email (only if user has an email)
      if (updatedUserDetails.email) {
        try {
          const userName = updatedUserDetails.firstName || 'User';
          const emailResponse = await mailSender(
            updatedUserDetails.email,
            "Password for your account has been updated",
            `Your password has been successfully updated.\n\n` +
            `If you did not make this change, please contact support immediately.`
          );
          console.log("Email sent successfully:", emailResponse?.response || 'Email queued');
        } catch (emailError) {
          // Log email error but don't fail the password update
          console.error("Error sending notification email:", emailError);
        }
      }

      // Return success response
      return res
        .status(200)
        .json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while updating password:", error);
      return res.status(500).json({
        success: false,
        message: error.message || "Error updating password",
        error: error.message,
      });
    }
  };

  exports.refreshToken = async (req, res) => {
  try {
    // Set CORS headers
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    // Get refresh token from cookies, body, or headers
    let refreshToken = req.cookies.refreshToken || req.body.refreshToken;
    
    // If not found in cookies or body, try Authorization header
    if (!refreshToken && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      refreshToken = req.headers.authorization.split(' ')[1];
    }
    
    if (!refreshToken) {
      console.error('No refresh token provided');
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Verify the refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    } catch (err) {
      console.error('Token verification error:', err);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired refresh token",
      });
    }

    // Find user by ID from the token
    const user = await User.findById(decoded.id)
      .select('+refreshToken')
      .populate("additionalDetails");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }
    
    // Verify the refresh token matches the one in the database
    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Generate new access token
    const payload = {
      email: user.email,
      id: user._id,
      accountType: user.accountType,
    };
    
    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Generate new refresh token
    const newRefreshToken = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Update user's tokens in database
    user.token = newAccessToken;
    user.refreshToken = newRefreshToken;
    await user.save();

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    };

    // Prepare user data for response
    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      accountType: user.accountType,
      image: user.image,
      enrollmentFeePaid: user.enrollmentFeePaid,
      approved: user.approved,
      additionalDetails: user.additionalDetails,
      userType: user.userType,
    };

    // Set both cookies and send response
    res
      .cookie("token", newAccessToken, { 
        ...cookieOptions, 
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: "/"
      })
      .cookie("refreshToken", newRefreshToken, { 
        ...cookieOptions, 
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: "/"
      })
      .status(200)
      .json({
        success: true,
        message: "Token refreshed successfully",
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        user: userData
      });
  } catch (error) {
    console.log("Refresh token error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to refresh token",
    });
  }
};
// Logout controller
exports.logout = async (req, res) => {
try {
  // Get the user ID from the request (set by auth middleware)
  const userId = req.user?.id;
  
  // Clear both cookies
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  // Clear access token cookie
  res.clearCookie('token', {
    ...cookieOptions,
    path: '/',
  });

  // Clear refresh token cookie
  res.clearCookie('refreshToken', {
    ...cookieOptions,
    path: '/api/v1/auth/refresh-token',
  });

  // Clear tokens from the database if user ID is available
  if (userId) {
    await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          token: null, 
          refreshToken: null 
        } 
      },
      { new: true }
    );
  }

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
} catch (error) {
  console.error('Logout error:', error);
  return res.status(500).json({
    success: false,
    message: 'Error logging out',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined,
  });
}
};