const jwt = require('jsonwebtoken');
const Course = require('../models/Course');
const CourseProgress = require('../models/CourseProgress');
const User = require('../models/User');

// Video protection middleware
const videoProtection = async (req, res, next) => {
  try {
    const { courseId, subsectionId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Check if user exists and is active
    const user = await User.findById(userId);
    if (!user || !user.active) {
      return res.status(401).json({
        success: false,
        message: 'User not found or inactive'
      });
    }

    // Check if course exists and user is enrolled
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is enrolled in the course
    const isEnrolled = course.studentsEnrolled.includes(userId);
    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: 'You must be enrolled to access this content'
      });
    }

    // Check if subsection exists in course
    const section = course.courseContent.find(s => 
      s.subSection.some(ss => ss._id.toString() === subsectionId)
    );
    
    if (!section) {
      return res.status(404).json({
        success: false,
        message: 'Video content not found'
      });
    }

    const subsection = section.subSection.find(ss => ss._id.toString() === subsectionId);
    
    // Add protection headers
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Content-Security-Policy': "default-src 'self'; media-src 'self' blob:; script-src 'self' 'unsafe-inline'",
      'Cache-Control': 'no-store, no-cache, must-revalidate, private',
      'Pragma': 'no-cache',
      'Expires': '0'
    });

    // Add user info to request for watermarking
    req.userInfo = {
      id: userId,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };
    
    req.videoInfo = {
      courseId,
      subsectionId,
      videoUrl: subsection.videoUrl,
      title: subsection.title
    };

    next();
  } catch (error) {
    console.error('Video protection middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Rate limiting for video access
const videoRateLimit = (req, res, next) => {
  const userId = req.userInfo?.id;
  const key = `video_access:${userId}`;
  
  // Implement rate limiting logic here
  // This prevents excessive video requests
  
  next();
};

// Session-based access control
const sessionControl = async (req, res, next) => {
  try {
    const { courseId, subsectionId } = req.params;
    const userId = req.userInfo.id;
    
    // Check if user has active session for this video
    const sessionKey = `video_session:${userId}:${courseId}:${subsectionId}`;
    
    // You can implement session tracking here
    // For now, we'll just allow access
    
    next();
  } catch (error) {
    console.error('Session control error:', error);
    next();
  }
};

module.exports = {
  videoProtection,
  videoRateLimit,
  sessionControl
};