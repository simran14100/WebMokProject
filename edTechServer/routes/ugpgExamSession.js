const express = require("express");
const router = express.Router();
const { auth, isAdminLevel } = require("../middlewares/auth");
const {
  createExamSession,
  listExamSessions,
  updateExamSession,
  deleteExamSession,
} = require("../controllers/ExamSession");

// All routes protected for admin-level
router.use(auth, isAdminLevel);

router.get("/", listExamSessions);
router.post("/", createExamSession);
router.patch("/:id", updateExamSession);
router.delete("/:id", deleteExamSession);

module.exports = router;
