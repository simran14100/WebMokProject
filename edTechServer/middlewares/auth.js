// Importing required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
// Configuring dotenv to load environment variables from .env file
dotenv.config();



// This function is used as middleware to authenticate user requests
exports.auth = exports.protect = async (req, res, next) => {
  console.log('=== AUTH MIDDLEWARE START ===');
  console.log('Request URL:', req.originalUrl);
  console.log('Request Method:', req.method);
  console.log('Request Headers:', {
    authorization: req.headers.authorization ? '***present***' : 'missing',
    cookie: req.headers.cookie ? '***present***' : 'missing'
  });
  
  try {
    // Extract token from headers, cookies, or body
    let token = null;
    let tokenSource = 'none';

    // Try extracting from header (Bearer token)
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
      tokenSource = 'authorization header';
    }
    // Fallback to cookies or body if needed
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      tokenSource = 'cookie';
    } else if (req.body && req.body.token) {
      token = req.body.token;
      tokenSource = 'request body';
    }

    console.log(`Token found in ${tokenSource}:`, token ? '***present***' : 'missing');
    
    // If JWT is missing, return 401 Unauthorized response
    if (!token) {
      console.error('No authentication token found in request');
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required. Please log in.' 
      });
    }

    try {
      console.log('Verifying JWT token...');
      
      // Verify the JWT
      const decoded = jwt.decode(token, { complete: true });
      console.log('Decoded token header:', decoded?.header);
      console.log('Decoded token payload:', decoded?.payload);
      
      const verified = await jwt.verify(token, process.env.JWT_SECRET);
      console.log('JWT verification successful:', {
        userId: verified?.id,
        iat: verified?.iat ? new Date(verified.iat * 1000).toISOString() : null,
        exp: verified?.exp ? new Date(verified.exp * 1000).toISOString() : null
      });
      
      // Get user from the database
      console.log('Fetching user from database with ID:', verified.id);
      const user = await User.findById(verified.id).select('-password');
      
      if (!user) {
        console.error('User not found for token ID:', verified.id);
        return res.status(401).json({ 
          success: false, 
          message: 'User not found. Please log in again.' 
        });
      }
      
      // Attach user to request object
      req.user = {
        _id: user._id,
        email: user.email,
        accountType: user.accountType,
        role: user.role || user.accountType
      };
      
      console.log('Authenticated user:', {
        id: req.user._id,
        email: req.user.email,
        accountType: req.user.accountType
      });
		} catch (error) {
			// If JWT verification fails, return 401 Unauthorized response
			return res
				.status(401)
				.json({ success: false, message: "token is invalid" });
		}

		// If JWT is valid, move on to the next middleware or request handler
		next();
	} catch (error) {

		 console.error("JWT verification error:", error.message);

		// If there is an error during the authentication process, return 401 Unauthorized response
		return res.status(401).json({
			success: false,
			message: `Something Went Wrong While Validating the Token`,
		});
	}
};

// Capability-based middleware using dynamic UserType flags
exports.isContentManager = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email }).populate('userType');
    // If userType exists and flag is true, allow
    if (userDetails.userType && userDetails.userType.contentManagement) {
      return next();
    }
    // Fallback: allow legacy role Content-management or Admin
    if (["Content-management", "Admin", "SuperAdmin"].includes(userDetails.accountType)) {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Content management access denied' });
  } catch (error) {
    return res.status(500).json({ success: false, message: "User capability can't be verified" });
  }
};

exports.isTrainerManager = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email }).populate('userType');
    if (userDetails.userType && userDetails.userType.trainerManagement) {
      return next();
    }
    if (["Instructor", "Admin", "SuperAdmin"].includes(userDetails.accountType)) {
      return next();
    }
    return res.status(403).json({ success: false, message: 'Trainer management access denied' });
  } catch (error) {
    return res.status(500).json({ success: false, message: "User capability can't be verified" });
  }
};
exports.isStudent = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "Student") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Students",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
exports.isAdmin = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });
    
    // Allow both Admin and SuperAdmin
    if (["Admin", "SuperAdmin"].includes(userDetails.accountType)) {
      return next();
    }
    
    // For other roles, check if they have specific permissions
    const allowedRoles = ["Instructor", "Content Manager"];
    if (allowedRoles.includes(userDetails.accountType) && userDetails.isApproved) {
      return next();
    }
    
    return res.status(403).json({
      success: false,
      message: 'Access denied. Requires admin privileges.',
      userRole: userDetails.accountType,
      isAdmin: ["Admin", "SuperAdmin"].includes(userDetails.accountType),
      isApproved: userDetails.isApproved
    });
  } catch (error) {
    console.error('Error in isAdmin middleware:', error);
    return res.status(500).json({
      success: false,
      message: `Error verifying admin status: ${error.message}`
    });
  }
};
exports.isSuperAdmin = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "SuperAdmin") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Super Admin",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
exports.isStaff = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "Staff") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Staff",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
exports.isInstructor = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });
		console.log(userDetails);

		console.log(userDetails.accountType);

		if (userDetails.accountType !== "Instructor") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Instructor",
			});
		}

		// Check if instructor is approved
		if (!userDetails.approved) {
			return res.status(403).json({
				success: false,
				message: "Your instructor account is pending approval. Please contact admin.",
			});
		}

		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};
