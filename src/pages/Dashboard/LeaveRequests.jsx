import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import LeaveRequestList from '../../components/LeaveRequest/LeaveRequestList';
import LeaveRequestForm from '../../components/LeaveRequest/LeaveRequestForm';

const LeaveRequests = () => {
  console.log('LeaveRequests component mounted');
  const { token, user } = useSelector((state) => state.auth);
  console.log('Current user:', user);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  
  console.log('Token exists:', !!token);

  const isAdmin = user?.accountType === 'Admin' || user?.accountType === 'SuperAdmin';

  const fetchLeaveRequests = async () => {
    const currentToken = token || localStorage.getItem('token');
    
    if (!currentToken) {
      console.error('No authentication token found in Redux or localStorage');
      toast.error('Please log in to view leave requests');
      return;
    }

    try {
      setLoading(true);
      // Use different endpoints for admin and student
      const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';
      const endpoint = isAdmin 
        ? '/api/v1/leave-requests' 
        : '/api/v1/leave-requests/my-requests';
      
      // Build URL with status filter if provided
      const url = new URL(`${baseUrl}${endpoint}`);
      if (statusFilter) {
        url.searchParams.append('status', statusFilter);
      }
      
      console.log('Fetching leave requests from:', url.toString());
      console.log('Using token:', currentToken.substring(0, 10) + '...');
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        credentials: 'include'
      });
      
      if (response.status === 401) {
        // Token might be expired or invalid
        toast.error('Your session has expired. Please log in again.');
        // Optionally redirect to login
        // navigate('/login');
        return;
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched leave requests:', data);
      
      // Log the structure of the first request for debugging
      if (data.data && data.data.length > 0) {
        console.log('First leave request structure:', {
          _id: data.data[0]._id,
          student: data.data[0].student,
          studentType: typeof data.data[0].student,
          hasStudentFields: {
            firstName: data.data[0].student?.firstName,
            lastName: data.data[0].student?.lastName,
            email: data.data[0].student?.email
          },
          status: data.data[0].status,
          startDate: data.data[0].startDate,
          endDate: data.data[0].endDate
        });
      }
      
      setRequests(data.data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      toast.error(error.message || 'Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we have a token
    if (token) {
      fetchLeaveRequests();
    } else {
      console.log('No token available, not fetching leave requests');
      setLoading(false);
    }
  }, [token, statusFilter]);

  const handleStatusUpdate = async (requestId, status, comment = '') => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/leave-requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, adminComment: comment })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update request status');
      }
      
      toast.success(`Request ${status.toLowerCase()} successfully`);
      fetchLeaveRequests();
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error(error.message || 'Failed to update request status');
    }
  };

  const filteredRequests = statusFilter 
    ? requests.filter(req => req.status === statusFilter)
    : requests;

  const handleCreateLeaveRequest = () => {
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
  };

  const handleSubmitSuccess = (newRequest) => {
    setShowForm(false);
    setRequests([newRequest, ...requests]);
    toast.success('Leave request submitted successfully');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {isAdmin ? 'All Leave Requests' : 'My Leave Requests'}
        </h1>
        {!isAdmin && (
          <button
            onClick={handleCreateLeaveRequest}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Leave Request
          </button>
        )}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value || '')}
          className="px-4 py-2 border rounded-md"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden p-6">
        {showForm ? (
          <LeaveRequestForm 
            onSuccess={handleSubmitSuccess}
            onCancel={handleCancelForm}
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

export default LeaveRequests;
