const express = require("express");
const router = express.Router();
const { auth, isAdminLevel } = require("../middlewares/auth");
const {
  createSubject,
  getSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
} = require("../controllers/UGPGSubject");

// Protect all UGPG subject routes for admin-level users
router.use(auth, isAdminLevel);

router.get("/", getSubjects);
router.post("/", createSubject);
router.get("/:id", getSubjectById);
router.patch("/:id", updateSubject);
router.delete("/:id", deleteSubject);

module.exports = router;
