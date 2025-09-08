const express = require('express');
const {
  createFeeType,
  getFeeTypes,
  getFeeType,
  updateFeeType,
  deleteFeeType,
  getFeeTypeStatistics,
  assignFeeType,
} = require('../controllers/feeTypeController');
const { protect, isSuperAdmin } = require('../middlewares/auth');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Check if user has required role
router.use((req, res, next) => {
  const allowedRoles = ['university', 'Admin', 'SuperAdmin'];
  const userRole = req.user?.accountType || req.user?.role;
  
  if (!userRole || !allowedRoles.includes(userRole)) {
    return res.status(403).json({
      success: false,
      message: `User role '${userRole}' is not authorized to access this route`,
      requiredRoles: allowedRoles,
      userRole: userRole
    });
  }
  next();
});

// Only SuperAdmins can create fee types
router.route('/')
  .post(isSuperAdmin, createFeeType)
  .get(getFeeTypes);

router.get('/statistics', getFeeTypeStatistics);

router
  .route('/:id')
  .get(getFeeType)
  .put(updateFeeType)
  .delete(deleteFeeType);

// Assign fee type to course/student
router.post('/:id/assign', assignFeeType);

module.exports = router;
