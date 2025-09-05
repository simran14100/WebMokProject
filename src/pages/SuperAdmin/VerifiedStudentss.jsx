import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Table, Card, Button, Space, Tag, message, Input } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Search } = Input;

const VerifiedStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [verifiedBy, setVerifiedBy] = useState("");

  // Fetch university registered students
  const fetchStudents = async (params = {}) => {
    setLoading(true);
    try {
      const { current = 1, pageSize = 10 } = params.pagination || pagination;
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get('http://localhost:4001/api/v1/university/registered-students', {
        params: {
          page: current,
          limit: pageSize,
          search: searchText,
          ...params,
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const { data } = response;
      
      if (data && data.data && data.data.students) {
        const formattedStudents = data.data.students.map(student => ({
          ...student,
          key: student._id,
          name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
          registrationDate: student.createdAt 
            ? dayjs(student.createdAt).format('DD-MMM-YYYY')
            : 'N/A'
        }));
        
        setStudents(formattedStudents);
        
        if (data.data.pagination) {
          setPagination(prev => ({
            ...prev,
            total: data.data.pagination.total || 0,
            current: data.data.pagination.page || 1,
            pageSize: data.data.pagination.limit || 10,
          }));
        }
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      message.error('Failed to fetch verified students');
    } finally {
      setLoading(false);
    }
  };

  // Wrap fetchStudents in useCallback to avoid infinite re-renders
  const fetchStudentsMemoized = React.useCallback(async () => {
    return fetchStudents();
  }, [searchText]);

  useEffect(() => {
    fetchStudentsMemoized().catch(error => {
      console.error('Error in fetchStudents:', error);
      message.error(error.response?.data?.message || 'Failed to fetch students. Please check your authentication.');
    });
  }, [fetchStudentsMemoized]);

  // Handle verify action
  const handleVerify = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    console.log('Submit button clicked');
    try {
      console.log('Getting token and user data');
      const token = localStorage.getItem('token');
      let user = null;
      
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          user = JSON.parse(userData);
        }
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
      
      if (!token) {
        message.error('Authentication token not found. Please log in again.');
        // Optionally redirect to login
        // navigate('/login');
        return;
      }

      // Verify only the specified required fields are present
      const requiredFields = [
        'photo', 
        'signature', 
        'registrationFeePaid',
        'srSecondaryMarksheet',
        'graduationMarksheet',
        'matricMarksheet',
        'pgMarksheet',
        'isEligible',
        'registrationStatus',
        'verificationStatus'
      ];

      const missingFields = requiredFields.filter(field => !selectedStudent[field]);
      
      // Special check for verification status and verification done by
      if (selectedStudent.verificationStatus === 'verified' && !selectedStudent.verifiedBy) {
        missingFields.push('verifiedBy');
      }

      if (missingFields.length > 0) {
        return message.error(`Cannot verify. Missing required fields: ${missingFields.join(', ')}`);
      }

      // Check if registration fee is paid
      if (!selectedStudent.registrationFeePaid) {
        return message.error('Cannot verify. Registration fee not paid.');
      }

      // Prepare verification data
      const verificationData = {
        status: 'approved',
        remarks: remarks || 'Student verified by admin'
      };

      // Add verifiedBy if user data is available
      if (user && user.name) {
        verificationData.verifiedBy = user.name;
      } else if (user && user.email) {
        verificationData.verifiedBy = user.email;
      } else {
        verificationData.verifiedBy = 'System Admin';
      }

      // Call API to update student status to verified
      const response = await axios.put(
        `http://localhost:4001/api/v1/university/registered-students/${selectedStudent._id}/status`,
        verificationData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update local state to reflect the change
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student._id === selectedStudent._id
            ? { 
                ...student, 
                status: 'approved',
                verificationDetails: response.data.data.verificationDetails,
                registrationStatus: 'completed'
              }
            : student
        )
      );

      message.success('Student verified and approved successfully');
      setShowModal(false);
      setRemarks("");
    } catch (error) {
      console.error('Error verifying student:', error);
      
      // Handle network errors
      if (error.message === 'Network Error') {
        message.error('Unable to connect to the server. Please check your internet connection.');
        return;
      }
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        message.error('Session expired. Please log in again.');
        // Optionally redirect to login
        // navigate('/login');
        return;
      }
      
      // Handle validation errors
      if (error.response?.data?.code === 'MISSING_REQUIRED_FIELDS' && error.response?.data?.missingFields) {
        const missingFields = error.response.data.missingFields;
        message.error({
          content: (
            <div>
              <p>Cannot verify student. The following information is missing:</p>
              <ul style={{ margin: '8px 0 0 16px' }}>
                {missingFields.map((field, index) => (
                  <li key={index}>{formatFieldName(field)}</li>
                ))}
              </ul>
            </div>
          ),
          duration: 8,
        });
        return;
      }
      
      // Handle registration fee not paid
      if (error.response?.data?.code === 'REGISTRATION_FEE_NOT_PAID') {
        message.error('Cannot verify student. Registration fee has not been paid.');
        return;
      }
      
      // Handle other errors
      const errorMessage = error.response?.data?.message || 'Failed to verify student. Please try again.';
      message.error(errorMessage);
    }
  };

  // Helper function to format field names for display
  const formatFieldName = (field) => {
    // Handle nested fields
    if (field === 'address.line1') return 'Address Line 1';
    if (field === 'address.city') return 'City';
    if (field === 'address.state') return 'State';
    if (field === 'address.pincode') return 'Pincode';
    
    // Format basic field names
    return field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .replace('Aadhar', 'Aadhaar')
      .trim();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      alert(`Delete student with ID: ${id}`);
      // Call API to delete student here
      setStudents((prev) => prev.filter((s) => s._id !== id));
    }
  };

  const columns = [
    {
      title: 'Registration ID',
      dataIndex: 'registrationNumber',
      key: 'registrationNumber',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Course',
      dataIndex: 'course',
      key: 'course',
    },
    {
      title: 'Registration Date',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const status = record.status || 'pending';
        const statusMap = {
          'pending': { color: 'orange', text: 'Pending' },
          'approved': { color: 'green', text: 'Verified' },
          'rejected': { color: 'red', text: 'Rejected' }
        };
        const statusInfo = statusMap[status] || { color: 'default', text: 'Unknown' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isPending = !record.status || record.status === 'pending';
        
        return (
          <Space size="middle">
            
            {isPending && (
              <Button 
                type="link" 
                onClick={() => handleVerify(record)}
              >
                Verify
              </Button>
            )}
            <Button 
              type="link" 
              danger
              onClick={() => handleDelete(record._id)}
            >
              Delete
            </Button>
          </Space>
        );
      },
    },
  ];

  const handleTableChange = (newPagination, filters, sorter) => {
    fetchStudents({
      pagination: newPagination,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
    });
  };

  const onSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };


  

  const VerificationModal = () => {
    if (!showModal || !selectedStudent) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Student Verification</h2>
  
            {/* Student Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p><strong>Reg. No.:</strong> {selectedStudent.registrationNumber}</p>
                <p><strong>Name:</strong> {selectedStudent.name}</p>
              </div>
              <div>
                <p><strong>Session:</strong> {selectedStudent.session}</p>
                <p><strong>Father's Name:</strong> {selectedStudent.fatherName}</p>
              </div>
            </div>
  
            {/* Photo & Signature */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium mb-2">Photo</h3>
                <div className="border p-2 rounded mb-2">
                  {selectedStudent.photo ? (
                    <img
                      src={selectedStudent.photo}
                      alt={`${selectedStudent.firstName || 'Student'} photo`}
                      className="h-32 w-32 object-cover rounded"
                    />
                  ) : (
                    <p className="text-gray-500">No photo uploaded</p>
                  )}
                </div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" /> Verified
                </label>
              </div>
  
              <div>
                <h3 className="font-medium mb-2">Signature</h3>
                <div className="border p-2 rounded mb-2">
                  {selectedStudent.signature ? (
                    <img
                      src={selectedStudent.signature}
                      alt={`${selectedStudent.firstName || 'Student'}'s signature`}
                      className="h-20 w-48 object-contain"
                    />
                  ) : (
                    <p className="text-gray-500">No signature uploaded</p>
                  )}
                </div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" /> Verified
                </label>
              </div>
            </div>
  
            {/* Documents */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Documents</h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  "Registration Fee",
                  "Sr. Secondary Marksheet",
                  "Graduation Marksheet",
                  "Matric Marksheet",
                  "P.G. Marksheet",
                ].map((doc) => (
                  <label key={doc} className="flex items-center">
                    <input type="checkbox" className="mr-2" /> {doc}
                  </label>
                ))}
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" /> Is Eligible?
                </label>
              </div>
            </div>
  
            {/* Registration & Verification Status */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-medium mb-2">Registration Status</h3>
                <label className="flex items-center">
                  <input type="radio" name="registrationStatus" className="mr-2" /> Pending
                </label>
                <label className="flex items-center">
                  <input type="radio" name="registrationStatus" className="mr-2" /> Complete
                </label>
              </div>
  
              <div>
                <h3 className="font-medium mb-2">Verification Status</h3>
                <label className="flex items-center">
                  <input type="radio" name="verificationStatus" className="mr-2" /> Pending
                </label>
                <label className="flex items-center">
                  <input type="radio" name="verificationStatus" className="mr-2" /> Complete
                </label>
              </div>
            </div>
  
            {/* Verified By */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Verification Done By</h3>
              <input
                type="text"
                className="w-full p-2 border rounded"
                placeholder="Enter verifier's name"
                value={verifiedBy}
                onChange={(e) => setVerifiedBy(e.target.value)}
              />
            </div>
  
            {/* Remarks */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Remarks</h3>
              <textarea
                className="w-full p-2 border rounded"
                rows="3"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks here..."
              ></textarea>
            </div>
  
            {/* Footer */}
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                onClick={handleModalSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <div className="p-6">
      <Card 
        title="Verified Students"
        extra={
          <Space>
            <Search
              placeholder="Search students..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={onSearch}
              style={{ width: 300 }}
            />
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => {
                setSearchText('');
                fetchStudents();
              }}
            >
              Refresh
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={students}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          locale={{
            emptyText: 'No verified students found'
          }}
        />
      </Card>
      
      {/* Render the modal */}
      <VerificationModal />
    </div>
  );
};

export default VerifiedStudents;