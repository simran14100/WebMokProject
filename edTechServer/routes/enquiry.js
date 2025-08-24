const express = require("express");
const router = express.Router();

const { auth, isAdminLevel } = require("../middlewares/auth");
const {
  createEnquiryPublic,
  getEnquiries,
} = require("../controllers/Enquiry");

// Public submit
router.post("/public", createEnquiryPublic);

// Admin read-only list
router.get("/", auth, isAdminLevel, getEnquiries);

module.exports = router;
