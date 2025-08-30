import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCurrentUser } from '../../services/operations/authApi';
import './University.css';

const UniversityDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const result = await dispatch(getCurrentUser());
        
        if (result?.payload?.success) {
          setUserData(result.payload.user);
        } else {
          // Redirect to login if not authenticated
          navigate('/university/login');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/university/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [dispatch, navigate]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="university-dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user?.firstName || 'Student'}</h1>
        <div className="user-info">
          <span>{user?.email}</span>
          <span className="account-type">{user?.accountType || 'Student'}</span>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-cards">
          <div className="card">
            <h3>My Courses</h3>
            <p>View and manage your enrolled courses</p>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/university/courses')}
            >
              View Courses
            </button>
          </div>

          <div className="card">
            <h3>Profile</h3>
            <p>Update your personal information</p>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/university/profile')}
            >
              Edit Profile
            </button>
          </div>

          {user?.accountType === 'PhD Student' && (
            <div className="card">
              <h3>Research</h3>
              <p>Manage your research work</p>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/university/research')}
              >
                Research Portal
              </button>
            </div>
          )}
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <p>No recent activity to show</p>
            {/* Activity items would be mapped here */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UniversityDashboard;
