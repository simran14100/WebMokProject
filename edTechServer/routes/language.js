const express = require("express");
const router = express.Router();

const { getLanguages, createLanguage, updateLanguage, deleteLanguage } = require("../controllers/Language");
const { auth, isAdminLevel } = require("../middlewares/auth");

// List all languages (Admin-level)
router.get("/", auth, isAdminLevel, getLanguages);

// Create language (Admin-level)
router.post("/", auth, isAdminLevel, createLanguage);

// Update language (Admin-level)
router.patch("/:id", auth, isAdminLevel, updateLanguage);

// Delete language (Admin-level)
router.delete("/:id", auth, isAdminLevel, deleteLanguage);

module.exports = router;
