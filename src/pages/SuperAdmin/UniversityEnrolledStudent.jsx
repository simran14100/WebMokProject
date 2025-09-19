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
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const { token, user } = useSelector((state) => state.auth);

  const showStudentDetails = (student) => {
    console.log('Selected Student:', student);
    console.log('Student verification details:', student.verificationDetails);
    console.log('Registration fee value:', student.verificationDetails?.registrationFee);
    console.log('Type of registration fee:', typeof student.verificationDetails?.registrationFee);
    console.log('Student Course Session ID:', student.course?.session);
    setSelectedStudent(student);
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
      toast.error(error.response?.data?.message || 'Error processing payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Fetch fee details for a student
  const fetchFeeDetails = async (student) => {
    try {
      setFeeLoading(true);
      setSelectedStudentForFee(student);
      
      const url = `${API_URL}/university/payments/fee-details/${student._id}`;
      console.log('Fetching fee details from:', url);
      console.log('Student ID:', student._id);
      
      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      
      if (response.data?.success) {
        // Format the fee data from the backend
        const formattedData = response.data.data.map(item => {
          // Extract fee type name, default to 'General Fee' if not available
          let feeTypeName = 'General Fee';
          if (item.feeType) {
            if (typeof item.feeType === 'string') {
              feeTypeName = item.feeType;
            } else if (typeof item.feeType === 'object' && item.feeType !== null) {
              feeTypeName = item.feeType.name || 'General Fee';
            }
          }
          
          return {
            id: item.id || item._id,
            key: item.id || item._id,
            feeType: feeTypeName, // Store just the name as a string
            feeTypeId: typeof item.feeType === 'object' ? item.feeType._id : null, // Store the ID separately if needed
            amount: item.amount || 0,
            paid: item.paid || 0,
            balance: item.balance || 0,
            status: item.status || (item.balance <= 0 ? 'paid' : (item.paid > 0 ? 'partial' : 'pending')),
            dueDate: item.dueDate ? moment(item.dueDate).format('DD/MM/YYYY') : 'N/A',
            semester: item.semester || 'N/A',
            session: item.session || 'N/A',
            feeAssignmentId: item.id || item._id
          };
        });
        
        console.log('Formatted fee data:', formattedData);
        setFeeData(formattedData);
        setSelectedFees(formattedData);
      } else {
        // If no data is returned but the request was successful
        setFeeData([]);
        setSelectedFees([]);
      }
      // Always show the modal, even if there's no data
      setFeeModalVisible(true);
    } catch (error) {
      console.error('Error fetching fee details:', error);
      if (error.response?.status === 404) {
        // Handle the case where no fee assignments are found
        setFeeData([]);
        setSelectedFees([]);
        toast('No fee assignments found for this student', { type: 'info' });
      } else {
        toast.error(error.response?.data?.message || 'Error loading fee details');
      }
    } finally {
      setFeeLoading(false);
    }
  };
  
  const handleFeeModalCancel = () => {
    setFeeModalVisible(false);
    setFeeData([]);
    setSelectedStudentForFee(null);
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
  const handleFeeSelect = (feeId, amount, isSelected) => {
    if (isSelected) {
      setSelectedFees([...selectedFees, { id: feeId, amount }]);
    } else {
      setSelectedFees(selectedFees.filter(fee => fee.id !== feeId));
    }
  };

  // Handle payment submission
  const handlePaymentSubmit = async (values) => {
    try {
      setIsPaying(true);
      
      // Get the selected fee assignment to get the feeType ID
      const selectedFeeAssignment = feeData.find(fee => fee._id === selectedFees[0]?.id);
      
      if (!selectedFeeAssignment) {
        throw new Error('No valid fee assignment selected');
      }

      // Prepare payment data
      const paymentData = {
        amount: values.paidAmount || 0,
        paymentMethod: values.modeOfPayment,
        paymentDate: values.paymentDate.toISOString(),
        receiptDate: values.receiptDate.toISOString(),
        remarks: values.remarks || '',
        scholarshipAmount: values.scholarshipAmount || 0,
        discountAmount: values.discountAmount || 0,
        transactionId: values.transactionId || undefined,
        feeType: selectedFeeAssignment.feeTypeId, // Use the preserved feeTypeId
        receiptNo: `RCPT-${Date.now().toString().slice(-6)}`,
        feeAssignmentId: selectedFeeAssignment._id
      };

      // Debug: Log the original API_URL
      console.log('Original API_URL:', API_URL);
      
      // Create a URL object to handle path construction properly
      const baseUrl = new URL(API_URL);
      
      // Remove any existing /api/v1 from the pathname
      let pathname = baseUrl.pathname.replace(/\/api\/v1$/, '');
      
      // Construct the final URL
      const url = new URL(
        `api/v1/university/payments/${currentPaymentData?.studentId}`,
        baseUrl.origin + pathname
      ).toString();
      
      console.log('Constructed URL:', url);
      
      console.log('Making request to:', url);
      console.log('Request data:', paymentData);
      
      // Call the payment API with the full path
      const response = await axios.post(
        url,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true // Ensure cookies are sent with the request
        }
      );

      if (response.data?.success) {
        toast.success('Payment recorded successfully!');
        await fetchFeeDetails(selectedStudentForFee);
        setPaymentModalVisible(false);
        setSelectedFees([]);
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
    const paidAmount = selectedFees.reduce((sum, fee) => sum + (fee.paid || 0), 0);
    const balanceAmount = totalAmount - paidAmount;
    
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
        balance: (fee.amount || 0) - (fee.paid || 0)
      })),
      totalAmount: balanceAmount, // Only the remaining balance to be paid
      paidAmount: 0,
      balanceAmount: balanceAmount,
      paymentDate: new Date().toISOString(),
      receiptDate: new Date().toISOString(),
      modeOfPayment: 'Cash',
      status: balanceAmount > 0 ? 'Partial' : 'Paid',
      remarks: ''
    });

    // Reset form with initial values
    paymentForm.setFieldsValue({
      paymentDate: moment(),
      receiptDate: moment(),
      modeOfPayment: 'Cash',
      status: balanceAmount > 0 ? 'Partial' : 'Paid',
      remarks: '',
      discountReason: '',
      discountAmount: 0,
      scholarshipAmount: 0,
      paidAmount: balanceAmount,
      balanceAmount: 0,
      totalAmount: balanceAmount
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
        const isPaid = (record.amount || 0) - (record.paid || 0) <= 0;
        return (
          <Checkbox 
            disabled={isPaid}
            onChange={(e) => handleFeeSelect(record._id, record.amount - (record.paid || 0), e.target.checked)}
            checked={selectedFees.some(fee => fee.id === record._id)}
          />
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
          {semester ? `Semester ${semester}` : '-'}
        </div>
      )
    },
    {
      title: 'Fee Type',
      dataIndex: 'feeType',
      key: 'feeType',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{text || 'Registration Fee'}</div>
          {record.dueDate && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              Due: {new Date(record.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Amount Details',
      key: 'amountDetails',
      width: 200,
      render: (_, record) => {
        const amount = record.amount || 0;
        const paid = record.paid || 0;
        const balance = amount - paid;
        const isPaid = balance <= 0;
        
        return (
          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: '#666', fontSize: '0.9em' }}>Total: </span>
              <span style={{ fontWeight: 500 }}>₹{amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: '#666', fontSize: '0.9em' }}>Paid: </span>
              <span style={{ color: '#52c41a' }}>₹{paid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 4 }}>
              <span style={{ color: '#666', fontSize: '0.9em' }}>Balance: </span>
              <span style={{
                color: isPaid ? '#52c41a' : '#f5222d',
                fontWeight: 600
              }}>
                ₹{Math.abs(balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                {isPaid && ' (Paid)'}
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