const express = require('express');
const router = express.Router();
const { auth, isAdminOrSuperAdmin } = require('../middlewares/auth');
const {
    getAllAdmissionConfirmations,
    getAdmissionConfirmationById,
    confirmAdmission,
    rejectAdmission,
    getAdmissionStats
} = require('../controllers/AdmissionConfirmation');

// All routes require authentication and admin/super admin privileges
router.use(auth);
router.use(isAdminOrSuperAdmin);

// Get all admission confirmations with pagination and filtering
router.get('/confirmations', getAllAdmissionConfirmations);

// Get admission confirmation by ID
router.get('/confirmations/:confirmationId', getAdmissionConfirmationById);

// Confirm admission
router.put('/confirmations/:confirmationId/confirm', confirmAdmission);

// Reject admission
router.put('/confirmations/:confirmationId/reject', rejectAdmission);

// Get admission statistics
router.get('/stats', getAdmissionStats);

module.exports = router; 