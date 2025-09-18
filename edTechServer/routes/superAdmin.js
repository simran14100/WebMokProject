const express = require('express');
const router = express.Router();
const { auth, isSuperAdmin } = require('../middlewares/auth');
const { createUserBySuperAdmin } = require('../controllers/SuperAdmin');

// Middleware for logging requests
const requestLogger = (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
};

// Super Admin - create user
router.post('/create-user', requestLogger, auth, isSuperAdmin, (req, res, next) => {
  console.log('Request reached create-user route handler');
  next();
}, createUserBySuperAdmin);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error('Error in superAdmin routes:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = router;
