// Importing required modules
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const User = require("../models/User");
// Configuring dotenv to load environment variables from .env file
dotenv.config();



// This function is used as middleware to authenticate user requests
exports.auth = exports.protect = async (req, res, next) => {
	try {
		// Extracting JWT from request cookies, body or header
	// 	const token =
    //    req.cookies.token ||
    //     req.body.token ||
    //     req.header("Authorization").replace("Bearer ", "");

	let token = null;

// Try extracting from header (Bearer token)
if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
  token = req.headers.authorization.split(" ")[1];
}

// Fallbacks (if you're also using cookies or body)
if (!token && req.cookies.token) {
  token = req.cookies.token;
} else if (!token && req.body.token) {
  token = req.body.token;
}


  console.log("Authorization Header:", req.headers.authorization);
 



		// If JWT is missing, return 401 Unauthorized response
		if (!token) {
			return res.status(401).json({ success: false, message: `Token Missing` });
		}

		try {
			console.log("JWT_SECRET:", process.env.JWT_SECRET);

			// Verifying the JWT using the secret key stored in environment variables
			const decode = await jwt.verify(token, process.env.JWT_SECRET);
			console.log("Decoded Token:", decode); //
			// Storing the decoded JWT payload in the request object for further use
			req.user = decode;
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

    // Allow Admin and Instructor to access Admin-protected routes
    if (!["Admin", "Instructor"].includes(userDetails.accountType)) {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route for Admin/Instructor",
      });
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `User Role Can't be Verified` });
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
// Middleware for admin-level access (Admin, SuperAdmin, Staff)
exports.isAdminLevel = async (req, res, next) => {
  try {
    const userDetails = await User.findOne({ email: req.user.email });

    // Include Instructor and Content-management as admin-level access
    if (!["Admin", "SuperAdmin", "Staff", "Instructor", "Content-management"].includes(userDetails.accountType)) {
      return res.status(401).json({
        success: false,
        message: "This is a Protected Route for Admin Level Users (Admin, SuperAdmin, Staff, Instructor, Content-management)",
      });
    }
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `User Role Can't be Verified` });
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
