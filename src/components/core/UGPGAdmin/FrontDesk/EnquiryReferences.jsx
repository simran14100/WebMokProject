import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { toast } from 'react-hot-toast';
import { FiSearch, FiFilter, FiEye, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { Table, Space, Button, Input, Select, Modal, Form, DatePicker, Card } from 'antd';
import moment from 'moment';
import { 
  getEnquiryReferences, 
  createEnquiryReference, 
  updateEnquiryReference, 
  deleteEnquiryReference 
} from '../../../../services/operations/enquiryReferenceAPI';

const { Option } = Select;
const { RangePicker } = DatePicker;

const EnquiryReferences = () => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.profile);
  
  const store = useStore();

  // Debug: Log user details
  useEffect(() => {
    const state = store.getState();
    console.log('Current user:', user);
    console.log('User role:', user?.role);
    console.log('User permissions:', user?.permissions);
    console.log('Auth state:', state.auth);
    console.log('Profile state:', state.profile);
  }, [user, store]);
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateRange: [],
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEnquiry, setEditingEnquiry] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Check if user has required role or account type
  const hasRequiredRole = () => {
    const allowedAccountTypes = ['Admin', 'SuperAdmin', 'Content-management'];
    // Check both role and accountType for backward compatibility
    return (user?.role && allowedAccountTypes.includes(user.role)) || 
           (user?.accountType && allowedAccountTypes.includes(user.accountType));
  };

  // Fetch enquiry references
  const fetchEnquiries = async (params = {}) => {
    // Check user role before making the API call
    if (!hasRequiredRole()) {
      toast.error('You do not have permission to view enquiry references');
      return;
    }

    try {
      setLoading(true);
      const { current, pageSize } = pagination;
      const { search, status, dateRange } = filters;
      
      const queryParams = {
        page: params.current || current,
        limit: params.pageSize || pageSize,
        search: search || '',
        status: status || '',
      };

      if (dateRange && dateRange.length === 2) {
        queryParams.startDate = dateRange[0].format('YYYY-MM-DD');
        queryParams.endDate = dateRange[1].format('YYYY-MM-DD');
      }

      const response = await getEnquiryReferences(queryParams);
      
      if (response && response.data) {
        setEnquiries(response.data);
        setPagination({
          ...pagination,
          total: response.pagination?.total || 0,
          current: response.pagination?.page || 1,
          pageSize: response.pagination?.limit || 10,
        });
      }
    } catch (error) {
      console.error('Error fetching enquiry references:', error);
      if (error.response?.status === 403) {
        toast.error('Access denied. You do not have permission to view this resource.');
      } else {
        toast.error('Failed to fetch enquiry references');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, [filters]);

  // Handle table change (pagination, filters, sorter)
  const handleTableChange = (pagination, filters, sorter) => {
    fetchEnquiries({
      current: pagination.current,
      pageSize: pagination.pageSize,
      ...filters,
      ...(sorter.field && {
        sortBy: sorter.field,
        sortOrder: sorter.order,
      }),
    });
  };

  // Handle search
  const handleSearch = (value) => {
    setFilters({
      ...filters,
      search: value,
    });
  };

  // Handle status filter change
  const handleStatusChange = (value) => {
    setFilters({
      ...filters,
      status: value,
    });
  };

  // Handle date range change
  const handleDateRangeChange = (dates) => {
    setFilters({
      ...filters,
      dateRange: dates,
    });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      status: '',
      dateRange: [],
    });
    form.resetFields();
  };

  // Show add new enquiry modal
  const showAddModal = () => {
    setEditingEnquiry(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Show edit enquiry modal
  const showEditModal = (record) => {
    setEditingEnquiry(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      contact: record.contact,
      reference: record.reference,
      status: record.status,
      notes: record.notes,
    });
    setIsModalVisible(true);
  };

  // Handle form submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setConfirmLoading(true);

      if (editingEnquiry) {
        // Update existing enquiry
        await updateEnquiryReference(editingEnquiry._id, values);
        toast.success('Enquiry reference updated successfully');
      } else {
        // Create new enquiry
        await createEnquiryReference({
          ...values,
          createdBy: user._id,
        });
        toast.success('Enquiry reference created successfully');
      }

      setIsModalVisible(false);
      fetchEnquiries();
    } catch (error) {
      console.error('Error submitting form:', error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to save enquiry reference');
      }
    } finally {
      setConfirmLoading(false);
    }
  };

  // Handle delete enquiry
  const handleDelete = async (id) => {
    try {
      await deleteEnquiryReference(id);
      toast.success('Enquiry reference deleted successfully');
      fetchEnquiries();
    } catch (error) {
      console.error('Error deleting enquiry reference:', error);
      toast.error('Failed to delete enquiry reference');
    }
  };

  // Table columns
  const columns = [
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
      title: 'Contact',
      dataIndex: 'contact',
      key: 'contact',
    },
    {
      title: 'Reference',
      dataIndex: 'reference',
      key: 'reference',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span
          className={`px-2 py-1 rounded-full text-xs ${
            status === 'Converted'
              ? 'bg-green-100 text-green-800'
              : status === 'Rejected'
              ? 'bg-red-100 text-red-800'
              : status === 'Contacted'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {status}
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="text"
            icon={<FiEye className="text-blue-500" />}
            onClick={() => showEditModal(record)}
          />
          <Button
            type="text"
            icon={<FiEdit2 className="text-green-500" />}
            onClick={() => showEditModal(record)}
          />
          <Button
            type="text"
            danger
            icon={<FiTrash2 />}
            onClick={() => {
              Modal.confirm({
                title: 'Delete Enquiry Reference',
                content: 'Are you sure you want to delete this enquiry reference?',
                okText: 'Yes',
                okType: 'danger',
                cancelText: 'No',
                onOk: () => handleDelete(record._id),
              });
            }}
          />
        </Space>
      ),
    },
  ];

  // Show permission denied message if user doesn't have required role
  if (!hasRequiredRole()) {
    return (
      <div style={{marginTop:"4rem", textAlign: 'center', padding: '2rem'}}>
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-700 mb-4">
          You don't have permission to access the Enquiry References section.
        </p>
        <p className="text-gray-600">
          Please contact your administrator if you believe this is a mistake.
        </p>
      </div>
    );
  }

  return (
    <div style={{marginTop:"4rem"}}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Enquiry References</h1>
        <Button
          type="primary"
          icon={<FiPlus className="mr-2" />}
          onClick={showAddModal}
        >
          Add New
        </Button>
      </div>

      {/* Search and Filter Section */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Input
              placeholder="Search by name, email, or reference"
              prefix={<FiSearch className="text-gray-400" />}
              value={filters.search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Select
            placeholder="Filter by status"
            className="w-full"
            allowClear
            value={filters.status || undefined}
            onChange={handleStatusChange}
          >
            <Option value="Pending">Pending</Option>
            <Option value="Contacted">Contacted</Option>
            <Option value="Converted">Converted</Option>
            <Option value="Rejected">Rejected</Option>
          </Select>
          <RangePicker
            className="w-full"
            placeholder={['Start Date', 'End Date']}
            value={filters.dateRange}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
          />
          <Button onClick={resetFilters}>Reset Filters</Button>
        </div>
      </Card>

      {/* Enquiry References Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={enquiries}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: true }}
        />
      </Card>

      {/* Add/Edit Enquiry Modal */}
      <Modal
        title={editingEnquiry ? 'Edit Enquiry Reference' : 'Add New Enquiry Reference'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={confirmLoading}
            onClick={handleSubmit}
          >
            {editingEnquiry ? 'Update' : 'Create'}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: 'Please enter name' }]}
          >
            <Input placeholder="Enter name" />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
          <Form.Item
            name="contact"
            label="Contact Number"
            rules={[{ required: true, message: 'Please enter contact number' }]}
          >
            <Input placeholder="Enter contact number" />
          </Form.Item>
          <Form.Item
            name="reference"
            label="Reference"
            rules={[{ required: true, message: 'Please enter reference' }]}
          >
            <Input placeholder="Enter reference" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Status"
            initialValue="Pending"
          >
            <Select>
              <Option value="Pending">Pending</Option>
              <Option value="Contacted">Contacted</Option>
              <Option value="Converted">Converted</Option>
              <Option value="Rejected">Rejected</Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label="Notes">
            <Input.TextArea rows={3} placeholder="Enter any additional notes" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default EnquiryReferences;
