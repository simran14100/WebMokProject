const express = require("express");
const router = express.Router();

const { getSessions, getSessionById, createSession, updateSession, deleteSession } = require("../controllers/PhDSession");
const { auth, isAdminLevel } = require("../middlewares/auth");

// List all PhD sessions (Admin-level)
router.get("/", auth, isAdminLevel, getSessions);

// Get one
router.get("/:id", auth, isAdminLevel, getSessionById);

// Create PhD session (Admin-level)
router.post("/", auth, isAdminLevel, createSession);

// Update PhD session (Admin-level)
router.patch("/:id", auth, isAdminLevel, updateSession);

// Delete PhD session (Admin-level)
router.delete("/:id", auth, isAdminLevel, deleteSession);

module.exports = router;
