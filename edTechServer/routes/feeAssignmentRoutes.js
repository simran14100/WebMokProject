const express = require('express');
const { assignFeeType, getFeeAssignments, deleteFeeAssignment } = require('../controllers/feeTypeController');
const { protect } = require('../middlewares/auth');

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

// Assign fee type to course/student
router.post('/', assignFeeType);

// Get all fee assignments for the university
router.get('/', getFeeAssignments);

// Delete a fee assignment
router.delete('/:id', deleteFeeAssignment);

module.exports = router;
