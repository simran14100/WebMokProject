import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';
import LeaveRequestList from '../../../LeaveRequest/LeaveRequestList';

const LeaveRequests = () => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:4000';
      const url = new URL(`${baseUrl}/api/v1/leave-requests`);
      
      if (statusFilter) {
        url.searchParams.append('status', statusFilter);
      }
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setRequests(data.data || []);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
      toast.error(error.message || 'Failed to fetch leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, [statusFilter]);

  const handleStatusUpdate = async (requestId, status, comment = '') => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/leave-requests/${requestId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ status, adminComment: comment }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update request status');
      }

      toast.success(`Request ${status.toLowerCase()} successfully`);
      fetchLeaveRequests(); // Refresh the list
    } catch (error) {
      console.error('Error updating request status:', error);
      toast.error(error.message || 'Failed to update request status');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Leave Requests Management</h1>
        <div className="flex items-center space-x-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      <LeaveRequestList 
        requests={requests} 
        loading={loading}
        isAdmin={true}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default LeaveRequests;
