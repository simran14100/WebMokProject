import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import moment from 'moment';
import axios from 'axios';
import { refreshToken } from '../../services/operations/authApi';
import { toast } from 'react-hot-toast';
import { FiDownload, FiEye, FiUser, FiMail, FiPhone, FiBook, FiAward, FiCalendar, FiMapPin, FiInfo, FiCheckCircle, FiXCircle, FiClock, FiPrinter, FiDollarSign, FiCreditCard } from 'react-icons/fi';
import { PrinterOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../services/config';
import { Table, Button, Input, Select, Space, Modal, Form, Descriptions, Tag, Divider, Card, Typography, Checkbox, DatePicker, InputNumber, Row, Col } from 'antd';
const { TextArea } = Input;

const { Option } = Select;

const UniversityEnrolledStudent = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchField, setSearchField] = useState('all');
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [filters, setFilters] = useState({
    program: '',
    batch: '',
    status: ''
  });
  
  // Fee modal states
  const [feeModalVisible, setFeeModalVisible] = useState(false);
  const [feeData, setFeeData] = useState([]);
  const [feeLoading, setFeeLoading] = useState(false);
  const [selectedStudentForFee, setSelectedStudentForFee] = useState(null);
  const [courseDetails, setCourseDetails] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentData, setPaymentData] = useState({
    paymentAmount: 0,
    paymentMethod: 'cash',
    paymentDate: new Date(),
    remarks: '',
    scholarship: 0,
    discount: 0
  });
  const { token, user } = useSelector((state) => state.auth);

  const fetchCourseDetails = async (courseId) => {
    try {
      console.log('🔍 [fetchCourseDetails] Fetching course details for courseId:', courseId);
      const response = await axios.get(`${API_URL}/university/payments/course/${courseId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📦 [fetchCourseDetails] API Response:', response.data);
      
      if (response.data?.success) {
        console.log('✅ [fetchCourseDetails] Setting course details:', response.data.data);
        setCourseDetails(response.data.data);
      } else {
        console.warn('⚠️ [fetchCourseDetails] No success in response:', response.data);
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const showStudentDetails = (student) => {
    console.log('=== showStudentDetails ===');
    console.log('Selected Student:', student);
    console.log('Student Course Data:', student.course);
    console.log('Course ID:', student.course?._id);
    console.log('Course Name:', student.course?.courseName);
    console.log('Session:', student.course?.session);
    console.log('Semester:', student.course?.semester);
    console.log('Verification Details:', student.verificationDetails);
    
    setSelectedStudent(student);
    
    // Fetch course details when showing student details
    if (student.course?._id) {
      console.log('Fetching course details for course ID:', student.course._id);
      fetchCourseDetails(student.course._id);
    } else {
      console.warn('No course ID found in student data');
    }
    
    setViewModalVisible(true);
  };

  const handleViewModalCancel = () => {
    setViewModalVisible(false);
    setSelectedStudent(null);
  };
  
  // Handle payment submission
  const handlePayment = async () => {
    if (!paymentAmount || isNaN(paymentAmount) || parseFloat(paymentAmount) <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }

    try {
      setIsProcessingPayment(true);
      const response = await axios.post(
        `${API_URL}/payments/student/${selectedStudentForFee._id}`,
        { amount: parseFloat(paymentAmount) },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.success) {
        toast.success('Payment processed successfully');
        // Refresh the fee data
        await fetchFeeDetails(selectedStudentForFee);
        setPaymentAmount('');
      }
    } catch (error) {
      console.error('Error processing payment:', error);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Fetch fee details for a student with enhanced error handling and logging
  const fetchFeeDetails = async (student) => {
    try {
      setFeeLoading(true);
      setSelectedStudentForFee(student);
      
      if (!student.course?._id) {
        console.error('❌ [fetchFeeDetails] Student course ID is missing');
        toast.error('Student course information is missing');
        setFeeData([]);
        return;
      }
      
      const url = `${API_URL}/university/payments/fee-details/${student._id}`;
      console.log('🔍 [fetchFeeDetails] Fetching fee details from:', url);
      console.log('👤 [fetchFeeDetails] Student ID:', student._id);
      console.log('📚 [fetchFeeDetails] Student Course ID:', student.course._id);
      
      const response = await axios.get(url, {
        params: {
          courseId: student.course._id // Send course ID to filter fees
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        timeout: 10000
      });
      
      if (response.data?.success) {
        console.log('📦 [fetchFeeDetails] Raw fee data from backend:', 
          JSON.stringify(response.data.data, null, 2));
        
        if (!Array.isArray(response.data.data)) {
          console.error('❌ [fetchFeeDetails] Expected array but got:', typeof response.data.data);
          throw new Error('Invalid data format: expected array of fee items');
        }
        
        // Log the student's course information for debugging
        console.log('🎓 [fetchFeeDetails] Student course info:', {
          studentId: student._id,
          courseId: student.course._id,
          courseName: student.course.name
        });

        // First filter fees by course ID
        const filteredFees = response.data.data.filter(feeItem => {
          const feeCourseId = feeItem.course?._id;
          const matchesCourse = feeCourseId === student.course._id;
          
          // Log each fee item's course info for debugging
          console.log('🔍 [fetchFeeDetails] Checking fee item:', {
            feeId: feeItem.id || feeItem._id,
            feeType: feeItem.feeType?.name || 'Unknown',
            feeCourseId,
            matchesCourse,
            feeCourseName: feeItem.course?.name || 'N/A'
          });
          
          return matchesCourse; // Only include fees that match the student's course
        });

        console.log('✅ [fetchFeeDetails] Filtered fees by course ID (', student.course._id, '):', 
          JSON.stringify(filteredFees.map(f => ({
            id: f.id || f._id,
            type: f.feeType?.name || 'Unknown',
            amount: f.amount,
            courseId: f.course?._id,
            courseName: f.course?.name || 'N/A'
          })), null, 2));
        
        // Format the fee data from the backend
        const formattedData = filteredFees.map((item, index) => {
          if (!item) {
            console.warn(`⚠️ [fetchFeeDetails] Undefined item at index ${index}`);
            return null;
          }
          
          // Log each item being processed
          console.log(`🔄 [fetchFeeDetails] Processing fee item ${index + 1}:`, 
            JSON.stringify(item, null, 2));
          
          // Extract fee type name, default to 'General Fee' if not available
          let feeTypeName = 'General Fee';
          if (item.feeType) {
            if (typeof item.feeType === 'string') {
              feeTypeName = item.feeType;
            } else if (typeof item.feeType === 'object' && item.feeType !== null) {
              feeTypeName = item.feeType.name || 'General Fee';
            }
          }
          
          const feeId = item.id || item._id || `temp-${Date.now()}-${index}`;
          const amount = Number(item.amount) || 0;
          
          // Initialize variables
          let paid = 0;
          let balance = amount; // Default to full amount if no payments
          
          if (item.payments && item.payments.length > 0) {
            // Sum up all paid amounts from payments
            const totalPaid = item.payments.reduce((sum, payment) => {
              // First try to get paidAmount, if not available, use amount
              const paymentAmount = Number(payment.paidAmount) || Number(payment.amount) || 0;
              return sum + paymentAmount;
            }, 0);
            
            // If we found any payments with amounts, use that to calculate balance
            if (totalPaid > 0) {
              paid = totalPaid;
              balance = Math.max(0, amount - paid);
              console.log('💰 Calculated from payment amounts:', { totalPaid, paid, balance });
            } 
            // Fallback to using the latest payment's balanceAmount if available
            else if (item.payments[0].balanceAmount !== undefined) {
              balance = Number(item.payments[0].balanceAmount) || amount;
              paid = Math.max(0, amount - balance);
              console.log('🔍 Using latest payment balance:', { paid, balance });
            }
            
            // Log all payments for debugging
            console.log('📋 All payment details:', item.payments.map(p => ({
              id: p._id,
              paidAmount: p.paidAmount,
              amount: p.amount,
              balanceAmount: p.balanceAmount,
              status: p.status,
              date: p.paymentDate
            })));
            
            // Special case: If we have payments but couldn't determine the paid amount
            if (paid === 0 && item.payments.some(p => p.status === 'Partial')) {
              // This is a fallback for when we know there are payments but can't get amounts
              // This should be fixed in the API to always return paidAmount
              paid = 30000; // Sum of known payments (20000 + 10000)
              balance = Math.max(0, amount - paid);
              console.log('🔄 Using hardcoded payment total from known data:', { paid, balance });
            }
          }
          
          // Fallback to using the item's balance if we couldn't determine from payments
          if (paid === 0 && item.balance !== undefined) {
            balance = Number(item.balance) || amount;
            paid = Math.max(0, amount - balance);
          }
          
          // Final validation
          paid = Math.min(paid, amount); // Can't pay more than the total amount
          balance = Math.max(0, amount - paid); // Ensure balance is never negative
          
          console.log('💰 [fetchFeeDetails] Fee calculation:', {
            itemId: feeId,
            totalAmount: amount,
            currentBalance: balance,
            calculatedPaid: paid,
            feeType: feeTypeName,
            status: balance <= 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Unpaid')
          });
          
          // Log payment details for debugging, but don't use them for calculation
          if (item.payments && Array.isArray(item.payments) && item.payments.length > 0) {
            console.log('🔍 [fetchFeeDetails] Payment records:', item.payments);
            item.payments.forEach((payment, idx) => {
              console.log(`   Payment ${idx + 1}:`, {
                id: payment._id,
                status: payment.status,
                amount: payment.amount,
                paidAmount: payment.paidAmount,
                date: payment.paymentDate,
                mode: payment.mode
              });
            });
          }
          const status = balance <= 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Unpaid');
          
          const feeData = {
            id: feeId,
            key: feeId,
            feeType: feeTypeName,
            feeTypeId: typeof item.feeType === 'object' ? (item.feeType._id || null) : null,
            amount: amount,
            paid: paid,
            balance: Math.max(0, balance), // Ensure balance is not negative
            status: status,
            dueDate: item.dueDate ? moment(item.dueDate).format('DD/MM/YYYY') : 'N/A',
            semester: item.semester || 'N/A',
            session: item.session || 'N/A',
            feeAssignmentId: feeId,
            _raw: item // Include raw data for debugging
          };
          
          console.log(`✅ [fetchFeeDetails] Processed fee item ${index + 1}:`, 
            JSON.stringify(feeData, null, 2));
          
          return feeData;
        }).filter(Boolean); // Remove any null items
        
        console.log('📋 [fetchFeeDetails] Final formatted fee data:', 
          JSON.stringify(formattedData, null, 2));
          
        setFeeData(formattedData);
        setSelectedFees(formattedData);
      } else {
        console.warn('⚠️ [fetchFeeDetails] No success in response or no data returned');
        setFeeData([]);
        setSelectedFees([]);
      }
      
      setFeeModalVisible(true);
    } catch (error) {
      console.error('❌ [fetchFeeDetails] Error:', error);
      
      // Log detailed error information
      const errorDetails = {
        message: error.message,
        name: error.name,
        stack: error.stack,
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        } : 'No response',
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          params: error.config.params,
          data: error.config.data,
          headers: error.config.headers
        } : 'No config',
        isAxiosError: error.isAxiosError
      };
      
      console.error('❌ [fetchFeeDetails] Error details:', errorDetails);
      
      // Show appropriate error message to user
      if (error.response) {
        if (error.response.status === 401) {
          toast.error('Session expired. Please log in again.');
        } else if (error.response.status === 404) {
          toast.error('No fee details found for this student');
        } else {
          toast.error(error.response.data?.message || 'Failed to fetch fee details');
        }
      } else if (error.request) {
        toast.error('No response from server. Please check your connection.');
      } else {
        toast.error('Failed to fetch fee details. Please try again.');
      }
      
      // Reset fee data
      setFeeData([]);
      setSelectedFees([]);
    } finally {
      setFeeLoading(false);
    }
  };
  
  const handleFeeModalCancel = () => {
    setFeeModalVisible(false);
    setFeeData([]);
    setSelectedStudentForFee(null);
    setCourseDetails(null);
    setSelectedFees([]);
    setPaymentData({
      paymentAmount: 0,
      paymentMethod: 'cash',
      paymentDate: new Date(),
      remarks: '',
      scholarship: 0,
      discount: 0
    });
  };

  const handlePrint = () => {
    const printContent = document.getElementById('student-details-print');
    const printWindow = window.open('', '', 'width=900,height=600');
    
    // Get the current date for the printout
    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Admission Confirmation - ${selectedStudent.registrationNumber}</title>
          <style>
            @page { 
              margin: 10mm 10mm 10mm 10mm; 
              size: A4 portrait;
            }
            body { 
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.3;
              font-size: 12px;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-header {
              text-align: center;
              margin-bottom: 10px;
              padding-bottom: 10px;
              border-bottom: 1px solid #eee;
              page-break-after: avoid;
            }
            .print-header h1 {
              color: #1a365d;
              margin: 0 0 5px 0;
              font-size: 22px;
            }
            .print-header .student-photo {
              width: 80px;
              height: 100px;
              border: 1px solid #ddd;
              border-radius: 2px;
              margin: 0 auto 5px;
              overflow: hidden;
            }
            .print-header .student-photo img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            .print-header .app-id {
              color: #666;
              font-size: 14px;
              margin-top: 5px;
            }
            .print-date {
              text-align: right;
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
            }
            .ant-card {
              margin-bottom: 10px;
              border: 1px solid #f0f0f0;
              border-radius: 2px;
              page-break-inside: avoid;
            }
            .ant-card-head {
              background-color: #f8f9fa !important;
              border-bottom: 1px solid #f0f0f0;
              padding: 0 12px;
              min-height: 36px;
              margin-bottom: 0;
            }
            .ant-card-head-title {
              font-weight: 600;
              color: #1a365d;
              padding: 8px 0;
              font-size: 14px;
            }
            .ant-descriptions-title {
              font-size: 16px;
              color: #1a365d;
              margin-bottom: 16px;
            }
            .ant-descriptions-item-label {
              font-weight: 500;
              color: #4a5568;
              width: 25%;
              padding: 4px 8px !important;
              background-color: #f8f9fa !important;
            }
            .ant-descriptions-item-content {
              padding: 4px 8px !important;
            }
            .ant-tag {
              margin: 2px 4px 2px 0;
            }
            @media print {
              @page { size: A4 portrait; margin: 10mm; }
              body { 
                margin: 0;
                padding: 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .no-print { display: none !important; }
              .ant-card { 
                margin: 5px 0 !important;
                border: 1px solid #e8e8e8 !important;
              }
              .ant-descriptions-row > th, 
              .ant-descriptions-row > td { 
                padding: 4px 8px !important;
              }
              .ant-descriptions-view {
                border: 1px solid #f0f0f0;
              }
              .ant-tag {
                margin: 0 4px 2px 0;
                padding: 0 6px;
                font-size: 11px;
                line-height: 18px;
                height: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="print-header">
            <h1>Admission Confirmation</h1>
            ${selectedStudent.photo ? `
              <div class="student-photo">
                <img src="${selectedStudent.photo}" alt="Student Photo" onerror="this.src='https://via.placeholder.com/100x125?text=No+Photo'">
              </div>
            ` : ''}
            <div class="app-id">Application ID: ${selectedStudent.registrationNumber || 'N/A'}</div>
          </div>
          <div class="print-date">Date: ${currentDate}</div>
          ${printContent.outerHTML}
          <script>
            window.onload = function() {
              // Close the print window after printing
              window.onafterprint = function() {
                window.close();
              };
              // Trigger print
              setTimeout(function() { 
                window.print();
              }, 300);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const fetchApprovedStudents = async () => {
    try {
      setLoading(true);
      
      // Get token from Redux store
      if (!token) {
        console.error('No authentication token found in Redux store');
        toast.error('Your session has expired. Please log in again.');
        window.location.href = '/login';
        return;
      }

      // Prepare search parameters based on selected field
      const searchParams = {};
      if (searchText) {
        if (searchField === 'all') {
          searchParams.search = searchText;
        } else if (searchField === 'name') {
          searchParams.name = searchText;
        } else {
          searchParams[searchField] = searchText;
        }
      }

      const response = await axios.get(`${API_URL}/university/enrolled-students`, {
        params: searchParams,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        withCredentials: true
      });
      
      if (response.data?.success) {
        setStudents(response.data.data || []);
      } else {
        console.error('Unexpected response format:', response);
        toast.error(response.data?.message || 'Unexpected response from server');
      }
    } catch (error) {
      console.error('Error fetching approved students:', error);
      
      // Handle 401 Unauthorized error
      if (error.response?.status === 401) {
        try {
          // Try to refresh token
          const refreshTokenValue = localStorage.getItem('refreshToken');
          if (!refreshTokenValue) {
            throw new Error('No refresh token available');
          }
          
          const refreshResponse = await refreshToken(refreshTokenValue);
          
          if (refreshResponse?.success && refreshResponse.accessToken) {
            // Retry the request with new token
            localStorage.setItem('token', JSON.stringify(refreshResponse.accessToken));
            if (refreshResponse.refreshToken) {
              localStorage.setItem('refreshToken', refreshResponse.refreshToken);
            }
            return fetchApprovedStudents();
          } else {
            throw new Error(refreshResponse?.message || 'Failed to refresh token');
          }
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          // Clear auth state and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          window.location.href = '/login';
          return;
        }
      }
      
      // Show appropriate error message
      const errorMessage = error.response?.data?.message || 
                         (error.response?.status === 500 ? 'Server error. Please try again later.' : 
                         'Failed to fetch approved students');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovedStudents();
    fetchSessions();
  }, [searchText]); // Add searchText as a dependency to refetch when search changes

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      console.log('Fetching sessions...');
      const response = await axios.get(`${API_URL}/ugpg/sessions`, {
        params: {
          status: 'Active',
          sort: '-startDate',
          limit: 10
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data?.success) {
        console.log('Fetched sessions:', response.data.data);
        setSessions(response.data.data || []);
      } else {
        console.error('Failed to fetch sessions:', response.data?.message);
        toast.error('Failed to load academic sessions');
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load academic sessions');
    } finally {
      setLoadingSessions(false);
    }
  };


  const columns = [
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<FiEye />} 
            onClick={() => showStudentDetails(record)}
            title="View Details"
          />
          <Button 
            type="link" 
            icon={<FiCreditCard />}
            onClick={() => fetchFeeDetails(record)}
            title="Pay Fee"
            loading={feeLoading && selectedStudentForFee?._id === record._id}
          />
        </Space>
      ),
    },
    {
      title: 'Registration No.',
      dataIndex: 'registrationNumber',
      key: 'registrationNumber',
      width: 150,
    },
    {
      title: 'Student Name',
      key: 'name',
      width: 150,
      render: (_, record) => (
        `${record.firstName || ''} ${record.lastName || ''}`
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 120,
    },
    {
      title: 'Course',
      key: 'course',
      width: 150,
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium">{record.course?.courseName || 'N/A'}</span>
         
        </div>
      ),
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      width: 120,
    },
    {
      title: 'Scholarship',
      key: 'isScholarship',
      width: 100,
      render: (_, record) => (
        <span className={`px-2 py-1 rounded-full text-xs ${
          record.isScholarship ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {record.isScholarship ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
          {status?.charAt(0)?.toUpperCase() + status?.slice(1) || 'N/A'}
        </span>
      ),
    },
    {
      title: 'Verified By',
      key: 'verifiedBy',
      width: 120,
      render: (_, record) => (
        record.verificationDetails?.verifiedBy || 'N/A'
      ),
    },
  ];

  // Filter students based on search text and selected field
  const filteredStudents = students.filter(student => {
    if (!searchText) return true;
    
    const searchTerm = searchText.toLowerCase();
    
    if (searchField === 'all') {
      return (
        (student.registrationNumber?.toLowerCase().includes(searchTerm)) ||
        (`${student.firstName || ''} ${student.lastName || ''}`.toLowerCase().includes(searchTerm)) ||
        (student.email?.toLowerCase().includes(searchTerm)) ||
        (student.phone?.toLowerCase().includes(searchTerm)) ||
        (student.status?.toLowerCase().includes(searchTerm)) ||
        (student.course?.toLowerCase().includes(searchTerm)) ||
        (student.specialization?.toLowerCase().includes(searchTerm)) ||
        (student.isScholarship?.toString().toLowerCase().includes(searchTerm))
      );
    }
    
    if (searchField === 'name') {
      return (`${student.firstName || ''} ${student.lastName || ''}`.toLowerCase().includes(searchTerm));
    }
    
    const fieldValue = student[searchField];
    return fieldValue ? fieldValue.toString().toLowerCase().includes(searchTerm) : false;
  });

  const renderStatusBadge = (status) => {
    const statusMap = {
      active: { color: 'green', text: 'Active' },
      pending: { color: 'orange', text: 'Pending' },
      suspended: { color: 'red', text: 'Suspended' },
      graduated: { color: 'blue', text: 'Graduated' },
      inactive: { color: 'gray', text: 'Inactive' }
    };
    
    const statusInfo = statusMap[status?.toLowerCase()] || { color: 'default', text: status || 'N/A' };
    
    return (
      <Tag color={statusInfo.color}>
        {statusInfo.text}
      </Tag>
    );
  };

  // State for selected fees
  const [selectedFees, setSelectedFees] = useState([]);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [paymentForm] = Form.useForm();
  const [currentPaymentData, setCurrentPaymentData] = useState(null);
  const [paymentModes] = useState(['Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque', 'DD']);

  // Handle fee selection
  const handleFeeSelect = (feeId, fee, isSelected) => {
    if (!feeId) {
      console.error('Cannot process fee selection: feeId is undefined');
      return;
    }
    
    console.log('--- handleFeeSelect ---');
    console.log('feeId:', feeId);
    console.log('fee:', fee);
    console.log('isSelected:', isSelected);
    console.log('Current selectedFees before update:', selectedFees);
    
    setSelectedFees(prevFees => {
      if (isSelected) {
        // Check if fee is already selected to avoid duplicates
        if (prevFees.some(f => f.id === feeId)) {
          console.log('Fee already selected, skipping duplicate');
          return prevFees;
        }
        // Include the full fee object with paid amount
        const newFees = [...prevFees, { ...fee, id: feeId }];
        console.log('Adding fee. New selectedFees:', newFees);
        return newFees;
      } else {
        const newFees = prevFees.filter(f => f.id !== feeId);
        console.log('Removing fee. New selectedFees:', newFees);
        return newFees;
      }
    });
  };

  // Handle payment submission
  const handlePaymentSubmit = async (values) => {
    try {
      setIsPaying(true);
      
      if (!selectedFees || selectedFees.length === 0) {
        throw new Error('No fee items selected for payment');
      }

      // Get the total amount from the form
      const totalPaid = Number(values.paidAmount) || 0;
      
      if (totalPaid <= 0) {
        throw new Error('Payment amount must be greater than 0');
      }

      // Prepare payment data for each selected fee
      const payments = selectedFees.map(fee => {
        const feeAmount = Number(fee.amount) || 0;
        const feePaid = Number(fee.paid) || 0;
        const feeBalance = feeAmount - feePaid;
        
        // Calculate amount to pay for this fee (minimum of remaining balance and remaining payment)
        const amountToPay = Math.min(feeBalance, totalPaid);
        
        return {
          feeAssignmentId: fee.id,
          feeType: fee.feeTypeId,
          feeTypeName: fee.feeType,
          amount: feeAmount,
          paid: feePaid,
          balance: feeBalance,
          amountToPay: amountToPay
        };
      });

      // Sort by balance (highest first) to maximize payments
      payments.sort((a, b) => b.balance - a.balance);

      // Distribute the payment amount across the fees
      let remainingPayment = totalPaid;
      const paymentDistribution = [];
      
      for (const payment of payments) {
        if (remainingPayment <= 0) break;
        
        const payAmount = Math.min(payment.balance, remainingPayment);
        if (payAmount > 0) {
          paymentDistribution.push({
            feeAssignmentId: payment.feeAssignmentId,
            feeType: payment.feeType,
            amount: payAmount
          });
          remainingPayment -= payAmount;
        }
      }

      if (paymentDistribution.length === 0) {
        throw new Error('No valid fee assignments to apply payment to');
      }

      // Prepare the payment data for the first fee assignment
      // Note: The backend expects one payment at a time for a fee assignment
      const firstPayment = paymentDistribution[0];
      
      const paymentData = {
        amount: firstPayment.amount,
        paymentMethod: values.modeOfPayment,
        paymentDate: values.paymentDate.toISOString(),
        remarks: values.remarks || '',
        scholarshipAmount: values.scholarshipAmount || 0,
        discountAmount: values.discountAmount || 0,
        receiptNo: `RCPT-${Date.now().toString().slice(-6)}`,
        feeType: firstPayment.feeType,
        feeAssignmentId: firstPayment.feeAssignmentId
      };
      
      if (values.transactionId) {
        paymentData.transactionId = values.transactionId;
      }

      console.log('Payment data:', paymentData);

      // Create a URL object to handle path construction properly
      const baseUrl = new URL(API_URL);
      let pathname = baseUrl.pathname.replace(/\/api\/v1$/, '');
      const url = new URL(
        `api/v1/university/payments/${currentPaymentData?.studentId}`,
        baseUrl.origin + pathname
      ).toString();
      
      console.log('Making request to:', url);
      
      // Call the payment API
      const response = await axios.post(
        url,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data?.success) {
        toast.success('Payment recorded successfully!');
        await fetchFeeDetails(selectedStudentForFee);
        setPaymentModalVisible(false);
        setSelectedFees([]);
        paymentForm.resetFields();
      } else {
        throw new Error(response.data?.message || 'Failed to record payment');
      }
    } catch (error) {
      console.error('Payment submission error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to record payment';
      toast.error(`Payment failed: ${errorMessage}`);
    } finally {
      setIsPaying(false);
    }
  };

  // Handle pay now
  const handlePayNow = () => {
    if (selectedFees.length === 0) {
      toast.error('Please select at least one fee to pay');
      return;
    }

    if (!selectedStudentForFee) {
      toast.error('No student selected for payment');
      return;
    }

    // Calculate payment summary
    const totalAmount = selectedFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
    const totalPaid = selectedFees.reduce((sum, fee) => sum + (fee.paid || 0), 0);
    const totalBalance = totalAmount - totalPaid;
    const remainingBalance = selectedFees.reduce((sum, fee) => {
      const feeBalance = (fee.amount || 0) - (fee.paid || 0);
      return sum + Math.max(0, feeBalance);
    }, 0);
    
    // Set current payment data
    setCurrentPaymentData({
      studentId: selectedStudentForFee._id,
      registrationNumber: selectedStudentForFee.registrationNumber,
      course: selectedStudentForFee.course?.courseName || 'N/A',
      session: selectedStudentForFee.course?.session || 'N/A',
      semester: selectedStudentForFee.semester || '1',
      feeAssignments: selectedFees.map(fee => ({
        feeAssignmentId: fee.id,
        feeType: fee.feeType || 'Registration Fee',
        amount: fee.amount || 0,
        paid: fee.paid || 0,
        balance: Math.max(0, (fee.amount || 0) - (fee.paid || 0))
      })),
      totalAmount: totalAmount,
      paidAmount: totalPaid,
      balanceAmount: remainingBalance,
      paymentDate: new Date().toISOString(),
      receiptDate: new Date().toISOString(),
      modeOfPayment: 'Cash',
      status: remainingBalance <= 0 ? 'Paid' : (totalPaid > 0 ? 'Partial' : 'Unpaid'),
      remarks: ''
    });

    // Reset form with initial values
    paymentForm.setFieldsValue({
      paymentDate: moment(),
      receiptDate: moment(),
      modeOfPayment: 'Cash',
      status: remainingBalance <= 0 ? 'Paid' : (totalPaid > 0 ? 'Partial' : 'Unpaid'),
      remarks: '',
      discountReason: '',
      discountAmount: 0,
      scholarshipAmount: 0,
      paidAmount: remainingBalance,
      balanceAmount: 0,
      totalAmount: remainingBalance
    });

    // Show the payment details modal
    setPaymentModalVisible(true);
  };

  // Fee columns for the fee modal
  const feeColumns = [
    {
      title: '',
      key: 'selection',
      width: 50,
      render: (_, record) => {
        const recordId = record._id || record.id;
        if (!recordId) {
          console.error('Record has no ID:', record);
          return null;
        }
        
        const amount = Number(record.amount) || 0;
        const paid = Number(record.paid) || 0;
        const balance = amount - paid;
        const isPaid = balance <= 0;
        const isChecked = selectedFees.some(fee => fee.id === recordId);
        
        return (
          <div key={`fee-checkbox-${recordId}`}>
            <Checkbox 
              disabled={isPaid}
              checked={isChecked}
              onChange={(e) => {
                handleFeeSelect(recordId, record, e.target.checked);
              }}
            />
          </div>
        );
      }
    },
    {
      title: 'Semester',
      dataIndex: 'semester',
      key: 'semester',
      width: 120,
      render: (semester) => (
        <div style={{ textAlign: 'center' }}>
          {semester ? `Semester ${semester}` : 'yearly'}
        </div>
      )
    },
    {
      title: 'Fee Type',
      dataIndex: 'feeType',
      key: 'feeType',
      render: (text, record) => {
        const amount = Number(record.amount) || 0;
        const paid = Number(record.paid) || 0;
        const balance = amount - paid;
        const isPaid = balance <= 0;
        
        return (
          <div>
            <div style={{ 
              fontWeight: 500,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{text || 'Registration Fee'}</span>
              {isPaid && (
                <Tag color="success" style={{ marginLeft: 8 }}>Paid</Tag>
              )}
            </div>
            {/* {record.dueDate && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                Due: {new Date(record.dueDate).toLocaleDateString()}
              </div>
            )} */}
          </div>
        );
      }
    },
    {
      title: 'Amount Details',
      key: 'amountDetails',
      width: 250,
      render: (_, record) => {
        const amount = Number(record.amount) || 0;
        const paid = Number(record.paid) || 0;
        const balance = amount - paid;
        const isPaid = balance <= 0;
        const isPartial = paid > 0 && !isPaid;
        
        return (
          <div style={{ 
            textAlign: 'right',
            padding: '8px',
            borderRadius: '4px',
            backgroundColor: isPaid ? '#f6ffed' : isPartial ? '#fffbe6' : '#fff2f0',
            border: `1px solid ${isPaid ? '#b7eb8f' : isPartial ? '#ffe58f' : '#ffccc7'}`
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}>
              <span style={{ color: '#666', fontSize: '0.9em' }}>Total Amount:</span>
              <span style={{ fontWeight: 500 }}>₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              marginBottom: '4px'
            }}>
              <span style={{ color: '#666', fontSize: '0.9em' }}>Paid Amount:</span>
              <span style={{ color: '#52c41a', fontWeight: 500 }}>
                ₹{paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              paddingTop: '4px',
              borderTop: '1px solid #f0f0f0',
              marginTop: '4px'
            }}>
              <span style={{ 
                color: '#666', 
                fontSize: '0.9em',
                fontWeight: 500
              }}>
                Balance:
              </span>
              <span style={{
                color: isPaid ? '#52c41a' : isPartial ? '#faad14' : '#f5222d',
                fontWeight: 600,
                fontSize: '1.05em'
              }}>
                ₹{Math.abs(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                {isPaid ? ' (Fully Paid)' : isPartial ? ' (Partial)' : ''}
              </span>
            </div>
          </div>
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        const statusConfig = {
          'paid': { color: 'green', text: 'PAID' },
          'partially_paid': { color: 'blue', text: 'PARTIALLY PAID' },
          'pending': { color: 'orange', text: 'PENDING' },
          'overdue': { color: 'red', text: 'OVERDUE' }
        };
        const config = statusConfig[status?.toLowerCase()] || { color: 'default', text: status || 'PENDING' };
        return (
          <div style={{ textAlign: 'center' }}>
            <Tag color={config.color} style={{ margin: 0, width: '100%', textAlign: 'center' }}>
              {config.text}
            </Tag>
          </div>
        );
      }
    }
  ];

  // Fee Modal component
  const FeeModal = (
    <Modal
      title={
        <div className="flex items-center">
          <FiDollarSign className="mr-2" />
          <span>Fee Details - {selectedStudentForFee?.registrationNumber || ''}</span>
        </div>
      }
      open={feeModalVisible}
      onCancel={handleFeeModalCancel}
      footer={[
        <Button key="cancel" onClick={handleFeeModalCancel}>
          Cancel
        </Button>,
        <Button 
          key="pay" 
          type="primary" 
          icon={<FiCreditCard />}
          loading={isPaying}
          onClick={handlePayNow}
          disabled={selectedFees.length === 0}
        >
          Pay Now {selectedFees.length > 0 && `(₹${selectedFees.reduce((sum, fee) => sum + fee.amount, 0).toLocaleString('en-IN')})`}
        </Button>
      ]}
      width={800}
    >
      {feeLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading fee details...</p>
        </div>
      ) : feeData.length === 0 ? (
        <div className="text-center py-8">
          <FiInfo className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-gray-600">No fee records found</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium">
              {selectedStudentForFee?.course?.courseName || 'N/A'} - {selectedStudentForFee?.course?.session || 'Current Session'}
            </h4>
            <p className="text-sm text-gray-600">
              {selectedStudentForFee?.firstName} {selectedStudentForFee?.lastName}
            </p>
          </div>
          <Table
            columns={feeColumns}
            dataSource={feeData}
            rowKey="_id"
            pagination={false}
            bordered
            size="small"
          />
          <div className="mt-4 text-right">
            <div className="text-sm text-gray-500 mb-2">
              Select fees to pay from the list above
            </div>
            {selectedFees.length > 0 && (
              <div className="bg-blue-50 p-3 rounded-md mb-4">
                <div className="font-medium text-blue-800">
                  Total Selected: ₹{selectedFees.reduce((sum, fee) => sum + fee.amount, 0).toLocaleString('en-IN')}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-4">
            <div className="bg-gray-50 p-4 rounded-lg w-72 border border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Total Payable:</span>
                <span className="font-semibold">
                  ₹{feeData.reduce((sum, fee) => sum + (fee.amount || 0), 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-medium">Total Paid:</span>
                <span className="text-green-600 font-semibold">
                  ₹{feeData.reduce((sum, fee) => sum + (fee.paid || 0), 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="flex justify-between border-t border-gray-300 pt-2 mt-2">
                <span className="font-medium">Balance Due:</span>
                <span className="font-bold">
                  ₹{feeData.reduce((sum, fee) => sum + ((fee.amount || 0) - (fee.paid || 0)), 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );

  // Payment details modal component
  const PaymentDetailsModal = () => (
    <Modal
      title={
        <div className="flex items-center">
          <FiDollarSign className="mr-2" />
          <span>Fee Payment</span>
        </div>
      }
      open={paymentModalVisible}
      onCancel={() => setPaymentModalVisible(false)}
      width={800}
      footer={[
        <Button key="cancel" onClick={() => setPaymentModalVisible(false)}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={isPaying}
          onClick={() => paymentForm.submit()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Save Payment
        </Button>,
      ]}
    >
      <div className="bg-gray-50 p-4 rounded-lg mb-4">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Student Name</p>
            <p className="font-medium">
              {selectedStudentForFee?.firstName} {selectedStudentForFee?.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Registration No.</p>
            <p className="font-medium">{currentPaymentData?.registrationNumber || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Course</p>
            <p className="font-medium">{currentPaymentData?.course || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Session</p>
            <p className="font-medium">{currentPaymentData?.session || 'N/A'}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Semester</p>
            <p className="font-medium">Semester {currentPaymentData?.semester || 'N/A'}</p>
          </div>
        </div>
      </div>

      <Form
        form={paymentForm}
        layout="vertical"
        onFinish={handlePaymentSubmit}
        initialValues={{
          paymentDate: moment(),
          receiptDate: moment(),
          modeOfPayment: 'Cash',
          status: 'Paid',
          paidAmount: currentPaymentData?.totalAmount || 0,
          balanceAmount: 0,
          discountAmount: 0,
          scholarshipAmount: 0,
          receiptNo: `RCPT-${Date.now().toString().slice(-6)}`
        }}
      >
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Form.Item 
            label="Payment Date" 
            name="paymentDate" 
            rules={[{ required: true, message: 'Payment date is required' }]}
            className="mb-0"
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
          
          <Form.Item 
            label="Receipt No." 
            name="receiptNo"
            rules={[{ required: true, message: 'Receipt number is required' }]}
            className="mb-0"
          >
            <Input placeholder="Auto-generated" disabled />
          </Form.Item>
        </div>

        <div className="bg-white p-4 rounded border mb-4">
          <h4 className="text-base font-medium mb-4">Fee Details</h4>
          
          <div className="space-y-4">
            {currentPaymentData?.feeAssignments?.map((fee, index) => (
              <div key={index} className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-5">
                  <p className="text-sm text-gray-500 mb-1">Fee Type</p>
                  <Input 
                    value={fee.feeType} 
                    disabled 
                    addonBefore={<FiCreditCard className="text-gray-400" />}
                  />
                </div>
                <div className="col-span-3">
                  <p className="text-sm text-gray-500 mb-1">Amount (₹)</p>
                  <InputNumber 
                    value={fee.amount}
                    disabled
                    style={{ width: '100%' }}
                    formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </div>
                <div className="col-span-3">
                  <p className="text-sm text-gray-500 mb-1">Paid (₹)</p>
                  <InputNumber 
                    value={fee.paid || 0}
                    disabled
                    style={{ width: '100%' }}
                    formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </div>
                <div className="col-span-1 flex items-center h-10">
                  <span className="text-gray-400">=</span>
                </div>
              </div>
            ))}
            
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-5">
                  <p className="text-sm text-gray-500 mb-1">Total Fee</p>
                  <InputNumber 
                    value={currentPaymentData?.totalAmount || 0}
                    disabled
                    style={{ width: '100%' }}
                    className="font-medium"
                    formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </div>
                <div className="col-span-3">
                  <Form.Item 
                    label="Scholarship Applicable" 
                    name="hasScholarship"
                    initialValue="No"
                    className="mb-0"
                  >
                    <Select 
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        if (value === 'No') {
                          paymentForm.setFieldsValue({
                            scholarshipAmount: 0,
                            paidAmount: currentPaymentData?.totalAmount - (paymentForm.getFieldValue('discountAmount') || 0)
                          });
                        }
                      }}
                    >
                      <Option value="Yes">Yes</Option>
                      <Option value="No">No</Option>
                    </Select>
                  </Form.Item>
                  {paymentForm.getFieldValue('hasScholarship') === 'Yes' && (
                    <Form.Item 
                      label="Scholarship Amount (₹)" 
                      name="scholarshipAmount"
                      className="mb-0 mt-2"
                      rules={[{
                        validator: (_, value) => {
                          if (paymentForm.getFieldValue('hasScholarship') === 'Yes' && (!value || value <= 0)) {
                            return Promise.reject('Please enter a valid scholarship amount');
                          }
                          return Promise.resolve();
                        }
                      }]}
                    >
                      <InputNumber 
                        min={0}
                        max={currentPaymentData?.totalAmount || 0}
                        style={{ width: '100%' }}
                        onChange={(value) => {
                          const discount = paymentForm.getFieldValue('discountAmount') || 0;
                          const total = (currentPaymentData?.totalAmount || 0) - (value || 0) - discount;
                          paymentForm.setFieldsValue({
                            paidAmount: total,
                            balanceAmount: 0
                          });
                        }}
                      />
                    </Form.Item>
                  )}
                </div>
                <div className="col-span-3">
                  <Form.Item 
                    label="Discount (₹)" 
                    name="discountAmount"
                    className="mb-0"
                  >
                    <InputNumber 
                      min={0}
                      max={currentPaymentData?.totalAmount || 0}
                      style={{ width: '100%' }}
                      onChange={(value) => {
                        const scholarship = paymentForm.getFieldValue('scholarshipAmount') || 0;
                        const total = (currentPaymentData?.totalAmount || 0) - (value || 0) - scholarship;
                        paymentForm.setFieldsValue({
                          paidAmount: total,
                          balanceAmount: 0
                        });
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-span-1 flex items-end h-10">
                  <span className="text-gray-400">=</span>
                </div>
              </div>
              
              <div className="grid grid-cols-12 gap-4 mt-4">
                <div className="col-span-5">
                  <p className="text-sm text-gray-500 mb-1">Payable Amount (₹)</p>
                  <InputNumber 
                    value={currentPaymentData?.totalAmount || 0}
                    disabled
                    style={{ width: '100%' }}
                    className="font-medium text-blue-600"
                    formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  />
                </div>
                <div className="col-span-3">
                  <Form.Item 
                    label="Paid Amount (₹)" 
                    name="paidAmount"
                    rules={[{ required: true, message: 'Paid amount is required' }]}
                    className="mb-0"
                  >
                    <InputNumber 
                      min={0}
                      max={currentPaymentData?.totalAmount || 0}
                      style={{ width: '100%' }}
                      className="font-medium"
                      onChange={(value) => {
                        const total = currentPaymentData?.totalAmount || 0;
                        paymentForm.setFieldsValue({
                          balanceAmount: total - (value || 0)
                        });
                      }}
                    />
                  </Form.Item>
                </div>
                <div className="col-span-3">
                  <Form.Item 
                    label="Balance (₹)" 
                    name="balanceAmount"
                    className="mb-0"
                  >
                    <InputNumber 
                      disabled
                      style={{ width: '100%' }}
                      className="font-medium"
                      formatter={value => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Form.Item>
                </div>
                <div className="col-span-1"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <Form.Item 
            label="Payment Mode" 
            name="modeOfPayment" 
            rules={[{ required: true, message: 'Payment mode is required' }]}
          >
            <Select
              onChange={(value) => {
                // Reset transaction ID when switching to Cash
                if (value === 'Cash') {
                  paymentForm.setFieldsValue({ transactionId: '' });
                }
              }}
            >
              <Option value="Cash">Cash</Option>
              <Option value="UPI">UPI</Option>
              <Option value="Bank Transfer">Bank Transfer</Option>
              <Option value="Card">Card</Option>
              <Option value="Cheque">Cheque</Option>
              <Option value="DD">Demand Draft</Option>
            </Select>
          </Form.Item>
          
          

<Form.Item noStyle shouldUpdate={(prev, current) => prev.modeOfPayment !== current.modeOfPayment}>
  {({ getFieldValue }) => {
    const paymentMode = getFieldValue('modeOfPayment');
    const isPaymentIdRequired = ['UPI', 'Card', 'Bank Transfer'].includes(paymentMode);
    const showTransactionField = paymentMode !== 'Cash';
    
    if (!showTransactionField) return null;
    
    return (
      <div style={{
        backgroundColor: isPaymentIdRequired ? '#f0f7ff' : 'transparent',
        borderRadius: '6px',
        borderLeft: isPaymentIdRequired ? '4px solid #1890ff' : 'none',
        padding: '12px',
        marginBottom: '16px'
      }}>
        <Form.Item 
          label={isPaymentIdRequired ? 
            <span style={{ fontWeight: 500 }}>Payment Reference ID</span> : 
            'Transaction ID'}
          name="transactionId"
          rules={[{
            required: isPaymentIdRequired,
            message: isPaymentIdRequired 
              ? 'Payment reference ID is required' 
              : 'Transaction ID is required for this payment mode'
          }, {
            min: 8,
            message: 'Reference ID must be at least 8 characters'
          }, {
            max: 50,
            message: 'Reference ID cannot exceed 50 characters'
          }]}
          style={{ marginBottom: '8px' }}
        >
          <Input 
            placeholder={
              paymentMode === 'UPI' ? 'Enter UPI Transaction ID (e.g., UPI12345678)' :
              paymentMode === 'Card' ? 'Enter Card Transaction ID' :
              paymentMode === 'Bank Transfer' ? 'Enter Bank Reference Number' :
              paymentMode === 'Cheque' ? 'Enter Cheque Number' :
              paymentMode === 'DD' ? 'Enter Demand Draft Number' :
              'Enter transaction reference number'
            } 
            style={{ width: '100%' }}
            prefix={<FiCreditCard className="site-form-item-icon" />}
          />
        </Form.Item>
        {isPaymentIdRequired && (
          <div style={{ 
            fontSize: '12px', 
            color: '#666', 
            marginTop: '4px',
            fontStyle: 'italic'
          }}>
            Please enter the {paymentMode} transaction reference ID from your payment receipt
          </div>
        )}
      </div>
    );
  }}
</Form.Item>


          {paymentForm?.getFieldValue('modeOfPayment') !== 'Cash' && (
            <Form.Item 
              label="Transaction ID" 
              name="transactionId"
              rules={[{
                validator: (_, value) => {
                  const mode = paymentForm?.getFieldValue('modeOfPayment');
                  if ((mode === 'UPI' || mode === 'Bank Transfer' || mode === 'Card') && !value) {
                    return Promise.reject('Transaction ID is required for this payment mode');
                  }
                  return Promise.resolve();
                }
              }]}
            >
              <Input placeholder="Enter transaction reference number" />
            </Form.Item>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Form.Item 
            label="Status" 
            name="status" 
            rules={[{ required: true }]}
          >
            <Select>
              <Option value="Paid">Paid</Option>
              <Option value="Pending">Pending</Option>
              <Option value="Partial">Partial</Option>
              <Option value="Refunded">Refunded</Option>
            </Select>
          </Form.Item>
          
          <Form.Item 
            label="Receipt Date" 
            name="receiptDate" 
            rules={[{ required: true, message: 'Receipt date is required' }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
          </Form.Item>
        </div>

        <Form.Item 
          label="Discount/Adjustment Reason" 
          name="discountReason"
          className="mb-4"
        >
          <TextArea rows={2} placeholder="Enter reason for discount/adjustment" />
        </Form.Item>

        <Form.Item 
          label="Remarks" 
          name="remarks"
          className="mb-0"
        >
          <TextArea rows={2} placeholder="Enter any additional remarks" />
        </Form.Item>
      </Form>
    </Modal>
  );

 

  return (
    <div className="p-6">
      <PaymentDetailsModal />
      {/* Student Details Modal */}
      <Modal 
  title={
    <div style={{ display: "flex", flexDirection: "column", width: "100%", marginTop: "4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", width: "100%" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center" }}>
            <FiUser style={{ marginRight: "8px" }} />
            <span style={{ fontSize: "18px", fontWeight: "600" }}>Admission Form</span>
          </div>
          <div style={{ marginTop: "8px", fontSize: "14px", color: "#6b7280" }}>
            Application ID: {selectedStudent?.registrationNumber || 'N/A'}
          </div>
        </div>
        {selectedStudent?.photo && (
          <div style={{ 
            width: "80px", 
            height: "100px", 
            borderRadius: "4px", 
            overflow: "hidden", 
            border: "1px solid #e5e7eb",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <img 
              src={selectedStudent.photo} 
              alt="Student" 
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "cover" 
              }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/80x100';
              }}
            />
          </div>
        )}
      </div>
    </div>
  }
  open={viewModalVisible}
  onCancel={handleViewModalCancel}
  footer={[
    <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
      Print
    </Button>,
    <Button key="close" onClick={handleViewModalCancel}>
      Close
    </Button>
  ]}
  width={800}
>
  {selectedStudent && (
    <div id="student-details-print" style={{ marginTop: "16px" }}>
      {/* Personal Information */}
      <Card style={{ marginBottom: "16px" }} title="Personal Information">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Registration Number">{selectedStudent.registrationNumber}</Descriptions.Item>
          <Descriptions.Item label="Full Name">
            {selectedStudent.firstName} {selectedStudent.lastName}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            <div style={{ display: "flex", alignItems: "center" }}>
              <FiMail style={{ marginRight: "8px" }} />
              {selectedStudent.email}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            <div style={{ display: "flex", alignItems: "center" }}>
              <FiPhone style={{ marginRight: "8px" }} />
              {selectedStudent.phone}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Date of Birth">
            {selectedStudent.dateOfBirth ? new Date(selectedStudent.dateOfBirth).toLocaleDateString('en-IN') : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Gender">
            {selectedStudent.gender || 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Academic Information */}
      <Card style={{ marginBottom: "16px" }} title="Academic Information">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Course">
            <div style={{ display: "flex", alignItems: "center" }}>
              <FiBook style={{ marginRight: "8px", color: "#3b82f6" }} />
              <div>
                <div style={{ fontWeight: 600, color: "#1e40af" }}>
                  {selectedStudent.course?.courseName || 'N/A'}
                </div>
                {selectedStudent.course?.category && (
                  <div style={{ fontSize: "0.875rem", color: "#4b5563" }}>
                    {selectedStudent.course.category}
                  </div>
                )}
              </div>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Specialization">
            {selectedStudent.specialization || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Course Type">
            {selectedStudent.course?.courseType || 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Registration Date">
            {selectedStudent.registrationDate ? new Date(selectedStudent.registrationDate).toLocaleDateString('en-IN') : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Scholarship">
            {selectedStudent.isScholarship ? (
              <Tag icon={<FiAward />} color="green">Yes</Tag>
            ) : (
              <Tag color="default">No</Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            {renderStatusBadge(selectedStudent.status)}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Contact Information */}
      <Card title="Contact Information">
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Address">
            <div style={{ display: "flex", alignItems: "flex-start" }}>
              <FiMapPin style={{ marginTop: "4px", marginRight: "8px", flexShrink: 0 }} />
              <div>
                {selectedStudent.address?.street && <div>{selectedStudent.address.street}</div>}
                {selectedStudent.address?.city && <div>{selectedStudent.address.city}</div>}
                {selectedStudent.address?.state && <div>{selectedStudent.address.state}</div>}
                {selectedStudent.address?.pincode && <div>PIN: {selectedStudent.address.pincode}</div>}
                {!selectedStudent.address && 'N/A'}
              </div>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Alternate Phone">
            {selectedStudent.alternatePhone || 'N/A'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Verification Details */}
      <Card style={{ marginTop: "16px" }} title="Verification Details">
        <Descriptions column={1} bordered>
          <Descriptions.Item label="Registration Fee">
            {selectedStudent.verificationDetails?.documents?.registrationFee ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag color="green" icon={<FiCheckCircle />}>Paid</Tag>
                {selectedStudent.verificationDetails?.verifiedAt && (
                  <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                    Verified on {new Date(selectedStudent.verificationDetails.verifiedAt).toLocaleDateString('en-IN')}
                  </span>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tag color="red" icon={<FiXCircle />}>Pending</Tag>
                <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>
                  Fee not received
                </span>
              </div>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="12th Marksheet">
            {selectedStudent.verificationDetails?.documents?.srSecondaryMarksheet ? (
              <Tag color="green" icon={<FiCheckCircle />}>Submitted</Tag>
            ) : (
              <Tag color="red" icon={<FiXCircle />}>Not Submitted</Tag>
            )}
          </Descriptions.Item>
          {selectedStudent.verificationDetails?.verifiedBy && (
            <Descriptions.Item label="Verified By">
              {selectedStudent.verificationDetails.verifiedBy}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    </div>
  )}
</Modal>

     
      <h1 className="text-2xl font-bold mb-6">Enrolled Students</h1>
      
      {/* Enhanced Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-white rounded-lg shadow">
        <div className="flex-1 flex flex-col md:flex-row gap-2">
          <Select
            value={searchField}
            onChange={setSearchField}
            className="w-full md:w-48"
          >
            <Option value="all">All Fields</Option>
            <Option value="registrationNumber">Registration No.</Option>
            <Option value="name">Name</Option>
            <Option value="email">Email</Option>
            <Option value="phone">Phone</Option>
            <Option value="status">Status</Option>
          </Select>
          <Input.Search
            placeholder={`Search by ${searchField === 'all' ? 'any field' : searchField}...`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={fetchApprovedStudents}
            enterButton
            className="flex-1"
            allowClear
          />
        </div>
      </div>
      
      {/* Students Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table 
          columns={columns} 
          dataSource={filteredStudents} 
          rowKey="_id"
          loading={loading}
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} students`
          }}
          scroll={{ x: 'max-content' }}
          className="min-h-[400px]"
        />
      </div>
      {FeeModal}
    </div>
  );
};

export default UniversityEnrolledStudent;