const Razorpay = require('razorpay');
const crypto = require('crypto');
const Student = require('../models/UniversityRegisteredStudent');
const StudentPayment = require('../models/StudentPayment');
const mailSender = require('../utils/mailSender');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Create Razorpay order
exports.createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt, notes = {} } = req.body;
    const studentId = req.user._id;

    // Validate amount
    if (!amount || isNaN(amount) || amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid amount'
      });
    }

    // Create order in Razorpay
    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      notes: {
        ...notes,
        studentId: studentId.toString()
      }
    });

    res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

// Verify payment and save to database
exports.verifyPayment = async (req, res) => {
  console.log('=== VERIFY PAYMENT START ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  if (!req.body.razorpay_order_id || !req.body.razorpay_payment_id || !req.body.razorpay_signature) {
    console.error('Missing required fields in request body');
    return res.status(400).json({
      success: false,
      message: 'Missing required payment verification data'
    });
  }
  
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const studentId = req.user._id;

    console.log('Verifying payment with:', {
      razorpay_order_id,
      razorpay_payment_id,
      studentId,
      hasSignature: !!razorpay_signature
    });

    // Verify the payment signature
    console.log('Verifying payment signature...');
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generatedSignature = hmac.digest('hex');
    
    console.log('Generated signature:', generatedSignature);
    console.log('Received signature:', razorpay_signature);

    if (generatedSignature !== razorpay_signature) {
      console.error('Signature verification failed');
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
        debug: {
          generatedSignature,
          receivedSignature: razorpay_signature
        }
      });
    }

    // Get order details from Razorpay
    console.log('Fetching order details from Razorpay...');
    console.log('Razorpay instance config:', {
      key_id: razorpay.key_id ? '***REDACTED***' : 'MISSING',
      key_secret: razorpay.key_secret ? '***REDACTED***' : 'MISSING'
    });
    
    const order = await razorpay.orders.fetch(razorpay_order_id);
    console.log('Order details from Razorpay API:', {
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      attempts: order.attempts,
      created_at: order.created_at,
      notes: order.notes
    });
    
    const amount = order.amount / 100; // Convert back to rupees
    
    console.log('Order details from Razorpay:', {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      status: order.status,
      notes: order.notes
    });

    // Get student details for email
    console.log('Fetching student details for ID:', studentId);
    
    // Initialize student variable
    let student = null;
    
    try {
      // Try to find the user in the User model first
      const User = require('../models/User');
      let user = await User.findById(studentId).select('firstName email contactNumber').lean();
      
      if (user) {
        console.log('Found user in User model:', {
          id: user._id,
          name: user.firstName,
          email: user.email
        });
        
        // Use user data as the student
        student = {
          _id: user._id,
          firstName: user.firstName || 'Student',
          email: user.email,
          contactNumber: user.contactNumber || ''
        };
        
        console.log('Using user account data for payment record');
      } else {
        // If not found in User model, try UniversityRegisteredStudent
        console.log('User not found in User model, trying UniversityRegisteredStudent...');
        const studentDoc = await Student.findById(studentId).lean();
        
        if (!studentDoc) {
          console.error('Student not found in any collection with ID:', studentId);
          return res.status(404).json({
            success: false,
            message: 'Student record not found. Please contact support with this reference: ' + studentId
          });
        }
        
        console.log('Found student in UniversityRegisteredStudent:', {
          id: studentDoc._id,
          name: studentDoc.firstName,
          email: studentDoc.email
        });
        
        student = studentDoc;
      }
    } catch (error) {
      console.error('Error fetching student/user:', error);
      return res.status(500).json({
        success: false,
        message: 'Error processing payment. Please try again or contact support.',
        error: error.message
      });
    }
    
    console.log('Processing payment for:', {
      id: student._id,
      name: student.firstName,
      email: student.email
    });

    // Create student payment record
    const paymentData = {
      student: studentId,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount,
      currency: order.currency,
      status: 'captured',
      feeType: order.notes?.feeType || 'General Fee',
      academicYear: order.notes?.academicYear || new Date().getFullYear(),
      paymentMethod: 'razorpay',
      paymentDetails: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        status: order.status,
        attempts: order.attempts,
        created_at: order.created_at
      }
    };
    
    console.log('Creating payment record with data:', JSON.stringify(paymentData, null, 2));

    console.log('Creating payment record with data:', JSON.stringify(paymentData, null, 2));
    
    const payment = new StudentPayment(paymentData);
    await payment.save();
    
    console.log('Payment record created successfully:', payment._id);

    // Update student's payment status if needed
    console.log('Updating student record with payment reference...');
    try {
      const updatedStudent = await Student.findByIdAndUpdate(
        studentId,
        { $push: { payments: payment._id } },
        { new: true, useFindAndModify: false }
      );
      
      if (!updatedStudent) {
        console.error('Failed to update student record with payment reference');
        // Don't fail the whole operation if this update fails
      } else {
        console.log('Student record updated with payment reference:', updatedStudent._id);
      }
    } catch (updateError) {
      console.error('Error updating student record with payment reference:', updateError);
      // Don't fail the whole operation if this update fails
    }

    // Send payment confirmation email
    try {
      const emailSubject = `Payment Confirmation - ${razorpay_payment_id}`;
      const formattedAmount = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2
      }).format(amount);
      
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #2c3e50; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Payment Confirmation</h2>
          <p>Dear ${student.firstName || 'Student'},</p>
          <p>Your payment has been successfully processed. Below are the details:</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; border: 1px solid #e0e0e0;">
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; background-color: #f9f9f9;">Payment ID:</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${razorpay_payment_id}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; background-color: #f9f9f9;">Order ID:</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${razorpay_order_id}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; background-color: #f9f9f9;">Amount Paid:</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${formattedAmount}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; background-color: #f9f9f9;">Date:</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${new Date().toLocaleString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Kolkata'
              })}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #e0e0e0; font-weight: bold; background-color: #f9f9f9;">Fee Type:</td>
              <td style="padding: 10px; border: 1px solid #e0e0e0;">${order.notes?.feeType || 'General Fee'}</td>
            </tr>
          </table>
          
          <p style="color: #555; font-size: 14px; margin-top: 20px;">
            Thank you for your payment. This is a system generated email, please do not reply.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #777; font-size: 12px;">
            <p>Best regards,<br>University Administration</p>
          </div>
        </div>
      `;
      
      await mailSender(student.email, emailSubject, emailBody);
    } catch (emailError) {
      console.error('Error sending payment confirmation email:', emailError);
      // Continue even if email fails
    }

    res.json({
      success: true,
      message: 'Payment verified and recorded successfully',
      payment: {
        _id: payment._id,
        orderId: payment.orderId,
        paymentId: payment.paymentId,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        feeType: payment.feeType,
        createdAt: payment.createdAt
      }
    });
  } catch (error) {
    console.error('Error in verifyPayment:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...error
    });
    
    // Send detailed error response in development, generic in production
    const errorResponse = {
      success: false,
      message: 'Failed to process payment verification'
    };
    
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error = {
        message: error.message,
        stack: error.stack,
        name: error.name
      };
    }
    
    res.status(500).json(errorResponse);
  }
};

// Get student payment history
exports.getStudentPaymentHistory = async (req, res) => {
  try {
    const studentId = req.user._id;
    
    const payments = await StudentPayment.find({ student: studentId })
      .sort({ createdAt: -1 })
      .populate('student', 'name email registrationNumber')
      .lean();

    res.json({
      success: true,
      data: payments
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
};
