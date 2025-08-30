const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const { body } = require('express-validator');
const { validate } = require('../middlewares/validate');
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
    validate([
        body('studentName', 'Student name is required').notEmpty(),
        body('email', 'Please include a valid email').isEmail(),
        body('phone', 'Phone number is required').notEmpty(),
        body('department', 'Department is required').notEmpty(),
    ]),
    createHonoraryEnquiry
);

// Protected routes (admin access required)
router.use(protect);
router.use(authorize('Admin', 'SuperAdmin'));

router.get('/', getHonoraryEnquiries);
router.get('/:id', getHonoraryEnquiryById);
router.put(
    '/:id',
    validate([
        body('status', 'Status is required').optional().isIn(['pending', 'contacted', 'accepted', 'rejected']),
    ]),
    updateHonoraryEnquiry
);
router.delete('/:id', deleteHonoraryEnquiry);

module.exports = router;
