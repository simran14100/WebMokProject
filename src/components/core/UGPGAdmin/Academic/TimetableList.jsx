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

  // Group timetables by common fields
  const groupTimetables = (timetables) => {
    const groups = {};
    
    timetables.forEach(entry => {
      if (!entry) return;
      
      const key = [
        entry.course?._id || '',
        entry.subject?._id || '',
        entry.semester || '',
        entry.school?._id || ''
      ].join('|');
      
      if (!groups[key]) {
        groups[key] = {
          ...entry,
          timeSlots: [],
          key: key,
          id: entry._id
        };
      }
      
      // Add time slot to the group
      if (entry.timeSlot) {
        const timeSlot = {
          time: entry.timeSlot,
          day: entry.day,
          id: entry._id
        };
        
        // Check if this time slot already exists (avoid duplicates)
        const exists = groups[key].timeSlots.some(
          ts => ts.time === timeSlot.time && ts.day === timeSlot.day
        );
        
        if (!exists) {
          groups[key].timeSlots.push(timeSlot);
        }
      }
    });
    
    return Object.values(groups);
  };

  // Load timetables
  const loadTimetables = async (params = {}) => {
    try {
      setLoading(true);
      const { current, pageSize, ...filters } = params;
      const queryParams = {
        page: current || 1,
        limit: 1000, // Get more records to group properly
        ...filters
      };
      
      console.log('Fetching timetables with params:', queryParams);
      const response = await TIMETABLE_API.getTimetables(queryParams);
      console.log('Timetables API response:', response);
      
      let processedData = [];
      
      // Handle different response formats and process data
      if (response && response.success !== false) {
        // Case 1: Standard API response with data and pagination
        if (response.data && Array.isArray(response.data)) {
          console.log('Handling standard paginated response');
          processedData = groupTimetables(response.data);
          setPagination(prev => ({
            ...prev,
            current: response.pagination?.currentPage || response.pagination?.page || 1,
            pageSize: response.pagination?.itemsPerPage || response.pagination?.limit || 10,
            total: response.pagination?.total || response.count || response.data.length,
          }));
        }
        // Case 2: Direct array response
        else if (Array.isArray(response)) {
          console.log('Handling direct array response');
          processedData = groupTimetables(response);
          setPagination(prev => ({
            ...prev,
            current: 1,
            pageSize: 10,
            total: response.length,
          }));
        }
        // Case 3: Response with data property that might be an object
        else if (response.data && typeof response.data === 'object') {
          console.log('Handling object response with data property');
          const dataArray = Object.values(response.data);
          processedData = groupTimetables(Array.isArray(dataArray) ? dataArray : []);
          setPagination(prev => ({
            ...prev,
            current: 1,
            pageSize: 10,
            total: Array.isArray(dataArray) ? dataArray.length : 0,
          }));
        }
      }
      
      setTimetables(processedData);
      
      if (processedData.length === 0) {
        console.error('No valid timetable data found in response:', response);
        setPagination(prev => ({
          ...prev,
          current: 1,
          total: 0
        }));
      }
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

  // Format time slots for display
  const formatTimeSlots = (timeSlots) => {
    if (!timeSlots || timeSlots.length === 0) return 'N/A';
    
    // Group by day
    const byDay = {};
    timeSlots.forEach(slot => {
      if (!byDay[slot.day]) {
        byDay[slot.day] = [];
      }
      byDay[slot.day].push(slot.time);
    });
    
    // Sort days according to the week order
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sortedDays = Object.keys(byDay).sort((a, b) => 
      dayOrder.indexOf(a) - dayOrder.indexOf(b)
    );
    
    // Format each day's time slots
    return sortedDays.map(day => (
      <div key={day} style={{ 
        marginBottom: 8,
        padding: '4px 8px',
        backgroundColor: '#f8f9fa',
        borderRadius: 4
      }}>
        <strong style={{ color: '#1890ff' }}>{day}:</strong> {byDay[day].sort().join(', ')}
      </div>
    ));
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
      sorter: (a, b) => (a.course?.name || '').localeCompare(b.course?.name || ''),
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
      render: (semester) => ` ${semester}`,
      sorter: (a, b) => (a.semester || '').localeCompare(b.semester || ''),
    },
    {
      title: 'Subject',
      key: 'subject',
      render: (_, record) => (
        <div>
          <div>{record.subject?.name || 'N/A'}</div>
          {record.subject?.code && <div><small>{record.subject.code}</small></div>}
        </div>
      ),
      sorter: (a, b) => (a.subject?.name || '').localeCompare(b.subject?.name || ''),
    },
    {
      title: 'School',
      key: 'school',
      render: (_, record) => record.school?.name || 'N/A',
      sorter: (a, b) => (a.school?.name || '').localeCompare(b.school?.name || ''),
    },
    {
      title: 'Schedule',
      key: 'schedule',
      render: (_, record) => (
        <div>
          {record.timeSlots && record.timeSlots.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {formatTimeSlots(record.timeSlots)}
            </div>
          ) : (
            'No schedule set'
          )}
        </div>
      ),
    },
    {
      title: 'Session',
      key: 'session',
      render: (_, record) => record.session?.name || 'N/A',
      sorter: (a, b) => (a.session?.name || '').localeCompare(b.session?.name || '')
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
    <>
      <Card 
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Timetable Management</span>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => navigate('/ugpg-admin/academic/timetable/new')}
            >
              Add Timetable
            </Button>
          </div>
        }
        bordered={false}
        style={{ borderRadius: 8, boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)' }}
      >
      <div style={{ marginBottom: 16 }}>
        <Space>
          <Select
            placeholder="Filter by Course Type"
            style={{ width: 200 }}
            allowClear
            onChange={(value) => handleFilterChange('courseType', value)}
          >
            {courseTypes.map(type => (
              <Select.Option key={type} value={type}>{type}</Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Filter by Day"
            style={{ width: 150 }}
            allowClear
            onChange={(value) => handleFilterChange('day', value)}
          >
            {daysOfWeek.map(day => (
              <Select.Option key={day} value={day}>{day}</Select.Option>
            ))}
          </Select>
        </Space>
      </div>
      
      <Table
        columns={columns}
        dataSource={timetables}
        rowKey="_id"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} entries`,
          pageSizeOptions: ['10', '20', '50', '100']
        }}
        loading={loading}
        onChange={handleTableChange}
        scroll={{ x: true }}
        style={{ borderRadius: 8 }}
        rowClassName={() => 'timetable-row'}
      />
      
      <style jsx global>{`
        .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 600;
        }
        .timetable-row:hover td {
          background: #f6f9ff !important;
        }
        .ant-table-tbody > tr > td {
          transition: background 0.3s;
        }
      `}</style>
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
    </>
  );
};

export default TimetableList;
