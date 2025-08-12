// Import the required modules
const express = require("express")
const router = express.Router()

// Import the Controllers

// Course Controllers Import
const {
  
  createCourse,
  getAllCourses,
  getCourseDetails,
  getFullCourseDetails,
  editCourse,
  getInstructorCourses,
  deleteCourse,
} = require("../controllers/Course")

// Tags Controllers Import

// Categories Controllers Import
const {
  showAllCategories,
 
  categoryPageDetails,
} = require("../controllers/Category")

const {createCategory}= require("../controllers/Category")
// Sections Controllers Import
const {
  createSection,
  updateSection,
  deleteSection,
} = require("../controllers/Section")

// Sub-Sections Controllers Import
const {
  createSubSection,
  updateSubSection,
  deleteSubSection,
} = require("../controllers/Subsection")

// Rating Controllers Import
const {
  createRating,
  getAverageRating,
  getAllRatingReview
 
} = require("../controllers/RatingAndReview")


const { updateCourseProgress} = require("../controllers/courseProgress")
// Importing Middlewares
const { auth, isApprovedInstructor, isStudent, isAdminLevel, isAdminOrSuperAdmin } = require("../middlewares/auth")

// ********************************************************************************************************
//                                      Course routes
// ********************************************************************************************************

// Courses can Only be Created by Approved Instructors
router.post("/createCourse", auth, isApprovedInstructor, createCourse)
router.get("/getInstructorCourses", auth, isApprovedInstructor, getInstructorCourses)
router.delete("/deleteCourse", deleteCourse)

// Edit Course routes
router.post("/editCourse", auth, isApprovedInstructor, editCourse)
//Add a Section to a Course
router.post("/addSection", auth, isApprovedInstructor, createSection)
// Update a Section
router.post("/updateSection", auth, isApprovedInstructor, updateSection)
// Delete a Section
router.post("/deleteSection", auth, isApprovedInstructor, deleteSection)
// Edit Sub Section
router.post("/updateSubSection", auth, isApprovedInstructor, updateSubSection)
// Delete Sub Section
router.post("/deleteSubSection", auth, isApprovedInstructor, deleteSubSection)
// Add a Sub Section to a Section
router.post("/addSubSection", auth, isApprovedInstructor, createSubSection)
// Get all Courses Under a Specific Instructor

// Get all Registered Courses
router.get("/getAllCourses", getAllCourses)
// Get Details for a Specific Courses
router.post("/getCourseDetails", getCourseDetails)

// Get Details for a Specific Courses
router.post("/getFullCourseDetails", auth, getFullCourseDetails)
// To Update Course Progress
router.post("/updateCourseProgress", auth, isStudent, updateCourseProgress)
// To get Course Progress
// router.post("/getProgressPercentage", auth, isStudent, getProgressPercentage)
// Delete a Course


// ********************************************************************************************************
//                                      Category routes (Only by Admin and SuperAdmin)
// ********************************************************************************************************
// Category can Only be Created by Admin and SuperAdmin (Staff excluded)
router.post("/createCategory", auth , isAdminOrSuperAdmin, createCategory)
router.get("/showAllCategories", showAllCategories)
router.post("/categoryPageDetails", categoryPageDetails)

// ********************************************************************************************************
//                                      Rating and Review
// ********************************************************************************************************
router.post("/createRating", auth, isStudent, createRating)
router.get("/getAverageRating", getAverageRating)
router.get("/getReviews", getAllRatingReview)
// In your routes file


module.exports = router
