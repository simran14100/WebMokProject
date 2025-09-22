import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import LeaveRequestList from '../../components/LeaveRequest/LeaveRequestList';
import LeaveRequestForm from '../../components/LeaveRequest/LeaveRequestForm';
import { setUser } from '../../store/slices/profileSlice';
import { logout } from '../../store/slices/authSlice';

const Leave = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [mounted, setMounted] = useState(true);
  
  const isAdmin = user?.accountType === 'Admin' || user?.accountType === 'SuperAdmin';

  // Cleanup function
  useEffect(() => {
    return () => setMounted(false);
  }, []);

  // Fetch user profile
  const fetchUserProfile = useCallback(async () => {
    if (!token) return null;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/profile/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          dispatch(logout());
          navigate('/login');
          return null;
        }
        throw new Error('Failed to fetch user profile');
      }
      
      const data = await response.json();
      if (mounted) {
        dispatch(setUser(data.data.user));
      }
      return data.data.user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      if (mounted) {
        toast.error('Failed to load user profile');
        dispatch(logout());
        navigate('/login');
      }
      return null;
    }
  }, [token, dispatch, navigate, mounted]);

  // Fetch leave requests
  const fetchLeaveRequests = useCallback(async () => {
    if (!mounted || !token) return;
    
    setLoading(true);
    
    try {
      const currentUser = user || await fetchUserProfile();
      if (!currentUser) return;
      
      const endpoint = isAdmin 
        ? '/api/v1/leave-requests' 
        : '/api/v1/leave-requests/my-requests';
      
      const url = new URL(
        `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}${endpoint}`
      );
      
      if (statusFilter) {
        url.searchParams.append('status', statusFilter);
      }
      
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          dispatch(logout());
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch leave requests');
      }
      
      const { data } = await response.json();
      if (mounted) {
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error:', error);
      if (mounted) {
        toast.error(error.message || 'An error occurred');
      }
    } finally {
      if (mounted) {
        setLoading(false);
      }
    }
  }, [token, user, statusFilter, isAdmin, fetchUserProfile, mounted, navigate, dispatch]);

  // Load data when component mounts or dependencies change
  useEffect(() => {
    if (!mounted) return;
    
    const loadData = async () => {
      if (!token) {
        navigate('/login');
        return;
      }
      
      if (!user) {
        const userData = await fetchUserProfile();
        if (!userData) return;
      }
      
      await fetchLeaveRequests();
    };
    
    loadData();
  }, [token, user, statusFilter, navigate, fetchUserProfile, fetchLeaveRequests, mounted]);

  // Handle leave request status update
  const handleStatusUpdate = async (requestId, status, comment = '') => {
    if (!mounted || !isAdmin) {
      toast.error('You do not have permission to update leave requests');
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/leave-requests/${requestId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ status, adminComment: comment })
        }
      );
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || 'Failed to update leave request');
      }
      
      await fetchLeaveRequests();
      toast.success(`Request ${status.toLowerCase()} successfully`);
    } catch (error) {
      console.error('Error updating leave request:', error);
      toast.error(error.message || 'Failed to update leave request');
    }
  };

  // Filter requests based on status
  const filteredRequests = statusFilter 
    ? requests.filter(req => req.status === statusFilter)
    : requests;

  if (!mounted) {
    return null;
  }

  return (

    <div style={{ padding: "1.5rem", backgroundColor: "#f0f4f8" , marginTop:"9rem"  }}> {/* light gray background */}
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#0A2F5A" }}> {/* dark blue */}
      {isAdmin ? 'All Leave Requests' : 'My Leave Requests'}
    </h1>

    {!isAdmin && (
      <button
        onClick={() => setShowForm(true)}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#3B82F6", // light blue
          color: "#fff",
          borderRadius: "0.375rem",
          border: "none",
          cursor: "pointer",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#2563EB")} // darker hover
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#3B82F6")}
      >
        Create Leave Request
      </button>
    )}

    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value || '')}
      style={{
        padding: "0.5rem 1rem",
        border: "1px solid #cbd5e1", // gray border
        borderRadius: "0.375rem",
        backgroundColor: "#fff",
        color: "#0A2F5A", // dark blue text
      }}
    >
      <option value="">All Status</option>
      <option value="Pending">Pending</option>
      <option value="Approved">Approved</option>
      <option value="Rejected">Rejected</option>
    </select>
  </div>

  <div style={{
    backgroundColor: "#ffffff", // white card
    borderRadius: "0.5rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
    padding: "1.5rem",
  }}>
    {showForm ? (
      <LeaveRequestForm 
        onSuccess={(newRequest) => {
          setShowForm(false);
          setRequests(prev => [newRequest, ...prev]);
          toast.success('Leave request submitted successfully');
        }}
        onCancel={() => setShowForm(false)}
      />
    ) : (
      <LeaveRequestList 
        requests={filteredRequests}
        onStatusUpdate={handleStatusUpdate}
        isAdmin={isAdmin}
        loading={loading}
      />
    )}
  </div>
</div>


  

    
  );
};

export default Leave;
