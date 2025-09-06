import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Space, 
  Checkbox,
  message, 
  Tag, 
  Card, 
  Input,
  Modal,
  Descriptions,
  Badge,
  Form,
  Input as AntdInput,
  Select,
  Popconfirm,
  DatePicker,
  Row,
  Col
} from 'antd';
import { 
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  BookOutlined,
  InfoCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
  SaveOutlined,
  CloseOutlined,
  TagOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { Divider } from 'antd';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import axios from 'axios';

const { Search } = Input;
const { Option } = Select;

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
  const [showEditModal, setShowEditModal] = useState(false);
  const [form] = Form.useForm();
  const [editingStudent, setEditingStudent] = useState(null);

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

  const statusOptions = [
    { value: 'pending', label: 'Pending', color: 'orange' },
    { value: 'approved', label: 'Verified', color: 'green' },
    { value: 'rejected', label: 'Rejected', color: 'red' }
  ];

  const getStatusBadge = (status) => {
    const statusInfo = statusOptions.find(opt => opt.value === status) || 
                      { label: 'Unknown', color: 'default' };
    return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
  };

  

  const handleEdit = (student) => {
    setEditingStudent(student);
    
    // Use dateOfBirth from the database (not dob)
    const dateOfBirth = student.dateOfBirth;
    
    // Parse the ISO date string
    let formattedDob = null;
    if (dateOfBirth) {
      try {
        formattedDob = dayjs(dateOfBirth);
        
        if (!formattedDob.isValid()) {
          // Fallback: try parsing without timezone if ISO format fails
          const datePart = dateOfBirth.split('T')[0];
          formattedDob = dayjs(datePart, 'YYYY-MM-DD');
        }
      } catch (e) {
        console.warn('Error parsing date:', e);
        formattedDob = null;
      }
    }
    
    const formValues = {
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      email: student.email || '',
      phone: student.phone || '',
      status: student.status || 'pending',
      registrationNumber: student.registrationNumber || '',
      gender: student.gender || '',
      dob: formattedDob, // This should match your form field name
      aadharNumber: student.aadharNumber || '',
      alternatePhone: student.alternatePhone || '',
      lastQualification: student.lastQualification || '',
      boardUniversity: student.boardUniversity || '',
      yearOfPassing: student.yearOfPassing || '',
      percentage: student.percentage || '',
      course: student.course || '',
      specialization: student.specialization || '',
      isScholarship: student.isScholarship || false,
      source: student.source || '',
      address: student.address ? {
        line1: student.address.line1 || '',
        line2: student.address.line2 || '',
        city: student.address.city || '',
        state: student.address.state || '',
        pincode: student.address.pincode || '',
        country: student.address.country || ''
      } : {}
    };
    
    console.log('Date debugging:', {
      original: dateOfBirth,
      parsed: formattedDob,
      isValid: formattedDob?.isValid()
    });
    
    form.setFieldsValue(formValues);
    setShowEditModal(true);
  };
  // Handle delete student
  const handleDelete = async (studentId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:4001/api/v1/university/registered-students/${studentId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      message.success('Student deleted successfully');
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      message.error(error.response?.data?.message || 'Failed to delete student');
    }
  };

  // Handle form submission for editing
  const handleEditSubmit = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('token');
      
      if (!token) {
        message.error('Authentication token not found. Please log in again.');
        return;
      }

      // Prepare the data for the API
      const updateData = {
        // Personal Information
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        registrationNumber: values.registrationNumber,
        gender: values.gender,
        dateOfBirth: values.dob ? values.dob.format('YYYY-MM-DD') : null,
        aadharNumber: values.aadharNumber,
        alternatePhone: values.alternatePhone,
        
        // Academic Information
        lastQualification: values.lastQualification,
        boardUniversity: values.boardUniversity,
        yearOfPassing: values.yearOfPassing,
        percentage: values.percentage,
        course: values.course,
        specialization: values.specialization,
        
        // Additional Information
        isScholarship: values.isScholarship,
        source: values.source,
        
        // Address
        address: values.address ? {
          line1: values.address.line1,
          line2: values.address.line2,
          city: values.address.city,
          state: values.address.state,
          pincode: values.address.pincode,
          country: values.address.country
        } : null
      };

      console.log('Updating student with data:', updateData);
      
      // Update the student's information
      const updateResponse = await axios.put(
        `${process.env.REACT_APP_API_URL || 'http://localhost:4000'}/api/v1/university/registered-students/${editingStudent._id}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (updateResponse.status === 200 || updateResponse.data.success) {
        message.success('Student status updated successfully');
        setShowEditModal(false);
        fetchStudents(); // Refresh the student list
      } else {
        throw new Error(updateResponse.data.message || 'Failed to update student status');
      }
    } catch (error) {
      console.error('Error updating student status:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
      
      if (error.response?.status === 401) {
        message.error('Session expired. Please log in again.');
      } else if (error.response?.data?.message) {
        message.error(error.response.data.message);
      } else {
        message.error('Failed to update student status. Please check the console for details.');
      }
    }
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
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetails(record)}
            title="View Details"
          />
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            title="Edit Student"
          />
          <Popconfirm
            title="Are you sure to delete this student?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
            placement="topRight"
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />} 
              title="Delete Student"
            />
          </Popconfirm>
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

      {/* Edit Student Modal */}
      <Modal
        title={
          <span>
            <EditOutlined style={{ marginRight: 8 }} />
            Edit Student: {editingStudent?.registrationNumber || ''}
          </span>
        }
        open={showEditModal}
        onCancel={() => setShowEditModal(false)}
        onOk={handleEditSubmit}
        okText="Save Changes"
        cancelText="Cancel"
        width={800}
        okButtonProps={{
          icon: <SaveOutlined />,
          type: 'primary',
          size: 'large'
        }}
        cancelButtonProps={{
          icon: <CloseOutlined />,
          size: 'large'
        }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            status: 'pending'
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <span>
                    <UserOutlined style={{ marginRight: 8 }} />
                    First Name
                  </span>
                }
                name="firstName"
                rules={[{ required: true, message: 'Please input first name!' }]}
              >
                <AntdInput placeholder="First Name" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <span>
                    <UserOutlined style={{ marginRight: 8 }} />
                    Last Name
                  </span>
                }
                name="lastName"
                rules={[{ required: true, message: 'Please input last name!' }]}
              >
                <AntdInput placeholder="Last Name" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <span>
                    <MailOutlined style={{ marginRight: 8 }} />
                    Email
                  </span>
                }
                name="email"
                rules={[
                  { required: true, message: 'Please input email!' },
                  { type: 'email', message: 'Please enter a valid email!' }
                ]}
              >
                <AntdInput placeholder="Email" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <span>
                    <PhoneOutlined style={{ marginRight: 8 }} />
                    Phone
                  </span>
                }
                name="phone"
                rules={[{ required: true, message: 'Please input phone number!' }]}
              >
                <AntdInput placeholder="Phone Number" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <span>
                    <PhoneOutlined style={{ marginRight: 8 }} />
                    Alternate Phone
                  </span>
                }
                name="alternatePhone"
              >
                <AntdInput placeholder="Alternate Phone (Optional)" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <span>
                    <IdcardOutlined style={{ marginRight: 8 }} />
                    Aadhar Number
                  </span>
                }
                name="aadharNumber"
                rules={[
                  { pattern: /^\d{12}$/, message: 'Please enter a valid 12-digit Aadhar number' }
                ]}
              >
                <AntdInput placeholder="Aadhar Number" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <span>
                    <IdcardOutlined style={{ marginRight: 8 }} />
                    Registration Number
                  </span>
                }
                name="registrationNumber"
                rules={[{ required: true, message: 'Please input registration number!' }]}
              >
                <AntdInput placeholder="Registration Number" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <span>
                    <CalendarOutlined style={{ marginRight: 8 }} />
                    Date of Birth
                  </span>
                }
                name="dob"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  size="large"
                  format="DD/MM/YYYY"
                  allowClear={false}
                  placeholder="Select date of birth"
                  value={form.getFieldValue('dob') || null}
                  onChange={(date) => form.setFieldsValue({ dob: date })}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <span>
                    <UserOutlined style={{ marginRight: 8 }} />
                    Gender
                  </span>
                }
                name="gender"
              >
                <Select placeholder="Select gender" size="large">
                  <Option value="male">Male</Option>
                  <Option value="female">Female</Option>
                  <Option value="other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label={
                  <span>
                    <TagOutlined style={{ marginRight: 8 }} />
                    Status
                  </span>
                }
                name="status"
                rules={[{ required: true, message: 'Please select status!' }]}
              >
                <Select placeholder="Select status" size="large">
                  {statusOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      <Tag color={option.color}>{option.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '16px 0' }}>
            <EnvironmentOutlined style={{ marginRight: 8 }} />
            Address
          </Divider>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Address Line 1"
                name={['address', 'line1']}
              >
                <AntdInput placeholder="Address Line 1" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Address Line 2"
                name={['address', 'line2']}
              >
                <AntdInput placeholder="Address Line 2 (Optional)" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item
                label="City"
                name={['address', 'city']}
              >
                <AntdInput placeholder="City" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="State"
                name={['address', 'state']}
              >
                <AntdInput placeholder="State" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Pincode"
                name={['address', 'pincode']}
                rules={[
                  { pattern: /^\d{6}$/, message: 'Please enter a valid 6-digit pincode' }
                ]}
              >
                <AntdInput placeholder="Pincode" size="large" maxLength={6} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                label="Country"
                name={['address', 'country']}
              >
                <AntdInput placeholder="Country" size="large" defaultValue="India" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '16px 0' }}>
            <BookOutlined style={{ marginRight: 8 }} />
            Academic Information
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Last Qualification"
                name="lastQualification"
              >
                <Select placeholder="Select Last Qualification" size="large">
                  <Option value="10th">10th</Option>
                  <Option value="12th">12th</Option>
                  <Option value="Graduation">Graduation</Option>
                  <Option value="Post Graduation">Post Graduation</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Board/University"
                name="boardUniversity"
              >
                <AntdInput placeholder="Board/University" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Year of Passing"
                name="yearOfPassing"
              >
                <Select 
                  placeholder="Select Year" 
                  size="large"
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {Array.from({length: 30}, (_, i) => new Date().getFullYear() - i).map(year => (
                    <Option key={year} value={year.toString()}>
                      {year}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Percentage/CGPA"
                name="percentage"
                rules={[
                  { pattern: /^\d*\.?\d*$/, message: 'Please enter a valid number' }
                ]}
              >
                <AntdInput 
                  placeholder="Percentage or CGPA" 
                  size="large" 
                  addonAfter={
                    <Select 
                      defaultValue="%" 
                      style={{ width: 80 }}
                      bordered={false}
                    >
                      <Option value="%">%</Option>
                      <Option value="CGPA">CGPA</Option>
                    </Select>
                  }
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Course"
                name="course"
              >
                <Select placeholder="Select Course" size="large">
                  <Option value="B.Tech">B.Tech</Option>
                  <Option value="MBA">MBA</Option>
                  <Option value="BBA">BBA</Option>
                  <Option value="BCA">BCA</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Specialization"
                name="specialization"
              >
                <AntdInput placeholder="Specialization" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left" style={{ margin: '16px 0' }}>
            <InfoCircleOutlined style={{ marginRight: 8 }} />
            Additional Information
          </Divider>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="isScholarship"
                valuePropName="checked"
              >
                <Checkbox>Eligible for Scholarship</Checkbox>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="How did you hear about us?"
                name="source"
              >
                <Select placeholder="Select Source" size="large">
                  <Option value="Friend/Family">Friend/Family</Option>
                  <Option value="Social Media">Social Media</Option>
                  <Option value="Newspaper">Newspaper</Option>
                  <Option value="Website">Website</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default AllRegisteredStudents;


