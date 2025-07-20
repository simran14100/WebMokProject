const express = require("express");
const router = express.Router();

// Import admin dashboard controllers
const {
    getRegisteredUsers,
    getEnrolledStudents,
    getPendingInstructors,
    approveInstructor,
    getDashboardStats,
    updateUserStatus
} = require("../controllers/AdminDashboard");

// Import middleware
const { auth, isAdminLevel } = require("../middlewares/auth");

// ********************************************************************************************************
//                                      Admin Dashboard routes
// ********************************************************************************************************

// Get all registered users (with pagination and filtering)
router.get("/registered-users", auth, isAdminLevel, getRegisteredUsers);

// Get enrolled students (students who have paid enrollment fee)
router.get("/enrolled-students", auth, isAdminLevel, getEnrolledStudents);

// Get pending instructor approvals
router.get("/pending-instructors", auth, isAdminLevel, getPendingInstructors);

// Approve instructor
router.post("/approve-instructor", auth, isAdminLevel, approveInstructor);

// Get dashboard statistics
router.get("/dashboard-stats", auth, isAdminLevel, getDashboardStats);

// Update user status (activate/deactivate)
router.put("/update-user-status", auth, isAdminLevel, updateUserStatus);

module.exports = router; 