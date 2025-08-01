const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { 
  videoProtection, 
  videoRateLimit, 
  sessionControl 
} = require('../middlewares/videoProtection');
const {
  streamVideo,
  serveVideo,
  trackVideoProgress,
  getVideoAnalytics
} = require('../controllers/VideoStream');

// Protected video streaming routes
router.get(
  '/stream/:courseId/:subsectionId',
  auth,
  videoProtection,
  videoRateLimit,
  sessionControl,
  streamVideo
);

// Actual video file serving
router.get(
  '/serve/:courseId/:subsectionId',
  auth,
  videoProtection,
  serveVideo
);

// Track video progress
router.post(
  '/progress',
  auth,
  videoProtection,
  trackVideoProgress
);

// Get video analytics
router.get(
  '/analytics/:courseId',
  auth,
  getVideoAnalytics
);

module.exports = router;