import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherApi } from '../../../../services/teacherApi';
import { showError, showSuccess } from '../../../../utils/toast';
import { FaEdit, FaTrash, FaSearch, FaPlus } from 'react-icons/fa';
import { Table, Button, Input, Space, Select, Tag, Modal, Card, Row, Col } from 'antd';
import { Link } from 'react-router-dom';

const { Search } = Input;
const { Option } = Select;

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [schoolFilter, setSchoolFilter] = useState('');
  const [designationFilter, setDesignationFilter] = useState('');
  const [schools, setSchools] = useState([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const navigate = useNavigate();

  const designations = [
    'Assistant Professor',
    'Professor',
    'Lecturer'
  ];

  // Load schools for filter
  useEffect(() => {
    const loadSchools = async () => {
      try {
        const response = await teacherApi.getSchools();
        if (response.data && response.data.data) {
          setSchools(response.data.data);
        }
      } catch (error) {
        showError('Failed to load schools');
      }
    };
    loadSchools();
  }, []);

  // Load teachers
  const loadTeachers = async (params = {}) => {
    try {
      setLoading(true);
      const { current, pageSize } = pagination;
      const queryParams = {
        page: params.page || current,
        limit: params.pageSize || pageSize,
        search: params.search || searchText,
        school: schoolFilter,
        designation: designationFilter
      };

      const response = await teacherApi.getTeachers(queryParams);
      
      if (response.data) {
        setTeachers(response.data.docs || response.data.data || []);
        setPagination({
          ...pagination,
          total: response.data.total || 0,
          current: response.data.page || 1,
          pageSize: response.data.limit || 10
        });
      }
    } catch (error) {
      showError('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  // Handle table change (pagination, sorting, filters)
  const handleTableChange = (pagination, filters, sorter) => {
    loadTeachers({
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...filters,
    });
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchText(value);
    loadTeachers({ search: value, page: 1 });
  };

  // Handle school filter change
  const handleSchoolFilterChange = (value) => {
    setSchoolFilter(value);
    loadTeachers({ school: value, page: 1 });
  };

  // Handle designation filter change
  const handleDesignationFilterChange = (value) => {
    setDesignationFilter(value);
    loadTeachers({ designation: value, page: 1 });
  };

  // Handle delete confirmation
  const confirmDelete = (teacher) => {
    setTeacherToDelete(teacher);
    setDeleteModalVisible(true);
  };

  // Handle delete
  const handleDelete = async () => {
    try {
      await teacherApi.deleteTeacher(teacherToDelete._id);
      showSuccess('Teacher deleted successfully');
      setDeleteModalVisible(false);
      loadTeachers();
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to delete teacher');
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
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'School',
      dataIndex: ['school', 'name'],
      key: 'school',
      render: (school) => school?.name || 'N/A',
    },
    {
      title: 'Designation',
      dataIndex: 'designation',
      key: 'designation',
      render: (designation) => (
        <Tag color={getDesignationColor(designation)}>{designation}</Tag>
      ),
    },
    {
      title: 'Subjects',
      dataIndex: 'subjects',
      key: 'subjects',
      render: (subjects) => (
        <div style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {subjects?.map(sub => sub.name).join(', ') || 'No subjects assigned'}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<FaEdit />} 
            onClick={() => navigate(`/ugpg-admin/teachers/edit/${record._id}`)}
          />
          <Button 
            type="text" 
            danger 
            icon={<FaTrash />} 
            onClick={() => confirmDelete(record)}
          />
        </Space>
      ),
    },
  ];

  // Get color based on designation
  const getDesignationColor = (designation) => {
    switch (designation) {
      case 'Professor':
        return 'blue';
      case 'Assistant Professor':
        return 'green';
      case 'Lecturer':
        return 'orange';
      default:
        return 'default';
    }
  };

  // Load teachers on component mount and when filters change
  useEffect(() => {
    loadTeachers();
  }, []);

  return (
    <div style={{ padding: "16px" , marginTop:"7rem"}}>
  <div style={{ marginBottom: "16px" }}>
    <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px" }}>
      Manage Teachers
    </h2>

    <Card style={{ marginBottom: "16px" }}>
      <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
        {/* Search */}
        <Col xs={24} sm={12} md={6}>
          <Search
            placeholder="Search teachers..."
            allowClear
            enterButton={<FaSearch />}
            onSearch={handleSearch}
            style={{ width: "100%" }}
          />
        </Col>

        {/* School Filter */}
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="Filter by School"
            style={{ width: "100%" }}
            allowClear
            onChange={handleSchoolFilterChange}
          >
            {schools.map((school) => (
              <Option key={school._id} value={school._id}>
                {school.name}
              </Option>
            ))}
          </Select>
        </Col>

        {/* Designation Filter */}
        <Col xs={24} sm={12} md={4}>
          <Select
            placeholder="Filter by Designation"
            style={{ width: "100%" }}
            allowClear
            onChange={handleDesignationFilterChange}
          >
            {designations.map((designation) => (
              <Option key={designation} value={designation}>
                {designation}
              </Option>
            ))}
          </Select>
        </Col>

        {/* Add Teacher Button */}
        <Col
          xs={24}
          sm={12}
          md={10}
          style={{ textAlign: "right" }}
        >
          <Button
            type="primary"
            icon={<FaPlus />}
            onClick={() => navigate("/ugpg-admin/teachers/add")}
          >
            Add Teacher
          </Button>
        </Col>
      </Row>
    </Card>

    {/* Teacher Table */}
    <Table
      columns={columns}
      dataSource={teachers}
      rowKey="_id"
      loading={loading}
      pagination={pagination}
      onChange={handleTableChange}
      scroll={{ x: true }}
    />
  </div>

  {/* Delete Confirmation Modal */}
  <Modal
    title="Confirm Delete"
    open={deleteModalVisible}
    onOk={handleDelete}
    onCancel={() => setDeleteModalVisible(false)}
    okText="Delete"
    okButtonProps={{ danger: true }}
  >
    <p>Are you sure you want to delete {teacherToDelete?.name}?</p>
    <p style={{ color: "red" }}>This action cannot be undone.</p>
  </Modal>
</div>

  );
};

export default TeacherList;
