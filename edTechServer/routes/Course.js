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

// Courses can be created by Admins or approved Instructors
router.post("/createCourse", auth, (req, res, next) => {
  if (
    req.user.accountType === 'Admin' ||
    req.user.accountType === 'Content-management' ||
    (req.user.accountType === 'Instructor' && req.user.isApproved)
  ) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'You need to be an Admin, Content-manager, or approved Instructor to perform this action'
    });
  }
}, createCourse);

// Get courses for the current instructor (or all courses for Admin)
router.get("/getInstructorCourses", auth, (req, res, next) => {
  if (req.user.accountType === 'Admin' || req.user.accountType === 'Instructor') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admins and Instructors only.'
    });
  }
}, getInstructorCourses);

// Delete course (Admin only for now, could be expanded to course owners)
router.delete("/deleteCourse", auth, isAdminLevel, deleteCourse)

// Edit Course routes - Allow both Admins and approved Instructors
router.post("/editCourse", auth, (req, res, next) => {
  if (req.user.accountType === 'Admin' || (req.user.accountType === 'Instructor' && req.user.isApproved)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'You need to be an Admin or approved Instructor to edit courses'
    });
  }
}, editCourse)
// Add a Section to a Course
router.post("/addSection", auth, (req, res, next) => {
  if (req.user.accountType === 'Admin' || (req.user.accountType === 'Instructor' && req.user.isApproved)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'You need to be an Admin or approved Instructor to perform this action'
    });
  }
}, createSection)
// Update a Section
router.post("/updateSection", auth, (req, res, next) => {
  if (req.user.accountType === 'Admin' || (req.user.accountType === 'Instructor' && req.user.isApproved)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'You need to be an Admin or approved Instructor to perform this action'
    });
  }
}, updateSection)

// Delete a Section
router.post("/deleteSection", auth, (req, res, next) => {
  if (req.user.accountType === 'Admin' || (req.user.accountType === 'Instructor' && req.user.isApproved)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'You need to be an Admin or approved Instructor to perform this action'
    });
  }
}, deleteSection)
// Edit Sub Section
router.post("/updateSubSection", auth, (req, res, next) => {
  if (req.user.accountType === 'Admin' || (req.user.accountType === 'Instructor' && req.user.isApproved)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'You need to be an Admin or approved Instructor to perform this action'
    });
  }
}, updateSubSection)

// Delete Sub Section
router.post("/deleteSubSection", auth, (req, res, next) => {
  if (req.user.accountType === 'Admin' || (req.user.accountType === 'Instructor' && req.user.isApproved)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'You need to be an Admin or approved Instructor to perform this action'
    });
  }
}, deleteSubSection)

// Add New Sub Section
router.post("/addSubSection", auth, (req, res, next) => {
  if (req.user.accountType === 'Admin' || (req.user.accountType === 'Instructor' && req.user.isApproved)) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'You need to be an Admin or approved Instructor to perform this action'
    });
  }
}, createSubSection)
// Get all Courses Under a Specific Instructor

// Get all Registered Courses
router.get("/getAllCourses", auth, isAdminLevel, getAllCourses)
// Get Details for a Specific Courses
router.post("/getCourseDetails", auth, isAdminLevel, getCourseDetails)

// Get Details for a Specific Courses
router.post("/getFullCourseDetails", auth, isAdminLevel, getFullCourseDetails)
// To Update Course Progress
router.post("/updateCourseProgress", auth, isStudent, isAdminLevel, updateCourseProgress)
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
