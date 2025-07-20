const express = require('express');
const router = express.Router();
const { auth, isStudent, isAdminOrSuperAdmin } = require('../middlewares/auth');
const {
    createInstallmentPlan,
    getStudentInstallments,
    getInstallmentDetails,
    createInstallmentPaymentOrder,
    verifyInstallmentPayment,
    sendPaymentReminders,
    getAllInstallments,
    getInstallmentStats
} = require('../controllers/PaymentInstallment');

// Student routes (require authentication and student role)
router.use(auth);

// Create installment plan
router.post('/create-plan', isStudent, createInstallmentPlan);

// Get student's installment plans
router.get('/student', isStudent, getStudentInstallments);

// Get installment details
router.get('/details/:installmentId', getInstallmentDetails);

// Create payment order for installment
router.post('/create-payment-order', isStudent, createInstallmentPaymentOrder);

// Verify installment payment
router.post('/verify-payment', isStudent, verifyInstallmentPayment);

// Admin routes (require admin/super admin privileges)
router.use(isAdminOrSuperAdmin);

// Send payment reminders (can be called manually or by cron job)
router.post('/send-reminders', sendPaymentReminders);

// Get all installments (admin view)
router.get('/all', getAllInstallments);

// Get installment statistics
router.get('/stats', getInstallmentStats);

module.exports = router; 