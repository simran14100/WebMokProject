const express = require("express");
const router = express.Router();

const { auth, isAdminLevel } = require("../middlewares/auth");
const { createBatchDepartment, listBatchDepartments, updateBatchDepartment, deleteBatchDepartment } = require("../controllers/BatchDepartment");

// List all batch departments; optional ?onlyActive=true
router.get("/", auth, isAdminLevel, listBatchDepartments);

// Create batch department
router.post("/", auth, isAdminLevel, createBatchDepartment);

// Update batch department
router.patch("/:id", auth, isAdminLevel, updateBatchDepartment);

// Delete batch department
router.delete("/:id", auth, isAdminLevel, deleteBatchDepartment);

module.exports = router;


