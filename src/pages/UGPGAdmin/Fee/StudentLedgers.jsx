import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, message, Popconfirm, Tag } from 'antd';
import { SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import { API_URL } from '../../../../src/utils/constants';

const { Option } = Select;

const StudentLedgers = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]); // Ensure initial state is an empty array
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    searchText: '',
    status: null,
  });

  const columns = [
    {
      title: 'Receipt No.',
      dataIndex: 'receiptNo',
      key: 'receiptNo',
      sorter: true,
    },
    {
      title: 'Registration No.',
      dataIndex: 'registrationNumber',
      key: 'registrationNumber',
      sorter: true,
    },
    {
      title: 'Student Name',
      dataIndex: 'student',
      key: 'studentName',
      render: (student) => student ? `${student.firstName} ${student.lastName}` : 'N/A',
    },
    {
      title: 'Course',
      key: 'course',
      render: (_, record) => {
        // The course name is in record.feeAssignment.course.courseName
        return record.feeAssignment?.course?.courseName || 'N/A';
      },
    },
    {
      title: 'Fee Name',
      dataIndex: 'feeType',
      key: 'feeType',
      render: (feeType) => {
        if (typeof feeType === 'object') {
          return feeType?.name || 'N/A';
        }
        return feeType || 'N/A';
      },
    },
    {
      title: 'Year/Sem',
      dataIndex: 'semester',
      key: 'semester',
    },
    {
      title: 'Amount',
      dataIndex: 'totalAmount',
      key: 'amount',
      render: (amount) => `₹${amount?.toLocaleString() || '0'}`,
    },
    {
      title: 'Paid Amount',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (amount) => `₹${amount?.toLocaleString() || '0'}`,
    },
    {
      title: 'Balance',
      dataIndex: 'balanceAmount',
      key: 'balanceAmount',
      render: (amount) => `₹${amount?.toLocaleString() || '0'}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'Paid') color = 'success';
        if (status === 'Partial') color = 'warning';
        if (status === 'Pending') color = 'error';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      render: (date) => moment(date).format('DD/MM/YYYY'),
    },
    // {
    //   title: 'Actions',
    //   key: 'actions',
    //   render: (_, record) => (
    //     <Space size="middle">
          
    //       <Popconfirm
    //         title="Are you sure you want to delete this record?"
    //         onConfirm={() => handleDelete(record._id)}
    //         okText="Yes"
    //         cancelText="No"
    //       >
    //         <Button 
    //           type="danger" 
    //           icon={<DeleteOutlined />} 
    //           size="small"
    //         />
    //       </Popconfirm>
    //     </Space>
    //   ),
    // },
  ];

  const fetchData = async (params = {}) => {
    try {
      setLoading(true);
      const { current, pageSize, sortField, sortOrder } = pagination;
      const { searchText, status } = filters;

      console.log('Fetching student ledgers with params:', {
        page: params.pagination?.current || current,
        pageSize: params.pagination?.pageSize || pageSize,
        sortField: params.sortField || sortField,
        sortOrder: params.sortOrder || sortOrder,
        search: searchText,
        status,
      });

      const token = localStorage.getItem('token');
      console.log('Using token:', token ? 'Token exists' : 'No token found');

      console.log('Making API call to fetch payments for registered students...');
      const response = await axios.get(`${API_URL}/api/v1/university/payments`, {
        params: {
          page: params.pagination?.current || current,
          pageSize: params.pagination?.pageSize || pageSize,
          sortField: params.sortField || sortField,
          sortOrder: params.sortOrder || sortOrder,
          search: searchText,
          status,
          registeredOnly: true, // Add this parameter to filter only registered students
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });
      
      // Log the full response to debug
      console.log('API Response:', JSON.stringify(response.data, null, 2));
      // Log the first payment item's structure
      if (response.data?.data?.docs?.length > 0) {
        console.log('First payment item structure:', JSON.stringify(response.data.data.docs[0], null, 2));
      }

      console.log('API Response:', response.data);

      // Check if response data exists and has the expected structure
      if (!response.data) {
        console.error('No data in response');
        message.error('No data received from server');
        return;
      }

      // Handle paginated response structure
      const responseData = response.data.data?.docs || response.data.data || [];
      const total = response.data.data?.totalDocs || response.data.total || response.data.count || 0;

      console.log('Processed data:', { responseData, total });

      setData(Array.isArray(responseData) ? responseData : []);
      setPagination({
        ...pagination,
        total: total,
      });
    } catch (error) {
      console.error('Error fetching student ledgers:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      if (error.response?.status === 401) {
        message.error('Session expired. Please log in again.');
        // Redirect to login or refresh token logic here
      } else {
        message.error(`Failed to fetch student ledgers: ${error.message}`);
      }
      
      // Reset data on error
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize, filters]);

  const handleTableChange = (pagination, filters, sorter) => {
    setPagination({
      ...pagination,
      sortField: sorter.field,
      sortOrder: sorter.order,
    });
  };

  const handleSearch = (value) => {
    setFilters({
      ...filters,
      searchText: value,
    });
  };

  const handleStatusChange = (value) => {
    setFilters({
      ...filters,
      status: value,
    });
  };

  // Removed date range filter

  const handleEdit = (record) => {
    // Implement edit functionality
    console.log('Edit record:', record);
    message.info('Edit functionality will be implemented soon');
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/v1/university/payments/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      message.success('Record deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting record:', error);
      message.error('Failed to delete record');
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Student Ledgers</h1>
        <Button type="primary">
          Export to Excel
        </Button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <Input
              placeholder="Search by name or ID"
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </div>
          <div>
            <Select
              style={{ width: '100%' }}
              placeholder="Filter by status"
              allowClear
              onChange={handleStatusChange}
            >
              <Option value="Paid">Paid</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Partial">Partial</Option>
            </Select>
          </div>
          {/* Removed start/end date filter */}
          <div>
            <Button 
              type="default" 
              onClick={() => {
                setFilters({
                  searchText: '',
                  status: null,
                });
              }}
              style={{ width: '100%' }}
            >
              Reset Filters
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          rowKey="_id"
dataSource={Array.isArray(data) ? data : []}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
          }}
          loading={loading}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
          className="mt-4"
        />
      </div>
    </div>
  );
};

export default StudentLedgers;
