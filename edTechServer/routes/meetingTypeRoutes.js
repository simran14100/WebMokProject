const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { protect, isAdmin, isSuperAdmin, isAdminLevel } = require('../middleware/auth');
const {
    createMeetingType,
    getMeetingTypes,
    getMeetingTypeById,
    updateMeetingType,
    deleteMeetingType,
    getActiveMeetingTypes
} = require('../controllers/MeetingTypeController');

// Apply auth middleware to all routes
router.use(protect);

// Middleware to check for admin-level access (Admin, SuperAdmin, Staff)
const checkAdminAccess = (req, res, next) => {
    if (req.user.accountType === 'SuperAdmin' || req.user.accountType === 'Admin' || req.user.accountType === 'Staff') {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Access denied. Requires admin, staff, or super admin privileges.'
    });
};

// Get all meeting types (with filters)
router.get(
    '/',
    checkAdminAccess,
    getMeetingTypes
);

// Get active meeting types (for dropdowns)
router.get(
    '/active',
    getActiveMeetingTypes
);

// Create new meeting type
router.post(
    '/',
    checkAdminAccess,
    [
        body('name', 'Name is required').notEmpty(),
        body('duration', 'Duration is required').isInt({ min: 5 }),
        body('color', 'Valid color is required').matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    ],
    createMeetingType
);

// Get single meeting type
router.get(
    '/:id',
    checkAdminAccess,
    [
        param('id', 'Invalid meeting type ID').isMongoId()
    ],
    getMeetingTypeById
);

// Update meeting type
router.put(
    '/:id',
    checkAdminAccess,
    [
        param('id', 'Invalid meeting type ID').isMongoId(),
        body('name', 'Name is required').optional().notEmpty(),
        body('duration', 'Duration must be at least 5 minutes').optional().isInt({ min: 5 }),
        body('color', 'Valid color is required').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
    ],
    updateMeetingType
);

// Delete meeting type
router.delete(
    '/:id',
    (req, res, next) => {
        // Only allow SuperAdmin or Admin to delete
        if (req.user.accountType === 'SuperAdmin' || req.user.accountType === 'Admin') {
            return next();
        }
        return res.status(403).json({
            success: false,
            message: 'Access denied. Requires admin or super admin privileges.'
        });
    },
    [
        param('id', 'Invalid meeting type ID').isMongoId()
    ],
    deleteMeetingType
);

module.exports = router;
