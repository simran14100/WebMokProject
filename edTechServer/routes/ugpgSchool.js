const express = require("express");
const router = express.Router();
const { auth, isAdminLevel } = require("../middlewares/auth");
const {
  createSchool,
  listSchools,
  getSchoolById,
  updateSchool,
  deleteSchool,
} = require("../controllers/UGPGSchool");

// Protect all routes
router.use(auth, isAdminLevel);

router.get("/", listSchools);
router.post("/", createSchool);
router.get("/:id", getSchoolById);
router.patch("/:id", updateSchool);
router.delete("/:id", deleteSchool);

module.exports = router;
