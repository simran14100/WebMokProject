import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Switch, Modal, Form, InputNumber, Popconfirm, message, Card, Row, Col, Typography, Select, ColorPicker, Tooltip } from 'antd';
import { useSelector } from 'react-redux';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CheckOutlined, CloseOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { toast } from 'react-hot-toast';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';


const { Title, Text } = Typography;
const { Search } = Input;

const MeetingTypes = () => {
  const { user } = useSelector((state) => state.profile);
  const [meetingTypes, setMeetingTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMeetingType, setEditingMeetingType] = useState(null);
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchMeetingTypes = async () => {
    try {
      setLoading(true);
      const { current, pageSize } = pagination;
      
      const response = await axios.get(`${API_URL}/meeting-types`, {
        params: { 
          page: current, 
          limit: pageSize, 
          search: searchText,
          isActive: statusFilter === 'all' ? '' : statusFilter === 'active'
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setMeetingTypes(response.data.data);
        setPagination({
          ...pagination,
          total: response.data.meta?.total || 0,
        });
      }
    } catch (error) {
      console.error('Error fetching meeting types:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch meeting types');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingTypes();
  }, [pagination.current, pagination.pageSize, searchText, statusFilter]);

  const handleTableChange = (pagination) => {
    setPagination(pagination);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  const handleStatusFilter = (value) => {
    setStatusFilter(value);
    setPagination({ ...pagination, current: 1 });
  };

  const showModal = (meetingType = null) => {
    setEditingMeetingType(meetingType);
    const defaultValues = {
      isActive: true,
      duration: 30,
      color: '#1890ff' // Default color
    };
    
    if (meetingType) {
      form.setFieldsValue({
        ...defaultValues,
        name: meetingType.name,
        description: meetingType.description || '',
        duration: meetingType.duration,
        isActive: meetingType.isActive !== false
      });
    } else {
      form.resetFields();
      form.setFieldsValue(defaultValues);
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingMeetingType(null);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const meetingTypeData = {
        name: values.name,
        description: values.description || '',
        duration: parseInt(values.duration),
        isActive: values.isActive !== false,
        color: '#1890ff',
        createdBy: user._id
      };

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      };

      if (editingMeetingType) {
        await axios.put(
          `${API_URL}/meeting-types/${editingMeetingType._id}`,
          meetingTypeData,
          config
        );
        toast.success('Meeting type updated successfully');
      } else {
        await axios.post(
          `${API_URL}/meeting-types`,
          meetingTypeData,
          config
        );
        toast.success('Meeting type created successfully');
      }
      
      setIsModalVisible(false);
      form.resetFields();
      fetchMeetingTypes();
    } catch (error) {
      if (error.errorFields) return;
      console.error('Error saving meeting type:', error);
      
      if (error.response?.data?.errors) {
        const errorMessages = error.response.data.errors.map(err => err.msg || err.message);
        toast.error(`Validation error: ${errorMessages.join(', ')}`);
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to save meeting type';
        toast.error(typeof errorMessage === 'string' ? errorMessage : 'An error occurred');
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/meeting-types/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      toast.success('Meeting type deleted successfully');
      fetchMeetingTypes();
    } catch (error) {
      console.error('Error deleting meeting type:', error);
      toast.error(error.response?.data?.message || 'Failed to delete meeting type');
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axios.put(
        `${API_URL}/meeting-types/${id}`,
        { isActive: !currentStatus },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      toast.success(`Meeting type ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchMeetingTypes();
    } catch (error) {
      console.error('Error toggling meeting type status:', error);
      toast.error(error.response?.data?.message || 'Failed to update meeting type status');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => (
        <span><ClockCircleOutlined style={{ marginRight: 8 }} />{duration} min</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => (
        <Tooltip title={isActive !== false ? 'Active' : 'Inactive'}>
          <Switch
            checkedChildren={<CheckOutlined />}
            unCheckedChildren={<CloseOutlined />}
            checked={isActive !== false}
            onChange={() => handleToggleStatus(record._id, isActive !== false)}
          />
        </Tooltip>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />} onClick={() => showModal(record)}>Edit</Button>
          <Popconfirm
            title="Delete this meeting type?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="meeting-types-container"  style={{marginTop:"8rem"}}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={4} style={{ margin: 0 }}>Meeting Types</Title>
            <Text type="secondary">Manage different types of meetings</Text>
          </Col>
          <Col>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              Add Meeting Type
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Search
              placeholder="Search meeting types..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by status"
              allowClear
              value={statusFilter}
              onChange={handleStatusFilter}
            >
              <Select.Option value="all">All Status</Select.Option>
              <Select.Option value="active">Active</Select.Option>
              <Select.Option value="inactive">Inactive</Select.Option>
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={meetingTypes}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          onChange={handleTableChange}
          scroll={{ x: true }}
        />
      </Card>

      {/* Add/Edit Meeting Type Modal */}
      <Modal
        title={editingMeetingType ? 'Edit Meeting Type' : 'Add New Meeting Type'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        okText={editingMeetingType ? 'Update' : 'Create'}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            isActive: true,
            color: '#1890ff',
            duration: 30
          }}
        >
          <Form.Item
            name="name"
            label="Meeting Type Name"
            rules={[{ required: true, message: 'Please enter meeting type name' }]}
          >
            <Input placeholder="e.g., Consultation, Interview, Follow-up" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description (Optional)"
          >
            <Input.TextArea rows={3} placeholder="Enter a brief description of this meeting type" />
          </Form.Item>

          <Form.Item
            name="duration"
            label="Duration (minutes)"
            rules={[{ 
              required: true, 
              message: 'Please enter duration',
              type: 'number',
              min: 5,
              transform: (value) => Number(value)
            }]}
          >
            <InputNumber 
              min={5}
              style={{ width: '100%' }} 
              placeholder="e.g., 30"
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Status"
            valuePropName="checked"
          >
            <Switch
              checkedChildren="Active"
              unCheckedChildren="Inactive"
              defaultChecked
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MeetingTypes;
