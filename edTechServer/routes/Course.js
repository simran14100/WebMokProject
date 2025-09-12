// Import the required modules
const express = require("express")
const router = express.Router()

// Import Middleware
const { auth, isInstructor, isStudent, isAdmin, isAdminOrSuperAdmin, isApprovedInstructor, isAdminLevel } = require("../middlewares/auth")

// Import the Controllers

// Course Controllers Import
const {  
  createCourse,
  getAllCourses,
  getCourseDetails,
  getFullCourseDetails,
  editCourse,
  getInstructorCourses,
  getAdminCourses,
  deleteCourse
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


const { updateCourseProgress } = require("../controllers/courseProgress")

// Test route to verify route mounting
router.get("/test-route", (req, res) => {
    console.log('Test route hit!');
    return res.status(200).json({
        success: true,
        message: 'Test route is working!'
    });
});

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

// Get courses created by the logged-in Admin/SuperAdmin only
router.get("/getAdminCourses", auth, isAdminOrSuperAdmin, getAdminCourses)

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

// Public Course queries (viewable by anyone)
router.get("/getAllCourses", getAllCourses)
router.post("/getCourseDetails", getCourseDetails)
router.post("/getFullCourseDetails", getFullCourseDetails)
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
router.post("/createRating", auth, isStudent, async (req, res, next) => {
    try {
        console.log('=== CREATE RATING ROUTE HIT ===');
        console.log('Request Body:', req.body);
        console.log('User:', req.user);
        
        // Ensure user is properly attached to request
        if (!req.user) {
            console.error('No user found in request after auth middleware');
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }
        
        // Ensure user ID is available
        if (!req.user._id) {
            console.error('No user ID found in request.user:', req.user);
            return res.status(401).json({
                success: false,
                message: 'User ID not found in request'
            });
        }
        
        // Continue to the createRating controller
        next();
    } catch (error) {
        console.error('Error in createRating middleware:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}, createRating);

router.get("/getAverageRating", getAverageRating);
router.get("/getReviews", getAllRatingReview);

// Export the router
module.exports = router;
