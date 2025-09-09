import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { VscCheck, VscError, VscHistory, VscLoading } from 'react-icons/vsc';
import { updateUserProgram } from '../../services/operations/authApi';
import { updateUser } from '../../store/slices/profileSlice';
import { apiConnector } from '../../services/apiConnector';
import { toast } from 'react-hot-toast';
import { fetchUserProfile } from '../../services/operations/profileApi';

const EnrollmentStatus = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [status, setStatus] = useState('loading');
  const [program, setProgram] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkEnrollmentStatus = async () => {
      console.log('🔍 Starting enrollment status check...');
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('🔑 Checking authentication...');
        // Redirect to login if not authenticated
        if (!token) {
          const searchParams = new URLSearchParams(location.search);
          const programType = searchParams.get('program') || '';
          const redirectUrl = programType 
            ? `/university/enrollment?program=${programType}`
            : '/university/enrollment';
            
          navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
          return;
        }

        // Get program type from URL, user's profile, or localStorage
        console.log('🔍 Parsing URL parameters...');
        const searchParams = new URLSearchParams(location.search);
        let programType = searchParams.get('program');

        // If no program type in URL, check user's profile or localStorage
        if (!programType) {
          if (user?.programType) {
            programType = user.programType;
            console.log('ℹ️ Using program type from user profile:', programType);
          } else {
            // Check localStorage for saved program type
            const savedProgram = localStorage.getItem('selectedProgram');
            if (savedProgram) {
              programType = savedProgram;
              console.log('ℹ️ Using program type from localStorage:', programType);
            } else {
              // No program type found, redirect to program selection
              console.log('⚠️ No program type found, redirecting to program selection');
              navigate('/university');
              return;
            }
          }
        }

        // Save the program type to localStorage for future visits
        if (programType) {
          localStorage.setItem('selectedProgram', programType);
        }

        console.log('📝 Setting program type:', programType);
        setProgram(programType);
        
        // Make sure we have the latest user data (optional async refresh)
        // await dispatch(fetchUserProfile(token)); // can be enabled if needed
        const userProfile = user;
        console.log('✅ User profile data from store:', userProfile);
        if (!userProfile) {
          throw new Error('Failed to load user profile');
        }

        // Fast-path: check UniversityRegisteredStudent approval
        try {
          const regStatus = await apiConnector(
            'GET',
            '/api/v1/university/registered-students/my-status',
            null,
            {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          );
          if (regStatus?.data?.success && regStatus.data?.data?.matched && regStatus.data.data.status === 'approved') {
            console.log('✅ UniversityRegisteredStudent shows approved. Redirecting to dashboard.');
            navigate('/dashboard', { replace: true });
            return;
          }
        } catch (e) {
          console.warn('University registration status check failed (non-blocking):', e?.response?.data || e.message);
        }

        if (programType && !userProfile.programType) {
          console.log('🔄 Updating user program type in profile...');
          await dispatch(updateUserProgram(programType, token));
        }
        
        // Check enrollment status
        console.log('📋 Checking enrollment status:', userProfile?.enrollmentStatus);
        
        // If user has an enrollment status, handle it
        if (userProfile?.enrollmentStatus) {
          const status = (userProfile.enrollmentStatus || '').toLowerCase();
          
          // If approved, redirect to dashboard
          if (status === 'approved') {
            console.log('✅ User is already enrolled, redirecting to dashboard');
            navigate('/dashboard', { replace: true });
            return;
          }
          
          // If payment is completed but status is still pending, check for enrollment date
          if (status === 'pending' && userProfile.paymentStatus === 'Completed') {
            console.log('ℹ️ Payment completed but enrollment still pending, showing enrollment status');
            setStatus('pending');
            navigate(`/university/enrollment/pending?program=${programType}`, { replace: true });
            return;
          }
          
          // For other statuses (rejected, etc.)
          setStatus(status);
          if (status === 'rejected') {
            navigate(`/university/enrollment/rejected?program=${programType}`, { replace: true });
            return;
          }
          // default to pending view route
          navigate(`/university/enrollment/pending?program=${programType}`, { replace: true });
        } else {
          // No enrollment status, check if payment was made
          if (userProfile.paymentStatus === 'Completed') {
            console.log('ℹ️ Payment completed but no enrollment status, showing pending status');
            setStatus('pending');
            navigate(`/university/enrollment/pending?program=${programType}`, { replace: true });
          } else {
            console.log('ℹ️ No enrollment status or payment, redirecting to program selection');
            navigate('/university');
            return;
          }
        }
      } catch (error) {
        console.error('Error checking enrollment status:', error);
        setError('Failed to load enrollment status. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    checkEnrollmentStatus();
  // Only include dependencies that are used in the effect
  }, [location.search, navigate, token, dispatch, user?.enrollmentStatus]);

  const handleEnroll = async () => {
    try {
      setIsLoading(true);
      
      // Update user's program type first
      const result = await dispatch(updateUserProgram(program, token));
      
      if (result?.error) {
        throw new Error(result.error.message || 'Failed to update program');
      }
      
      // Submit enrollment request
      const response = await apiConnector(
        'POST',
        '/api/enroll',
        { programType: program },
        {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      );
      
      if (response.data.success) {
        setStatus('pending');
        toast.success('Enrollment request submitted successfully');
        
        // Update user's enrollment status in the store
        const { data: updatedProfile } = await fetchUserProfile(token);
        dispatch(updateUser(updatedProfile));
      } else {
        throw new Error(response.data.message || 'Failed to submit enrollment request');
      }
      
    } catch (error) {
      console.error('Enrollment error:', error);
      toast.error(error.message || 'Failed to submit enrollment request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatus = () => {
    switch (status) {
      case 'universityEnrolled':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <VscCheck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">Enrollment Successful!</h3>
            <p className="mt-2 text-sm text-gray-500">
              You have been successfully enrolled in the {program} program. Your enrollment is being processed.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );
        
      case 'approved':
        return (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <VscCheck className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">Enrollment Approved!</h3>
            <p className="mt-2 text-sm text-gray-500">
              Your enrollment in the {program} program has been approved. You can now access all features.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        );
      
      case 'rejected':
        return (
          <div style={{marginTop:"5rem"}}>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <VscError className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">Enrollment Rejected</h3>
            <p className="mt-2 text-sm text-gray-500">
              Your enrollment in the {program} program has been rejected. Please contact support for more information.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/contact')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Contact Support
              </button>
            </div>
          </div>
        );
      
      case 'pending':
        return (
          <div style={{marginTop:"7rem"}}>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
              <VscHistory className="h-6 w-6 text-yellow-600" />
            </div>
            <h3 className="mt-3 text-lg font-medium text-gray-900">Enrollment Pending</h3>
            <p className="mt-2 text-sm text-gray-500">
              Your enrollment in the {program} program is being reviewed. You'll be notified once a decision is made.
            </p>
          </div>
        );
      
      default:
        return (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-500">Checking enrollment status...</p>
          </div>
        );
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <VscLoading className="animate-spin h-10 w-10 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading enrollment status...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <VscError className="h-10 w-10 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Enrollment</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {program} Program Enrollment
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {renderStatus()}
          
          {status === 'pending' && (
            <div className="mt-6">
              <p className="text-sm text-gray-500 text-center">
                In the meantime, you can update your profile or browse available courses.
              </p>
              <div className="mt-4 flex justify-center space-x-3">
                <button
                  onClick={() => navigate('/dashboard/my-profile')}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Update Profile
                </button>
                <button
                  onClick={() => navigate('/dashboard/AdmissionenquiryForm')}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Apply for Enquiry
                </button>
                <button
                  onClick={() => navigate('/university?update=true')}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '0.375rem',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#1f2937',
                    backgroundColor: 'white',
                    border: '1px solid #d1d5db',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    outline: 'none'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                    e.currentTarget.style.borderColor = '#9ca3af';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                    e.currentTarget.style.borderColor = '#d1d5db';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.5)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                  }}
                >
                  Update Program Type
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrollmentStatus;
