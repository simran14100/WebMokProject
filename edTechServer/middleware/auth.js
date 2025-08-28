const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  console.log('Auth Headers:', req.headers);
  
  // Check for token in different locations
  if (req.headers.authorization) {
    if (req.headers.authorization.startsWith('Bearer ')) {
      // Format: "Bearer [token]"
      token = req.headers.authorization.split(' ')[1];
    } else {
      // Format: "[token]" (without Bearer)
      token = req.headers.authorization;
    }
  } else if (req.cookies?.token) {
    // Check for token in cookies
    token = req.cookies.token;
  } else if (req.query?.token) {
    // Check for token in query params
    token = req.query.token;
  }

  console.log('Extracted token:', token ? `${token.substring(0, 10)}...` : 'No token found');

  // Make sure token exists
  if (!token) {
    console.error('No token provided');
    return res.status(401).json({
      success: false,
      message: 'Not authorized - No token provided'
    });
  }

  try {
    console.log('JWT Secret:', process.env.JWT_SECRET);
    console.log('Token to verify:', token);
    
    // Remove any quotes from token if present
    const cleanToken = token.replace(/^['"]|['"]$/g, '');
    
    // Verify token
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    console.log('Decoded token:', decoded);
    
    // Add user from payload
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      throw new Error('User not found');
    }
    
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    
    let errorMessage = 'Not authorized to access this route';
    
    if (err.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
      errorMessage = 'Token has expired';
    }
    
    return res.status(401).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: 'User not authenticated'
      });
    }
    
    // Use accountType instead of role
    const userRole = req.user.accountType;
    
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role '${userRole || 'undefined'}' is not authorized to access this route.`
      });
    }
    
    console.log(`User ${req.user._id} with role '${userRole}' authorized to access route`);
    next();
  };
};
