import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Outlet } from 'react-router-dom';
import { getCurrentUser } from '../../services/operations/authApi';
import { useDispatch } from 'react-redux';

const UniversityRoute = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);

  useEffect(() => {
    const verifyUser = async () => {
      // If we're a SuperAdmin, we can proceed without any checks
      if (user?.accountType === 'SuperAdmin') return;

      // For non-SuperAdmin users, check authentication
      if (!token) {
        navigate('/university/login');
        return;
      }

      // If we have a token but no user data, fetch it
      if (!user) {
        try {
          const result = await dispatch(getCurrentUser());
          if (!result?.success) {
            navigate('/university/login');
            return;
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          navigate('/university/login');
          return;
        }
      }

      // Check if user has the correct account type
      const allowedAccountTypes = ['UG Student', 'PG Student', 'PhD Student'];
      if (!allowedAccountTypes.includes(user?.accountType)) {
        navigate('/unauthorized');
        return;
      }
    };

    verifyUser();
  }, [token, user, navigate, dispatch]);

  // If we're a SuperAdmin, render immediately
  if (user?.accountType === 'SuperAdmin') {
    return <Outlet />;
  }

  // For other users, show loading state while verifying
  if (!token || !user) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Verifying authentication...</p>
      </div>
    );
  }

  // If authenticated and has correct account type, render the protected route
  return <Outlet />;
};

export default UniversityRoute;
