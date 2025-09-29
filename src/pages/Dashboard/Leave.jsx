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

//     <div style={{ padding: "1.5rem", backgroundColor: "#f0f4f8" , marginTop:"4rem" , width:"100%" }}> {/* light gray background */}
//   <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
//     <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#0A2F5A" }}> {/* dark blue */}
//       {isAdmin ? 'All Leave Requests' : 'My Leave Requests'}
//     </h1>

//     {!isAdmin && (
//       <button
//         onClick={() => setShowForm(true)}
//         style={{
//           padding: "0.5rem 1rem",
//           backgroundColor: "#3B82F6", // light blue
//           color: "#fff",
//           borderRadius: "0.375rem",
//           border: "none",
//           cursor: "pointer",
//         }}
//         onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#2563EB")} // darker hover
//         onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#3B82F6")}
//       >
//         Create Leave Request
//       </button>
//     )}

//     <select
//       value={statusFilter}
//       onChange={(e) => setStatusFilter(e.target.value || '')}
//       style={{
//         padding: "0.5rem 1rem",
//         border: "1px solid #cbd5e1", // gray border
//         borderRadius: "0.375rem",
//         backgroundColor: "#fff",
//         color: "#0A2F5A", // dark blue text
//       }}
//     >
//       <option value="">All Status</option>
//       <option value="Pending">Pending</option>
//       <option value="Approved">Approved</option>
//       <option value="Rejected">Rejected</option>
//     </select>
//   </div>

//   <div style={{
//     backgroundColor: "#ffffff", // white card
//     borderRadius: "0.5rem",
//     boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
//     padding: "1.5rem",
//   }}>
//     {showForm ? (
//       <LeaveRequestForm 
//         onSuccess={(newRequest) => {
//           setShowForm(false);
//           setRequests(prev => [newRequest, ...prev]);
//           toast.success('Leave request submitted successfully');
//         }}
//         onCancel={() => setShowForm(false)}
//       />
//     ) : (
//       <LeaveRequestList 
//         requests={filteredRequests}
//         onStatusUpdate={handleStatusUpdate}
//         isAdmin={isAdmin}
//         loading={loading}
//       />
//     )}
//   </div>
// </div>


