const express = require("express");
const router = express.Router();
const { auth, isAdminLevel } = require("../middlewares/auth");
const {
  createCourse,
  listCourses,
  updateCourse,
  deleteCourse,
  getCourseById,
} = require("../controllers/UGPGCourse");


router.get("/", listCourses);
router.get("/:id", getCourseById);
router.post("/", createCourse);
router.patch("/:id", updateCourse);
router.delete("/:id", deleteCourse);

module.exports = router;
