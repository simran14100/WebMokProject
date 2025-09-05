
//test
import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Modal, 
  message, 
  Tag, 
  Card, 
  Input,
  Select,
  Descriptions,
  Popconfirm,
  Badge
} from 'antd';
import { 
  EyeOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { Option } = Select;
const { Search } = Input;

const RegisteredStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const navigate = useNavigate();

  // Fetch university registered students data
  const fetchStudents = async (params = {}) => {
    setLoading(true);
    try {
      const { current = 1, pageSize = 10 } = params.pagination || pagination;
      
      console.log('Fetching university registered students...');
      const response = await axios.get(
        "http://localhost:4001/api/v1/university/registered-students",
      {
        params: {
          page: params.pagination?.current || current,
          limit: params.pagination?.pageSize || pageSize,
          search: searchText,
          ...params,
        },
      }
    );

    console.log('University Students API Response:', response);
  
    const { data } = response;
  
    if (data && data.data && data.data.students) {
      console.log(`Found ${data.data.students.length} university students`);
      
      const formattedStudents = data.data.students.map(student => ({
        ...student,
        key: student._id,
        name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
        studentId: student.registrationNumber || `UNI-${student._id?.substring(0, 6) || 'N/A'}`,
        course: student.course || 'Not specified',
        status: student.status || 'pending',
        registrationDate: student.createdAt 
          ? dayjs(student.createdAt).format('DD-MMM-YYYY')
          : 'N/A'
      }));
      
      setStudents(formattedStudents);
      
      // Update pagination with server values if available
      if (data.data.pagination) {
        setPagination(prev => ({
          ...prev,
          total: data.data.pagination.total || 0,
          current: data.data.pagination.page || 1,
          pageSize: data.data.pagination.limit || 10,
        }));
      }
    } else {
      console.log('No students data found in response');
      setStudents([]);
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    message.error("Failed to fetch students");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchStudents();
  }, [searchText, pagination]);

  // Handle table change (pagination, filters, sorter)
  const handleTableChange = (newPagination, filters, sorter) => {
    fetchStudents({
      pagination: newPagination,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
    });
    
    // Update pagination state
    setPagination({
      ...pagination,
      ...newPagination,
    });
  };

  // Handle search
  const onSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  // View student details
  const handleView = (student) => {
    setCurrentStudent(student);
    setIsModalVisible(true);
  };

  // Edit student
  const handleEdit = (id) => {
    navigate(`/ugpg-admin/student/edit/${id}`);
  };

  // Delete student
  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:4001/api/v1/university/registered-students/${id}`);
      message.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      message.error('Failed to delete student');
    }
  };

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'studentId',
      key: 'studentId',
      sorter: true,
    },
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
      sorter: (a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`),
    },
    {
      title: 'Course',
      dataIndex: 'course',
      key: 'course',
      sorter: true,
      filters: [
        { text: 'B.Tech', value: 'btech' },
        { text: 'M.Tech', value: 'mtech' },
        { text: 'BCA', value: 'bca' },
        { text: 'MCA', value: 'mca' },
        { text: 'BBA', value: 'bba' },
        { text: 'MBA', value: 'mba' },
      ],
      onFilter: (value, record) => record.course === value,
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
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'approved') color = 'success';
        if (status === 'pending') color = 'processing';
        if (status === 'rejected') color = 'error';
        return <Badge status={color} text={status?.charAt(0).toUpperCase() + status?.slice(1)} />;
      },
      filters: [
        { text: 'Pending', value: 'pending' },
        { text: 'Approved', value: 'approved' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Scholarship',
      dataIndex: 'isScholarship',
      key: 'isScholarship',
      render: (isScholarship) => (
        <Tag color={isScholarship ? 'green' : 'default'}>
          {isScholarship ? 'Yes' : 'No'}
        </Tag>
      ),
      filters: [
        { text: 'Yes', value: true },
        { text: 'No', value: false },
      ],
      onFilter: (value, record) => record.isScholarship === value,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleView(record)}
            title="View Details"
          />
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record._id)}
            title="Edit"
          />
          <Popconfirm
            title="Are you sure to delete this student?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />} 
              title="Delete"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Card 
        title="Registered Students" 
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
              type="primary" 
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
        />
      </Card>

      {/* Student Details Modal */}
      <Modal
        title="Student Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {currentStudent && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Student ID" span={2}>
              {currentStudent.studentId || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Full Name">
              {`${currentStudent.firstName} ${currentStudent.lastName}`}
            </Descriptions.Item>
            <Descriptions.Item label="Date of Birth">
              {currentStudent.dateOfBirth ? dayjs(currentStudent.dateOfBirth).format('DD/MM/YYYY') : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Gender">
              {currentStudent.gender?.charAt(0).toUpperCase() + currentStudent.gender?.slice(1) || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {currentStudent.email || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {currentStudent.phone || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Course">
              {currentStudent.course?.toUpperCase() || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Specialization">
              {currentStudent.specialization || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Scholarship" span={2}>
              <Tag color={currentStudent.isScholarship ? 'green' : 'default'}>
                {currentStudent.isScholarship ? 'Yes' : 'No'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Status" span={2}>
              <Badge 
                status={
                  currentStudent.status === 'approved' ? 'success' : 
                  currentStudent.status === 'pending' ? 'processing' : 'error'
                } 
                text={
                  currentStudent.status?.charAt(0).toUpperCase() + currentStudent.status?.slice(1) || 'N/A'
                } 
              />
            </Descriptions.Item>
            <Descriptions.Item label="Address" span={2}>
              {currentStudent.address ? (
                <>
                  <div>{currentStudent.address.line1}</div>
                  {currentStudent.address.line2 && <div>{currentStudent.address.line2}</div>}
                  <div>{currentStudent.address.city}, {currentStudent.address.state} - {currentStudent.address.pincode}</div>
                </>
              ) : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Father's Name">
              {currentStudent.fatherName || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Mother's Name">
              {currentStudent.motherName || 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="Registered On">
              {dayjs(currentStudent.createdAt).format('DD/MM/YYYY hh:mm A')}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default RegisteredStudents;
