import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  message, 
  Tag, 
  Card, 
  Input,
  Modal,
  Descriptions,
  Badge
} from 'antd';
import { 
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Search } = Input;

const AllRegisteredStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch all registered students
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
      message.error(error.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [searchText]);

  const handleTableChange = (pagination, filters, sorter) => {
    fetchStudents({
      pagination,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
    });
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { text: 'Pending', color: 'orange' },
      'approved': { text: 'Verified', color: 'green' },
      'rejected': { text: 'Rejected', color: 'red' }
    };
    
    const statusInfo = statusMap[status] || { text: 'Unknown', color: 'default' };
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const columns = [
    {
      title: 'Registration ID',
      dataIndex: 'registrationNumber',
      key: 'registrationNumber',
      sorter: true,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Registration Date',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
      sorter: true,
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => getStatusBadge(record.status),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card 
        title="All Registered Students"
        extra={
          <Space>
            <Search
              placeholder="Search students..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={value => {
                setSearchText(value);
                setPagination(prev => ({ ...prev, current: 1 }));
              }}
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
            emptyText: 'No registered students found'
          }}
        />
      </Card>

      {/* Student Details Modal */}
      <Modal
        title="Student Details"
        visible={showDetailsModal}
        onCancel={() => setShowDetailsModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowDetailsModal(false)}>
            Close
          </Button>
        ]}
        width={800}
      >
        {selectedStudent && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Registration ID" span={2}>
              {selectedStudent.registrationNumber || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Full Name">
              {selectedStudent.name || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedStudent.email || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {selectedStudent.phone || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Date of Birth">
              {selectedStudent.dob ? dayjs(selectedStudent.dob).format('DD-MMM-YYYY') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Registration Date">
              {selectedStudent.registrationDate || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Status" span={2}>
              {getStatusBadge(selectedStudent.status)}
            </Descriptions.Item>
            {selectedStudent.address && (
              <>
                <Descriptions.Item label="Address" span={2}>
                  {selectedStudent.address.line1}<br />
                  {selectedStudent.address.line2 && <>{selectedStudent.address.line2}<br /></>}
                  {selectedStudent.address.city}, {selectedStudent.address.state} - {selectedStudent.address.pincode}
                </Descriptions.Item>
              </>
            )}
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default AllRegisteredStudents;


