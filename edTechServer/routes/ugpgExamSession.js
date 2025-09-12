const express = require("express");
const router = express.Router();
const { auth, isAdminLevel } = require("../middlewares/auth");
const {
  createExamSession,
  listExamSessions,
  updateExamSession,
  deleteExamSession,
  listStudentExamSessions
} = require("../controllers/ExamSession");

// Student-accessible route (no admin check)
router.get("/student", auth, listStudentExamSessions);

// Admin-only routes
router.use(auth, isAdminLevel);
router.get("/", listExamSessions);
router.post("/", createExamSession);
router.patch("/:id", updateExamSession);
router.delete("/:id", deleteExamSession);

module.exports = router;