// Middleware for admin-level access (Admin, SuperAdmin, Content-management, approved Instructors)
exports.isAdminLevel = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });
    
    // Log for debugging
    console.log('Admin level check:', {
      email: userDetails.email,
      accountType: userDetails.accountType,
      isApproved: userDetails.isApproved
    });

    // Allow SuperAdmin, Admin, and Content-management directly
    if (["SuperAdmin", "Admin", "Content-management"].includes(userDetails.accountType)) {
      console.log('Access granted - admin level');
      return next();
    }
    
    // For Instructors, check if they're approved
    if (userDetails.accountType === "Instructor" && userDetails.isApproved) {
      console.log('Access granted - approved instructor');
      return next();
    }

    // If we get here, the user doesn't have the required permissions
    console.log('Access denied - insufficient permissions:', {
      userRole: userDetails.accountType,
      isApproved: userDetails.isApproved
    });
    
    return res.status(403).json({
      success: false,
      message: 'You do not have permission to access this resource',
      userRole: userDetails.accountType,
      isAdmin: ["SuperAdmin", "Admin"].includes(userDetails.accountType),
      isApprovedInstructor: userDetails.accountType === "Instructor" && userDetails.isApproved,
      isApproved: userDetails.isApproved
    });
  } catch (error) {
    console.error('Error in isAdminLevel middleware:', error);
    return res.status(500).json({
      success: false,
      message: `Error verifying user role: ${error.message}`
    });
  }
};

// Middleware for admin dashboard access (Admin, SuperAdmin, Staff)
exports.isAdminDashboard = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });

    // Include Instructor for dashboard access
    if (!['Admin', 'SuperAdmin', 'Staff', 'Instructor'].includes(userDetails.accountType)) {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route for Admin Dashboard Access",
      });
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `User Role Can't be Verified` });
  }
};

// Middleware to check if instructor is approved
exports.isApprovedInstructor = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (userDetails.accountType !== "Instructor") {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Instructor",
			});
		}

		if (!userDetails.approved) {
			return res.status(403).json({
				success: false,
				message: "Your instructor account is pending approval. Please contact admin.",
			});
		}

		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};

// Middleware for Admin and SuperAdmin access (excludes Staff)
exports.isAdminOrSuperAdmin = async (req, res, next) => {
	try {
		const userDetails = await User.findOne({ email: req.user.email });

		if (!["Admin", "SuperAdmin"].includes(userDetails.accountType)) {
			return res.status(401).json({
				success: false,
				message: "This is a Protected Route for Admin and SuperAdmin only",
			});
		}
		next();
	} catch (error) {
		return res
			.status(500)
			.json({ success: false, message: `User Role Can't be Verified` });
	}
};

/**
 * Role-based access control middleware
 * Checks if the user has any of the allowed roles
 * @param {...string} roles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(
        new ErrorResponse('Not authorized to access this route', 401)
      );
    }

    // Check role from header if present (for superadmin access)
    const headerRole = req.headers['x-user-role'];
    const userRole = headerRole || req.user.accountType || req.user.role;
    
    // Normalize roles for case-insensitive comparison
    const normalizedUserRole = userRole.toLowerCase();
    const normalizedAllowedRoles = roles.map(role => role.toLowerCase());

    if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
      return res.status(403).json({
        success: false,
        message: `User role '${userRole}' is not authorized to access this route`,
        requiredRoles: roles,
        userRole: userRole
      });
    }
    
    // Update the user role in the request if it came from header
    if (headerRole) {
      req.user.role = headerRole;
    } else {
      // Ensure role is set from accountType if not set
      req.user.role = req.user.role || req.user.accountType;
    }
    
    next();
  };
};
