const express = require("express")
const router = express.Router()
const { auth, isInstructor } = require("../middlewares/auth")
const {
  deleteAccount,
  updateProfile,
  getAllUserDetails,
  updateDisplayPicture,
  getEnrolledCourses,
  instructorDashboard,
  getStudentLiveClasses,
  getStudentBatchCourses,
  getStudentAssignments,
  getStudentAssignmentDetail,
  submitAssignment,
  getStudentNotifications,
} = require("../controllers/Profile")

// ********************************************************************************************************
//                                      Profile routes
// ********************************************************************************************************
// Delet User Account
router.delete("/deleteProfile", auth, deleteAccount)
router.put("/updateProfile", auth, updateProfile)
router.get("/getUserDetails", auth, getAllUserDetails)
// Get Enrolled Courses
router.get("/getEnrolledCourses", auth, getEnrolledCourses)
router.put("/updateDisplayPicture", auth, updateDisplayPicture)
router.get("/instructorDashboard", auth, isInstructor, instructorDashboard)
// Live classes for a student (Student authenticated)
router.get("/live-classes", auth, getStudentLiveClasses)
// Courses assigned via batches for a student
router.get("/batch-courses", auth, getStudentBatchCourses)

// Assignments (Student authenticated)
router.get("/assignments", auth, getStudentAssignments)
router.get("/assignments/:taskId", auth, getStudentAssignmentDetail)
router.post("/assignments/:taskId/submit", auth, submitAssignment)

// Notifications (Student authenticated)
router.get("/notifications", auth, getStudentNotifications)

module.exports = router
