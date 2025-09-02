import React, { useEffect, useState } from 'react';
import { 
  Table, Button, Input, Select, Card, Tag, Space, Modal, 
  message, Tooltip, Dropdown, Row, Col, Typography 
} from 'antd';
import { 
  SearchOutlined, EyeOutlined, DeleteOutlined, 
  PhoneOutlined, MailOutlined, UserOutlined, 
  DownOutlined, CalendarOutlined, BookOutlined,
  HomeOutlined, TeamOutlined, IdcardOutlined
} from '@ant-design/icons';
import { 
  getAllAdmissionEnquiries, 
  deleteAdmissionEnquiry, 
  updateEnquiryStatus 
} from '../../services/operations/admissionEnquiryApi';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { isSuperAdmin, hasAdminAccess } from '../../utils/roleUtils';
import { ACCOUNT_TYPE } from '../../utils/constants';

const { Title, Text } = Typography;
const { Option } = Select;

const AdmissionEnquiry = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ 
    current: 1, 
    pageSize: 10, 
    total: 0 
  });
  const [filters, setFilters] = useState({ 
    search: '', 
    status: '' 
  });
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const { token } = useSelector((state) => state.auth);

  const columns = [
    {
      title: 'Action',
      key: 'action',
      width: 120,
      fixed: 'left',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button 
              type="text" 
              icon={<EyeOutlined style={{ color: '#1890ff' }} />} 
              onClick={() => {
                setSelectedEnquiry(record);
                setIsModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteEnquiry(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
      width: 180,
      sorter: (a, b) => a.fullName?.localeCompare(b.fullName || '') || 0,
      render: (text, record) => (
        <div className="flex items-center">
          <IdcardOutlined className="mr-2 text-blue-500" />
          <span>{text || `${record.firstName || ''} ${record.lastName || ''}`.trim() || 'N/A'}</span>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <MailOutlined className="mr-2 text-blue-500" />
            <a href={`mailto:${record.email}`} className="text-blue-600 hover:underline">
              {record.email || 'N/A'}
            </a>
          </div>
          <div className="flex items-center">
            <PhoneOutlined className="mr-2 text-green-500" />
            {record.mobileNumber || record.phone || 'N/A'}
          </div>
        </div>
      ),
    },
    {
      title: 'Program',
      dataIndex: 'programType',
      key: 'programType',
      width: 150,
      render: (type) => (
        <Tag color={type === 'UG' ? 'blue' : type === 'PG' ? 'green' : 'purple'}>
          {type || 'N/A'}
        </Tag>
      ),
      filters: [
        { text: 'UG', value: 'UG' },
        { text: 'PG', value: 'PG' },
        { text: 'PhD', value: 'PhD' },
      ],
      onFilter: (value, record) => record.programType === value,
    },
    {
      title: 'Education',
      key: 'education',
      width: 180,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <BookOutlined className="mr-2 text-blue-500" />
            <span>{record.lastClass || record.qualification || 'N/A'}</span>
          </div>
          {record.boardSchoolName && (
            <div className="text-xs text-gray-500 truncate" title={record.boardSchoolName}>
              {record.boardSchoolName}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        const statusMap = {
          'pending': { color: 'orange', text: 'Pending' },
          'contacted': { color: 'blue', text: 'Contacted' },
          'admitted': { color: 'green', text: 'Admitted' },
          'rejected': { color: 'red', text: 'Rejected' },
          'new': { color: 'blue', text: 'New' },
          'follow up': { color: 'orange', text: 'Follow Up' },
          'converted': { color: 'green', text: 'Converted' }
        };
        
        const statusInfo = statusMap[status?.toLowerCase()] || { color: 'default', text: status || 'N/A' };
        
        return (
          <Tag 
            color={statusInfo.color} 
            className="capitalize flex items-center justify-center"
            style={{ minWidth: '100px' }}
          >
            {statusInfo.text}
          </Tag>
        );
      },
      filters: [
        { text: 'New', value: 'new' },
        { text: 'Pending', value: 'pending' },
        { text: 'Contacted', value: 'contacted' },
        { text: 'Follow Up', value: 'follow up' },
        { text: 'Admitted', value: 'admitted' },
        { text: 'Converted', value: 'converted' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status?.toLowerCase() === value.toLowerCase(),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      width: 150,
      render: (date) => (
        <div className="flex items-center">
          <CalendarOutlined className="mr-2 text-blue-500" />
          <span>{date ? moment(date).format('DD MMM YYYY') : 'N/A'}</span>
        </div>
      ),
      sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
    },
    {
      title: 'Address',
      key: 'address',
      width: 200,
      render: (_, record) => (
        <div className="flex items-start">
          <HomeOutlined className="mr-2 mt-1 text-blue-500 flex-shrink-0" />
          <div className="truncate">
            {record.address || 'N/A'}
            {(record.city || record.state) && (
              <div className="text-xs text-gray-500">
                {[record.city, record.state].filter(Boolean).join(', ')}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      ellipsis: true,
      render: (email) => (
        <div className="flex items-center">
          <MailOutlined className="mr-1" />
          {email || 'N/A'}
        </div>
      ),
    },
    {
      title: 'Qualification',
      dataIndex: 'qualification',
      key: 'qualification',
      width: 150,
      render: (qualification) => qualification || 'N/A',
    },
    {
      title: 'Course',
      dataIndex: 'course',
      key: 'course',
      width: 150,
      render: (course) => course?.name || 'N/A',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      ellipsis: true,
      render: (address) => address || 'N/A',
    },
  ];

  const { user } = useSelector((state) => state.auth);
  
  const checkAdminAccess = () => {
    if (!hasAdminAccess(user)) {
      throw new Error('You do not have permission to view admission enquiries');
    }
  };

  const fetchEnquiries = async () => {
    try {
      if (!token) {
        throw new Error('Authentication token is missing');
      }

      // Check if user has admin access
      checkAdminAccess();

      setLoading(true);
      const { current, pageSize } = pagination;
      const { search, status } = filters;

      const params = {
        page: current,
        limit: pageSize,
        ...(search && { search }),
        ...(status && { status }),
      };

      console.log('Fetching enquiries with params:', {
        ...params,
        token: token ? 'token exists' : 'no token'
      });
      
      // Add role to headers if user is superadmin
      const headers = isSuperAdmin(user) 
        ? { 'X-User-Role': ACCOUNT_TYPE.SUPER_ADMIN }
        : {};
      
      const response = await getAllAdmissionEnquiries(params, token, headers);
      
      if (response?.data) {
        setEnquiries(response.data.enquiries || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
        }));
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch admission enquiries';
      message.error(errorMessage);
      
      // If unauthorized, clear token and redirect to login
      if (error.response?.status === 401 || error.response?.status === 403) {
        // You might want to dispatch a logout action here
        message.error('Session expired. Please login again.');
        // Redirect to login or handle as needed
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [pagination.current, pagination.pageSize, filters]);

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
  };

  const handleStatusFilter = (value) => {
    setFilters({ ...filters, status: value });
  };

  const handleDeleteEnquiry = async (id) => {
    try {
      await deleteAdmissionEnquiry(id, token);
      message.success('Enquiry deleted successfully');
      fetchEnquiries();
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      message.error(error.response?.data?.message || 'Failed to delete enquiry');
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedEnquiry) return;
    
    try {
      await updateEnquiryStatus(selectedEnquiry._id, { status }, token);
      message.success(`Enquiry marked as ${status}`);
      fetchEnquiries();
      setIsModalVisible(false);
    } catch (error) {
      console.error('Error updating status:', error);
      message.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  // Filter out duplicate columns and keep only the enhanced ones
  const filteredColumns = columns.filter((column, index, self) => {
    return index === self.findIndex((c) => c.key === column.key);
  });

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <Title level={3} className="m-0">Admission Enquiries</Title>
          <Text type="secondary">Manage and track all admission enquiries in one place</Text>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Input
            placeholder="Search by name, email or phone"
            prefix={<SearchOutlined />}
            onChange={(e) => handleSearch(e.target.value)}
            allowClear
            className="w-full md:w-64"
          />
          <Select
            placeholder="Filter by status"
            allowClear
            onChange={handleStatusFilter}
            className="w-full md:w-48"
          >
            <Option value="new">New</Option>
            <Option value="pending">Pending</Option>
            <Option value="contacted">Contacted</Option>
            <Option value="follow up">Follow Up</Option>
            <Option value="admitted">Admitted</Option>
            <Option value="rejected">Rejected</Option>
          </Select>
        </div>
      </div>

      <Card className="shadow-sm">
        <Table
          columns={filteredColumns}
          dataSource={enquiries}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} enquiries`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Enquiry Details Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <UserOutlined className="mr-2 text-blue-500" />
            <span>Enquiry Details</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          selectedEnquiry?.status !== 'admitted' && selectedEnquiry?.status !== 'rejected' && (
            <Dropdown
              key="status"
              menu={{
                items: [
                  {
                    key: 'contacted',
                    label: 'Mark as Contacted',
                    onClick: () => handleUpdateStatus('contacted'),
                  },
                  {
                    key: 'admitted',
                    label: 'Mark as Admitted',
                    danger: true,
                    onClick: () => handleUpdateStatus('admitted'),
                  },
                  {
                    key: 'rejected',
                    label: 'Reject Application',
                    danger: true,
                    onClick: () => handleUpdateStatus('rejected'),
                  },
                ],
              }}
              placement="topRight"
            >
              <Button type="primary">
                Update Status <DownOutlined />
              </Button>
            </Dropdown>
          ),
        ]}
        width={800}
        bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
      >
        {selectedEnquiry && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Text type="secondary" className="block mb-1">Full Name</Text>
                  <Text strong className="text-lg">
                    {selectedEnquiry.fullName || 
                     `${selectedEnquiry.firstName || ''} ${selectedEnquiry.lastName || ''}`.trim() || 'N/A'}
                  </Text>
                </div>
                
                <div>
                  <Text type="secondary" className="block mb-1">Email</Text>
                  <div className="flex items-center">
                    <MailOutlined className="mr-2 text-blue-500" />
                    <a 
                      href={`mailto:${selectedEnquiry.email}`} 
                      className="text-blue-600 hover:underline"
                    >
                      {selectedEnquiry.email || 'N/A'}
                    </a>
                  </div>
                </div>
                
                <div>
                  <Text type="secondary" className="block mb-1">Phone</Text>
                  <div className="flex items-center">
                    <PhoneOutlined className="mr-2 text-green-500" />
                    <a 
                      href={`tel:${selectedEnquiry.mobileNumber || selectedEnquiry.phone}`}
                      className="text-gray-800 hover:text-blue-600"
                    >
                      {selectedEnquiry.mobileNumber || selectedEnquiry.phone || 'N/A'}
                    </a>
                  </div>
                </div>
                
                {selectedEnquiry.alternateNumber && (
                  <div>
                    <Text type="secondary" className="block mb-1">Alternate Phone</Text>
                    <div className="flex items-center">
                      <PhoneOutlined className="mr-2 text-gray-500" />
                      <a 
                        href={`tel:${selectedEnquiry.alternateNumber}`}
                        className="text-gray-800 hover:text-blue-600"
                      >
                        {selectedEnquiry.alternateNumber}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <Text type="secondary" className="block mb-1">Program Type</Text>
                  <Tag 
                    color={selectedEnquiry.programType === 'UG' ? 'blue' : 
                          selectedEnquiry.programType === 'PG' ? 'green' : 'purple'}
                    className="text-sm"
                  >
                    {selectedEnquiry.programType || 'N/A'}
                  </Tag>
                </div>
                
                <div>
                  <Text type="secondary" className="block mb-1">Education</Text>
                  <div>
                    <div className="font-medium">
                      {selectedEnquiry.lastClass || selectedEnquiry.qualification || 'N/A'}
                    </div>
                    {selectedEnquiry.boardSchoolName && (
                      <div className="text-sm text-gray-600 mt-1">
                        {selectedEnquiry.boardSchoolName}
                      </div>
                    )}
                    {selectedEnquiry.percentage && (
                      <div className="text-sm text-gray-600">
                        Percentage: {selectedEnquiry.percentage}%
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Text type="secondary" className="block mb-1">Address</Text>
                  <div className="flex items-start">
                    <HomeOutlined className="mr-2 mt-1 text-blue-500 flex-shrink-0" />
                    <div>
                      <div>{selectedEnquiry.address || 'N/A'}</div>
                      {(selectedEnquiry.city || selectedEnquiry.state) && (
                        <div className="text-gray-600">
                          {[selectedEnquiry.city, selectedEnquiry.state, selectedEnquiry.pincode]
                            .filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {(selectedEnquiry.notes || selectedEnquiry.additionalInfo) && (
              <div className="border-t border-gray-200 pt-4 mt-4">
                <Text type="secondary" className="block mb-2">
                  {selectedEnquiry.notes ? 'Additional Notes' : 'Additional Information'}
                </Text>
                <div className="p-4 bg-gray-50 rounded-md">
                  {selectedEnquiry.notes || selectedEnquiry.additionalInfo}
                </div>
              </div>
            )}
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div>
                <Text type="secondary" className="block text-sm">Enquiry Status</Text>
                <Tag 
                  color={{
                    'new': 'blue',
                    'pending': 'orange',
                    'contacted': 'green',
                    'follow up': 'orange',
                    'admitted': 'green',
                    'converted': 'green',
                    'rejected': 'red'
                  }[selectedEnquiry.status?.toLowerCase()] || 'default'}
                  className="capitalize text-sm py-1 px-3"
                >
                  {selectedEnquiry.status || 'N/A'}
                </Tag>
              </div>
              
              <div className="text-right">
                <Text type="secondary" className="block text-sm">Submitted On</Text>
                <Text className="font-medium">
                  {moment(selectedEnquiry.createdAt).format('DD MMM YYYY hh:mm A')}
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdmissionEnquiry;
