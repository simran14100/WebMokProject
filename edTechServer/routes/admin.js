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
    createStudentByAdmin,
    createUserByAdmin,
    downloadStudentsTemplate,
    bulkCreateStudents
} = require("../controllers/AdminDashboard");

// Import batch controllers
const { createBatch, listBatches, exportBatches, getBatchById, updateBatch, deleteBatch, addStudentToBatch, removeStudentFromBatch, listBatchStudents, listBatchCourses, addCourseToBatch, removeCourseFromBatch, addLiveClassToBatch, listBatchTrainers, addTrainerToBatch, removeTrainerFromBatch } = require("../controllers/Batch");
const { createAdminReview, deleteReview } = require("../controllers/RatingAndReview");
const { createMeetEvent } = require("../controllers/GoogleCalendar");

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

// Create a user with specific role (Admin only)
router.post("/create-user", auth, isAdmin, createUserByAdmin);

// ***********************************
// Bulk Students (Admin only)
// ***********************************
// Download CSV template
router.get("/students/template", auth, isAdmin, downloadStudentsTemplate);
// Upload CSV/XLSX to bulk create students and add to batch
router.post("/students/bulk-upload", auth, isAdmin, bulkCreateStudents);

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

// ***********************************
// Batch Trainers management (Admin only)
// ***********************************
// List trainers in a batch
router.get("/batches/:batchId/trainers", auth, isAdmin, listBatchTrainers);
// Assign trainer to batch
router.post("/batches/:batchId/trainers", auth, isAdmin, addTrainerToBatch);
// Remove trainer from batch
router.delete("/batches/:batchId/trainers/:trainerId", auth, isAdmin, removeTrainerFromBatch);

// ***********************************
// Batch Courses management (Admin only)
// ***********************************
// List courses in a batch
router.get("/batches/:batchId/courses", auth, isAdmin, listBatchCourses);
// Add course to batch
router.post("/batches/:batchId/courses", auth, isAdmin, addCourseToBatch);
// Remove course from batch
router.delete("/batches/:batchId/courses/:courseId", auth, isAdmin, removeCourseFromBatch);

// ***********************************
// Batch Live Classes (Admin only)
// ***********************************
// Create a live class for a batch
router.post("/batches/:batchId/live-classes", auth, isAdmin, addLiveClassToBatch);

// ***********************************
// Admin Reviews (Admin/SuperAdmin)
// ***********************************
router.post("/reviews", auth, isAdminLevel, createAdminReview);
router.delete("/reviews/:reviewId", auth, isAdminLevel, deleteReview);

// ***********************************
// Google Calendar - Create Meet link (Admin only)
// ***********************************
router.post("/calendar/create-meet", auth, isAdmin, createMeetEvent);

module.exports = router;