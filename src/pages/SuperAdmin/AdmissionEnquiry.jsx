import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Select, Card, Tag, Space, Modal, message } from 'antd';
import { SearchOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { getAllAdmissionEnquiries, deleteAdmissionEnquiry, updateEnquiryStatus } from '../../services/operations/admissionEnquiryApi';
import moment from 'moment';

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
    { title: 'ID', dataIndex: 'enquiryId', key: 'enquiryId' },
    {
      title: 'Name',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Phone', dataIndex: 'phone' },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => {
        const statusColors = {
          'new': 'blue',
          'contacted': 'green',
          'follow up': 'orange',
          'converted': 'green',
          'rejected': 'red'
        };
        return <Tag color={statusColors[status?.toLowerCase()] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      render: (date) => moment(date).format('DD MMM YYYY'),
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EyeOutlined />} onClick={() => handleViewEnquiry(record)} />
          <Button danger icon={<DeleteOutlined />} onClick={() => handleDeleteEnquiry(record.enquiryId)} />
        </Space>
      ),
    },
  ];

  const fetchEnquiries = async () => {
    try {
      setLoading(true);
      const { current, pageSize } = pagination;
      
      console.log('Fetching enquiries with params:', {
        page: current,
        limit: pageSize,
        search: filters.search,
        status: filters.status,
        token: token ? 'token exists' : 'no token'
      });
      
      const response = await getAllAdmissionEnquiries(
        { 
          page: current, 
          limit: pageSize, 
          search: filters.search,
          status: filters.status 
        },
        token
      );
      
      console.log('API Response:', response);
      
      if (response && response.success) {
        setEnquiries(response.data.enquiries || []);
        setPagination(prev => ({ 
          ...prev,
          total: response.data.total || 0,
          pageSize: response.data.limit || prev.pageSize,
          current: response.data.page || prev.current
        }));
      } else {
        console.error('Error in response:', response);
        message.error(response?.message || 'Failed to fetch admission enquiries');
        setEnquiries([]);
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      message.error(error.message || 'Failed to fetch admission enquiries');
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
    <Card 
      title="Admission Enquiry" 
      extra={
        <Input
          placeholder="Search..."
          prefix={<SearchOutlined />}
          style={{ width: 200 }}
          onChange={(e) => handleSearch(e.target.value)}
        />
      }
    >
      <div style={{ marginBottom: 16 }}>
        <Select
          placeholder="Filter by status"
          style={{ width: 150, marginRight: 16 }}
          onChange={handleStatusFilter}
          allowClear
        >
          <Option value="new">New</Option>
          <Option value="contacted">Contacted</Option>
          <Option value="follow up">Follow Up</Option>
          <Option value="converted">Converted</Option>
          <Option value="rejected">Rejected</Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={enquiries}
        rowKey="enquiryId"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        onChange={handleTableChange}
      />

      <Modal
        title="Enquiry Details"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          <Button 
            key="converted" 
            type="primary" 
            onClick={() => handleUpdateStatus('converted')}
            style={{ marginRight: 8 }}
          >
            Mark as Converted
          </Button>,
          <Button 
            key="contacted" 
            type="default" 
            onClick={() => handleUpdateStatus('contacted')}
            style={{ marginRight: 8 }}
          >
            Mark as Contacted
          </Button>,
          <Button 
            key="rejected" 
            danger 
            onClick={() => handleUpdateStatus('rejected')}
          >
            Mark as Rejected
          </Button>,
        ]}
      >
        {selectedEnquiry && (
          <div>
            <p><strong>Name:</strong> {selectedEnquiry.firstName} {selectedEnquiry.lastName}</p>
            <p><strong>Email:</strong> {selectedEnquiry.email}</p>
            <p><strong>Phone:</strong> {selectedEnquiry.phone}</p>
            <p><strong>Status:</strong> {selectedEnquiry.status}</p>
            <p><strong>Date:</strong> {moment(selectedEnquiry.createdAt).format('DD MMM YYYY')}</p>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default AdmissionEnquiry;
