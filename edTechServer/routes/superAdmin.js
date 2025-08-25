const express = require('express');
const router = express.Router();
const { auth, isSuperAdmin } = require('../middlewares/auth');
const { createUserBySuperAdmin } = require('../controllers/SuperAdmin');

// Super Admin - create user
router.post('/create-user', auth, isSuperAdmin, createUserBySuperAdmin);

module.exports = router;
