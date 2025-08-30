const express = require('express');
const router = express.Router();
const { 
  universitySignup, 
  universityLogin, 
  getCurrentUser,
  updateProgram 
} = require('../controllers/universityAuth');
const { auth } = require('../middlewares/auth');

// Public routes
router.post('/signup', universitySignup);
router.post('/login', universityLogin);

// Protected routes (require authentication)
router.get('/me', auth, getCurrentUser);
router.put('/update-program', auth, updateProgram);

module.exports = router;
