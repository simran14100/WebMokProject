const express = require("express");
const router = express.Router();

const { getSessions, getSessionById, createSession, updateSession, deleteSession } = require("../controllers/UGPGSession");
const { auth, isAdminLevel } = require("../middlewares/auth");

// List all UG/PG sessions (Admin-level)
router.get("/", auth, isAdminLevel, getSessions);

// Get one
router.get("/:id", auth, isAdminLevel, getSessionById);

// Create UG/PG session (Admin-level)
router.post("/", auth, isAdminLevel, createSession);

// Update UG/PG session (Admin-level)
router.patch("/:id", auth, isAdminLevel, updateSession);

// Delete UG/PG session (Admin-level)
router.delete("/:id", auth, isAdminLevel, deleteSession);

module.exports = router;
