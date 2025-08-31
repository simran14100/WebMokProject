import { ACCOUNT_TYPE } from "./constants";

/**
 * Gets the user's role from either role or accountType property
 * @param {Object} user - The user object
 * @returns {string} The normalized role in lowercase
 */
const getUserRole = (user) => {
  if (!user) return '';
  // Check both role and accountType for compatibility
  return (user.role || user.accountType || '').toLowerCase().trim();
};

/**
 * Checks if a user has a specific role
 * @param {Object} user - The user object
 * @param {string} role - The role to check for
 * @returns {boolean} True if user has the role, false otherwise
 */
export const hasRole = (user, role) => {
  const userRole = getUserRole(user);
  const requiredRole = (role || '').toLowerCase().trim();
  return userRole === requiredRole;
};

/**
 * Checks if user has any of the specified roles
 * @param {Object} user - The user object
 * @param {Array<string>} roles - Array of roles to check against
 * @returns {boolean} True if user has any of the roles, false otherwise
 */
export const hasAnyRole = (user, roles = []) => {
  if (!user || !Array.isArray(roles)) return false;
  
  const userRole = getUserRole(user);
  const normalizedRoles = roles.map(role => (role || '').toLowerCase().trim());
  
  return normalizedRoles.includes(userRole);
};

// Specific role checkers
export const isSuperAdmin = (user) => hasRole(user, ACCOUNT_TYPE.SUPER_ADMIN);
export const isAdmin = (user) => hasRole(user, ACCOUNT_TYPE.ADMIN);
export const isInstructor = (user) => hasRole(user, ACCOUNT_TYPE.INSTRUCTOR);
export const isStudent = (user) => hasRole(user, ACCOUNT_TYPE.STUDENT);
export const isStaff = (user) => hasRole(user, ACCOUNT_TYPE.STAFF);

/**
 * Checks if user has admin-level access (Admin, SuperAdmin, or Staff)
 * @param {Object} user - The user object
 * @returns {boolean} True if user has admin access
 */
export const hasAdminAccess = (user) => {
  return hasAnyRole(user, [
    ACCOUNT_TYPE.ADMIN,
    ACCOUNT_TYPE.SUPER_ADMIN,
    ACCOUNT_TYPE.STAFF
  ]);
};

/**
 * Checks if user has instructor-level access (Instructor, Admin, or SuperAdmin)
 * @param {Object} user - The user object
 * @returns {boolean} True if user has instructor access
 */
export const hasInstructorAccess = (user) => {
  return hasAnyRole(user, [
    ACCOUNT_TYPE.INSTRUCTOR,
    ACCOUNT_TYPE.ADMIN,
    ACCOUNT_TYPE.SUPER_ADMIN
  ]);
};

/**
 * Middleware for protecting routes based on roles
 * @param {...string} allowedRoles - Roles that are allowed to access the route
 * @returns {Function} Express middleware function
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
      });
    }

    const userRole = getUserRole(req.user);
    const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase().trim());
    
    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `User role ${userRole} is not authorized to access this route`,
        requiredRoles: normalizedAllowedRoles,
        userRole
      });
    }

    next();
  };
};
