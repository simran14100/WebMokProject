import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Card, Tag, Space, Modal, message, Tooltip } from 'antd';
import { SearchOutlined, EyeOutlined, DeleteOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import { getAllAdmissionEnquiries, deleteAdmissionEnquiry, updateEnquiryStatus } from '../../services/operations/admissionEnquiryApi';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { hasAdminAccess, isSuperAdmin } from '../../utils/roleUtils';
import { ACCOUNT_TYPE } from '../../utils/constants';

const { Option } = Select;

const AdmissionEnquiry = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  
  const { token } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const columns = [
    {
      title: 'Action',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Details">
            <Button 
              type="link" 
              icon={<EyeOutlined />} 
              onClick={() => {
                setSelectedEnquiry(record);
                setIsModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteEnquiry(record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (status) => {
        const statusColors = {
          'new': 'blue',
          'contacted': 'green',
          'follow up': 'orange',
          'converted': 'green',
          'rejected': 'red'
        };
        return (
          <Tag 
            color={statusColors[status?.toLowerCase()] || 'default'}
            style={{ 
              padding: '4px 8px',
              borderRadius: '4px',
              textTransform: 'capitalize',
              textAlign: 'center',
              minWidth: '80px',
              display: 'inline-block'
            }}
          >
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (_, record) => (
        <div className="font-medium">
          {`${record.firstName || ''} ${record.lastName || ''}`.trim()}
        </div>
      ),
    },
    {
      title: "Father's Name",
      dataIndex: 'fatherName',
      key: 'fatherName',
      width: 150,
      render: (fatherName) => fatherName || 'N/A',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 130,
      render: (phone) => (
        <div className="flex items-center">
          <PhoneOutlined className="mr-1" />
          {phone || 'N/A'}
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
    setPagination({ ...pagination, current: 1 });
  };

  const handleStatusFilter = (value) => {
    setFilters({ ...filters, status: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleViewEnquiry = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setIsModalVisible(true);
  };

  const handleDeleteEnquiry = (id) => {
    Modal.confirm({
      title: 'Delete Enquiry',
      content: 'Are you sure you want to delete this enquiry?',
      onOk: async () => {
        try {
          await deleteAdmissionEnquiry(id, token);
          message.success('Enquiry deleted successfully');
          fetchEnquiries();
        } catch (error) {
          console.error('Error deleting enquiry:', error);
          message.error(error.message || 'Failed to delete enquiry');
        }
      },
    });
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedEnquiry) return;
    
    try {
      await updateEnquiryStatus(
        selectedEnquiry._id, 
        { status }, 
        token
      );
      
      message.success('Enquiry status updated successfully');
      setIsModalVisible(false);
      fetchEnquiries();
    } catch (error) {
      console.error('Error updating status:', error);
      message.error(error.message || 'Failed to update enquiry status');
    }
  };

  return (
    <div className="p-6 mt-4">
      <Card 
        title={
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Admission Enquiries</h2>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <Input
                placeholder="Search by name, email, or phone"
                prefix={<SearchOutlined className="text-gray-400" />}
                className="w-full md:w-64"
                onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                allowClear
              />

              <Select
                placeholder="Filter by status"
                className="w-full md:w-48"
                allowClear
                onChange={(value) => setFilters(prev => ({...prev, status: value}))}
              >
                <Option value="new">New</Option>
                <Option value="contacted">Contacted</Option>
                <Option value="follow up">Follow Up</Option>
                <Option value="converted">Converted</Option>
                <Option value="rejected">Rejected</Option>
              </Select>
            </div>
          </div>
        }
        bordered={false}
        className="shadow-sm rounded-lg"
        bodyStyle={{ padding: 0 }}
      >
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={enquiries}
            rowKey="_id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              showTotal: (total) => `Total ${total} items`,
              className: 'px-6 py-3',
            }}
            onChange={handleTableChange}
            className="min-w-full"
            scroll={{ x: 'max-content' }}
          />
        </div>

        <Modal
          title="Enquiry Details"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="close" onClick={() => setIsModalVisible(false)}>
              Close
            </Button>,
            <Button 
              key="converted" 
              type="primary" 
              onClick={() => handleUpdateStatus('converted')}
              className="bg-green-600 hover:bg-green-700"
            >
              Mark as Converted
            </Button>,
            <Button 
              key="contacted" 
              type="default" 
              className="border-blue-500 text-blue-500 hover:border-blue-600 hover:text-blue-600"
              onClick={() => handleUpdateStatus('contacted')}
            >
              Mark as Contacted
            </Button>,
            <Button 
              key="rejected" 
              danger 
              onClick={() => handleUpdateStatus('rejected')}
              className="hover:bg-red-50"
            >
              Mark as Rejected
            </Button>,
          ]}
          width={600}
        >
          {selectedEnquiry && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">{selectedEnquiry.firstName} {selectedEnquiry.lastName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Father's Name</p>
                  <p className="font-medium">{selectedEnquiry.fatherName || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium flex items-center">
                    <MailOutlined className="mr-2" />
                    {selectedEnquiry.email || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium flex items-center">
                    <PhoneOutlined className="mr-2" />
                    {selectedEnquiry.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Qualification</p>
                  <p className="font-medium">{selectedEnquiry.qualification || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Course</p>
                  <p className="font-medium">
                    {selectedEnquiry.course?.name || selectedEnquiry.course || 'N/A'}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">{selectedEnquiry.address || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">
                    <Tag 
                      color={{
                        'new': 'blue',
                        'contacted': 'green',
                        'follow up': 'orange',
                        'converted': 'green',
                        'rejected': 'red'
                      }[selectedEnquiry.status?.toLowerCase()] || 'default'}
                      className="capitalize"
                    >
                      {selectedEnquiry.status}
                    </Tag>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Enquiry Date</p>
                  <p className="font-medium">
                    {moment(selectedEnquiry.createdAt).format('DD MMM YYYY hh:mm A')}
                  </p>
                </div>
              </div>
              {selectedEnquiry.notes && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500 mb-1">Additional Notes</p>
                  <div className="p-3 bg-gray-50 rounded">
                    {selectedEnquiry.notes}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>
      </Card>
    </div>
  );
};

export default AdmissionEnquiry;
