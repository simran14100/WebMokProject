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
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">University Fee Payments</h1>
      </div>

      {/* Filters */}
      <Card className="mb-6" size="small">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <Input
              placeholder="Search by ID or name"
              prefix={<SearchOutlined />}
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              allowClear
            />
          </div>
          <RangePicker
            className="w-full"
            value={filters.dateRange}
            onChange={(dates) => handleFilterChange('dateRange', dates)}
          />
         
        </div>
        <div className="flex justify-end gap-2">
          <Button onClick={resetFilters}>
            Reset
          </Button>
          <Button 
            type="primary" 
            icon={<FilterOutlined />} 
            onClick={applyFilters}
          >
            Apply Filters
          </Button>
        </div>
      </Card>

      {/* Main Table */}
      <Card className="shadow-sm mt-4">
        <Table
          columns={studentColumns}
          dataSource={groupedPayments}
          rowKey="_id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: (total) => `Total ${total} students`,
          }}
          onChange={handleTableChange}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => (studentPayments[record._id]?.length || 0) > 0,
            expandedRowKeys,
            onExpand: (expanded, record) => {
              if (expanded) {
                setExpandedRowKeys([...expandedRowKeys, record._id]);
              } else {
                setExpandedRowKeys(expandedRowKeys.filter(key => key !== record._id));
              }
            },
          }}
        />
      </Card>

      {/* Receipt Modal */}
     

        <Modal
        title={selectedStudent ? `Payment Receipt - ${selectedStudent.registrationNumber || 'N/A'}` : 'Payment Receipt'}
        open={receiptModalVisible}
        onCancel={() => setReceiptModalVisible(false)}
        width={800}
        footer={[
          <Button 
            key="print" 
            type="primary" 
            icon={<PrinterOutlined />}
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
          >
            Print Receipt
          </Button>,
          <Button key="close" onClick={() => setReceiptModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <div className="p-4">
          <div className="receipt" ref={receiptRef}>
            {selectedStudent ? (
              <>
                <div className="receipt-header">
                  <h2 className="text-xl font-bold">PAYMENT RECEIPT</h2>
                  <p className="text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                </div>
                
                <div className="receipt-details">
                  <table className="w-full">
                    <tbody>
                      <tr>
                        <td className="w-1/3"><strong>Receipt No:</strong></td>
                        <td>{studentPayments[selectedStudent._id]?.[0]?.receiptNo || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Student Name:</strong></td>
                        <td>{selectedStudent.name || selectedStudent.fullName || 
                            `${selectedStudent.firstName || ''} ${selectedStudent.lastName || ''}`.trim() || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Registration No:</strong></td>
                        <td>{selectedStudent.registrationNumber || selectedStudent.rollNumber || 'N/A'}</td>
                      </tr>
                      <tr>
                        <td><strong>Course:</strong></td>
                        <td>
                          {(() => {
                            const latestPayment = studentPayments[selectedStudent._id]?.[0];
                            const courseName = latestPayment?.feeAssignment?.course?.courseName;
                            console.log('Rendering course for student:', selectedStudent.registrationNumber);
                            console.log('Latest payment course data:', latestPayment?.feeAssignment?.course);
                            return courseName || 'N/A';
                          })()}
                        </td>
                      </tr>
                      
                      <tr>
                        <td><strong>Semester/Year:</strong></td>
                        <td>
                          {getSemesterYearDisplay(
                            selectedStudent, 
                            studentPayments[selectedStudent._id]
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  
                  <div className="mt-6">
                    <h4 className="font-semibold mb-2">Payment Details:</h4>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-2 text-left">Date</th>
                          <th className="border p-2 text-left">Fee Type</th>
                          <th className="border p-2 text-left">Semester/Year</th>
                          <th className="border p-2 text-left">Payment Mode</th>
                          <th className="border p-2 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentPayments[selectedStudent._id]?.map((payment, index) => (
                          <tr key={index}>
                            <td className="border p-2">{formatDate(payment.paymentDate) || 'N/A'}</td>
                            <td className="border p-2">{
                              payment.feeAssignment?.feeType?.name || 
                              payment.feeType || 
                              payment.feeTypeId?.name ||
                              'General Fee'
                            }</td>
                            <td className="border p-2">
                              {payment.semester ? 
                                `Sem ${payment.semester}${payment.academicYear ? ` (${payment.academicYear})` : ''}` : 
                                (payment.academicYear || 'N/A')}
                            </td>
                            <td className="border p-2">{
                              (() => {
                                const mode = payment.modeOfPayment || 
                                           payment.paymentMethod || 
                                           payment.paymentDetails?.paymentMethod;
                                if (!mode) return 'Not Specified';
                                return mode
                                  .split('_')
                                  .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                  .join(' ');
                              })()
                            }</td>
                            <td className="border p-2 text-right">
                              {formatCurrency(payment.paidAmount || 0)}
                              {payment.totalAmount && payment.totalAmount !== payment.paidAmount && (
                                <div className="text-xs text-gray-500">
                                  of {formatCurrency(payment.totalAmount)}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                        <tr className="font-bold bg-gray-50">
                          <td colSpan="4" className="text-right p-2">Total Paid:</td>
                          <td className="text-right p-2">
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
                
                <div className="receipt-footer">
                  <p>Thank you for your payment!</p>
                  <p className="text-sm text-gray-600">This is a computer-generated receipt. No signature required.</p>
                </div>
              </>
            ) : (
              <p>No student data available for receipt</p>
            )}
          </div>
        </div>
      </Modal>

      <style jsx global>{`
        th { background-color: #f5f5f5; }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .mb-4 { margin-bottom: 1rem; }
        .mt-4 { margin-top: 1rem; }
        .receipt-header, .receipt-footer { text-align: center; margin: 20px 0; }
        .receipt-details { margin: 20px 0; }
      `}</style>

      
    </div>

    
  );
};

export default PaidFee;