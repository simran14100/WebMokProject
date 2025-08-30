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

//login
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

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "24h",
      });

      // Secure cookie settings
      const cookieOptions = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      };

      // Return both cookie and token in response
      return res.cookie("token", token, cookieOptions).status(200).json({
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
        // Still return token for mobile clients
        token,
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
      // Get user data from req.user
      const userDetails = await User.findById(req.user.id)
  
      // Get old password, new password, and confirm new password from req.body
      const { oldPassword, newPassword } = req.body
  
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
      const encryptedPassword = await bcrypt.hash(newPassword, 10)
      const updatedUserDetails = await User.findByIdAndUpdate(
        req.user.id,
        { password: encryptedPassword },
        { new: true }
      )
  
      // Send notification email
      try {
        const emailResponse = await mailSender(
          updatedUserDetails.email,
          "Password for your account has been updated",
          passwordUpdated(
            updatedUserDetails.email,
            `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
          )
        )
        console.log("Email sent successfully:", emailResponse.response)
      } catch (error) {
        // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while sending email:", error)
        return res.status(500).json({
          success: false,
          message: "Error occurred while sending email",
          error: error.message,
        })
      }
  
      // Return success response
      return res
        .status(200)
        .json({ success: true, message: "Password updated successfully" })
    } catch (error) {
      // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
      console.error("Error occurred while updating password:", error)
      return res.status(500).json({
        success: false,
        message: "Error occurred while updating password",
        error: error.message,
      })
    }
  }

// Refresh token endpoint
exports.refreshToken = async (req, res) => {
  try {
    // Get user from the request (set by auth middleware)
    const user = await User.findById(req.user.id).populate("additionalDetails").populate("userType");
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate new token
    const payload = {
      email: user.email,
      id: user._id,
      accountType: user.accountType,
    };
    
    const newToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    // Update user's token in database
    user.token = newToken;
    await user.save();

    // Create cookie options
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };

    res.cookie("token", newToken, options).status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token: newToken,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        accountType: user.accountType,
        image: user.image,
        enrollmentFeePaid: user.enrollmentFeePaid,
        approved: user.approved,
        additionalDetails: user.additionalDetails,
        userType: user.userType ? {
          _id: user.userType._id,
          name: user.userType.name,
          contentManagement: user.userType.contentManagement,
          trainerManagement: user.userType.trainerManagement,
        } : null,
      },
    });
  } catch (error) {
    console.log("Refresh token error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to refresh token",
    });
  }
};