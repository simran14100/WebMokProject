const express = require("express");
const router = express.Router();

// Import admin dashboard controllers
const {
    getRegisteredUsers,
    getEnrolledStudents,
    getPhdEnrolledStudents,
    getPhdEnrollmentPaidStudents,
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
const { createBatch, listBatches, exportBatches, getBatchById, updateBatch, deleteBatch, addStudentToBatch, removeStudentFromBatch, listBatchStudents, listTempStudentsInBatch, addTempStudentToBatch, removeTempStudentFromBatch, listBatchCourses, addCourseToBatch, removeCourseFromBatch, addLiveClassToBatch, listBatchTrainers, addTrainerToBatch, removeTrainerFromBatch } = require("../controllers/Batch");
const { createAdminReview, deleteReview } = require("../controllers/RatingAndReview");
const { createUserType, listUserTypes } = require("../controllers/UserType");
const { createMeetEvent } = require("../controllers/GoogleCalendar");
// Notifications
const { createNotification, listNotifications, deleteNotification } = require("../controllers/Notification");

// Import middleware
const { auth, isAdminLevel, isAdmin } = require("../middlewares/auth");
// Import Task controllers
const { listBatchTasks, createBatchTask, updateTask, deleteTask, getTaskStatuses, getTaskSummary } = require("../controllers/Task");

// ********************************************************************************************************
//                                      Admin Dashboard routes
// ********************************************************************************************************

// Get all registered users (with pagination and filtering)
router.get("/registered-users", auth, isAdminLevel, getRegisteredUsers);

// Get enrolled students (students who have paid enrollment fee)
router.get("/enrolled-students", auth, isAdminLevel, getEnrolledStudents);
// Get PhD enrolled students (enrollment + course fee) and PhD enrollment-paid only
router.get("/phd-enrolled-students", auth, isAdminLevel, getPhdEnrolledStudents);
router.get("/phd-enrollment-paid-students", auth, isAdminLevel, getPhdEnrollmentPaidStudents);

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
// User Types (Admin-level)
// ***********************************
router.post("/user-types", auth, isAdminLevel, createUserType);
router.get("/user-types", auth, isAdminLevel, listUserTypes);

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
// Create a new batch (Admin-level)
router.post("/create-batch", auth, isAdminLevel, createBatch);

// List batches with pagination and search (Admin-level)
router.get("/batches", auth, isAdminLevel, listBatches);

// Export batches as CSV (Admin-level)
router.get("/batches/export", auth, isAdminLevel, exportBatches);

// Get single batch by ID (Admin-level) - keep after export to avoid capturing 'export' as :batchId
router.get("/batches/:batchId", auth, isAdminLevel, getBatchById);

// Update batch by ID (Admin-level)
router.patch("/batches/:batchId", auth, isAdminLevel, updateBatch);

// Delete batch by ID (Admin-level)
router.delete("/batches/:batchId", auth, isAdminLevel, deleteBatch);

// ***********************************
// Batch Students management (Admin only)
// ***********************************
// List students in a batch
router.get("/batches/:batchId/students", auth, isAdminLevel, listBatchStudents);
// Assign student to batch
router.post("/batches/:batchId/students", auth, isAdminLevel, addStudentToBatch);
// Remove student from batch
router.delete("/batches/:batchId/students/:studentId", auth, isAdminLevel, removeStudentFromBatch);

// Temp Students in a batch (not saved as Users)
router.get("/batches/:batchId/temp-students", auth, isAdminLevel, listTempStudentsInBatch);
router.post("/batches/:batchId/temp-students", auth, isAdminLevel, addTempStudentToBatch);
router.delete("/batches/:batchId/temp-students/:tempId", auth, isAdminLevel, removeTempStudentFromBatch);

// ***********************************
// Batch Trainers management (Admin only)
// ***********************************
// List trainers in a batch
router.get("/batches/:batchId/trainers", auth, isAdminLevel, listBatchTrainers);
// Assign trainer to batch
router.post("/batches/:batchId/trainers", auth, isAdminLevel, addTrainerToBatch);
// Remove trainer from batch
router.delete("/batches/:batchId/trainers/:trainerId", auth, isAdminLevel, removeTrainerFromBatch);

// ***********************************
// Batch Courses management (Admin only)
// ***********************************
// List courses in a batch
router.get("/batches/:batchId/courses", auth, isAdminLevel, listBatchCourses);
// Add course to batch
router.post("/batches/:batchId/courses", auth, isAdminLevel, addCourseToBatch);
// Remove course from batch
router.delete("/batches/:batchId/courses/:courseId", auth, isAdminLevel, removeCourseFromBatch);

// ***********************************
// Batch Tasks management (Admin only)
// ***********************************
// List tasks for a batch
router.get("/batches/:batchId/tasks", auth, isAdminLevel, listBatchTasks);
// Create task for a batch
router.post("/batches/:batchId/tasks", auth, isAdminLevel, createBatchTask);
// Update a task
router.put("/tasks/:taskId", auth, isAdminLevel, updateTask);
// Delete a task
router.delete("/tasks/:taskId", auth, isAdminLevel, deleteTask);
// Task per-student statuses (Option A: completed=submitted)
router.get("/tasks/:taskId/statuses", auth, isAdminLevel, getTaskStatuses);
// Task summary counts
router.get("/tasks/:taskId/summary", auth, isAdminLevel, getTaskSummary);

// ***********************************
// Batch Live Classes (Admin only)
// ***********************************
// Create a live class for a batch
router.post("/batches/:batchId/live-classes", auth, isAdminLevel, addLiveClassToBatch);

// ***********************************
// Admin Reviews (Admin/SuperAdmin)
// ***********************************
router.post("/reviews", auth, isAdminLevel, createAdminReview);
router.delete("/reviews/:reviewId", auth, isAdminLevel, deleteReview);

// ***********************************
// Google Calendar - Create Meet link (Admin only)
// ***********************************
router.post("/calendar/create-meet", auth, isAdmin, createMeetEvent);

// ***********************************
// Admin Notifications (Admin-level)
// ***********************************
router.post("/notifications", auth, isAdminLevel, createNotification);
router.get("/notifications", auth, isAdminLevel, listNotifications);
router.delete("/notifications/:id", auth, isAdminLevel, deleteNotification);

module.exports = router;