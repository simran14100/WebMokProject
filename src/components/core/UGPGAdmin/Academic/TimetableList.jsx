import React, { useState, useEffect } from 'react';
import { Table, Card, Row, Col, Button, Select, Space, Tag, Modal, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import TIMETABLE_API from '../../../../services/timetableApi';
import { showError, showSuccess } from '../../../../utils/helpers';

const { Option } = Select;

const TimetableList = () => {
  const [timetables, setTimetables] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({});
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [timetableToDelete, setTimetableToDelete] = useState(null);
  
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  // Days of the week for filtering
  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ];
  
  // Course types for filtering
  const courseTypes = ['Certificate', 'Diploma', 'Bachelor Degree', 'Master Degree'];

  // Load timetables
  const loadTimetables = async (params = {}) => {
    try {
      setLoading(true);
      const { current, pageSize, ...filters } = params;
      const queryParams = {
        page: current || 1,
        limit: pageSize || 10,
        ...filters
      };
      
      console.log('Fetching timetables with params:', queryParams);
      const response = await TIMETABLE_API.getTimetables(queryParams);
      console.log('Timetables API response:', response);
      
      // Handle different response formats
      if (response && response.success !== false) {
        // Case 1: Standard API response with data and pagination
        if (response.data && Array.isArray(response.data)) {
          console.log('Handling standard paginated response');
          setTimetables(response.data);
          setPagination(prev => ({
            ...prev,
            current: response.pagination?.currentPage || response.pagination?.page || 1,
            pageSize: response.pagination?.itemsPerPage || response.pagination?.limit || 10,
            total: response.pagination?.total || response.count || response.data.length,
          }));
          return;
        }
        
        // Case 2: Direct array response
        if (Array.isArray(response)) {
          console.log('Handling direct array response');
          setTimetables(response);
          setPagination(prev => ({
            ...prev,
            current: 1,
            pageSize: 10,
            total: response.length,
          }));
          return;
        }
        
        // Case 3: Response with data property that might be an object
        if (response.data && typeof response.data === 'object') {
          console.log('Handling object response with data property');
          const dataArray = Object.values(response.data);
          setTimetables(Array.isArray(dataArray) ? dataArray : []);
          setPagination(prev => ({
            ...prev,
            current: 1,
            pageSize: 10,
            total: Array.isArray(dataArray) ? dataArray.length : 0,
          }));
          return;
        }
      }
      
      // If we get here, the response format is unexpected
      console.error('Unexpected response format:', response);
      setTimetables([]);
      setPagination(prev => ({
        ...prev,
        current: 1,
        total: 0
      }));
    } catch (error) {
      console.error('Error loading timetables:', error);
      showError(error.response?.data?.message || 'Failed to load timetable');
    } finally {
      setLoading(false);
    }
  };

  // Handle table change (pagination, filters, sorter)
  const handleTableChange = (pagination, filters, sorter) => {
    const params = {
      ...pagination,
      ...filters,
    };
    
    if (sorter.field) {
      params.sortBy = sorter.field;
      params.sortOrder = sorter.order === 'ascend' ? 'asc' : 'desc';
    }
    
    loadTimetables(params);
  };

  // Handle delete confirmation
  const confirmDelete = (record) => {
    setTimetableToDelete(record);
    setDeleteModalVisible(true);
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await TIMETABLE_API.deleteTimetable(timetableToDelete._id);
      showSuccess('Timetable entry deleted successfully');
      loadTimetables({ ...pagination, ...filters });
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete timetable entry');
    } finally {
      setDeleteModalVisible(false);
      setTimetableToDelete(null);
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    loadTimetables({ ...pagination, ...newFilters, current: 1 });
  };

  // Columns for the table
  const columns = [
    {
      title: 'Course',
      key: 'course',
      render: (_, record) => (
        <div>
          <div><strong>{record.course?.name || 'N/A'}</strong></div>
          <div><small>{record.courseType}</small></div>
        </div>
      ),
    },
    {
      title: 'Day',
      dataIndex: 'day',
      key: 'day',
      filters: daysOfWeek.map(day => ({ text: day, value: day })),
      onFilter: (value, record) => record.day === value,
    },
    {
      title: 'Time Slot',
      dataIndex: 'timeSlot',
      key: 'timeSlot',
    },
    {
      title: 'Course Type',
      dataIndex: 'courseType',
      key: 'courseType',
      filters: courseTypes.map(type => ({ text: type, value: type })),
      onFilter: (value, record) => record.courseType === value,
    },
    {
      title: 'School',
      dataIndex: ['school', 'name'],
      key: 'school',
    },
    {
      title: 'Session',
      dataIndex: ['session', 'name'],
      key: 'session',
    },
    {
      title: 'Subject',
      dataIndex: ['subject', 'name'],
      key: 'subject',
      render: (_, record) => (
        <div>
          <div>{record.subject?.name}</div>
          <div><small>{record.subject?.code}</small></div>
        </div>
      ),
    },
    {
      title: 'Room',
      dataIndex: 'room',
      key: 'room',
    },
    {
      title: 'Faculty',
      dataIndex: ['faculty', 'name'],
      key: 'faculty',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => navigate(`/ugpg-admin/academic/timetable-edit/${record._id}`)}
            title="Edit"
          />
          <Button 
            type="text" 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => confirmDelete(record)}
            title="Delete"
          />
        </Space>
      ),
    },
  ];

  // Load timetables on component mount
  useEffect(() => {
    loadTimetables(pagination);
  }, []);

  return (
    <div style={{ padding: '16px', marginTop:"7rem" }}>
      <Card 
        title="Timetable Management" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => navigate('/ugpg-admin/academic/timetable-add')}
            title="Add New Timetable"
          >
            Add Timetable
          </Button>
        }
      >
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} md={6}>
            <Select
              placeholder="Filter by Course Type"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => handleFilterChange('courseType', value)}
            >
              {courseTypes.map(type => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
          </Col>
          <Col xs={24} md={6}>
            <Select
              placeholder="Filter by Day"
              style={{ width: '100%' }}
              allowClear
              onChange={(value) => handleFilterChange('day', value)}
            >
              {daysOfWeek.map(day => (
                <Option key={day} value={day}>{day}</Option>
              ))}
            </Select>
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={timetables}
          rowKey="_id"
          loading={loading}
          pagination={pagination}
          onChange={handleTableChange}
          scroll={{ x: true }}
        />
      </Card>

      {/* Delete confirmation modal */}
      <Modal
        title="Confirm Delete"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        okText="Delete"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this timetable entry?</p>
        {timetableToDelete && (
          <p>
            <strong>{timetableToDelete.day}</strong> - {timetableToDelete.timeSlot} - {timetableToDelete.subject?.name}
          </p>
        )}
      </Modal>
    </div>
  );
};

export default TimetableList;
