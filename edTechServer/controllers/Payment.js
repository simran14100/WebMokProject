const {instance} = require("../config/razorpay")
const Course = require("../models/Course")
const crypto = require("crypto")
const User = require("../models/User")
const mailSender = require("../utils/mailSender")
const mongoose = require("mongoose")
const {
  courseEnrollmentEmail,
} = require("../mail/templates/courseEnrollmentEmail")
const { paymentSuccessEmail } = require("../mail/templates/paymentSuccessEmail")
const CourseProgress = require("../models/CourseProgress")
const {convertSecondsToDuration} = require("../utils/secToDuration")
const { createAdmissionConfirmation } = require("./AdmissionConfirmation")


// Capture the payment and initiate the Razorpay order
exports.capturePayment = async (req, res) => {
  const { courses } = req.body
  const userId = req.user.id
  if (courses.length === 0) {
    return res.json({ success: false, message: "Please Provide Course ID" })
  }

  // Check if user has paid enrollment fee (for students)
  const user = await User.findById(userId);
  if (user.accountType === "Student" && !user.enrollmentFeePaid) {
    return res.status(403).json({ 
      success: false, 
      message: "Please complete enrollment fee payment before enrolling in courses" 
    });
  }

  let total_amount = 0

  for (const course_id of courses) {
    let course
    try {
      // Find the course by its ID
      course = await Course.findById(course_id)

      // If the course is not found, return an error
      if (!course) {
        return res
          .status(200)
          .json({ success: false, message: "Could not find the Course" })
      }

      // Check if the user is already enrolled in the course
    
      const uid = new mongoose.Types.ObjectId(userId)
      if (course.studentsEnrolled.includes(uid)) {
        return res
          .status(200)
          .json({ success: false, message: "Student is already Enrolled" })
      }

      // Add the price of the course to the total amount
      total_amount += course.price
    } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false, message: error.message })
    }
  }

  const options = {
    amount: total_amount * 100,
    currency: "INR",
    receipt: Math.random(Date.now()).toString(),
  }

  try {
    // Initiate the payment using Razorpay
    const paymentResponse = await instance.orders.create(options)
    console.log(paymentResponse)
    res.json({
      success: true,
      data: paymentResponse,
    })
  } catch (error) {
    console.log(error)
    res
      .status(500)
      .json({ success: false, message: "Could not initiate order." })
  }
}

// verify the payment
exports.verifyPayment = async (req, res) => {
  try {
    console.log("=== PAYMENT VERIFICATION STARTED ===");
    console.log("Request body:", req.body);
    console.log("User ID:", req.user?.id);
    
    const razorpay_order_id = req.body?.razorpay_order_id
    const razorpay_payment_id = req.body?.razorpay_payment_id
    const razorpay_signature = req.body?.razorpay_signature
    const courses = req.body?.courses

    const userId = req.user.id

    console.log("Payment verification request:", {
      razorpay_order_id,
      razorpay_payment_id,
      courses,
      userId
    });

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !courses ||
      !userId
    ) {
      console.log("Missing required fields for payment verification");
      return res.status(400).json({ success: false, message: "Payment Failed - Missing required fields" })
    }

    let body = razorpay_order_id + "|" + razorpay_payment_id

    console.log("raz- secret " , process.env.RAZORPAY_KEY_SECRET)
    console.log("raz-key" , process.env.RAZORPAY_KEY_ID)
    
    if (!process.env.RAZORPAY_KEY_SECRET) {
      console.error("RAZORPAY_KEY_SECRET is not set");
      return res.status(500).json({ success: false, message: "Payment verification failed - server configuration error" })
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex")

    console.log("Expected signature:", expectedSignature);
    console.log("Received signature:", razorpay_signature);

    if (expectedSignature === razorpay_signature) {
      console.log("Signature verified successfully");
      console.log("=== ENROLLING STUDENT ===");
      await enrollStudents(courses, userId, res, req.body)
      console.log("=== PAYMENT VERIFICATION COMPLETED SUCCESSFULLY ===");
      return res.status(200).json({ success: true, message: "Payment Verified" })
    } else {
      console.log("Signature verification failed");
      return res.status(400).json({ success: false, message: "Payment Failed - Invalid signature" })
    }
  } catch (error) {
    console.error("=== PAYMENT VERIFICATION ERROR ===");
    console.error("Error in verifyPayment:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      success: false, 
      message: "Payment verification failed - server error",
      error: error.message 
    })
  }
}

