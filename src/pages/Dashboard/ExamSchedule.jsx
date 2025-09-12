import React, { useState, useEffect } from 'react';
import { apiConnector } from "../../services/apiConnector";
import { store } from '../../store';
import { toast } from 'react-hot-toast';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ACCOUNT_TYPE } from '../../utils/constants';

const ExamSchedule = () => {
  const [examSessions, setExamSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Get auth and profile state
  const authState = useSelector((state) => {
    console.log('Redux auth state:', state.auth);
    return state.auth;
  });
  
  const { token } = authState;
  
  const profileState = useSelector((state) => {
    console.log('Redux profile state:', state.profile);
    return state.profile;
  });
  
  const { user: profileUser, loading: profileLoading } = profileState;
  const dispatch = useDispatch();
  
  // Debug token
  useEffect(() => {
    const debugInfo = {
      fromRedux: !!token,
      fromLocalStorage: !!localStorage.getItem('token'),
      isAuthenticated: authState.isAuthenticated,
      currentPath: window.location.pathname
    };
    console.log('Auth debug:', debugInfo);

    // Only proceed if we have a token and user data
    const hasValidAuth = (token || localStorage.getItem('token')) && 
                        (profileUser || localStorage.getItem('user'));
    
    if (!hasValidAuth && !window.location.pathname.includes('/login')) {
      console.log('No valid auth, redirecting to login');
      window.location.href = '/login';
      return;
    }
  }, [token, authState.isAuthenticated, profileUser]);
  
  // Get user data from Redux or fallback to localStorage
  const getUserData = () => {
    if (profileUser) {
      console.log('Using profileUser from Redux:', profileUser);
      return profileUser;
    }
    
    // Try to get user data from localStorage as fallback
    try {
      const userFromStorage = localStorage.getItem('user');
      if (userFromStorage) {
        return JSON.parse(userFromStorage);
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
    }
    
    return null;
  };
  
  const user = getUserData() || {};
  console.log('Using user data:', user);
  
  // Log profile state and localStorage for debugging
  useEffect(() => {
    console.log('=== Debug Info ===');
    console.log('Profile state:', {
      hasToken: !!token,
      hasProfileUser: !!profileUser,
      profileLoading,
      userData: user
    });
    
    // Log all localStorage items
    console.log('LocalStorage contents:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      console.log(`${key}:`, localStorage.getItem(key));
    }
  }, [token, profileUser, profileLoading, user]);
  
  const navigate = useNavigate();
  
  // Check authentication and authorization
  useEffect(() => {
    console.log('Auth check - Token:', token);
    console.log('Auth check - User:', user);
    console.log('Profile loading state:', profileLoading);
    
    if (!token) {
      console.log('No token found, redirecting to login');
      navigate('/login');
      return;
    }
    
    // If we don't have user data yet, try to load it
    if (!user || Object.keys(user).length === 0) {
      console.log('User data not loaded yet');
      // Check if we can get user data from localStorage as a fallback
      const userFromStorage = localStorage.getItem('user');
      if (userFromStorage) {
        try {
          const parsedUser = JSON.parse(userFromStorage);
          console.log('Using user data from localStorage:', parsedUser);
          // Update the component state with the user data
          // This is a workaround - in a real app, you'd want to properly load this into Redux
          if (parsedUser.accountType || parsedUser.userType) {
            const userRole = parsedUser.accountType || parsedUser.userType;
            console.log('User role from localStorage:', userRole);
            if (['Student', 'Admin', 'SuperAdmin'].includes(userRole)) {
              console.log('User authorized via localStorage');
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error('Error parsing user data from localStorage:', e);
        }
      }
      
      setLoading(true);
      return;
    }
    
    // Check user type (accountType or userType)
    const userRole = user.accountType || user.userType;
    console.log('User role:', userRole);
    
    if (!userRole) {
      console.log('User data is missing role information');
      setError('Your account is not properly configured. Please contact support.');
    } else {
      console.log('User authorized:', userRole);
      // Clear any previous error if user is now authorized
      setError('');
    }
    
    setLoading(false);
  }, [token, user, navigate]);

  useEffect(() => {
    console.log('Fetch effect - Token:', !!token, 'User:', user);
    
    // Skip if no user data yet or showing error
    if (!user || error) {
      console.log('Skipping fetch - no user data or error present');
      return;
    }
    
    // Check user type (accountType or userType)
    const userRole = user.accountType || user.userType;
    
    // Check if user has any of the allowed roles
    if (!userRole || !['Student', 'Admin', 'SuperAdmin'].includes(userRole)) {
      console.log('Skipping fetch - user not authorized or missing role');
      return;
    }
    
    console.log('Proceeding with fetch for user role:', userRole);
    
    const fetchExamSessions = async () => {
      try {
        setLoading(true);
        console.log('Fetching exam sessions for student:', user._id);
        
        // Prepare query parameters
        const params = {
          populate: 'sessionId,schoolId,subjectId',
          sort: '-examDate',
          limit: 50,
          status: 'Active'
        };

        // Add school filter if available
        if (user?.schoolId?._id || user?.school) {
          params.school = user.schoolId?._id || user.school;
        }
        
        // Get token from Redux store
        const token = store.getState()?.auth?.token;
        const API_BASE_URL = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';
        
        if (!token) {
          console.error('No authentication token found');
          throw new Error('Authentication required');
        }
        
        // Make the API request using fetch with explicit token - using the student-specific endpoint
        const response = await fetch(`${API_BASE_URL}/api/v1/ugpg-exam/student?${new URLSearchParams(params).toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-Requested-With': 'XMLHttpRequest'
          },
          credentials: 'include'  // Important for cookies/sessions
        });
        
        const data = await response.json();
        
        console.log('API Response:', data);
        
        // The backend returns { success, data: { data, pagination } }
        if (data.success) {
          const sessions = Array.isArray(data.data) ? data.data : [];
          console.log('Exam sessions data:', sessions);
          
          // Transform data to match frontend expectations if needed
          const formattedSessions = sessions.map(session => ({
            ...session,
            id: session._id || session.id,
            key: (session._id || session.id).toString(),
            // Add any other required transformations
          }));
          
          setExamSessions(formattedSessions);
        } else {
          const errorMsg = data.message || 'Failed to fetch exam sessions';
          console.error('API Error:', errorMsg);
          throw new Error(errorMsg);
        }
      } catch (error) {
        console.error('Error fetching exam sessions:', error);
        const errorMessage = error.message || 'Failed to load exam schedule. Please try again later.';
        setError(errorMessage);
        toast.error(errorMessage);
        
        // If unauthorized, redirect to login
        if (error.status === 401 || error.message?.includes('401')) {
          console.log('Unauthorized - redirecting to login');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchExamSessions();
  }, [token, user, error, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="text-gray-600">Loading exam schedule...</p>
        <p className="text-sm text-gray-500">User: {user?.email}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 my-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading exam schedule</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <p className="text-xs text-red-600 mt-2">User: {user?.email}</p>
            <p className="text-xs text-red-600">Account Type: {user?.accountType}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-2 px-3 py-1 bg-red-100 text-red-800 text-sm rounded hover:bg-red-200"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Exam Schedule</h1>
      </div>

      {examSessions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500">No exam schedules found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">School</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {examSessions.map((session) => (
                  <tr key={session._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.sessionId?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.subjectId?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.schoolId?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {session.semester || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(session.examDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatTime(session.examDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        session.examType === 'theory' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {session.examType?.charAt(0).toUpperCase() + session.examType?.slice(1) || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        session.status === 'Active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {session.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamSchedule;