<div style={{ 
  padding: "2rem", 
  backgroundColor: "#f8fafc", 
  marginTop: "2rem", 
  width: "100%",
  minHeight: "100vh"
}}>
  {/* Header Section */}
  <div style={{ 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: "2rem",
    flexWrap: "wrap",
    gap: "1rem"
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{
        width: "48px",
        height: "48px",
        backgroundColor: "#0A2F5A",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <i className="fas fa-calendar-alt" style={{ color: "#fff", fontSize: "20px" }} />
      </div>
      <div>
        <h1 style={{ 
          fontSize: "1.75rem", 
          fontWeight: "700", 
          color: "#0A2F5A",
          margin: 0,
          lineHeight: "1.2"
        }}>
          {isAdmin ? 'All Leave Requests' : 'My Leave Requests'}
        </h1>
        <p style={{ 
          color: "#64748b", 
          margin: 0,
          fontSize: "0.875rem",
          marginTop: "4px"
        }}>
          {isAdmin ? 'Manage all employee leave requests' : 'Track and manage your leave applications'}
        </p>
      </div>
    </div>

    <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
      {!isAdmin && (
        <button
          onClick={() => setShowForm(true)}
          style={{
            padding: "0.75rem 1.5rem",
            backgroundColor: "#0A2F5A",
            color: "#fff",
            borderRadius: "10px",
            border: "none",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            transition: "all 0.3s ease",
            boxShadow: "0 2px 8px rgba(10, 47, 90, 0.2)"
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#08306b";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(10, 47, 90, 0.3)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#0A2F5A";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(10, 47, 90, 0.2)";
          }}
        >
          <i className="fas fa-plus" style={{ fontSize: "14px" }} />
          Create Leave Request
        </button>
      )}

      <div style={{ position: "relative" }}>
        <i className="fas fa-filter" style={{
          position: "absolute",
          left: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#64748b",
          fontSize: "14px",
          zIndex: 1
        }} />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value || '')}
          style={{
            padding: "0.75rem 1rem 0.75rem 2.5rem",
            border: "1px solid #e2e8f0",
            borderRadius: "10px",
            backgroundColor: "#fff",
            color: "#0A2F5A",
            fontWeight: "500",
            fontSize: "0.875rem",
            cursor: "pointer",
            appearance: "none",
            minWidth: "160px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            transition: "all 0.2s ease"
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#0A2F5A";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(10, 47, 90, 0.1)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
          }}
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
        <i className="fas fa-chevron-down" style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          color: "#64748b",
          fontSize: "12px",
          pointerEvents: "none"
        }} />
      </div>
    </div>
  </div>

  {/* Content Card */}
  <div style={{
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    padding: "2rem",
    border: "1px solid #f1f5f9",
    minHeight: "400px"
  }}>
    {showForm ? (
      <div style={{
        animation: "fadeIn 0.3s ease-in"
      }}>
        <LeaveRequestForm 
          onSuccess={(newRequest) => {
            setShowForm(false);
            setRequests(prev => [newRequest, ...prev]);
            toast.success('Leave request submitted successfully');
          }}
          onCancel={() => setShowForm(false)}
        />
      </div>
    ) : (
      <div style={{
        animation: "fadeIn 0.3s ease-in"
      }}>
        <LeaveRequestList 
          requests={filteredRequests}
          onStatusUpdate={handleStatusUpdate}
          isAdmin={isAdmin}
          loading={loading}
        />
      </div>
    )}
  </div>

  {/* Stats Bar - Optional Enhancement */}
  {!showForm && !loading && (
    <div style={{
      display: "flex",
      gap: "1rem",
      marginTop: "1.5rem",
      flexWrap: "wrap"
    }}>
      <div style={{
        flex: "1",
        minWidth: "200px",
        backgroundColor: "#fff",
        padding: "1rem 1.5rem",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid #f1f5f9",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          backgroundColor: "#fef3c7",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <i className="fas fa-clock" style={{ color: "#d97706", fontSize: "16px" }} />
        </div>
        <div>
          <div style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: "500" }}>
            Pending
          </div>
          <div style={{ fontSize: "1.25rem", color: "#0A2F5A", fontWeight: "700" }}>
            {requests.filter(r => r.status === 'Pending').length}
          </div>
        </div>
      </div>

      <div style={{
        flex: "1",
        minWidth: "200px",
        backgroundColor: "#fff",
        padding: "1rem 1.5rem",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid #f1f5f9",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          backgroundColor: "#dcfce7",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <i className="fas fa-check" style={{ color: "#16a34a", fontSize: "16px" }} />
        </div>
        <div>
          <div style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: "500" }}>
            Approved
          </div>
          <div style={{ fontSize: "1.25rem", color: "#0A2F5A", fontWeight: "700" }}>
            {requests.filter(r => r.status === 'Approved').length}
          </div>
        </div>
      </div>

      <div style={{
        flex: "1",
        minWidth: "200px",
        backgroundColor: "#fff",
        padding: "1rem 1.5rem",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        border: "1px solid #f1f5f9",
        display: "flex",
        alignItems: "center",
        gap: "12px"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          backgroundColor: "#fee2e2",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <i className="fas fa-times" style={{ color: "#dc2626", fontSize: "16px" }} />
        </div>
        <div>
          <div style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: "500" }}>
            Rejected
          </div>
          <div style={{ fontSize: "1.25rem", color: "#0A2F5A", fontWeight: "700" }}>
            {requests.filter(r => r.status === 'Rejected').length}
          </div>
        </div>
      </div>
    </div>
  )}


  {/* Add this CSS for animations */}
<style>
{`
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`}
</style>
</div>



    
  );
};

export default Leave;
