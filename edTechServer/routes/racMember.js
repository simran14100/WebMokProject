const express = require("express");
const router = express.Router();
const { auth, isSuperAdmin } = require("../middlewares/auth");
const { listMembers, createMember, deleteMember, updateMember } = require("../controllers/racMember");

// List RAC members
router.get("/", auth, isSuperAdmin, listMembers);

// Create new RAC member
router.post("/", auth, isSuperAdmin, createMember);

// Delete RAC member
router.delete("/:id", auth, isSuperAdmin, deleteMember);

// Update RAC member
router.put("/:id", auth, isSuperAdmin, updateMember);

module.exports = router;
