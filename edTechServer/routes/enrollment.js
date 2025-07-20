const express = require("express");
const router = express.Router();

// Import enrollment payment controllers
const {
    createEnrollmentOrder,
    verifyEnrollmentPayment,
    getEnrollmentStatus
} = require("../controllers/EnrollmentPayment");

// Import middleware
const { auth, isStudent } = require("../middlewares/auth");

// ********************************************************************************************************
//                                      Enrollment Payment routes
// ********************************************************************************************************

// Create enrollment fee payment order
router.post("/create-order", auth, isStudent, createEnrollmentOrder);

// Verify enrollment payment
router.post("/verify-payment", auth, isStudent, verifyEnrollmentPayment);

// Get enrollment payment status
router.get("/status", auth, isStudent, getEnrollmentStatus);

module.exports = router; 