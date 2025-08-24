const express = require("express");
const router = express.Router();

const { createSession, getSessions, getSessionById, updateSession, deleteSession } = require("../controllers/Session");
const { auth, isAdminLevel } = require("../middlewares/auth");

// List all sessions (Admin-level)
router.get("/", auth, isAdminLevel, getSessions);

// Get one session by id (Admin-level)
router.get("/:id", auth, isAdminLevel, getSessionById);

// Create session (Admin-level)
router.post("/", auth, isAdminLevel, createSession);

// Update session (Admin-level)
router.patch("/:id", auth, isAdminLevel, updateSession);

// Delete session (Admin-level)
router.delete("/:id", auth, isAdminLevel, deleteSession);

module.exports = router;
