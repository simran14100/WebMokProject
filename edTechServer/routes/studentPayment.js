const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const studentPaymentController = require('../controllers/studentPaymentController');

// Debug route to test if routes are working
router.get('/test', (req, res) => {
  console.log('Test route hit');
  res.json({ success: true, message: 'Test route is working' });
});

// Protect all routes with authentication
router.use(auth);

// Create Razorpay order
router.post('/create-order', studentPaymentController.createOrder);

// Verify payment
router.post('/verify', (req, res) => {
  console.log('Verify payment route hit');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  
  // Call the controller function
  studentPaymentController.verifyPayment(req, res);
});

// Get payment history for student
router.get('/history', studentPaymentController.getStudentPaymentHistory);

module.exports = router;
