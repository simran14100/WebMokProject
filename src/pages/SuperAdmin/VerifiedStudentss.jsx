import React, { useEffect, useState } from "react";
import axios from 'axios';
import { Table, Card, Button, Space, Tag, message, Input } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Search } = Input;

const VerifiedStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchText, setSearchText] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [remarks, setRemarks] = useState("");

  // Fetch university registered students
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
      message.error('Failed to fetch verified students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents().catch(error => {
      console.error('Error in fetchStudents:', error);
      message.error(error.response?.data?.message || 'Failed to fetch students. Please check your authentication.');
    });
  }, [searchText]);

  // Handle verify action
  const handleVerify = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleModalSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Call API to update student status to verified
      await axios.put(
        `http://localhost:4001/api/v1/university/registered-students/${selectedStudent._id}/status`,
        { status: 'approved', remarks },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update local state to reflect the change
      setStudents(prevStudents =>
        prevStudents.map(student =>
          student._id === selectedStudent._id
            ? { ...student, status: 'approved' }
            : student
        )
      );

      message.success('Student verified successfully');
      setShowModal(false);
      setRemarks("");
    } catch (error) {
      console.error('Error verifying student:', error);
      message.error(error.response?.data?.message || 'Failed to verify student');
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      alert(`Delete student with ID: ${id}`);
      // Call API to delete student here
      setStudents((prev) => prev.filter((s) => s._id !== id));
    }
  };

  const columns = [
    {
      title: 'Registration ID',
      dataIndex: 'registrationNumber',
      key: 'registrationNumber',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Course',
      dataIndex: 'course',
      key: 'course',
    },
    {
      title: 'Registration Date',
      dataIndex: 'registrationDate',
      key: 'registrationDate',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const status = record.status || 'pending';
        const statusMap = {
          'pending': { color: 'orange', text: 'Pending' },
          'approved': { color: 'green', text: 'Verified' },
          'rejected': { color: 'red', text: 'Rejected' }
        };
        const statusInfo = statusMap[status] || { color: 'default', text: 'Unknown' };
        return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const isPending = !record.status || record.status === 'pending';
        
        return (
          <Space size="middle">
            <Button 
              type="link" 
              onClick={() => {
                // Handle view details
                console.log('View details for:', record._id);
              }}
            >
              View Details
            </Button>
            {isPending && (
              <Button 
                type="link" 
                onClick={() => handleVerify(record)}
              >
                Verify
              </Button>
            )}
            <Button 
              type="link" 
              danger
              onClick={() => handleDelete(record._id)}
            >
              Delete
            </Button>
          </Space>
        );
      },
    },
  ];

  const handleTableChange = (newPagination, filters, sorter) => {
    fetchStudents({
      pagination: newPagination,
      sortField: sorter.field,
      sortOrder: sorter.order,
      ...filters,
    });
  };

  const onSearch = (value) => {
    setSearchText(value);
    setPagination({ ...pagination, current: 1 });
  };

  // Verification Modal Component
  const VerificationModal = () => {
    if (!showModal || !selectedStudent) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Student Verification</h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>Reg. No.:</strong> {selectedStudent.registrationNumber}</p>
                <p><strong>F.Name:</strong> {selectedStudent.name}</p>
              </div>
              <div>
                <p><strong>Session:</strong> {selectedStudent.session}</p>
                <p><strong>M.Name:</strong> {selectedStudent.fatherName}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>Name:</strong> {selectedStudent.name}</p>
              </div>
              <div>
                <p><strong>DOB:</strong> {selectedStudent.dob}</p>
              </div>
            </div>
            
            <hr className="my-4" />
            
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <h3 className="font-medium mb-2">Photo</h3>
                <div className="space-y-1">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Registration Fee
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Sr. Secondary Marksheet
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Other Marksheet
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Signature</h3>
                <div className="space-y-1">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Course Fee
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Graduation Marksheet
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Annexure
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">ID Proof</h3>
                <div className="space-y-1">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Matric Marksheet
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    P.G. Marksheet
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Is eligible?
                  </label>
                </div>
              </div>
            </div>
            
            <hr className="my-4" />
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Registration Status</h3>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  Pending
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Registration Fee
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Yes
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Verification Status</h3>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  Pending
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Verified
                </label>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  Yes
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Remark:</h3>
              <textarea 
                className="w-full p-2 border rounded"
                rows="3"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks here..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <button 
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                onClick={handleModalSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <Card 
        title="Verified Students"
        extra={
          <Space>
            <Search
              placeholder="Search students..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={onSearch}
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
            emptyText: 'No verified students found'
          }}
        />
      </Card>
      
      {/* Render the modal */}
      <VerificationModal />
    </div>
  );
};

export default VerifiedStudents;