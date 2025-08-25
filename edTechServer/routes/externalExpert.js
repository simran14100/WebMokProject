const express = require("express");
const router = express.Router();
const { auth, isSuperAdmin } = require("../middlewares/auth");
const { listExperts, createExpert, updateExpert, deleteExpert } = require("../controllers/ExternalExpert");

// List experts
router.get("/", auth, isSuperAdmin, listExperts);

// Create
router.post("/", auth, isSuperAdmin, createExpert);

// Update
router.put("/:id", auth, isSuperAdmin, updateExpert);

// Delete
router.delete("/:id", auth, isSuperAdmin, deleteExpert);

module.exports = router;
