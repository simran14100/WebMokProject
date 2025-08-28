const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const {
    getHonoraryEnquiries,
    getHonoraryEnquiryById,
    createHonoraryEnquiry,
    updateHonoraryEnquiry,
    deleteHonoraryEnquiry
} = require('../controllers/HonoraryEnquiryController');

// Public routes (no authentication required for submission)
router.post(
    '/',
    [
        body('studentName', 'Student name is required').notEmpty(),
        body('email', 'Please include a valid email').isEmail(),
        body('phone', 'Phone number is required').notEmpty(),
        body('department', 'Department is required').notEmpty(),
    ],
    createHonoraryEnquiry
);

// Protected routes (admin access required)
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.get('/', getHonoraryEnquiries);
router.get('/:id', getHonoraryEnquiryById);
router.put(
    '/:id',
    [
        body('status', 'Status is required').optional().isIn(['pending', 'contacted', 'accepted', 'rejected']),
    ],
    updateHonoraryEnquiry
);
router.delete('/:id', deleteHonoraryEnquiry);

module.exports = router;
