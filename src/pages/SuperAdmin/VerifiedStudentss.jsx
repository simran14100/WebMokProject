import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Table, Card, Button, Space, Tag, message, Input, Modal, Form, Descriptions, Typography, Divider, Select } from 'antd';
import { SearchOutlined, ReloadOutlined, CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
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
  const [selectedStudent, setSelectedStudent] = useState({
    verificationStatus: 'pending',
    registrationStatus: 'incomplete'
  });
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

  const [form] = Form.useForm();
  const [verificationLoading, setVerificationLoading] = useState(false);

  const validateVerification = (student) => {
    const requiredFields = [
      { field: 'photo', label: 'Photo' },
      { field: 'signature', label: 'Signature' },
      { field: 'registrationFeePaid', label: 'Registration Fee Payment' },
      { field: 'matricMarksheet', label: 'Matriculation Marksheet' },
      { field: 'srSecondaryMarksheet', label: 'Senior Secondary Marksheet' },
      { field: 'graduationMarksheet', label: 'Graduation Marksheet' },
      { field: 'registrationStatus', label: 'Registration Status' },
    ];

    const missingFields = [];
    const invalidFields = [];

    // Check required fields
    requiredFields.forEach(({ field, label }) => {
      if (!student[field]) {
        missingFields.push(label);
      }
    });

    // Check registration status
    if (student.registrationStatus !== 'completed') {
      invalidFields.push('Registration status must be completed');
    }

    // Check verification status
    if (student.verificationStatus === 'verified') {
      invalidFields.push('Student is already verified');
    }

    return { missingFields, invalidFields };
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
    sorter: (a, b) => a.registrationNumber?.localeCompare(b.registrationNumber),
  },
  {
    title: 'Name',
    dataIndex: 'name',
    key: 'name',
    sorter: (a, b) => a.name?.localeCompare(b.name),
  },
  {
    title: 'Course',
    dataIndex: 'course',
    key: 'course',
    sorter: (a, b) => (a.course || '').localeCompare(b.course || ''),
  },
  {
    title: 'Registration Date',
    dataIndex: 'registrationDate',
    key: 'registrationDate',
    sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  },
  {
    title: 'Status',
    key: 'status',
    filters: [
      { text: 'Pending', value: 'pending' },
      { text: 'Verified', value: 'approved' },
      { text: 'Rejected', value: 'rejected' },
    ],
    onFilter: (value, record) => (record.status || 'pending') === value,
    render: (_, record) => {
      const status = record.status || 'pending';
      const statusMap = {
        'pending': { color: 'orange', text: 'Pending', icon: <CloseCircleOutlined /> },
        'approved': { color: 'green', text: 'Verified', icon: <CheckCircleOutlined /> },
        'rejected': { color: 'red', text: 'Rejected', icon: <CloseCircleOutlined /> }
      };
      const statusInfo = statusMap[status] || { color: 'default', text: 'Unknown', icon: null };
      return (
        <Tag 
          icon={statusInfo.icon} 
          color={statusInfo.color}
          style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          {statusInfo.text}
        </Tag>
      );
    },
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 200,
    render: (_, record) => {
      const isVerified = record.verificationStatus === 'verified';
      return (
        <Space size="middle">
          
          {!isVerified && (
            <Button 
              type="link" 
              icon={<CheckCircleOutlined />}
              onClick={() => handleVerify(record)}
              style={{ color: '#52c41a' }}
            >
              Verify
            </Button>
          )}
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />} 
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

// Handle search
const handleSearch = (value) => {
  setSearchText(value);
  fetchStudents({ pagination: { ...pagination, current: 1 }, search: value });
};

// Handle view details
const handleViewDetails = (record) => {
  // Implement view details logic here
  console.log('View details:', record);
};

// Format field names for display
const formatFieldName = (field) => {
  if (!field) return '';
  // Handle nested fields
  if (field.includes('.')) {
    const parts = field.split('.');
    return parts.map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
  }
  // Format basic field names
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace('Aadhar', 'Aadhaar')
    .trim();
};

// Render verification status badge
const renderVerificationStatus = (status) => {
  switch (status) {
    case 'verified':
      return <Tag icon={<CheckCircleOutlined />} color="success">Verified</Tag>;
    case 'pending':
      return <Tag icon={<CloseCircleOutlined />} color="warning">Pending</Tag>;
    default:
      return <Tag color="default">{status || 'Not Submitted'}</Tag>;
  }
};

// Render document status with required indicator
const renderDocumentStatus = (doc, status = 'pending', isRequired = false) => {
  if (status === 'submitted') {
    return <Tag color="success">Submitted ✓</Tag>;
  }
  if (!doc) return <Tag color="error">Missing{isRequired ? ' (Required)' : ''}</Tag>;
  return <Tag color="processing">Pending Review</Tag>;
};

const VerificationModal = ({ showModal, selectedStudent, form, setShowModal, fetchStudents, setVerificationLoading, verificationLoading }) => {
  const [documentStatus, setDocumentStatus] = useState({
    matricMarksheet: 'pending',
    srSecondaryMarksheet: 'pending',
    graduationMarksheet: 'pending',
    registrationFee: 'pending'
  });

  if (!showModal || !selectedStudent) return null;

  const handleStatusChange = (field, value) => {
    setDocumentStatus(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Check if all required documents are submitted
  const allDocumentsSubmitted = () => {
    const requiredDocs = [
      'matricMarksheet',
      'srSecondaryMarksheet',
      'graduationMarksheet',
      'registrationFee'
    ];
    
    return requiredDocs.every(doc => documentStatus[doc] === 'submitted');
  };

  const handleModalSubmit = async () => {
    try {
      console.log('=== Starting verification process ===');
      console.log('Student ID:', selectedStudent?._id);
      
      // Validate form and get values
      const values = await form.validateFields();
      console.log('Form values:', values);
      
      // Check if all required documents are submitted
      const allSubmitted = allDocumentsSubmitted();
      console.log('All documents submitted:', allSubmitted);
      
      if (!allSubmitted) {
        const errorMsg = 'Please mark all documents as "Submitted" before verification';
        console.error('Verification failed:', errorMsg);
        message.error(errorMsg);
        return;
      }
      
      console.log('All validations passed, preparing verification data...');
  
      setVerificationLoading(true);
      
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
  
      // Check if all required documents are present
      const hasAllRequiredDocs = selectedStudent.photo && selectedStudent.signature;
      console.log('Checking required documents:', {
        hasPhoto: !!selectedStudent.photo,
        hasSignature: !!selectedStudent.signature
      });
      
      if (!hasAllRequiredDocs) {
        const errorMsg = 'Photo and Signature are required for verification';
        console.error('Verification failed:', errorMsg);
        message.error(errorMsg);
        return;
      }
      
      // Prepare documents verification data
      console.log('Current documentStatus:', documentStatus);
      
      const documents = {
        registrationFee: documentStatus.registrationFee === 'submitted',
        srSecondaryMarksheet: documentStatus.srSecondaryMarksheet === 'submitted',
        graduationMarksheet: documentStatus.graduationMarksheet === 'submitted',
        matricMarksheet: documentStatus.matricMarksheet === 'submitted',
        pgMarksheet: false,
        idProof: false,
        isEligible: allDocumentsSubmitted()
      };
      
      console.log('Document verification status:', JSON.stringify(documents, null, 2));
      console.log('All documents submitted:', allDocumentsSubmitted());
      
      // Prepare verification data
      const verificationData = {
        photoVerified: true,
        signatureVerified: true,
        documents,
        verifiedBy: values.verifiedBy || user.name || 'Admin',
        remarks: values.remarks || 'Documents verified and submitted',
        status: 'approved' // Explicitly set status to approved
      };
      
      console.log('Complete verification data:', JSON.stringify(verificationData, null, 2));
      
      try {
        console.log('=== Sending Verification Request ===');
        console.log('Student ID:', selectedStudent._id);
        console.log('Verification Data:', JSON.stringify(verificationData, null, 2));
        
        // FIXED: Correct API endpoint - changed from /students/ to /registered-students/
        const apiUrl = `http://localhost:4001/api/v1/university/registered-students/${selectedStudent._id}/complete-verification`;
        console.log('API Endpoint:', apiUrl);
        
        const startTime = Date.now();
        const response = await axios.post(
          apiUrl,
          verificationData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            validateStatus: (status) => status < 500 // Don't throw for 4xx errors
          }
        );
        
        const endTime = Date.now();
        console.log('=== Received Response ===');
        console.log(`Request took: ${endTime - startTime}ms`);
        console.log('Status:', response.status, response.statusText);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));
        
        if (!response.data) {
          console.error('No data in response');
          throw new Error('No data received from server');
        }
        
        if (response.data && response.data.success) {
          console.log('Verification successful, updating UI...');
          message.success('Student verified and approved successfully');
          
          // Close modal and reset form first for better UX
          setShowModal(false);
          form.resetFields();
          
          // Force refresh the students list from server
          await fetchStudents();
          
        } else {
          console.error('Verification failed with response:', response.data);
          const errorMsg = response.data?.message || 'Failed to verify student';
          message.error(errorMsg);
          
          // Log additional error details if available
          if (response.data?.error) {
            console.error('Server error details:', response.data.error);
          }
        }
      } catch (error) {
        console.error('API Error:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          headers: error.response?.headers
        });
        
        // More specific error messages
        if (error.response?.status === 404) {
          message.error('Student not found. Please refresh the page and try again.');
        } else if (error.response?.status === 400) {
          message.error(error.response.data?.message || 'Invalid verification data');
        } else if (error.response?.status === 401) {
          message.error('Authentication failed. Please log in again.');
        } else {
          message.error(error.response?.data?.message || 'Error verifying student');
        }
      }
    } catch (error) {
      console.error('Error verifying student:', error);
      message.error(
        error.response?.data?.message || 
        'An error occurred while verifying the student. Please try again.'
      );
    } finally {
      setVerificationLoading(false);
    }
  };

  return (
    <Modal
      title={
        <div>
          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
          Verify Student
        </div>
      }
      open={showModal}
      onCancel={() => {
        setShowModal(false);
        form.resetFields();
      }}
      width={800}
      footer={[
        <Button 
          key="cancel" 
          onClick={() => {
            setShowModal(false);
            form.resetFields();
          }}
          disabled={verificationLoading}
        >
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleModalSubmit}
          loading={verificationLoading}
          disabled={!allDocumentsSubmitted()}
          icon={<CheckCircleOutlined />}
        >
          {allDocumentsSubmitted() ? 'Verify & Approve' : 'Mark All Documents as Submitted'}
        </Button>,
      ]}
    >
      {selectedStudent && (
        <div>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Student Name">
              {selectedStudent.firstName} {selectedStudent.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Registration Number">
              {selectedStudent.registrationNumber || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Course">
              {selectedStudent.course || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Verification Status">
              <Space>
                {renderVerificationStatus(selectedStudent.verificationStatus || 'pending')}
                <Select
                  value={selectedStudent.verificationStatus || 'pending'}
                  onChange={(value) => setSelectedStudent({
                    ...selectedStudent,
                    verificationStatus: value
                  })}
                  style={{ width: 150, marginLeft: 8 }}
                >
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="in_progress">In Progress</Select.Option>
                  <Select.Option value="verified">Verified</Select.Option>
                  <Select.Option value="rejected">Rejected</Select.Option>
                </Select>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Registration Status">
              <Space>
                {selectedStudent.registrationStatus === 'completed' ? (
                  <Tag color="success">Completed</Tag>
                ) : (
                  <Tag color="warning">Incomplete</Tag>
                )}
                <Select
                  value={selectedStudent.registrationStatus || 'incomplete'}
                  onChange={(value) => setSelectedStudent({
                    ...selectedStudent,
                    registrationStatus: value
                  })}
                  style={{ width: 150, marginLeft: 8 }}
                >
                  <Select.Option value="incomplete">Incomplete</Select.Option>
                  <Select.Option value="in_progress">In Progress</Select.Option>
                  <Select.Option value="completed">Completed</Select.Option>
                  <Select.Option value="on_hold">On Hold</Select.Option>
                </Select>
              </Space>
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">Document Verification</Divider>
          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="Photo" required>
              {selectedStudent.photo ? (
                <Tag color="success">Uploaded ✓</Tag>
              ) : (
                <Tag color="error">Missing (Required)</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Signature" required>
              {selectedStudent.signature ? (
                <Tag color="success">Uploaded ✓</Tag>
              ) : (
                <Tag color="error">Missing (Required)</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Matric Marksheet" required>
              <Space>
                {renderDocumentStatus(selectedStudent.matricMarksheet, documentStatus.matricMarksheet, true)}
                <Select
                  value={documentStatus.matricMarksheet}
                  onChange={(value) => handleStatusChange('matricMarksheet', value)}
                  style={{ width: 120, marginLeft: 8 }}
                >
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="submitted">Submitted</Select.Option>
                </Select>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Senior Secondary Marksheet" required>
              <Space>
                {renderDocumentStatus(selectedStudent.srSecondaryMarksheet, documentStatus.srSecondaryMarksheet, true)}
                <Select
                  value={documentStatus.srSecondaryMarksheet}
                  onChange={(value) => handleStatusChange('srSecondaryMarksheet', value)}
                  style={{ width: 120, marginLeft: 8 }}
                >
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="submitted">Submitted</Select.Option>
                </Select>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Graduation Marksheet" required>
              <Space>
                {renderDocumentStatus(selectedStudent.graduationMarksheet, documentStatus.graduationMarksheet, true)}
                <Select
                  value={documentStatus.graduationMarksheet}
                  onChange={(value) => handleStatusChange('graduationMarksheet', value)}
                  style={{ width: 120, marginLeft: 8 }}
                >
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="submitted">Submitted</Select.Option>
                </Select>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Registration Fee" required>
              <Space>
                {documentStatus.registrationFee === 'submitted' ? (
                  <Tag color="success">Paid ✓</Tag>
                ) : (
                  <Tag color="error">Not Paid</Tag>
                )}
                <Select
                  value={documentStatus.registrationFee || 'pending'}
                  onChange={(value) => handleStatusChange('registrationFee', value)}
                  style={{ width: 120, marginLeft: 8 }}
                >
                  <Select.Option value="pending">Pending</Select.Option>
                  <Select.Option value="submitted">Paid</Select.Option>
                </Select>
              </Space>
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">Verification Details</Divider>
          <Form form={form} layout="vertical">
            <Form.Item
              name="verifiedBy"
              label="Verified By"
              initialValue={localStorage.getItem('userName') || ''}
              rules={[
                { required: true, message: 'Please enter your name' },
                { min: 3, message: 'Name must be at least 3 characters' }
              ]}
            >
              <Input placeholder="Enter your name" />
            </Form.Item>
            
            <Form.Item
              name="remarks"
              label="Verification Remarks"
              rules={[
                { required: true, message: 'Please enter verification remarks' },
                { min: 10, message: 'Remarks should be at least 10 characters' }
              ]}
            >
              <Input.TextArea
                placeholder="Enter verification remarks..."
                rows={4}
                showCount
                maxLength={500}
              />
            </Form.Item>
          </Form>

          <div style={{ marginTop: 16, textAlign: 'center' }}>
            <Typography.Text type="secondary">
              By verifying, you confirm that all documents have been checked and are valid.
            </Typography.Text>
          </div>
        </div>
      )}
    </Modal>
  );
};

return (
  <div className="p-6">
    <Card 
      title={
        <div className="flex justify-between items-center">
          <span>Verified Students</span>
          <Space>
            <Search
              placeholder="Search students..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ width: 300 }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchText('');
                fetchStudents({ pagination });
              }}
            >
              Refresh
            </Button>
          </Space>
        </div>
      }
    >
      <Table
        columns={columns}
        dataSource={students}
        rowKey="_id"
        pagination={pagination}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: 1500 }}
      />
    </Card>
    <VerificationModal 
      showModal={showModal}
      selectedStudent={selectedStudent}
      form={form}
      setShowModal={setShowModal}
      fetchStudents={fetchStudents}
      setVerificationLoading={setVerificationLoading}
      verificationLoading={verificationLoading}
    />
  </div>
);
};

export default VerifiedStudents;