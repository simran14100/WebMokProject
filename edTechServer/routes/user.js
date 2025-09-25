// Import the required modules
const express = require("express")
const router = express.Router()

// Import the required controllers and middleware functions
const {
  login,
  signup,
  changePassword,
  sendotp,
  refreshToken,
  checkUserExists,
  logout,
  verifySession
} = require("../controllers/Auth")
const {
  resetPasswordToken,
  resetPassword,
} = require("../controllers/ResetPassword")

const { auth } = require("../middlewares/auth")

// Routes for Login, Signup, and Authentication

// ********************************************************************************************************
//                                      Authentication routes
// ********************************************************************************************************

// Check if user exists by email
router.post("/check-email", checkUserExists)

// Verify user session
router.get("/verify-session", auth, verifySession)

// Secure email gate: if a secureAllowedEmail cookie is present, only that email may login
function secureEmailGate(req, res, next) {
  try {
    const scoped = req.cookies && req.cookies.secureAllowedEmail;
    const email = req.body && req.body.email;
    if (scoped && email && String(email).toLowerCase() !== String(scoped).toLowerCase()) {
      return res.status(403).json({ success: false, message: 'This login link is restricted to a specific email.' });
    }
  } catch (_) {}
  return next();
}

// Route for user login (enforced by secureEmailGate if cookie is present)
router.post("/login", secureEmailGate, login)

// Secret link to scope login to a specific admin without exposing email/password in URL
router.get('/secure/dashboard-7x3k9', (req, res) => {
  try {
    const allowedEmail = 'kjha24760@gmail.com';
    res.cookie('secureAllowedEmail', allowedEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60 * 1000 // 10 minutes
    });

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(302, `${FRONTEND_URL}/login?admin=1&redirect=/admin/dashboard`);
  } catch (error) {
    console.error('secure/dashboard-7x3k9 error:', error);
    return res.status(500).json({ success: false, message: 'Secure login init failed' });
  }
})

// (Removed) Instructor secure link route

// SuperAdmin secure link: scope login to specific email and redirect to user dashboard
router.get('/secure/superadmin-9a2b1', (req, res) => {
  try {
    const allowedEmail = 'kj175849@gmail.com';
    res.cookie('secureAllowedEmail', allowedEmail, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 10 * 60 * 1000 // 10 minutes
    });

    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
    return res.redirect(302, `${FRONTEND_URL}/login?admin=1&redirect=/dashboard/my-profile`);
  } catch (error) {
    console.error('secure/superadmin-9a2b1 error:', error);
    return res.status(500).json({ success: false, message: 'Secure superadmin init failed' });
  }
})

// Clear secure login scope cookie so normal login works again
router.get('/secure/clear', (req, res) => {
  try {
    res.clearCookie('secureAllowedEmail', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

    // Detect AJAX/fetch requests and return 204 to avoid cross-origin redirects during credentialed requests
    const isAjax = req.xhr ||
      req.get('X-Requested-With') === 'XMLHttpRequest' ||
      (req.headers.accept && req.headers.accept.includes('application/json')) ||
      req.headers['sec-fetch-mode'] === 'cors';

    if (isAjax) {
      return res.status(204).end();
    }

    return res.redirect(302, `${FRONTEND_URL}/login`);
  } catch (error) {
    console.error('secure/clear error:', error);
    return res.status(500).json({ success: false, message: 'Failed to clear secure scope' });
  }
})

// Route for user signup
router.post("/signup", signup)

// Route for sending OTP to the user's email
router.post("/sendotp", sendotp)

// Route for refreshing token - no auth middleware as we're using the refresh token for authentication
router.post("/refresh-token", (req, res) => {
  // The refreshToken controller will handle the request directly
  refreshToken(req, res);
})

// Route for user logout
router.post("/logout", auth, logout)

// Route for Changing the password
router.post("/changepassword", auth, changePassword)

// ********************************************************************************************************
//                                      Reset Password
// ********************************************************************************************************

// Route for generating a reset password token
router.post("/reset-password-token", resetPasswordToken)

// Route for resetting user's password after verification
router.post("/reset-password", resetPassword)

// Export the router for use in the main application
module.exports = router
