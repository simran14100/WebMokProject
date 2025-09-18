import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { refreshToken } from '../../services/operations/authApi';
import { toast } from 'react-hot-toast';
import { FiDownload, FiEye, FiUser, FiMail, FiPhone, FiBook, FiAward, FiCalendar, FiMapPin, FiInfo, FiCheckCircle, FiXCircle, FiClock, FiPrinter, FiDollarSign } from 'react-icons/fi';
import { PrinterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../services/config';
import { Table, Button, Input, Select, Space, Modal, Form, Descriptions, Tag, Divider, Card, Typography } from 'antd';

const { Option } = Select;

const UniversityEnrolledStudent = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [filters, setFilters] = useState({
    program: '',
    batch: '',
    status: ''
  });
  const { token } = useSelector((state) => state.auth);

  const showStudentDetails = (student) => {
    console.log('Selected Student:', student);
    console.log('Student verification details:', student.verificationDetails);
    console.log('Registration fee value:', student.verificationDetails?.registrationFee);
    console.log('Type of registration fee:', typeof student.verificationDetails?.registrationFee);
    console.log('Student Course Session ID:', student.course?.session);
    setSelectedStudent(student);
    setViewModalVisible(true);
  };

  const handleViewModalCancel = () => {
    setViewModalVisible(false);
    setSelectedStudent(null);
  };

  const handlePrint = () => {
    const printContent = document.getElementById('student-details-print');
    const printWindow = window.open('', '', 'width=900,height=600');
    
    // Get the current date for the printout
    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Admission Confirmation - ${selectedStudent.registrationNumber}</title>
          <style>
            @page { 
              margin: 10mm 10mm 10mm 10mm; 
              size: A4 portrait;
            }
            body { 
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.3;
              font-size: 12px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-header {
              text-align: center;
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 1px solid #eee;
              page-break-after: avoid;
            }
            .print-header h1 {
              color: #1a365d;
              margin: 0 0 5px 0;
              font-size: 22px;
            }
            .print-header .student-photo {
              width: 80px;
              height: 100px;
              border: 1px solid #ddd;
              border-radius: 2px;
              margin: 0 auto 5px;
              overflow: hidden;
            }
            .print-header .student-photo img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .print-header .app-id {
              color: #666;
              font-size: 14px;
              margin-top: 5px;
            }
            .print-date {
              text-align: right;
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
            }
            .ant-card {
              margin-bottom: 10px;
              border: 1px solid #f0f0f0;
              border-radius: 2px;
              page-break-inside: avoid;
            }
            .ant-card-head {
              background-color: #f8f9fa !important;
              border-bottom: 1px solid #f0f0f0;
              padding: 0 12px;
              min-height: 36px;
              margin-bottom: 0;
            }
            .ant-card-head-title {
              font-weight: 600;
              color: #1a365d;
              padding: 8px 0;
              font-size: 14px;
            }
            .ant-descriptions-title {
              font-size: 16px;
              color: #1a365d;
              margin-bottom: 16px;
            }
            .ant-descriptions-item-label {
              font-weight: 500;
              color: #4a5568;
              width: 25%;
              padding: 4px 8px !important;
              background-color: #f8f9fa !important;
            }
            .ant-descriptions-item-content {
              padding: 4px 8px !important;
            }
            .ant-tag {
              margin: 2px 4px 2px 0;
            }
            @media print {
              @page { size: A4 portrait; margin: 10mm; }
              body { 
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print { display: none !important; }
              .ant-card { 
                margin: 5px 0 !important;
                border: 1px solid #e8e8e8 !important;
              }
              .ant-descriptions-row > th, 
              .ant-descriptions-row > td { 
                padding: 4px 8px !important;
              }
              .ant-descriptions-view {
                border: 1px solid #f0f0f0;
              }
              .ant-tag {
                margin: 0 4px 2px 0;
                padding: 0 6px;
                font-size: 11px;
                line-height: 18px;
                height: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Admission Confirmation</h1>
            ${selectedStudent.photo ? `
              <div class="student-photo">
                <img src="${selectedStudent.photo}" alt="Student Photo" onerror="this.src='https://via.placeholder.com/100x125?text=No+Photo'">
              </div>
            ` : ''}
            <div class="app-id">Application ID: ${selectedStudent.registrationNumber || 'N/A'}</div>
          </div>
          <div class="print-date">Date: ${currentDate}</div>
          ${printContent.outerHTML}
          <script>
            window.onload = function() {
              // Close the print window after printing
              window.onafterprint = function() {
                window.close();
              };
              // Trigger print
              setTimeout(function() { 
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

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

      const response = await axios.get(`${API_URL}/university/enrolled-students`, {
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
    fetchSessions();
  }, [searchText]); // Add searchText as a dependency to refetch when search changes

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      console.log('Fetching sessions...');
      const response = await axios.get(`${API_URL}/ugpg/sessions`, {
        params: {
          status: 'Active',
          sort: '-startDate',
          limit: 10
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data?.success) {
        console.log('Fetched sessions:', response.data.data);
        setSessions(response.data.data || []);
      } else {
        console.error('Failed to fetch sessions:', response.data?.message);
        toast.error('Failed to load academic sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load academic sessions');
    } finally {
      setLoadingSessions(false);
    }
  };


  const columns = [
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<FiEye />} 
            onClick={() => showStudentDetails(record)}
            title="View Details"
          />
        </Space>
      ),
    },
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
      key: 'course',
      width: 150,
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium">{record.course?.courseName || 'N/A'}</span>
         
        </div>
      ),
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

  const renderStatusBadge = (status) => {
    const statusMap = {
      active: { color: 'green', text: 'Active' },
      pending: { color: 'orange', text: 'Pending' },
      suspended: { color: 'red', text: 'Suspended' },
      graduated: { color: 'blue', text: 'Graduated' },
      inactive: { color: 'gray', text: 'Inactive' }
    };
    
    const statusInfo = statusMap[status?.toLowerCase()] || { color: 'default', text: status || 'N/A' };
    
    return (
      <Tag color={statusInfo.color}>
        {statusInfo.text}
      </Tag>
    );
  };

  return (
    <div className="p-6">
      {/* Student Details Modal */}
      <Modal 
  title={
    <div style={{ display: "flex", flexDirection: "column", width: "100%", marginTop: "4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <FiUser style={{ marginRight: "8px" }} />
            <span style={{ fontSize: "18px", fontWeight: "600" }}>Admission Form</span>
          </div>
          <div style={{ marginTop: "8px", fontSize: "14px", color: "#6b7280" }}>
            Application ID: {selectedStudent?.registrationNumber || 'N/A'}
          </div>
        </div>
        {selectedStudent?.photo && (
          <div style={{ 
            width: "80px", 
            height: "100px", 
            borderRadius: "4px", 
            overflow: "hidden", 
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <img 
              src={selectedStudent.photo} 
              alt="Student" 
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "cover" 
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/80x100';
              }}
            />
          </div>
        )}
      </div>
    </div>
  }
  open={viewModalVisible}
  onCancel={handleViewModalCancel}
  footer={[
    <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
      Print
    </Button>,
    <Button key="close" onClick={handleViewModalCancel}>
      Close
    </Button>
  ]}
  width={800}
>
  {selectedStudent && (
    <div id="student-details-print" style={{ marginTop: "16px" }}>
      {/* Personal Information */}
      <Card style={{ marginBottom: "16px" }} title="Personal Information">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Registration Number">{selectedStudent.registrationNumber}</Descriptions.Item>
          <Descriptions.Item label="Full Name">
            {selectedStudent.firstName} {selectedStudent.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <div style={{ display: "flex", alignItems: "center" }}>
              <FiMail style={{ marginRight: "8px" }} />
              {selectedStudent.email}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            <div style={{ display: "flex", alignItems: "center" }}>
              <FiPhone style={{ marginRight: "8px" }} />
              {selectedStudent.phone}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Date of Birth">
            {selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString('en-IN') : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Gender">
            {selectedStudent.gender || 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Academic Information */}
      <Card style={{ marginBottom: "16px" }} title="Academic Information">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Course">
            <div style={{ display: "flex", alignItems: "center" }}>
              <FiBook style={{ marginRight: "8px", color: "#3b82f6" }} />
              <div>
                <div style={{ fontWeight: 600, color: "#1e40af" }}>
                  {selectedStudent.course?.courseName || 'N/A'}
                </div>
                {selectedStudent.course?.category && (
                  <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                    {selectedStudent.course.category}
                  </div>
                )}
              </div>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Specialization">
            {selectedStudent.specialization || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Course Type">
            {selectedStudent.course?.courseType || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Registration Date">
            {selectedStudent.registrationDate ? new Date(selectedStudent.registrationDate).toLocaleDateString('en-IN') : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Scholarship">
            {selectedStudent.isScholarship ? (
              <Tag icon={<FiAward />} color="green">Yes</Tag>
            ) : (
              <Tag color="default">No</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {renderStatusBadge(selectedStudent.status)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Contact Information */}
      <Card title="Contact Information">
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Address">
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <FiMapPin style={{ marginTop: "4px", marginRight: "8px", flexShrink: 0 }} />
              <div>
                {selectedStudent.address?.street && <div>{selectedStudent.address.street}</div>}
                {selectedStudent.address?.city && <div>{selectedStudent.address.city}</div>}
                {selectedStudent.address?.state && <div>{selectedStudent.address.state}</div>}
                {selectedStudent.address?.pincode && <div>PIN: {selectedStudent.address.pincode}</div>}
                {!selectedStudent.address && 'N/A'}
              </div>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Alternate Phone">
            {selectedStudent.alternatePhone || 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Verification Details */}
      <Card style={{ marginTop: "16px" }} title="Verification Details">
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Registration Fee">
            {selectedStudent.verificationDetails?.documents?.registrationFee ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag color="green" icon={<FiCheckCircle />}>Paid</Tag>
                {selectedStudent.verificationDetails?.verifiedAt && (
                  <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                    Verified on {new Date(selectedStudent.verificationDetails.verifiedAt).toLocaleDateString('en-IN')}
                  </span>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag color="red" icon={<FiXCircle />}>Pending</Tag>
                <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                  Fee not received
                </span>
              </div>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="12th Marksheet">
            {selectedStudent.verificationDetails?.documents?.srSecondaryMarksheet ? (
              <Tag color="green" icon={<FiCheckCircle />}>Submitted</Tag>
            ) : (
              <Tag color="red" icon={<FiXCircle />}>Not Submitted</Tag>
            )}
          </Descriptions.Item>
          {selectedStudent.verificationDetails?.verifiedBy && (
            <Descriptions.Item label="Verified By">
              {selectedStudent.verificationDetails.verifiedBy}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  )}
</Modal>

     
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