// Send Payment Success Email
exports.sendPaymentSuccessEmail = async (req, res) => {
  const { orderId, paymentId, amount } = req.body

  const userId = req.user.id

  if (!orderId || !paymentId || !amount || !userId) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all the details" })
  }

  try {
    const enrolledStudent = await User.findById(userId)

    await mailSender(
      enrolledStudent.email,
      `Payment Received`,
      paymentSuccessEmail(
        `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
        amount / 100,
        orderId,
        paymentId
      )
    )
  } catch (error) {
    console.log("error in sending mail", error)
    return res
      .status(400)
      .json({ success: false, message: "Could not send email" })
  }
}

// enroll the student in the courses
const enrollStudents = async (courses, userId, res, paymentData) => {
  try {
    if (!courses || !userId) {
      return res
        .status(400)
        .json({ success: false, message: "Please Provide Course ID and User ID" })
    }

    // Check if user has paid enrollment fee (for students)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }
    
    if (user.accountType === "Student" && !user.enrollmentFeePaid) {
      return res.status(403).json({ 
        success: false, 
        message: "Please complete enrollment fee payment before enrolling in courses" 
      });
    }

    for (const courseId of courses) {
      try {
        // Find the course and enroll the student in it
        const enrolledCourse = await Course.findOneAndUpdate(
          { _id: courseId },
          { $push: { studentsEnrolled: userId } },
          { new: true }
        )

        if (!enrolledCourse) {
          return res
            .status(500)
            .json({ success: false, error: "Course not found" })
        }
        console.log("Updated course: ", enrolledCourse)

        // Calculate duration safely
        let durationString = "N/A";
        try {
          if (enrolledCourse.durationInSeconds) {
            durationString = convertSecondsToDuration(enrolledCourse.durationInSeconds);
          }
          console.log("Course Duration: ", durationString);
        } catch (durationError) {
          console.log("Error calculating duration:", durationError);
        }

        const courseProgress = await CourseProgress.create({
          courseID: courseId,
          userId: userId,
          completedVideos: [],
        })
        
        // Find the student and add the course to their list of enrolled courses
        const enrolledStudent = await User.findByIdAndUpdate(
          userId,
          {
            $push: {
              courses: courseId,
              courseProgress: courseProgress._id,
            },
          },
          { new: true }
        )

        console.log("Enrolled student: ", enrolledStudent)
        
        // Create admission confirmation record for admin review
        try {
          if (typeof createAdmissionConfirmation === 'function') {
            await createAdmissionConfirmation(userId, courseId, {
              orderId: paymentData?.razorpay_order_id || 'N/A',
              paymentId: paymentData?.razorpay_payment_id || 'N/A',
              amount: enrolledCourse.price,
              paidAt: new Date()
            });
            console.log("Admission confirmation record created");
          } else {
            console.log("createAdmissionConfirmation function not available");
          }
        } catch (admissionError) {
          console.error("Error creating admission confirmation:", admissionError);
        }

        // Send an email notification to the enrolled student
        try {
          const emailResponse = await mailSender(
            enrolledStudent.email,
            `Successfully Enrolled into ${enrolledCourse.courseName}`,
            courseEnrollmentEmail(
              enrolledCourse.courseName,
              `${enrolledStudent.firstName} ${enrolledStudent.lastName}`,
              durationString
            )
          )
          console.log("Email sent successfully: ", emailResponse.response)
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }
        
      } catch (error) {
        console.error("Error enrolling in course:", error);
        return res.status(400).json({ success: false, error: error.message })
      }
    }
  } catch (error) {
    console.error("Error in enrollStudents:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to enroll student",
      error: error.message 
    })
  }
}