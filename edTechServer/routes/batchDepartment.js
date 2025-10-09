const express = require("express");
const router = express.Router();

const { auth } = require("../middlewares/auth");
const User = require("../models/User");
const { 
  createBatchDepartment, 
  listBatchDepartments, 
  updateBatchDepartment, 
  deleteBatchDepartment 
} = require("../controllers/BatchDepartment");

// Custom middleware to allow either Admin or SuperAdmin
const isAdminOrSuperAdmin = async (req, res, next) => {
  try {
    console.log('Checking admin/superadmin access for:', req.user.email);
    const user = await User.findOne({ email: req.user.email });
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log('User details:', {
      accountType: user.accountType,
      role: user.role,
      _id: user._id
    });

    // Check both accountType and role fields
    const isAdmin = user.accountType === 'Admin' || user.role === 'Admin';
    const isSuperAdmin = user.accountType === 'SuperAdmin' || user.role === 'SuperAdmin';

    if (isAdmin || isSuperAdmin) {
      console.log('Access granted - User is Admin or SuperAdmin');
      return next();
    }

    console.log('Access denied - User is not Admin or SuperAdmin');
    return res.status(403).json({
      success: false,
      message: 'Access denied. Requires Admin or SuperAdmin role',
      userRole: user.accountType || user.role
    });
  } catch (error) {
    console.error('Error in isAdminOrSuperAdmin middleware:', error);
    return res.status(500).json({
      success: false,
      message: 'Error verifying user role',
    });
  }
};

// List all batch departments; optional ?onlyActive=true
router.get("/", auth, isAdminOrSuperAdmin, listBatchDepartments);

// Create batch department
router.post("/", auth, isAdminOrSuperAdmin, createBatchDepartment);

// Update batch department
router.patch("/:id", auth, isAdminOrSuperAdmin, updateBatchDepartment);

// Delete batch department
router.delete("/:id", auth, isAdminOrSuperAdmin, deleteBatchDepartment);

module.exports = router;


