import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { refreshToken } from '../../services/operations/authApi';
import { toast } from 'react-hot-toast';
import { FiDownload } from 'react-icons/fi';
import { Table, Button, Input, Select, Space, Modal, Form, message } from 'antd';

const { Option } = Select;

// API endpoints
const API_BASE_URL = 'http://localhost:4001/api/v1';

const UniversityEnrolledStudent = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState('all'); // 'all', 'registrationNumber', 'name', 'email', 'phone', 'status'
  const [filters, setFilters] = useState({
    program: '',
    batch: '',
    status: ''
  });
  const { token } = useSelector((state) => state.auth);

  const fetchApprovedStudents = async () => {
    try {
      setLoading(true);
      
      // Get token from Redux store
      if (!token) {
        console.error('No authentication token found in Redux store');
        toast.error('Your session has expired. Please log in again.');
        window.location.href = '/login';
        return;
      }

      // Prepare search parameters based on selected field
      const searchParams = {};
      if (searchText) {
        if (searchField === 'all') {
          searchParams.search = searchText;
        } else if (searchField === 'name') {
          searchParams.name = searchText;
        } else {
          searchParams[searchField] = searchText;
        }
      }

      const response = await axios.get(`${API_BASE_URL}/university/enrolled-students`, {
        params: searchParams,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      });
      
      if (response.data?.success) {
        setStudents(response.data.data || []);
      } else {
        console.error('Unexpected response format:', response);
        toast.error(response.data?.message || 'Unexpected response from server');
      }
    } catch (error) {
      console.error('Error fetching approved students:', error);
      
      // Handle 401 Unauthorized error
      if (error.response?.status === 401) {
        try {
          // Try to refresh token
          const refreshTokenValue = localStorage.getItem('refreshToken');
          if (!refreshTokenValue) {
            throw new Error('No refresh token available');
          }
          
          const refreshResponse = await refreshToken(refreshTokenValue);
          
          if (refreshResponse?.success && refreshResponse.accessToken) {
            // Retry the request with new token
            localStorage.setItem('token', JSON.stringify(refreshResponse.accessToken));
            if (refreshResponse.refreshToken) {
              localStorage.setItem('refreshToken', refreshResponse.refreshToken);
            }
            return fetchApprovedStudents();
          } else {
            throw new Error(refreshResponse?.message || 'Failed to refresh token');
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Clear auth state and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return;
        }
      }
      
      // Show appropriate error message
      const errorMessage = error.response?.data?.message || 
                         (error.response?.status === 500 ? 'Server error. Please try again later.' : 
                         'Failed to fetch approved students');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedStudents();
  }, [searchText]); // Add searchText as a dependency to refetch when search changes


  const columns = [
    {
      title: 'Registration No.',
      dataIndex: 'registrationNumber',
      key: 'registrationNumber',
      width: 150,
    },
    {
      title: 'Student Name',
      key: 'name',
      width: 150,
      render: (_, record) => (
        `${record.firstName || ''} ${record.lastName || ''}`
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: 'Course',
      dataIndex: 'course',
      key: 'course',
      width: 120,
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      width: 120,
    },
    {
      title: 'Scholarship',
      key: 'isScholarship',
      width: 100,
      render: (_, record) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          record.isScholarship ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {record.isScholarship ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
          {status?.charAt(0)?.toUpperCase() + status?.slice(1) || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Verified By',
      key: 'verifiedBy',
      width: 120,
      render: (_, record) => (
        record.verificationDetails?.verifiedBy || 'N/A'
      ),
    },
  ];

  // Filter students based on search text and selected field
  const filteredStudents = students.filter(student => {
    if (!searchText) return true;
    
    const searchTerm = searchText.toLowerCase();
    
    if (searchField === 'all') {
      return (
        (student.registrationNumber?.toLowerCase().includes(searchTerm)) ||
        (`${student.firstName || ''} ${student.lastName || ''}`.toLowerCase().includes(searchTerm)) ||
        (student.email?.toLowerCase().includes(searchTerm)) ||
        (student.phone?.toLowerCase().includes(searchTerm)) ||
        (student.status?.toLowerCase().includes(searchTerm)) ||
        (student.course?.toLowerCase().includes(searchTerm)) ||
        (student.specialization?.toLowerCase().includes(searchTerm)) ||
        (student.isScholarship?.toString().toLowerCase().includes(searchTerm))
      );
    }
    
    if (searchField === 'name') {
      return (`${student.firstName || ''} ${student.lastName || ''}`.toLowerCase().includes(searchTerm));
    }
    
    const fieldValue = student[searchField];
    return fieldValue ? fieldValue.toString().toLowerCase().includes(searchTerm) : false;
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Enrolled Students</h1>
      
      {/* Enhanced Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex-1 flex flex-col md:flex-row gap-2">
          <Select
            value={searchField}
            onChange={setSearchField}
            className="w-full md:w-48"
          >
            <Option value="all">All Fields</Option>
            <Option value="registrationNumber">Registration No.</Option>
            <Option value="name">Name</Option>
            <Option value="email">Email</Option>
            <Option value="phone">Phone</Option>
            <Option value="status">Status</Option>
          </Select>
          <Input.Search
            placeholder={`Search by ${searchField === 'all' ? 'any field' : searchField}...`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={fetchApprovedStudents}
            enterButton
            className="flex-1"
            allowClear
          />
        </div>
      </div>
      
      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={filteredStudents} 
          rowKey="_id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} students`
          }}
          scroll={{ x: 'max-content' }}
          className="min-h-[400px]"
        />
      </div>
    </div>
  );
};

export default UniversityEnrolledStudent;