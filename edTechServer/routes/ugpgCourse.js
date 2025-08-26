const express = require("express");
const router = express.Router();
const { auth, isAdminLevel } = require("../middlewares/auth");
const {
  createCourse,
  listCourses,
  updateCourse,
  deleteCourse,
} = require("../controllers/UGPGCourse");

// Protect all routes
router.use(auth, isAdminLevel);

router.get("/", listCourses);
router.post("/", createCourse);
router.patch("/:id", updateCourse);
router.delete("/:id", deleteCourse);

module.exports = router;
