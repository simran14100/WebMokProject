const express = require("express");
const router = express.Router();

// Import admin dashboard controllers
const {
    getRegisteredUsers,
    getEnrolledStudents,
    getAllInstructors,
    getInstructorById,
    getPendingInstructors,
    approveInstructor,
    getDashboardStats,
    updateUserStatus,
    createStudentByAdmin
} = require("../controllers/AdminDashboard");

// Import batch controllers
const { createBatch, listBatches, exportBatches, getBatchById, updateBatch, deleteBatch, addStudentToBatch, removeStudentFromBatch, listBatchStudents } = require("../controllers/Batch");

// Import middleware
const { auth, isAdminLevel, isAdmin } = require("../middlewares/auth");

// ********************************************************************************************************
//                                      Admin Dashboard routes
// ********************************************************************************************************

// Get all registered users (with pagination and filtering)
router.get("/registered-users", auth, isAdminLevel, getRegisteredUsers);

// Get enrolled students (students who have paid enrollment fee)
router.get("/enrolled-students", auth, isAdminLevel, getEnrolledStudents);

// Get all approved instructors (public route)
router.get("/all-instructors", getAllInstructors);

// Get individual instructor by ID (public route)
router.get("/all-instructors/:instructorId", getInstructorById);

// Get pending instructor approvals
router.get("/pending-instructors", auth, isAdminLevel, getPendingInstructors);

// Approve instructor
router.post("/approve-instructor", auth, isAdminLevel, approveInstructor);

// Get dashboard statistics
router.get("/dashboard-stats", auth, isAdminLevel, getDashboardStats);

// Update user status (activate/deactivate)
router.put("/update-user-status", auth, isAdminLevel, updateUserStatus);

// Create a student (Admin only)
router.post("/create-student", auth, isAdmin, createStudentByAdmin);

// ********************************************************************************************************
//                                      Batch Management routes (Admin only)
// ********************************************************************************************************
// Create a new batch (Admin only)
router.post("/create-batch", auth, isAdmin, createBatch);

// List batches with pagination and search (Admin only)
router.get("/batches", auth, isAdmin, listBatches);

// Export batches as CSV (Admin only)
router.get("/batches/export", auth, isAdmin, exportBatches);

// Get single batch by ID (Admin only) - keep after export to avoid capturing 'export' as :batchId
router.get("/batches/:batchId", auth, isAdmin, getBatchById);

// Update batch by ID (Admin only)
router.patch("/batches/:batchId", auth, isAdmin, updateBatch);

// Delete batch by ID (Admin only)
router.delete("/batches/:batchId", auth, isAdmin, deleteBatch);

// ***********************************
// Batch Students management (Admin only)
// ***********************************
// List students in a batch
router.get("/batches/:batchId/students", auth, isAdmin, listBatchStudents);
// Assign student to batch
router.post("/batches/:batchId/students", auth, isAdmin, addStudentToBatch);
// Remove student from batch
router.delete("/batches/:batchId/students/:studentId", auth, isAdmin, removeStudentFromBatch);

module.exports = router;