const express = require("express");
const router = express.Router();
const { auth, isAdminLevel } = require("../middlewares/auth");
const {
  createCourseCategory,
  listCourseCategories,
  getActiveCourseCategories,
  updateCourseCategory,
  deleteCourseCategory,
} = require("../controllers/CourseCategory");

// Protect all routes with authentication
router.use(auth);

// Public routes (for dropdowns)
router.get("/active", getActiveCourseCategories);

// Admin routes
router.get("/", listCourseCategories);
router.post("/", createCourseCategory);
router.put("/:id", updateCourseCategory);
router.delete("/:id", deleteCourseCategory);

module.exports = router;
