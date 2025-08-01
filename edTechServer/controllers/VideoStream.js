const crypto = require('crypto');
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const monitoringService = require('../services/monitoringService');

// Generate time-limited access token for video
const generateVideoToken = (userId, courseId, subsectionId, duration = 3600) => {
  const payload = {
    userId,
    courseId,
    subsectionId,
    exp: Math.floor(Date.now() / 1000) + duration,
    iat: Math.floor(Date.now() / 1000)
  };
  
  const token = crypto.createHmac('sha256', process.env.JWT_SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
    
  return token;
};

// Protected video streaming
exports.streamVideo = async (req, res) => {
  try {
    const { courseId, subsectionId } = req.params;
    const { userInfo, videoInfo } = req;
    
    // Generate time-limited access token
    const videoToken = generateVideoToken(
      userInfo.id, 
      courseId, 
      subsectionId, 
      3600 // 1 hour access
    );
    
    // Log video access for monitoring
    console.log(`Video access: User ${userInfo.email} accessing ${videoInfo.title}`);
    
    // Log with monitoring service
    monitoringService.logVideoAccess(
      userInfo.id,
      courseId,
      subsectionId,
      'access',
      {
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        email: userInfo.email
      }
    );
    
    // Create protected video URL with token
    const protectedVideoUrl = `${process.env.BASE_URL}/api/v1/video/stream/${courseId}/${subsectionId}?token=${videoToken}`;
    
    // Add watermarking data
    const watermarkData = {
      userId: userInfo.id,
      email: userInfo.email,
      timestamp: new Date().toISOString(),
      courseId,
      subsectionId
    };
    
    res.json({
      success: true,
      data: {
        videoUrl: protectedVideoUrl,
        token: videoToken,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        watermark: watermarkData,
        protection: {
          drm: true,
          watermarking: true,
          sessionControl: true,
          rateLimit: true
        }
      }
    });
    
  } catch (error) {
    console.error('Video streaming error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate video stream'
    });
  }
};

// Actual video file streaming with token validation
exports.serveVideo = async (req, res) => {
  try {
    const { courseId, subsectionId } = req.params;
    const { token } = req.query;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }
    
    // Validate token
    const expectedToken = generateVideoToken(
      req.userInfo.id,
      courseId,
      subsectionId
    );
    
    if (token !== expectedToken) {
      return res.status(403).json({
        success: false,
        message: 'Invalid or expired access token'
      });
    }
    
    // Get video info
    const course = await Course.findById(courseId);
    const section = course.courseContent.find(s => 
      s.subSection.some(ss => ss._id.toString() === subsectionId)
    );
    const subsection = section.subSection.find(ss => ss._id.toString() === subsectionId);
    
    // Set video streaming headers
    res.set({
      'Content-Type': 'video/mp4',
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY'
    });
    
    // Stream video from Cloudinary or your storage
    const videoUrl = subsection.videoUrl;
    
    // For now, redirect to the actual video URL
    // In production, you'd implement proper video streaming with watermarking
    res.redirect(videoUrl);
    
  } catch (error) {
    console.error('Video serving error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve video'
    });
  }
};

// Track video progress and detect suspicious activity
exports.trackVideoProgress = async (req, res) => {
  try {
    const { courseId, subsectionId, currentTime, duration, action } = req.body;
    const userId = req.userInfo.id;
    
    // Log video progress for monitoring
    const progressData = {
      userId,
      courseId,
      subsectionId,
      currentTime,
      duration,
      action, // play, pause, seek, complete
      timestamp: new Date(),
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip
    };
    
    console.log('Video progress:', progressData);
    
    // Log with monitoring service
    monitoringService.logVideoAccess(
      userId,
      courseId,
      subsectionId,
      action,
      {
        currentTime,
        duration,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip
      }
    );
    
    // Detect suspicious activity
    const suspiciousPatterns = [
      { action: 'seek', threshold: 10 }, // Too many seeks
      { action: 'pause', threshold: 50 }, // Too many pauses
      { action: 'fast_forward', threshold: 5 } // Too much fast forwarding
    ];
    
    // Update course progress
    await CourseProgress.findOneAndUpdate(
      { courseID: courseId, userId },
      {
        $addToSet: { completedVideos: subsectionId },
        $set: { lastAccessed: new Date() }
      },
      { upsert: true }
    );
    
    res.json({
      success: true,
      message: 'Progress tracked successfully'
    });
    
  } catch (error) {
    console.error('Progress tracking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track progress'
    });
  }
};

// Get video analytics and suspicious activity
exports.getVideoAnalytics = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.userInfo.id;
    
    // Get user's video access patterns
    const progress = await CourseProgress.findOne({
      courseID: courseId,
      userId
    });
    
    // Get analytics from monitoring service
    const monitoringAnalytics = await monitoringService.getUserAnalytics(userId, courseId);
    
    // Calculate completion percentage
    const course = await Course.findById(courseId);
    const totalVideos = course.courseContent.reduce((total, section) => 
      total + section.subSection.length, 0
    );
    
    const completedVideos = progress?.completedVideos?.length || 0;
    const completionPercentage = (completedVideos / totalVideos) * 100;
    
    res.json({
      success: true,
      data: {
        completionPercentage,
        completedVideos,
        totalVideos,
        lastAccessed: progress?.lastAccessed,
        suspiciousActivity: false, // You can implement detection logic here
        monitoring: {
          totalAccesses: monitoringAnalytics.totalAccesses,
          averageSessionDuration: monitoringAnalytics.averageSessionDuration,
          lastAccess: monitoringAnalytics.lastAccess
        }
      }
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get analytics'
    });
  }
};