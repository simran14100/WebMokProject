const mongoose = require('mongoose');
const razorpay = require("../config/razorpay");
const Course = require("../models/Course");
const crypto = require("crypto");
const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const { courseEnrollmentEmail } = require("../mail/templates/courseEnrollmentEmail");
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail");
const CourseProgress = require("../models/CourseProgress");
const { convertSecondsToDuration } = require("../utils/secToDuration");
const { createAdmissionConfirmation } = require("./AdmissionConfirmation");

// Get Razorpay key
const getRazorpayKey = async (req, res) => {
  try {
    if (!process.env.RAZORPAY_KEY_ID) {
      throw new Error('Razorpay key ID is not configured');
    }
    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error getting Razorpay key:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment key',
      error: error.message
    });
  }
};
// Capture payment and create Razorpay order
const capturePayment = async (req, res) => {
  try {
    const { courses } = req.body;
    const userId = req.user?._id;

    // Validate userId is present
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is missing in the request'
      });
    }

    // Ensure courses is an array
    if (!Array.isArray(courses)) {
      return res.status(400).json({ 
        success: false, 
        message: "Courses should be an array" 
      });
    }

    if (courses.length === 0) {
      return res.json({ success: false, message: "Please Provide Course IDs" });
    }

    // Check if user is already enrolled in any of the courses
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Find any courses the user is already enrolled in
    const alreadyEnrolledCourses = [];
    for (const courseId of courses) {
      if (user.courses.includes(courseId)) {
        const course = await Course.findById(courseId);
        if (course) {
          alreadyEnrolledCourses.push(course.courseName);
        }
      }
    }

    // If already enrolled in any course, return early
    if (alreadyEnrolledCourses.length > 0) {
      return res.status(200).json({
        success: false,
        alreadyEnrolled: true,
        message: `You are already enrolled in: ${alreadyEnrolledCourses.join(', ')}`,
        enrolledCourses: alreadyEnrolledCourses
      });
    }


     
    let total_amount = 0;
    const courseDetails = [];

    for (const course_id of courses) {
      try {
        const course = await Course.findById(course_id);
        
        if (!course) {
          return res.status(404).json({ 
            success: false, 
            message: `Course not found: ${course_id}` 
          });
        }

        const uid = new mongoose.Types.ObjectId(userId);
        if (course.studentsEnrolled.includes(uid)) {
          return res.status(400).json({ 
            success: false, 
            message: `Already enrolled in course: ${course.courseName}` 
          });
        }

         // Validate amount is provided
    
        total_amount += course.price;
        courseDetails.push({
          id: course._id,
          name: course.courseName,
          price: course.price
        });
      } catch (error) {
        console.error(error);
        return res.status(500).json({ 
          success: false, 
          message: error.message 
        });
      }
    }

    const options = {
      amount: total_amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        courses: JSON.stringify(courseDetails),
        userId: userId?.toString() || ''
      }
    };
    
    // Validate options before creating order
    if (!options.amount || options.amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      });
    }

    const paymentResponse = await razorpay.orders.create(options);
    res.json({
      success: true,
      orderId: paymentResponse.id,
      amount: paymentResponse.amount,
      currency: paymentResponse.currency
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: "Could not initiate payment" 
    });
  }
}

// Verify payment and process enrollment
const verifyPayment = async (req, res) => {
  try {
    const razorpay_order_id = req.body?.razorpay_order_id;
    const razorpay_payment_id = req.body?.razorpay_payment_id;
    const razorpay_signature = req.body?.razorpay_signature;
    const courses = req.body?.courses;
    const userId = req.user?._id;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !courses || !userId) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required payment information" 
      });
    }

    console.log("Verifying payment with order ID:", razorpay_order_id);
    
    // Generate signature for verification
    const generated_signature = crypto
      .createHmac('sha256', razorpay.key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    // Verify the signature
    if (generated_signature !== razorpay_signature) {
      console.error("Invalid signature received");
      return res.status(400).json({ 
        success: false, 
        message: "Invalid payment signature" 
      });
    }

    // Process enrollment if signature is valid
    try {
      await enrollStudents(courses, userId, res, req.body);
      return res.status(200).json({ 
        success: true, 
        message: "Payment verified and enrollment processed successfully" 
      });
    } catch (enrollError) {
      console.error("Error during enrollment:", enrollError);
      return res.status(500).json({ 
        success: false, 
        message: "Error processing enrollment" 
      });
    }
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Internal server error during payment verification" 
    });
  }
};

// Enroll students in courses after successful payment
async function enrollStudents(courses, userId, res, paymentData) {
  try {
    if (!Array.isArray(courses) || courses.length === 0) {
      throw new Error('No courses provided for enrollment');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Process each course enrollment
    for (const courseId of courses) {
      try {
        // Check if already enrolled
        if (user.courses.includes(courseId)) {
          console.log(`User already enrolled in course: ${courseId}`);
          return res.status(200).json({
            success: true,
            message: 'You are already enrolled in this course',
            alreadyEnrolled: true
          });
        }

        const course = await Course.findById(courseId);
        if (!course) {
          console.error(`Course not found: ${courseId}`);
          continue;
        }

        // Add course to user's courses
        user.courses.push(courseId);
        
        // Add user to course's enrolled students
        course.studentsEnrolled.push(userId);

        // Create admission confirmation if needed
        if (typeof createAdmissionConfirmation === 'function') {
          try {
            await createAdmissionConfirmation(userId, courseId, {
              orderId: paymentData?.razorpay_order_id || 'N/A',
              paymentId: paymentData?.razorpay_payment_id || 'N/A',
              amount: course.price || 0,
              paidAt: new Date()
            });
            console.log("Admission confirmation record created");
          } catch (admissionError) {
            console.error("Error creating admission confirmation:", admissionError);
          }
        }

        // Send enrollment email
        try {
          const emailResponse = await mailSender(
            user.email,
            `Successfully Enrolled into ${course.courseName}`,
            courseEnrollmentEmail(
              course.courseName,
              `${user.firstName} ${user.lastName}`,
              course.duration || 'N/A'
            )
          );
          console.log("Email sent successfully:", emailResponse.response);
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }

        // Save course updates
        await course.save();
      } catch (error) {
        console.error(`Error processing course ${courseId}:`, error);
        // Continue with next course even if one fails
      }
    }

    // Save user updates after all courses are processed
    await user.save();
    
  } catch (error) {
    console.error("Error in enrollStudents:", error);
    throw error; // Re-throw to be caught by the caller
  }
}

// Send payment success email
const sendPaymentSuccessEmail = async (req, res) => {
  try {
    const { orderId, paymentId, amount, courses } = req.body;
    const userId = req.user?._id;

    if (!orderId || !paymentId || !amount || !courses || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required payment information'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get course names for the email
    const courseNames = [];
    for (const courseId of courses) {
      const course = await Course.findById(courseId);
      if (course) {
        courseNames.push(course.courseName);
      }
    }

    // Send email
    await mailSender(
      user.email,
      'Payment Successful',
      paymentSuccessEmail({
        orderId,
        paymentId,
        amount,
        courseNames: courseNames.join(', '),
        userName: `${user.firstName} ${user.lastName}`
      })
    );

    return res.status(200).json({
      success: true,
      message: 'Payment success email sent successfully'
    });
  } catch (error) {
    console.error('Error sending payment success email:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to send payment success email',
      error: error.message
    });
  }
};

// Export all controller functions
module.exports = {
  getRazorpayKey,
  capturePayment,
  verifyPayment,
  enrollStudents,
  sendPaymentSuccessEmail
};