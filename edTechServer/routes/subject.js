const express = require("express");
const router = express.Router();

const { createSubject, getSubjects, getSubjectById, updateSubject, deleteSubject } = require("../controllers/Subject");
const { auth, isAdminLevel } = require("../middlewares/auth");

// List all subjects with optional query params q, page, limit, department
router.get("/", auth, isAdminLevel, getSubjects);

// Get one subject by id
router.get("/:id", auth, isAdminLevel, getSubjectById);

// Create
router.post("/", auth, isAdminLevel, createSubject);

// Update
router.patch("/:id", auth, isAdminLevel, updateSubject);

// Delete
router.delete("/:id", auth, isAdminLevel, deleteSubject);

module.exports = router;
