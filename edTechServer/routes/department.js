const express = require("express");
const router = express.Router();

const { createDepartment, getDepartments, getDepartmentById, updateDepartment, deleteDepartment } = require("../controllers/Department");
const { auth, isAdminLevel } = require("../middlewares/auth");

// List all departments (Admin-level)
router.get("/", auth, isAdminLevel, getDepartments);

// Get one department by id (Admin-level)
router.get("/:id", auth, isAdminLevel, getDepartmentById);

// Create department (Admin-level)
router.post("/", auth, isAdminLevel, createDepartment);

// Update department (Admin-level)
router.patch("/:id", auth, isAdminLevel, updateDepartment);

// Delete department (Admin-level)
router.delete("/:id", auth, isAdminLevel, deleteDepartment);

module.exports = router;
