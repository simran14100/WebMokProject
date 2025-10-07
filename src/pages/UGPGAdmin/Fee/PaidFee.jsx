import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { 
  Table, Card, Tag, Space, Button, Input, DatePicker, message, 
  Typography, Modal, Descriptions, Divider, Badge, Tooltip, Select 
} from 'antd';
import { 
  SearchOutlined, 
  DownloadOutlined, 
  EyeOutlined, 
  PrinterOutlined,
  FilterOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiConnector } from '../../../services/apiConnector';
import { formatDate, formatCurrency } from '../../../utils/formatUtils';

import ReactToPrint from 'react-to-print';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Component for the receipt that will be printed
const PaymentReceipt = React.forwardRef(({ student, payments = [] }, ref) => {
  const totalPaid = payments?.reduce((sum, payment) => sum + (payment.paidAmount || 0), 0) || 0;
  const receiptRef = useRef();
  return (
    <div ref={ref} className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold mb-2">Payment Receipt</h3>
        <Text type="secondary">
          {new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Text>
      </div>

      <Descriptions bordered column={1} className="mb-6">
        <Descriptions.Item label="Student ID">{student?.registrationNumber || 'N/A'}</Descriptions.Item>
        <Descriptions.Item label="Student Name">
          {student ? `${student.firstName} ${student.lastName}` : 'N/A'}
        </Descriptions.Item>
        <Descriptions.Item label="Course">
          {student?.enrollment?.program?.name || 'Not Specified'}
        </Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Payment History</Divider>
      <Table 
        dataSource={payments || []} 
        rowKey="_id"
        pagination={false}
        columns={[
          {
            title: 'Receipt No',
            dataIndex: 'receiptNo',
            key: 'receiptNo',
          },
          {
            title: 'Date',
            dataIndex: 'paymentDate',
            key: 'date',
            render: (date) => formatDate(date, 'DD/MM/YYYY'),
          },
          {
            title: 'Fee Type',
            dataIndex: 'feeType',
            key: 'feeType',
          },
          {
            title: 'Amount',
            dataIndex: 'paidAmount',
            key: 'amount',
            render: (amount) => formatCurrency(amount || 0),
            align: 'right',
          },
        ]}
        footer={() => (
          <div className="text-right font-bold">
            Total Paid: {formatCurrency(totalPaid)}
          </div>
        )}
      />
    </div>
  );
});

const PaidFee = () => {
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    dateRange: [dayjs().startOf('month'), dayjs().endOf('day')],
    status: '',
    feeType: '',
    paymentMethod: '',
  });
  const [receiptModalVisible, setReceiptModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [feeTypes, setFeeTypes] = useState([]);
  const [courses, setCourses] = useState({}); // Store course names by ID
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [studentPayments, setStudentPayments] = useState({});
  const receiptRef = useRef();
  const isMounted = useRef(true);

  // Handle date range change
  const handleDateChange = (index, date) => {
    const newDateRange = [...(filters.dateRange || [])];
    newDateRange[index] = dayjs(date);
    setFilters(prev => ({
      ...prev,
      dateRange: newDateRange
    }));
  };

  // Handle page size change
  const handlePageSizeChange = (size) => {
    setPagination(prev => ({
      ...prev,
      pageSize: size,
      current: 1 // Reset to first page when page size changes
    }));
  };

  // Handle page change
  const handlePageChange = (page) => {
    setPagination(prev => ({
      ...prev,
      current: page
    }));
  };



  // Function to get semester/year display text
  const getSemesterYearDisplay = (student, payments) => {
    if (!student) return 'Not Specified';
    
    const semester = student.semester || 
                   payments?.[0]?.semester ||
                   payments?.[0]?.feeAssignment?.semester;
    
    const academicYear = student.academicYear ||
                       payments?.[0]?.academicYear ||
                       payments?.[0]?.feeAssignment?.academicYear;
    
    const displayText = [];
    if (semester) displayText.push(`Semester ${semester}`);
    if (academicYear) displayText.push(academicYear);
    
    return displayText.length > 0 ? displayText.join(' - ') : 'Not Specified';
  };

  const fetchPayments = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      setLoading(true);
      
      // Build query string manually to avoid CORS issues with params object
      const queryParams = new URLSearchParams();
      queryParams.append('page', pagination.current);
      queryParams.append('limit', pagination.pageSize);
      queryParams.append('registeredOnly', 'true');
      
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.feeType) queryParams.append('feeType', filters.feeType);
      if (filters.paymentMethod) queryParams.append('paymentMethod', filters.paymentMethod);
      if (filters.dateRange?.[0]) queryParams.append('startDate', filters.dateRange[0].toISOString());
      if (filters.dateRange?.[1]) queryParams.append('endDate', filters.dateRange[1].toISOString());

      const url = `/api/v1/university/payments?${queryParams.toString()}`;
      
      const response = await apiConnector(
        'GET',
        url,
        null,
        { 
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        const paymentsData = response.data.data.docs || [];
        setPayments(paymentsData);
        
        // Group payments by student ID
        const paymentsByStudent = {};
        paymentsData.forEach(payment => {
          const studentId = payment.student?._id || payment.student;
          if (studentId) {
            if (!paymentsByStudent[studentId]) {
              paymentsByStudent[studentId] = [];
            }
            paymentsByStudent[studentId].push(payment);
          }
        });
        
        setStudentPayments(paymentsByStudent);
        setPagination(prevPagination => ({
          ...prevPagination,
          total: response.data.data.totalDocs || 0,
        }));
      } else {
        message.error(response.data.message || 'Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      message.error('An error occurred while fetching payments');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters]);

  // Function to fetch course details
  const fetchCourseDetails = useCallback(async (courseIds) => {
    console.log('fetchCourseDetails called with courseIds:', courseIds);
    
    if (!courseIds || courseIds.length === 0) {
      console.log('No course IDs to fetch');
      return;
    }
    
    try {
      // Filter out course IDs we already have
      const idsToFetch = [...new Set(courseIds)].filter(id => {
        const shouldFetch = id && !courses[id] && typeof id === 'string' && id.length === 24;
        console.log(`Course ID ${id} should be fetched:`, shouldFetch);
        return shouldFetch;
      });
      
      if (idsToFetch.length === 0) {
        console.log('No new courses to fetch, using cached data');
        return;
      }
      
      console.log('Fetching course details for IDs:', idsToFetch);
      
      // Make a single API call to get all courses
      const response = await apiConnector(
        'POST',
        '/api/v1/university/courses/batch',
        { ids: idsToFetch },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      console.log('Course details API response:', response);
      
      if (response.data.success && response.data.data) {
        console.log('Processing course data:', response.data.data);
        const newCourses = {};
        
        response.data.data.forEach(course => {
          if (course && course._id) {
            console.log(`Processing course:`, course);
            newCourses[course._id] = {
              name: course.name || `Course ${course._id}`,
              code: course.code || ''
            };
          }
        });
        
        console.log('New courses to add to state:', newCourses);
        
        setCourses(prev => {
          const updated = {
            ...prev,
            ...newCourses
          };
          console.log('Updated courses state:', updated);
          return updated;
        });
      } else {
        console.warn('Unexpected API response format:', response);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
  }, [token, courses]);

  // Extract unique course IDs from payments
  useEffect(() => {
    if (payments && payments.length > 0) {
      const courseIds = [];
      const courseIdSet = new Set();
      
      console.log('Extracting course IDs from payments and student data...');
      
      // Get course IDs from student payments
      Object.values(studentPayments).forEach((paymentList, studentIndex) => {
        paymentList.forEach((payment, paymentIndex) => {
          // Log payment structure for debugging
          console.log(`Payment [${studentIndex}][${paymentIndex}]:`, payment);
          
          // Check all possible locations for course ID
          const possibleCoursePaths = [
            payment?.feeAssignment?.course?._id,
            payment?.feeAssignment?.course,
            payment?.course?._id,
            payment?.course,
            payment?.student?.course?._id,
            payment?.student?.course
          ];
          
          // Add all valid course IDs
          possibleCoursePaths.forEach(course => {
            if (course) {
              if (typeof course === 'object' && course._id) {
                // If it's an object with _id, use the _id
                courseIdSet.add(String(course._id));
                console.log(`Found course ID in object: ${course._id}`);
              } else if (typeof course === 'string' && course.length > 0) {
                // If it's a non-empty string, use it as is
                courseIdSet.add(course);
                console.log(`Found course ID as string: ${course}`);
              }
            }
          });
        });
      });
      
      // Also check selected student's course
      if (selectedStudent) {
        console.log('Selected student data:', selectedStudent);
        const studentCourse = selectedStudent.course || selectedStudent.courseId;
        if (studentCourse) {
          if (typeof studentCourse === 'object' && studentCourse._id) {
            courseIdSet.add(String(studentCourse._id));
            console.log(`Found course ID in selected student: ${studentCourse._id}`);
          } else if (typeof studentCourse === 'string' && studentCourse.length > 0) {
            courseIdSet.add(studentCourse);
            console.log(`Found course ID as string in selected student: ${studentCourse}`);
          }
        }
      }
      
      const uniqueCourseIds = Array.from(courseIdSet);
      console.log('Extracted course IDs:', uniqueCourseIds);
      
      if (uniqueCourseIds.length > 0) {
        console.log('Fetching details for course IDs:', uniqueCourseIds);
        fetchCourseDetails(uniqueCourseIds);
      } else {
        console.log('No course IDs found to fetch');
      }
    }
  }, [payments, studentPayments, selectedStudent, fetchCourseDetails]);

  const fetchFeeTypes = async () => {
    try {
      const response = await apiConnector(
        'GET',
        '/api/v1/university/fee-types',
        null,
        { 
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.success) {
        // Transform the response to match the expected format
        const types = response.data.data.map(type => ({
          value: type._id,
          label: type.name
        }));
        setFeeTypes(types);
      }
    } catch (error) {
      console.error('Error fetching fee types:', error);
      // Set default fee types if API fails
      setFeeTypes([
        { value: 'tuition', label: 'Tuition Fee' },
        { value: 'library', label: 'Library Fee' },
        { value: 'hostel', label: 'Hostel Fee' },
        { value: 'other', label: 'Other' }
      ]);
    }
  };

  // Payment table columns (for expanded row)
  const paymentColumns = [
    {
      title: 'Receipt No',
      dataIndex: 'receiptNo',
      key: 'receiptNo',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Payment Date',
      dataIndex: 'paymentDate',
      key: 'date',
      render: (date) => formatDate(date, 'DD/MM/YYYY'),
      sorter: (a, b) => new Date(a.paymentDate) - new Date(b.paymentDate),
    },
    {
      title: 'Semester',
      key: 'semester',
      render: (_, record) => {
        const semester = record.semester;
        if (!semester) return 'N/A';
        return `Year ${Math.ceil(semester/2)} - Sem ${semester}`;
      },
    },
    {
      title: 'Fee Type',
      key: 'feeType',
      render: (_, record) => {
        // Get the fee type name from the feeType object's name property
        const feeType = record.feeAssignment?.feeType?.name || 
                       record.feeType || 
                       'N/A';
        return feeType;
      },
    },
    {
      title: 'Amount',
      dataIndex: 'paidAmount',
      key: 'amount',
      render: (amount, record) => (
        <div>
          <div>Paid: <Text strong>{formatCurrency(amount || 0)}</Text></div>
          {record.totalAmount && (
            <div>Total: <Text type="secondary">{formatCurrency(record.totalAmount)}</Text></div>
          )}
        </div>
      ),
      sorter: (a, b) => (a.paidAmount || 0) - (b.paidAmount || 0),
    },
    {
      title: 'Payment Mode',
      dataIndex: 'modeOfPayment',
      key: 'paymentMode',
      render: (text) => text || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'Paid' || status === 'Success') color = 'success';
        else if (status === 'Pending') color = 'warning';
        else if (status === 'Failed') color = 'error';
        else if (status === 'Partial') color = 'processing';
        return <Tag color={color}>{status || 'N/A'}</Tag>;
      },
    },
  ];

  // Group payments by student and convert to array
  const groupedPayments = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    
    const grouped = payments.reduce((acc, payment) => {
      if (!payment?.student) return acc;
      
      const studentId = payment.student._id || payment.student;
      if (!acc[studentId]) {
        acc[studentId] = {
          ...payment.student,
          _id: studentId, // Ensure _id is always set
          payments: [],
          totalPaid: 0,
          lastPaymentDate: null,
          key: studentId, // Add key for React
          name: payment.student.name || `${payment.student.firstName || ''} ${payment.student.lastName || ''}`.trim() || 'Unknown Student'
        };
      }
      
      if (payment._id) {
        acc[studentId].payments.push({
          ...payment,
          key: payment._id
        });
        acc[studentId].totalPaid += Number(payment.paidAmount) || 0;
        
        const paymentDate = payment.paymentDate ? new Date(payment.paymentDate) : null;
        if (paymentDate && (!acc[studentId].lastPaymentDate || paymentDate > new Date(acc[studentId].lastPaymentDate))) {
          acc[studentId].lastPaymentDate = payment.paymentDate;
        }
      }
      
      return acc;
    }, {});
    
    // Convert to array and ensure all required fields are present
    return Object.values(grouped).map(student => ({
      ...student,
      key: student._id || `student-${Math.random().toString(36).substr(2, 9)}`,
      name: student.name || 'Unknown Student',
      registrationNumber: student.registrationNumber || 'N/A',
      course: student.course || student.enrollment?.program?.name || 'Not Specified',
      totalPaid: Number(student.totalPaid) || 0,
      payments: Array.isArray(student.payments) ? student.payments : []
    }));
  }, [payments]);

  const studentData = Object.values(groupedPayments).map(student => {
    // Get the latest payment to extract course and semester info
    const latestPayment = student.payments?.[0];
    const courseData = latestPayment?.feeAssignment?.course;
    
    return {
      ...student,
      key: student._id,
      name: `${student.firstName} ${student.lastName}`,
      course: courseData?.name || 'N/A',
      semester: latestPayment?.semester,
      program: latestPayment?.feeAssignment?.course || {},
      payments: student.payments,
      totalPaid: student.totalPaid,
      lastPaymentDate: student.lastPaymentDate,
      // Add debug info
      _debug: {
        feeAssignment: latestPayment?.feeAssignment,
        course: courseData
      }
    };
  });

  // Initial data fetch with cleanup

  const handlePrint = useCallback(() => {
    // This will be handled by ReactToPrint's trigger
  }, []);

  const handlePrintReceipt = (student) => {
    if (!student) {
      console.error('No student data provided');
      message.error('No student data available for receipt');
      return;
    }

    console.log('=== Print Receipt Clicked ===');
    console.log('Student ID:', student._id);
    console.log('Student Data:', student);
    
    try {
      // Get payments from the studentPayments state
      const studentId = student._id;
      const paymentsToUse = Array.isArray(studentPayments[studentId]) 
        ? [...studentPayments[studentId]] 
        : [];
      
      console.log(`Found ${paymentsToUse.length} payments for student ${studentId}`);
      
      // Create a clean student object with just the data we need
      const studentData = {
        _id: student._id,
        registrationNumber: student.registrationNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        enrollment: student.enrollment,
        payments: paymentsToUse
      };
      
      console.log('Setting selected student with data:', studentData);
      setSelectedStudent(studentData);
      setReceiptModalVisible(true);
      
    } catch (error) {
      console.error('Error in handlePrintReceipt:', error);
      message.error('Failed to generate receipt. Please try again.');
    }
  };

 

  // Student table columns
  const studentColumns = [
    {
      title: 'Student ID',
      dataIndex: 'registrationNumber',
      key: 'studentId',
      sorter: (a, b) => (a.registrationNumber || '').localeCompare(b.registrationNumber || ''),
    },
    {
      title: 'Student Name',
      dataIndex: 'name',
      key: 'studentName',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Course',
      key: 'course',
      render: (_, record) => {
        const latestPayment = record.payments?.[0];
        const courseName = latestPayment?.feeAssignment?.course?.courseName;
        console.log('Rendering course for student:', record.registrationNumber);
        console.log('Latest payment course data:', latestPayment?.feeAssignment?.course);
        return courseName || 'N/A';
      },
    },

    {
      title: 'Total Paid',
      dataIndex: 'totalPaid',
      key: 'totalPaid',
      render: (_, record) => (
        <Text strong>{formatCurrency(record.totalPaid || 0)}</Text>
      ),
      sorter: (a, b) => (a.totalPaid || 0) - (b.totalPaid || 0),
    },
    {
      title: 'Balance',
      key: 'balance',
      render: (_, record) => {
        // Use the balanceAmount from the latest payment
        const latestPayment = record.payments?.[0];
        const balance = latestPayment?.balanceAmount || 0;
        
        console.log('Balance for student:', record.registrationNumber, {
          balanceAmount: balance,
          latestPayment: latestPayment
        });
        
        return (
          <Text type={balance > 0 ? 'danger' : 'success'} strong>
            {formatCurrency(Math.max(0, balance))}
          </Text>
        );
      },
      sorter: (a, b) => {
        const balanceA = a.payments?.[0]?.balanceAmount || 0;
        const balanceB = b.payments?.[0]?.balanceAmount || 0;
        return balanceA - balanceB;
      },
    },
    {
      title: 'Last Payment',
      dataIndex: 'lastPaymentDate',
      key: 'lastPayment',
      render: (date) => date ? formatDate(date, 'DD/MM/YYYY') : 'N/A',
      sorter: (a, b) => new Date(a.lastPaymentDate || 0) - new Date(b.lastPaymentDate || 0),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const hasPayments = studentPayments[record._id]?.length > 0;
        console.log(`Student ${record._id} - hasPayments:`, hasPayments);
        console.log('Student payments data:', studentPayments[record._id]);
        
        return (
          <Space size="middle">
            <Tooltip title="Print Payment History">
              <Button
                type="primary"
                icon={<PrinterOutlined />}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Print button clicked for student:', record._id);
                  console.log('Student payments:', studentPayments[record._id]);
                  console.log('Record data:', record);
                  handlePrintReceipt(record);
                }}
                // Temporarily enable the button for testing
                // disabled={!hasPayments}
              />
            </Tooltip>
          </Space>
        );
      }
    }
  ];

  const handleViewReceipt = (paymentId) => {
    // Implementation of handleViewReceipt
  };

  // Handle table change (pagination, filters, sorter)
  const handleTableChange = useCallback((newPagination, newFilters, sorter) => {
    setPagination({
      ...pagination,
      ...newPagination,
    });
    setFilters({
      ...filters,
      ...newFilters,
    });
  }, [pagination, filters]);

  // Fetch data when pagination or filters change
  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    
    const fetchData = async () => {
      try {
        if (isMounted) {
          await fetchPayments();
          await fetchFeeTypes();
        }
      } catch (error) {
        if (error.name !== 'AbortError' && isMounted) {
          console.error('Error fetching data:', error);
          message.error('Failed to fetch data. Please try again.');
        }
      }
    };
    
    fetchData();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [pagination.current, pagination.pageSize, filters]);

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [name]: value
    }));
  };

  // Apply filters
  const applyFilters = () => {
    setPagination({
      ...pagination,
      current: 1, // Reset to first page when filters change
    });
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      search: '',
      dateRange: [dayjs().startOf('month'), dayjs().endOf('day')],
      status: '',
      feeType: '',
      paymentMethod: '',
    });
    setPagination({
      ...pagination,
      current: 1,
    });
  };

  // Expandable row for student payments
  const expandedRowRender = (record) => {
    const payments = record.payments || [];
    
    return (
      <div className="p-4 bg-gray-50">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <Text strong className="text-lg">Payment History</Text>
          </div>
          
          {payments.length === 0 ? (
            <p className="text-gray-500">No payment records found</p>
          ) : (
            <Table
              columns={paymentColumns}
              dataSource={payments}
              rowKey="_id"
              pagination={false}
              size="small"
              bordered
              className="custom-table"
            />
          )}
        </div>
      </div>
    );
  };

  return (
    // <div className="p-4">
    //   <div className="flex justify-between items-center mb-6">
    //     <h1 className="text-2xl font-bold text-gray-800">University Fee Payments</h1>
    //   </div>

    //   {/* Filters */}
    //   <Card className="mb-6" size="small">
    //     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
    //       <div>
    //         <Input
    //           placeholder="Search by ID or name"
    //           prefix={<SearchOutlined />}
    //           value={filters.search}
    //           onChange={(e) => handleFilterChange('search', e.target.value)}
    //           allowClear
    //         />
    //       </div>
    //       <RangePicker
    //         className="w-full"
    //         value={filters.dateRange}
    //         onChange={(dates) => handleFilterChange('dateRange', dates)}
    //       />
         
    //     </div>
    //     <div className="flex justify-end gap-2">
    //       <Button onClick={resetFilters}>
    //         Reset
    //       </Button>
    //       <Button 
    //         type="primary" 
    //         icon={<FilterOutlined />} 
    //         onClick={applyFilters}
    //       >
    //         Apply Filters
    //       </Button>
    //     </div>
    //   </Card>

    //   {/* Main Table */}
    //   <Card className="shadow-sm mt-4">
    //     <Table
    //       columns={studentColumns}
    //       dataSource={groupedPayments}
    //       rowKey="_id"
    //       loading={loading}
    //       pagination={{
    //         ...pagination,
    //         showSizeChanger: true,
    //         pageSizeOptions: ['10', '20', '50', '100'],
    //         showTotal: (total) => `Total ${total} students`,
    //       }}
    //       onChange={handleTableChange}
    //       expandable={{
    //         expandedRowRender,
    //         rowExpandable: (record) => (studentPayments[record._id]?.length || 0) > 0,
    //         expandedRowKeys,
    //         onExpand: (expanded, record) => {
    //           if (expanded) {
    //             setExpandedRowKeys([...expandedRowKeys, record._id]);
    //           } else {
    //             setExpandedRowKeys(expandedRowKeys.filter(key => key !== record._id));
    //           }
    //         },
    //       }}
    //     />
    //   </Card>

    //   {/* Receipt Modal */}
     

    //     <Modal
    //     title={selectedStudent ? `Payment Receipt - ${selectedStudent.registrationNumber || 'N/A'}` : 'Payment Receipt'}
    //     open={receiptModalVisible}
    //     onCancel={() => setReceiptModalVisible(false)}
    //     width={800}
    //     footer={[
    //       <Button 
    //         key="print" 
    //         type="primary" 
    //         icon={<PrinterOutlined />}
    //         onClick={() => {
    //           const content = receiptRef.current;
    //           const printWindow = window.open('', '', 'width=800,height=600');
    //           printWindow.document.write(`
    //             <html>
    //               <head>
    //                 <title>Payment Receipt</title>
    //                 <style>
    //                   @page { size: auto; margin: 10mm; }
    //                   body { font-family: Arial, sans-serif; }
    //                   .receipt { padding: 20px; max-width: 800px; margin: 0 auto; }
    //                   .receipt-header { text-align: center; margin-bottom: 20px; }
    //                   .receipt-details { margin: 20px 0; }
    //                   table { width: 100%; border-collapse: collapse; }
    //                   th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    //                   th { background-color: #f5f5f5; }
    //                   .text-right { text-align: right; }
    //                   .receipt-footer { text-align: center; margin-top: 30px; }
    //                   @media print {
    //                     body { -webkit-print-color-adjust: exact; }
    //                     .no-print { display: none !important; }
    //                   }
    //                 </style>
    //               </head>
    //               <body>
    //                 ${content.outerHTML}
    //                 <script>window.print();</script>
    //               </body>
    //             </html>
    //           `);
    //           printWindow.document.close();
    //         }}
    //       >
    //         Print Receipt
    //       </Button>,
    //       <Button key="close" onClick={() => setReceiptModalVisible(false)}>
    //         Close
    //       </Button>
    //     ]}
    //   >
    //     <div className="p-4">
    //       <div className="receipt" ref={receiptRef}>
    //         {selectedStudent ? (
    //           <>
    //             <div className="receipt-header">
    //               <h2 className="text-xl font-bold">PAYMENT RECEIPT</h2>
    //               <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
    //             </div>
                
    //             <div className="receipt-details">
    //               <table className="w-full">
    //                 <tbody>
    //                   <tr>
    //                     <td className="w-1/3"><strong>Receipt No:</strong></td>
    //                     <td>{studentPayments[selectedStudent._id]?.[0]?.receiptNo || 'N/A'}</td>
    //                   </tr>
    //                   <tr>
    //                     <td><strong>Student Name:</strong></td>
    //                     <td>{selectedStudent.name || selectedStudent.fullName || 
    //                         `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim() || 'N/A'}</td>
    //                   </tr>
    //                   <tr>
    //                     <td><strong>Registration No:</strong></td>
    //                     <td>{selectedStudent.registrationNumber || selectedStudent.rollNumber || 'N/A'}</td>
    //                   </tr>
    //                   <tr>
    //                     <td><strong>Course:</strong></td>
    //                     <td>
    //                       {(() => {
    //                         const latestPayment = studentPayments[selectedStudent._id]?.[0];
    //                         const courseName = latestPayment?.feeAssignment?.course?.courseName;
    //                         console.log('Rendering course for student:', selectedStudent.registrationNumber);
    //                         console.log('Latest payment course data:', latestPayment?.feeAssignment?.course);
    //                         return courseName || 'N/A';
    //                       })()}
    //                     </td>
    //                   </tr>
                      
    //                   <tr>
    //                     <td><strong>Semester/Year:</strong></td>
    //                     <td>
    //                       {getSemesterYearDisplay(
    //                         selectedStudent, 
    //                         studentPayments[selectedStudent._id]
    //                       )}
    //                     </td>
    //                   </tr>
    //                 </tbody>
    //               </table>
                  
    //               <div className="mt-6">
    //                 <h4 className="font-semibold mb-2">Payment Details:</h4>
    //                 <table className="w-full border-collapse">
    //                   <thead>
    //                     <tr className="bg-gray-100">
    //                       <th className="border p-2 text-left">Date</th>
    //                       <th className="border p-2 text-left">Fee Type</th>
    //                       <th className="border p-2 text-left">Semester/Year</th>
    //                       <th className="border p-2 text-left">Payment Mode</th>
    //                       <th className="border p-2 text-right">Amount</th>
    //                     </tr>
    //                   </thead>
    //                   <tbody>
    //                     {studentPayments[selectedStudent._id]?.map((payment, index) => (
    //                       <tr key={index}>
    //                         <td className="border p-2">{formatDate(payment.paymentDate) || 'N/A'}</td>
    //                         <td className="border p-2">{
    //                           payment.feeAssignment?.feeType?.name || 
    //                           payment.feeType || 
    //                           payment.feeTypeId?.name ||
    //                           'General Fee'
    //                         }</td>
    //                         <td className="border p-2">
    //                           {payment.semester ? 
    //                             `Sem ${payment.semester}${payment.academicYear ? ` (${payment.academicYear})` : ''}` : 
    //                             (payment.academicYear || 'N/A')}
    //                         </td>
    //                         <td className="border p-2">{
    //                           (() => {
    //                             const mode = payment.modeOfPayment || 
    //                                        payment.paymentMethod || 
    //                                        payment.paymentDetails?.paymentMethod;
    //                             if (!mode) return 'Not Specified';
    //                             return mode
    //                               .split('_')
    //                               .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    //                               .join(' ');
    //                           })()
    //                         }</td>
    //                         <td className="border p-2 text-right">
    //                           {formatCurrency(payment.paidAmount || 0)}
    //                           {payment.totalAmount && payment.totalAmount !== payment.paidAmount && (
    //                             <div className="text-xs text-gray-500">
    //                               of {formatCurrency(payment.totalAmount)}
    //                             </div>
    //                           )}
    //                         </td>
    //                       </tr>
    //                     ))}
    //                     <tr className="font-bold bg-gray-50">
    //                       <td colSpan="4" className="text-right p-2">Total Paid:</td>
    //                       <td className="text-right p-2">
    //                         {formatCurrency(
    //                           (studentPayments[selectedStudent._id] || []).reduce(
    //                             (sum, p) => sum + (p.paidAmount || 0), 0
    //                           )
    //                         )}
    //                       </td>
    //                     </tr>
    //                   </tbody>
    //                 </table>
    //               </div>
    //             </div>
                
    //             <div className="receipt-footer">
    //               <p>Thank you for your payment!</p>
    //               <p className="text-sm text-gray-600">This is a computer-generated receipt. No signature required.</p>
    //             </div>
    //           </>
    //         ) : (
    //           <p>No student data available for receipt</p>
    //         )}
    //       </div>
    //     </div>
    //   </Modal>

    //   <style jsx global>{`
    //     th { background-color: #f5f5f5; }
    //     .text-center { text-align: center; }
    //     .text-right { text-align: right; }
    //     .mb-4 { margin-bottom: 1rem; }
    //     .mt-4 { margin-top: 1rem; }
    //     .receipt-header, .receipt-footer { text-align: center; margin: 20px 0; }
    //     .receipt-details { margin: 20px 0; }
    //   `}</style>

      
    // </div>


    <div style={{ 
      padding: '24px', 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh',
      marginTop: '20px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e9ecef'
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: '700', 
          color: '#1a237e',
          margin: 0,
          textShadow: '0 1px 2px rgba(0,0,0,0.1)'
        }}>
          🎓 University Fee Payments
        </h1>
      </div>
    
      {/* Filters Card */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div style={{ flex: '1', minWidth: '250px' }}>
              <div style={{ 
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}>
                <span style={{ 
                  position: 'absolute',
                  left: '12px',
                  color: '#666',
                  zIndex: 1
                }}>
                  🔍
                </span>
                <input
                  placeholder="Search by ID or name..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  style={{ 
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '14px',
                    transition: 'all 0.3s ease',
                    backgroundColor: '#fafafa'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2196f3';
                    e.target.style.backgroundColor = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.backgroundColor = '#fafafa';
                  }}
                />
                {filters.search && (
                  <button
                    onClick={() => handleFilterChange('search', '')}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'none',
                      border: 'none',
                      fontSize: '16px',
                      color: '#666',
                      cursor: 'pointer'
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
    
            {/* Date Range Picker */}
            <div style={{ flex: '1', minWidth: '300px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="date"
                  value={filters.dateRange?.[0] || ''}
                  onChange={(e) => handleDateChange(0, e.target.value)}
                  style={{ 
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '14px',
                    backgroundColor: '#fafafa',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2196f3';
                    e.target.style.backgroundColor = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.backgroundColor = '#fafafa';
                  }}
                />
                <span style={{ color: '#666', fontWeight: '500' }}>to</span>
                <input
                  type="date"
                  value={filters.dateRange?.[1] || ''}
                  onChange={(e) => handleDateChange(1, e.target.value)}
                  style={{ 
                    flex: 1,
                    padding: '12px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '8px',
                    outline: 'none',
                    fontSize: '14px',
                    backgroundColor: '#fafafa',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#2196f3';
                    e.target.style.backgroundColor = 'white';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0';
                    e.target.style.backgroundColor = '#fafafa';
                  }}
                />
              </div>
            </div>
          </div>
        </div>
    
        {/* Filter Buttons */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid #f0f0f0'
        }}>
          <button 
            onClick={resetFilters}
            style={{
              padding: '10px 20px',
              border: '2px solid #dc3545',
              borderRadius: '8px',
              backgroundColor: 'white',
              color: '#dc3545',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#dc3545';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#dc3545';
            }}
          >
            ↺ Reset
          </button>
          <button 
            onClick={applyFilters}
            style={{
              padding: '10px 24px',
              border: 'none',
              borderRadius: '8px',
              backgroundColor: '#2196f3',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#1976d2';
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(33, 150, 243, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#2196f3';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(33, 150, 243, 0.3)';
            }}
          >
            ⚡ Apply Filters
          </button>
        </div>
      </div>
    
      {/* Main Table Card */}
      <div style={{ 
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        marginTop: '16px',
        overflow: 'hidden',
        border: '1px solid #e0e0e0'
      }}>
        <div style={{ padding: '8px 16px', backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '8px 0'
          }}>
            <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
              Showing {groupedPayments.length} students
            </span>
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid #f3f3f3',
                  borderTop: '2px solid #2196f3',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span style={{ fontSize: '14px', color: '#666' }}>Loading...</span>
              </div>
            )}
          </div>
        </div>
    
        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '14px'
          }}>
            <thead>
              <tr style={{ 
                backgroundColor: '#1a237e',
                color: 'white'
              }}>
                <th style={{ 
                  width: '40px',
                  padding: '16px 8px',
                  borderBottom: '2px solid #0d147a'
                }}></th>
                {studentColumns.map((column, index) => (
                  <th 
                    key={index}
                    style={{ 
                      padding: '16px 12px',
                      textAlign: 'left',
                      fontWeight: '600',
                      fontSize: '14px',
                      borderBottom: '2px solid #0d147a'
                    }}
                  >
                    {column.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {groupedPayments.map((record, index) => (
                <React.Fragment key={record._id}>
                  <tr 
                    style={{ 
                      backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                      borderBottom: '1px solid #e0e0e0',
                      transition: 'background-color 0.2s ease',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      setExpandedRowKeys(prev => 
                        prev.includes(record._id) 
                          ? prev.filter(key => key !== record._id)
                          : [...prev, record._id]
                      );
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#e3f2fd';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f8f9fa';
                    }}
                  >
                    <td style={{ 
                      padding: '14px 8px',
                      textAlign: 'center',
                      color: '#666',
                      fontSize: '16px',
                      borderRight: '1px solid #f0f0f0'
                    }}>
                      {expandedRowKeys.includes(record._id) ? '▼' : '▶'}
                    </td>
                    {studentColumns.map((column, colIndex) => (
                      <td 
                        key={colIndex}
                        style={{ 
                          padding: '14px 12px',
                          color: '#333',
                          fontSize: '14px'
                        }}
                      >
                        {column.render ? column.render(record[column.dataIndex], record) : record[column.dataIndex]}
                      </td>
                    ))}
                  </tr>
                  {expandedRowKeys.includes(record._id) && (
                    <tr>
                      <td colSpan={studentColumns.length + 1} style={{ padding: '16px', backgroundColor: '#fafafa' }}>
                        {expandedRowRender(record)}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
    
        {/* Pagination */}
        <div style={{ 
          padding: '20px 24px', 
          borderTop: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#fafafa'
        }}>
          <span style={{ color: '#666', fontSize: '14px' }}>
            Total {pagination.total} students
          </span>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <select
              value={pagination.pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              style={{
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                outline: 'none',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                onClick={() => handlePageChange(pagination.current - 1)}
                disabled={pagination.current === 1}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: pagination.current === 1 ? 'not-allowed' : 'pointer',
                  opacity: pagination.current === 1 ? 0.5 : 1,
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (pagination.current !== 1) {
                    e.target.style.backgroundColor = '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pagination.current !== 1) {
                    e.target.style.backgroundColor = 'white';
                  }
                }}
              >
                ← Previous
              </button>
              <span style={{ 
                padding: '8px 16px', 
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Page {pagination.current} of {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              <button
                onClick={() => handlePageChange(pagination.current + 1)}
                disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: 'white',
                  cursor: pagination.current >= Math.ceil(pagination.total / pagination.pageSize) ? 'not-allowed' : 'pointer',
                  opacity: pagination.current >= Math.ceil(pagination.total / pagination.pageSize) ? 0.5 : 1,
                  fontSize: '14px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (pagination.current < Math.ceil(pagination.total / pagination.pageSize)) {
                    e.target.style.backgroundColor = '#f0f0f0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (pagination.current < Math.ceil(pagination.total / pagination.pageSize)) {
                    e.target.style.backgroundColor = 'white';
                  }
                }}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    
      {/* Receipt Modal */}
      {receiptModalVisible && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '20px',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '800px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: '2px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#1a237e',
              color: 'white'
            }}>
              <h3 style={{ 
                fontSize: '20px', 
                fontWeight: '600', 
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📄 {selectedStudent ? `Payment Receipt - ${selectedStudent.registrationNumber || 'N/A'}` : 'Payment Receipt'}
              </h3>
              <button 
                onClick={() => setReceiptModalVisible(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: 'white',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
            </div>
            
            {/* Modal Content */}
            <div style={{ 
              padding: '24px',
              maxHeight: '60vh',
              overflowY: 'auto'
            }}>
              <div ref={receiptRef} style={{ fontFamily: 'Arial, sans-serif' }}>
                {selectedStudent ? (
                  <>
                    {/* Receipt Header */}
                    <div style={{ 
                      textAlign: 'center', 
                      marginBottom: '32px',
                      paddingBottom: '24px',
                      borderBottom: '2px solid #e0e0e0'
                    }}>
                      <h2 style={{ 
                        fontSize: '28px', 
                        fontWeight: 'bold', 
                        margin: '0 0 12px 0',
                        color: '#1a237e',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        PAYMENT RECEIPT
                      </h2>
                      <p style={{ 
                        color: '#666',
                        margin: '0',
                        fontSize: '16px',
                        fontWeight: '500'
                      }}>
                        📅 Date: {new Date().toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    
                    {/* Student Details */}
                    <div style={{ margin: '32px 0' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <tbody>
                          <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ 
                              width: '35%', 
                              padding: '12px 8px', 
                              fontWeight: '600',
                              color: '#333',
                              fontSize: '15px'
                            }}>
                              📋 Receipt No:
                            </td>
                            <td style={{ 
                              padding: '12px 8px',
                              color: '#666',
                              fontSize: '15px'
                            }}>
                              {studentPayments[selectedStudent._id]?.[0]?.receiptNo || 'N/A'}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '12px 8px', fontWeight: '600', color: '#333' }}>
                              👤 Student Name:
                            </td>
                            <td style={{ padding: '12px 8px', color: '#666' }}>
                              {selectedStudent.name || selectedStudent.fullName || 
                               `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim() || 'N/A'}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '12px 8px', fontWeight: '600', color: '#333' }}>
                              🆔 Registration No:
                            </td>
                            <td style={{ padding: '12px 8px', color: '#666' }}>
                              {selectedStudent.registrationNumber || selectedStudent.rollNumber || 'N/A'}
                            </td>
                          </tr>
                          <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '12px 8px', fontWeight: '600', color: '#333' }}>
                              🎓 Course:
                            </td>
                            <td style={{ padding: '12px 8px', color: '#666' }}>
                              {(() => {
                                const latestPayment = studentPayments[selectedStudent._id]?.[0];
                                const courseName = latestPayment?.feeAssignment?.course?.courseName;
                                return courseName || 'N/A';
                              })()}
                            </td>
                          </tr>
                          <tr>
                            <td style={{ padding: '12px 8px', fontWeight: '600', color: '#333' }}>
                              📚 Semester/Year:
                            </td>
                            <td style={{ padding: '12px 8px', color: '#666' }}>
                              {getSemesterYearDisplay(selectedStudent, studentPayments[selectedStudent._id])}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      
                      {/* Payment Details Table */}
                      <div style={{ marginTop: '40px' }}>
                        <h4 style={{ 
                          fontWeight: '600', 
                          marginBottom: '20px',
                          fontSize: '18px',
                          color: '#1a237e',
                          paddingBottom: '8px',
                          borderBottom: '2px solid #1a237e'
                        }}>
                          💳 Payment Details:
                        </h4>
                        <table style={{ 
                          width: '100%', 
                          borderCollapse: 'collapse', 
                          border: '1px solid #e0e0e0',
                          fontSize: '14px'
                        }}>
                          <thead>
                            <tr style={{ backgroundColor: '#1a237e', color: 'white' }}>
                              <th style={{ border: '1px solid #0d147a', padding: '14px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                              <th style={{ border: '1px solid #0d147a', padding: '14px', textAlign: 'left', fontWeight: '600' }}>Fee Type</th>
                              <th style={{ border: '1px solid #0d147a', padding: '14px', textAlign: 'left', fontWeight: '600' }}>Semester/Year</th>
                              <th style={{ border: '1px solid #0d147a', padding: '14px', textAlign: 'left', fontWeight: '600' }}>Payment Mode</th>
                              <th style={{ border: '1px solid #0d147a', padding: '14px', textAlign: 'right', fontWeight: '600' }}>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {studentPayments[selectedStudent._id]?.map((payment, index) => (
                              <tr key={index} style={{ 
                                backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                                transition: 'background-color 0.2s ease'
                              }}>
                                <td style={{ border: '1px solid #e0e0e0', padding: '12px', fontWeight: '500' }}>
                                  {formatDate(payment.paymentDate) || 'N/A'}
                                </td>
                                <td style={{ border: '1px solid #e0e0e0', padding: '12px' }}>
                                  {payment.feeAssignment?.feeType?.name || 
                                   payment.feeType || 
                                   payment.feeTypeId?.name ||
                                   'General Fee'}
                                </td>
                                <td style={{ border: '1px solid #e0e0e0', padding: '12px' }}>
                                  {payment.semester ? 
                                    `Sem ${payment.semester}${payment.academicYear ? ` (${payment.academicYear})` : ''}` : 
                                    (payment.academicYear || 'N/A')}
                                </td>
                                <td style={{ border: '1px solid #e0e0e0', padding: '12px' }}>
                                  {(() => {
                                    const mode = payment.modeOfPayment || 
                                               payment.paymentMethod || 
                                               payment.paymentDetails?.paymentMethod;
                                    if (!mode) return 'Not Specified';
                                    return mode
                                      .split('_')
                                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                      .join(' ');
                                  })()}
                                </td>
                                <td style={{ border: '1px solid #e0e0e0', padding: '12px', textAlign: 'right', fontWeight: '600' }}>
                                  <div style={{ color: '#2e7d32' }}>
                                    {formatCurrency(payment.paidAmount || 0)}
                                  </div>
                                  {payment.totalAmount && payment.totalAmount !== payment.paidAmount && (
                                    <div style={{ fontSize: '12px', color: '#666', fontWeight: 'normal' }}>
                                      of {formatCurrency(payment.totalAmount)}
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {/* Total Row */}
                            <tr style={{ 
                              fontWeight: 'bold', 
                              backgroundColor: '#e8f5e8',
                              borderTop: '2px solid #2e7d32'
                            }}>
                              <td colSpan="4" style={{ 
                                textAlign: 'right', 
                                padding: '16px', 
                                border: '1px solid #e0e0e0',
                                fontSize: '16px',
                                color: '#1b5e20'
                              }}>
                                💰 Total Paid:
                              </td>
                              <td style={{ 
                                textAlign: 'right', 
                                padding: '16px', 
                                border: '1px solid #e0e0e0',
                                fontSize: '18px',
                                color: '#1b5e20'
                              }}>
                                {formatCurrency(
                                  (studentPayments[selectedStudent._id] || []).reduce(
                                    (sum, p) => sum + (p.paidAmount || 0), 0
                                  )
                                )}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    {/* Receipt Footer */}
                    <div style={{ 
                      textAlign: 'center', 
                      marginTop: '40px',
                      paddingTop: '24px',
                      borderTop: '2px solid #e0e0e0'
                    }}>
                      <p style={{ 
                        margin: '8px 0', 
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#1a237e'
                      }}>
                        ✅ Thank you for your payment!
                      </p>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#666', 
                        margin: '8px 0',
                        fontStyle: 'italic'
                      }}>
                        This is a computer-generated receipt. No signature required.
                      </p>
                    </div>
                  </>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px',
                    color: '#666'
                  }}>
                    <p style={{ fontSize: '18px', margin: 0 }}>No student data available for receipt</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Modal Footer */}
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #e0e0e0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              backgroundColor: '#f8f9fa'
            }}>
              <button
                onClick={() => {
                  const content = receiptRef.current;
                  const printWindow = window.open('', '', 'width=800,height=600');
                  printWindow.document.write(`
                    <html>
                      <head>
                        <title>Payment Receipt</title>
                        <style>
                          @page { size: auto; margin: 10mm; }
                          body { font-family: Arial, sans-serif; }
                          .receipt { padding: 20px; max-width: 800px; margin: 0 auto; }
                          .receipt-header { text-align: center; margin-bottom: 20px; }
                          .receipt-details { margin: 20px 0; }
                          table { width: 100%; border-collapse: collapse; }
                          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                          th { background-color: #f5f5f5; }
                          .text-right { text-align: right; }
                          .receipt-footer { text-align: center; margin-top: 30px; }
                          @media print {
                            body { -webkit-print-color-adjust: exact; }
                            .no-print { display: none !important; }
                          }
                        </style>
                      </head>
                      <body>
                        ${content.outerHTML}
                        <script>window.print();</script>
                      </body>
                    </html>
                  `);
                  printWindow.document.close();
                }}
                style={{
                  padding: '12px 24px',
                  border: 'none',
                  borderRadius: '8px',
                  backgroundColor: '#2196f3',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#1976d2';
                  e.target.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#2196f3';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                🖨️ Print Receipt
              </button>
              <button 
                onClick={() => setReceiptModalVisible(false)}
                style={{
                  padding: '12px 24px',
                  border: '2px solid #666',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  color: '#666',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#666';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = '#666';
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
    
  );
};

export default PaidFee;