const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { getUploadSignature } = require('../controllers/Cloudinary');

// Signed upload parameters for client
router.post('/signature', auth, getUploadSignature);

module.exports = router;


