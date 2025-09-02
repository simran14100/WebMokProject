import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

// List of public enrollment routes that don't require authentication
const PUBLIC_ENROLLMENT_ROUTES = [
  '/university/enrollment',
  '/university/enrollment/pending',
  '/university/enrollment/rejected'
];

/**
 * Middleware to verify if user is enrolled in a program
 * @param {Object} options - Configuration options
 * @param {boolean} options.requireApproval - If true, requires enrollment to be approved
 * @param {string} options.redirectPath - Path to redirect if enrollment check fails
 * @returns {JSX.Element} - Protected component or redirect
 */
export const withEnrollmentVerification = ({
  requireApproval = true,
  redirectPath = '/university/enrollment',
} = {}) => {
  return function WithEnrollmentVerification({ children }) {
    const { token } = useSelector((state) => state.auth);
    const { user } = useSelector((state) => state.profile);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const programType = searchParams.get('program');
    
    // If it's a public enrollment route, allow access
    if (PUBLIC_ENROLLMENT_ROUTES.some(route => location.pathname.startsWith(route))) {
      return children;
    }

    // If user is not logged in, redirect to login with redirect back
    if (!token) {
      const redirectUrl = location.pathname === '/university' 
        ? '/university' 
        : `/university/login?redirect=${encodeURIComponent(location.pathname + location.search)}`;
      return <Navigate to={redirectUrl} />;
    }

    // If no user data yet, wait for it to load
    if (!user) {
      return null; // or a loading spinner
    }

    // If no program type is selected, redirect to program selection
    if (!user.programType && !location.pathname.startsWith('/university/enrollment')) {
      return <Navigate to="/university" state={{ from: location }} replace />;
    }

    // Handle different enrollment statuses
    switch (user.enrollmentStatus) {
      case 'Pending':
        if (!location.pathname.startsWith('/university/enrollment/pending')) {
          return <Navigate to="/university/enrollment/pending" state={{ from: location }} replace />;
        }
        break;
        
      case 'Rejected':
        if (!location.pathname.startsWith('/university/enrollment/rejected')) {
          return <Navigate to="/university/enrollment/rejected" state={{ from: location }} replace />;
        }
        break;
        
      case 'Approved':
        // If user is on an enrollment status page but is already approved
        if (location.pathname.startsWith('/university/enrollment/')) {
          return <Navigate to="/university/dashboard" replace />;
        }
        break;
        
      case 'Not Enrolled':
      default:
        // If user hasn't enrolled yet, redirect to enrollment
        if (!location.pathname.startsWith('/university/enrollment')) {
          return <Navigate to="/university" state={{ from: location }} replace />;
        }
    }

    // If user is approved but trying to access enrollment page
    if (user.enrollmentStatus === 'Approved' && location.pathname.includes('/enrollment')) {
      return <Navigate to="/university/dashboard" replace />;
    }

    return children;
  };
};

/**
 * Higher Order Component to check specific program type access
 * @param {string} requiredProgram - Required program type (UG/PG/PhD)
 * @param {string} redirectPath - Path to redirect if program type doesn't match
 * @returns {JSX.Element} - Protected component or redirect
 */
export const withProgramAccess = (requiredProgram, redirectPath = '/university') => {
  return function WithProgramAccess({ children }) {
    const { user } = useSelector((state) => state.profile);
    const location = useLocation();

    // If user is not logged in, redirect to login
    if (!user) {
      return <Navigate to="/university/login" state={{ from: location.pathname }} replace />;
    }

    // If user doesn't have the required program type
    if (!user.programType || user.programType !== requiredProgram) {
      return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    return children;
  };
};

/**
 * Hook to check if user has access to a specific program
 * @returns {Object} - Enrollment status and helper functions
 */
export const useEnrollment = () => {
  const { user } = useSelector((state) => state.profile);
  
  const getProgramType = () => {
    if (!user?.accountType) return null;
    return user.accountType.split(' ')[0]; // Returns 'UG', 'PG', or 'PhD'
  };

  const isEnrolled = () => {
    return !!getProgramType();
  };

  const hasProgramAccess = (requiredProgram) => {
    const userProgram = getProgramType();
    return userProgram === requiredProgram;
  };

  return {
    isEnrolled,
    getProgramType,
    hasProgramAccess,
    user
  };
};
