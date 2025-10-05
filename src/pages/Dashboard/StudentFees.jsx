import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { Modal, Button, Input, Tag, Divider } from 'antd';
import { LoadingOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_URL } from '../../services/config';
import moment from 'moment';

const StudentFees = () => {
  const [feeDetails, setFeeDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [feeModalVisible, setFeeModalVisible] = useState(false);
  const [feeData, setFeeData] = useState([]);
  const [feeLoading, setFeeLoading] = useState(false);
  const [selectedStudentForFee, setSelectedStudentForFee] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedFees, setSelectedFees] = useState([]);
  const { token, user, isAdmin } = useSelector((state) => ({
    token: state.auth.token,
    user: state.profile.user
  }));
  
  const navigate = useNavigate();

  const fetchStudentStatus = async () => {
    try {
      const response = await axios.get(`${API_URL}/university/registered-students/my-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      return response.data?.data;
    } catch (error) {
      console.error('Error fetching student status:', error);
      throw error;
    }
  };

  const fetchFeeDetails = async (student) => {
    try {
      if (!student) {
        console.error('❌ [fetchFeeDetails] No student data provided');
        throw new Error('Student information is missing');
      }

      setFeeLoading(true);
      setFeeData([]); // Clear previous data
      setSelectedFees([]);
      setFeeDetails(null);
      
      // Get student data from the response
      const studentData = student.data || student;
      console.log('📝 [fetchFeeDetails] Student data:', studentData);
  
      // Check if student has a course
      if (!studentData.course) {
        console.warn('⚠️ [fetchFeeDetails] Student is not enrolled in any course');
        throw new Error('You are not enrolled in any course');
      }
  
      // Get course ID, handling both object and string formats
      const courseId = studentData.course._id || studentData.course;
      console.log('📚 [fetchFeeDetails] Course ID:', courseId);
  
      const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
      const feeUrl = `${baseUrl}/university/payments/fee-details/${studentData._id}`;
      console.log('💰 [fetchFeeDetails] Fetching fee details from:', feeUrl);
      
      const feeResponse = await axios.get(feeUrl, {
        params: { 
          courseId: courseId.toString(),
          includeCourse: true
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true,
        timeout: 10000
      });

      if (feeResponse.data?.success) {
        console.log('📦 [fetchFeeDetails] Fee data received');
        
        // Process the fee data
        const formattedData = (feeResponse.data.data || []).map((item, index) => {
          if (!item) {
            console.warn(`⚠️ [fetchFeeDetails] Undefined fee item at index ${index}`);
            return null;
          }

          // Calculate paid amount
          const amount = Number(item.amount) || 0;
          let paid = 0;
          
          if (item.payments && Array.isArray(item.payments)) {
            paid = item.payments.reduce((sum, payment) => {
              return sum + (Number(payment.paidAmount) || 0);
            }, 0);
          }

          const balance = amount - paid;
          const status = balance <= 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Unpaid');

          return {
            id: item.id || item._id || `temp-${Date.now()}-${index}`,
            key: item.id || item._id || `temp-${Date.now()}-${index}`,
            feeType: item.feeType?.name || 'General Fee',
            amount: amount,
            paid: paid,
            balance: Math.max(0, balance),
            status: status,
            dueDate: item.dueDate ? moment(item.dueDate).format('DD/MM/YYYY') : 'N/A',
            semester: item.semester || 'N/A',
            session: item.session || 'N/A',
            _raw: item // Keep original data for reference
          };
        }).filter(Boolean);

        console.log('✅ [fetchFeeDetails] Processed fee data:', formattedData);
        setFeeData(formattedData);
        setSelectedFees(formattedData);
        
        // Calculate totals for feeDetails
        const totalAmount = formattedData.reduce((sum, fee) => sum + (fee.amount || 0), 0);
        const totalPaid = formattedData.reduce((sum, fee) => sum + (fee.paid || 0), 0);
        const totalBalance = totalAmount - totalPaid;
        
        setFeeDetails({
          ...studentData,
          totalAmount,
          totalPaid,
          totalBalance,
          paidPercentage: totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0,
          feeItems: formattedData
        });
      } else {
        throw new Error(feeResponse.data?.message || 'Failed to fetch fee details');
      }
    } catch (error) {
      console.error('❌ [fetchFeeDetails] Failed to fetch fee details:', error);
      toast.error(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch fee details. Please try again.'
      );
      setFeeData([]);
      setSelectedFees([]);
    } finally {
      setFeeLoading(false);
    }
  };


  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      if (!token || !user?.email) {
        if (isMounted) {
          setLoading(false);
          setFeeLoading(false);
        }
        return;
      }

      try {
        if (isMounted) {
          setLoading(true);
          setFeeLoading(true);
        }
        
        console.log('🔍 [useEffect] Fetching student status...');
        const studentData = await fetchStudentStatus();
        
        if (!isMounted) return;
        
        if (studentData?._id) {
          console.log('✅ [useEffect] Student data loaded:', studentData._id);
          await fetchFeeDetails(studentData);
        } else {
          console.error('❌ [useEffect] Invalid student data received:', studentData);
          throw new Error('Failed to load student information');
        }
      } catch (error) {
        console.error('❌ [useEffect] Error in data fetching sequence:', error);
        if (isMounted) {
          toast.error(error.response?.data?.message || error.message || 'Failed to load student data');
          setFeeData([]);
          setSelectedFees([]);
          setFeeDetails(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setFeeLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      isMounted = false; // Cleanup function to prevent state updates after unmount
    };
  }, [token, user?.email]);

  const handlePayment = async () => {
    const amountToPay = parseFloat(paymentAmount);
    
    // Validate amount
    if (isNaN(amountToPay) || amountToPay <= 0) {
      toast.error('Please enter a valid payment amount');
      return;
    }
    
    // Check if amount exceeds maximum allowed
    const feeBalance = selectedFees.reduce((sum, fee) => sum + (fee.amount - (fee.paid || 0)), 0);
    const maxAmount = Number(feeBalance.toFixed(2));
    
    if (amountToPay > maxAmount) {
      toast.error(`Amount cannot exceed ₹${maxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
      return;
    }

    try {
      setIsProcessingPayment(true);
      
      // Find the first unpaid fee
      const feeToPay = feeData.find(fee => (fee.amount - (fee.paid || 0)) > 0) || {};
      
      // Create order in backend
      console.log('Creating order with amount:', amountToPay, 'for fee:', feeToPay);
      
      let orderResponse;
      try {
        orderResponse = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000'}/api/v1/student-payment/create-order`,
          {
            amount: amountToPay, // Send amount in rupees, will be converted to paise in backend
            currency: 'INR',
            receipt: `rcpt_${Date.now()}`,
            notes: {
              feeType: feeToPay.feeType?.name || 'General Fee',
              feeId: feeToPay._id,
              academicYear: new Date().getFullYear(),
              studentId: user?._id,
              description: `Fee payment for ${user?.name || 'student'}`
            }
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 second timeout
          }
        );
        
        console.log('Order creation response:', orderResponse.data);
      } catch (error) {
        console.error('Order creation failed:', {
          error: error.response?.data || error.message,
          status: error.response?.status,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data
          }
        });
        throw new Error(`Failed to create payment order: ${error.response?.data?.message || error.message}`);
      }

      const { order } = orderResponse.data;
      
      // Load Razorpay script
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = async () => {
        const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_k4DTmfJOt3egOc';
        console.log('Using Razorpay Key:', razorpayKey);
        
        if (!razorpayKey) {
          console.error('Razorpay key ID is not set in environment variables');
          toast.error('Payment configuration error. Please try again later.');
          setIsProcessingPayment(false);
          return;
        }

        // Convert amount from paise to rupees for display
        const balanceInRupees = (feeToPay.amount - (feeToPay.paid || 0)) / 100;
        const balanceFee = balanceInRupees.toLocaleString('en-IN', {
          maximumFractionDigits: 2,
          minimumFractionDigits: 2
        });
        
        const options = {
          key: razorpayKey,
          amount: order.amount, // This should be in paise (handled by backend)
          currency: order.currency,
          name: 'University Fee Payment',
          description: `Amount: ₹${amountToPay.toFixed(2)} | ${feeToPay.feeType?.name || 'Fee Payment'}`,
          theme: {
            display_currency: 'INR',
            display_amount: amountToPay, // Display amount in rupees
            currency: 'INR'
          },
          notes: {
            feeType: feeToPay.feeType?.name || 'General Fee',
            feeId: feeToPay._id,
            balanceFee: balanceFee
          },
          order_id: order.id,
          handler: async function(response) {
            console.log('Verifying payment with:', {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature
            });

            try {
              // Verify payment on your server
              console.log('Sending verification request to server...');
              console.log('Verification data:', {
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature
              });
              
              const verifyResponse = await axios.post(
                `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000'}/api/v1/student-payment/verify`,
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                },
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                  },
                  withCredentials: true,
                  timeout: 10000 // 10 second timeout
                }
              );
              
              console.log('Verification response:', verifyResponse.data);
              
              if (verifyResponse.data && verifyResponse.data.success) {
                toast.success('Payment successful! You will receive a confirmation email shortly. Please show the payment receipt at the accounts office if required.');
                // Don't refresh the fee data to prevent UI update
                setPaymentAmount('');
                setFeeModalVisible(false);
                
                // Log success for debugging
                console.log('Payment verified and processed successfully');
                
                // Return early to prevent the error toast from showing
                return;
              } else {
                throw new Error(verifyResponse.data?.message || 'Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                config: error.config ? {
                  url: error.config.url,
                  method: error.config.method,
                  headers: error.config.headers
                } : null
              });
              
              // Show more detailed error to user
              const errorMessage = error.response?.data?.message || error.message || 'Payment verification failed';
              toast.error(`Payment verification failed: ${errorMessage}`);
              
              // Log the full error for debugging
              console.error('Payment verification error details:', error);
            }
          },
          prefill: {
            name: user?.name || '',
            email: user?.email || '',
            contact: user?.phone || ''
          },
          theme: {
            color: '#4F46E5'
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function(response) {
          console.error('Payment failed:', response.error);
          toast.error(`Payment failed: ${response.error.description || 'Unknown error'}`);
        });
        
        rzp.open();
      };
      
      document.body.appendChild(script);
      
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error(error.response?.data?.message || error.message || 'Failed to process payment');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleOpenFeeModal = async (student) => {
    try {
      setFeeLoading(true);
      setSelectedStudentForFee(student);
      setFeeModalVisible(true);
      
      // Fetch fresh fee data when opening the modal
      const courseId = student.course?._id || feeDetails.course?._id;
      if (!courseId) {
        toast.error('Course information not found');
        return;
      }

      const response = await axios.get(
        `${API_URL}/university/payments/fee-details/${student._id}`,
        {
          params: { courseId },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.success) {
        const feeData = Array.isArray(response.data.data) ? response.data.data : [];
        setFeeData(feeData.map(item => {
          const amount = Number(item.amount) || 0;
          const paid = (item.payments && Array.isArray(item.payments)) 
            ? item.payments.reduce((sum, p) => sum + (Number(p.paidAmount) || 0), 0)
            : (Number(item.paid) || 0);
            
          return {
            ...item,
            feeType: typeof item.feeType === 'object' ? item.feeType : { name: item.feeType || 'General Fee' },
            amount,
            paid,
            balance: amount - paid,
            status: amount <= paid ? 'Paid' : paid > 0 ? 'Partial' : 'Unpaid'
          };
        }));
      }
    } catch (error) {
      console.error('Error fetching fee details for modal:', error);
      toast.error('Failed to load fee details');
    } finally {
      setFeeLoading(false);
    }
  };

  const renderFeeModal = () => {
    const feeBalance = selectedFees.reduce((sum, fee) => sum + (fee.amount - (fee.paid || 0)), 0);
    const maxAmount = Number(feeBalance.toFixed(2));
    
    return (
      <Modal
        title={`Make Payment - ${selectedStudentForFee?.name || 'Student'}`}
        open={feeModalVisible}
        onCancel={() => setFeeModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setFeeModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="pay"
            type="primary"
            loading={isProcessingPayment}
            onClick={handlePayment}
            disabled={!paymentAmount || isProcessingPayment || parseFloat(paymentAmount) > maxAmount}
          >
            {isProcessingPayment ? 'Processing...' : 'Make Payment'}
          </Button>,
        ]}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <h4>Student Information</h4>
          <p><strong>Name:</strong> {selectedStudentForFee?.name}</p>
          <p><strong>Registration No:</strong> {selectedStudentForFee?.registrationNumber}</p>
        </div>

        <Divider />

        <div style={{ marginBottom: 16 }}>
          <h4>Payment Amount</h4>
          <div style={{ marginBottom: 16 }}>
            <Input
              type="number"
              placeholder="Enter amount to pay"
              prefix="₹"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              style={{ width: '100%' }}
              min="1"
              max={maxAmount}
              step="0.01"
            />
            <p style={{ marginTop: 8, color: '#666' }}>
              Maximum payable amount: ₹{maxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            {paymentAmount && parseFloat(paymentAmount) > maxAmount && (
              <p style={{ color: 'red', marginTop: 8 }}>
                Amount cannot exceed ₹{maxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              backgroundColor: '#f8fafc', 
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '12px',
                paddingBottom: '12px',
                borderBottom: '1px dashed #e2e8f0'
              }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Total Fee Amount</span>
                <span style={{ fontWeight: '600', fontSize: '15px' }}>
                  ₹{selectedFees.reduce((sum, fee) => sum + (fee.amount || 0), 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '12px',
                paddingBottom: '12px',
                borderBottom: '1px dashed #e2e8f0'
              }}>
                <span style={{ color: '#64748b', fontSize: '14px' }}>Paid Amount</span>
                <span style={{ color: '#10b981', fontWeight: '500' }}>
                  ₹{selectedFees.reduce((sum, fee) => sum + (fee.paid || 0), 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: '8px'
              }}>
                <span style={{ color: '#1e293b', fontWeight: '600', fontSize: '15px' }}>Balance Amount</span>
                <span style={{ 
                  color: selectedFees.reduce((sum, fee) => sum + (fee.balance || 0), 0) > 0 ? '#ef4444' : '#10b981', 
                  fontWeight: '600',
                  fontSize: '15px'
                }}>
                  ₹{Math.abs(selectedFees.reduce((sum, fee) => sum + (fee.balance || 0), 0)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            
          </div>
        </div>
      </Modal>
    );
  };

  const styles = {
    container: {
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    },
    heading: {
      fontSize: '24px',
      fontWeight: 600,
      marginBottom: '24px',
      color: '#1a365d'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      marginBottom: '24px',
      padding: '24px'
    },
    paymentBanner: {
      backgroundColor: '#e6f7ff',
      border: '1px solid #91d5ff',
      borderRadius: '8px',
      padding: '16px 24px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '24px'
    },
    paymentButton: {
      backgroundColor: '#1890ff',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '8px 16px',
      cursor: 'pointer',
      fontWeight: 500,
      '&:hover': {
        backgroundColor: '#40a9ff'
      }
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      marginTop: '16px',
      '& th, & td': {
        padding: '12px 16px',
        textAlign: 'left',
        borderBottom: '1px solid #f0f0f0'
      },
      '& th': {
        backgroundColor: '#fafafa',
        fontWeight: 500
      },
      '& tr:hover': {
        backgroundColor: '#fafafa'
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading fee details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ 
          backgroundColor: '#fef2f2',
          borderLeft: '4px solid #f87171',
          padding: '16px',
          marginBottom: '24px'
        }}>
          <p style={{ color: '#b91c1c', margin: 0 }}>{error}</p>
        </div>
        <button 
          onClick={fetchFeeDetails}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  // Function to search for university registered students by email
  const searchStudentsByEmail = async (email) => {
    if (!email.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      console.log('🔍 [searchStudentsByEmail] Searching for student with email:', email);
      
      // First, search for the student by email
      const searchResponse = await axios.get(
        `${API_URL}/api/students/search`,
        {
          params: { email },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        }
      );

      if (searchResponse.data?.success && searchResponse.data.data?.length > 0) {
        console.log('✅ [searchStudentsByEmail] Found students:', searchResponse.data.data);
        setSearchResults(Array.isArray(searchResponse.data.data) ? searchResponse.data.data : []);
        
        // Fetch fee details for each student
        const feePromises = searchResults.map(async student => {
          const feeResponse = await axios.get(
            `${API_URL}/university/payments/fee-details/${student._id}`,
            {
              params: {
                courseId: student.course?._id // Send course ID to filter fees
              },
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              withCredentials: true,
              timeout: 10000
            }
          );
          
          if (feeResponse.data?.success) {
            return {
              student,
              feeData: feeResponse.data.data
            };
          } else {
            return {
              student,
              feeData: []
            };
          }
        });
        
        const feeResults = await Promise.all(feePromises);
        setSearchResults(feeResults.map(result => result.student));
        setFeeData(feeResults.map(result => result.feeData).flat());
      } else {
        console.log('ℹ️ [searchStudentsByEmail] No students found with email:', email);
        setSearchResults([]);
        toast('No students found with this email', { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('❌ [searchStudentsByEmail] Error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error searching students';
      console.error('Error details:', {
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
      });
    } finally {
      setSearchLoading(false);
    }
  };

  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const email = e.target.value;
    setSearchEmail(email);
    
    // Simple debounce to avoid too many API calls
    const timer = setTimeout(() => {
      searchStudentsByEmail(email);
    }, 500);
    
    return () => clearTimeout(timer);
  };

  // Handle student selection from search results
  const handleStudentSelect = async (student) => {
    try {
      setFeeLoading(true);
      setSelectedStudentForFee(student);
      setSearchEmail('');
      setSearchResults([]);
      
      if (!student.course?._id) {
        console.error('❌ [handleStudentSelect] Student course ID is missing');
        toast.error('Student course information is missing');
        setFeeData([]);
        return;
      }
      
      const url = `${API_URL}/university/payments/fee-details/${student._id}`;
      console.log('🔍 [handleStudentSelect] Fetching fee details from:', url);
      console.log('👤 [handleStudentSelect] Student ID:', student._id);
      console.log('📚 [handleStudentSelect] Student Course ID:', student.course._id);
      
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
        console.log('📦 [handleStudentSelect] Raw fee data from backend:', 
          JSON.stringify(response.data.data, null, 2));
        
        if (!Array.isArray(response.data.data)) {
          console.error('❌ [handleStudentSelect] Expected array but got:', typeof response.data.data);
          throw new Error('Invalid data format: expected array of fee items');
        }
        
        // Format the fee data from the backend
        const formattedData = response.data.data
          .filter(feeItem => feeItem.course?._id === student.course._id)
          .map((item, index) => {
            const feeTypeName = item.feeType?.name || 'General Fee';
            const feeId = item.id || item._id || `temp-${Date.now()}-${index}`;
            const amount = Number(item.amount) || 0;
            
            // Calculate paid amount from payments array if it exists
            let paid = 0;
            if (item.payments && Array.isArray(item.payments)) {
              paid = item.payments.reduce((sum, payment) => {
                return sum + (Number(payment.paidAmount) || 0);
              }, 0);
            } else {
              // Fallback to item.paid if payments array is not available
              paid = Number(item.paid) || 0;
            }
            
            const balance = amount - paid;
            const status = balance <= 0 ? 'Paid' : (paid > 0 ? 'Partial' : 'Unpaid');
            
            return {
              id: feeId,
              key: feeId,
              feeType: feeTypeName,
              feeTypeId: typeof item.feeType === 'object' ? (item.feeType._id || null) : null,
              amount: amount,
              paid: paid,
              balance: Math.max(0, balance), // Ensure balance is not negative
              status: status,
              dueDate: item.dueDate || 'N/A',
              semester: item.semester || 'N/A',
              session: item.session || 'N/A',
              feeAssignmentId: feeId
            };
          });
          
        console.log('📋 [handleStudentSelect] Final formatted fee data:', 
          JSON.stringify(formattedData, null, 2));
          
        setFeeData(formattedData);
        setFeeModalVisible(true);
      } else {
        throw new Error(response.data?.message || 'Failed to fetch fee details');
      }
    } catch (error) {
      console.error('❌ [handleStudentSelect] Error:', error);
      
      let errorMessage = 'Failed to fetch fee details';
      if (error.response) {
        if (error.response.status === 401) {
          errorMessage = 'Session expired. Please log in again.';
        } else if (error.response.status === 404) {
          errorMessage = 'No fee details found for this student';
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
      setFeeData([]);
    } finally {
      setFeeLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />
      <div style={{ marginBottom: '20px' }}>
        <h2 style={styles.heading}>Your Fee Details</h2>
      </div>
      
      {feeLoading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <LoadingOutlined style={{ fontSize: 32, marginBottom: 16 }} />
          <div>Loading fee details...</div>
        </div>
      ) : feeDetails ? (
        <div>
          {/* Student Information */}
          <div style={styles.card}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>Student Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Name</div>
                <div>{feeDetails.name || `${feeDetails.firstName || ''} ${feeDetails.lastName || ''}`.trim() || 'N/A'}</div>
              </div>
              <div>
                <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Registration No</div>
                <div>{feeDetails.registrationNumber || 'N/A'}</div>
              </div>
              {/* <div>
                <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Course</div>
                <div>{typeof feeDetails.course === 'object' ? feeDetails.course.name : feeDetails.course || 'N/A'}</div>
              </div> */}
              {/* <div>
                <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Semester</div>
                <div>{feeDetails.semester || 'N/A'}</div>
              </div>
              <div>
                <div style={{ color: '#6b7280', fontSize: '14px', marginBottom: '4px' }}>Session</div>
                <div>{feeDetails.session || 'N/A'}</div>
              </div> */}
            </div>
          </div>

          {/* Fee Summary */}
          <div style={styles.card}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>Fee Summary</h3>
            {feeData && feeData.length > 0 ? (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px', marginBottom: '24px' }}>
                  <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ color: '#6b7280', marginBottom: '8px' }}>Total Fees</div>
                    <div style={{ fontSize: '24px', fontWeight: 600 }}>
                      ₹{feeData.reduce((sum, fee) => sum + (fee.amount || 0), 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {feeData.length} fee item{feeData.length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
                    <div style={{ color: '#6b7280', marginBottom: '8px' }}>Total Paid</div>
                    <div style={{ fontSize: '24px', fontWeight: 600, color: '#059669' }}>
                      ₹{feeData.reduce((sum, fee) => sum + (fee.paid || 0), 0).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {feeData.filter(fee => fee.paid > 0).length} paid item{feeData.filter(fee => fee.paid > 0).length !== 1 ? 's' : ''}
                    </div>
                  </div>
                  
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '16px', 
                    backgroundColor: feeData.some(fee => fee.balance > 0) ? '#fef2f2' : '#f0fdf4', 
                    borderRadius: '8px' 
                  }}>
                    <div style={{ color: '#6b7280', marginBottom: '8px' }}>Balance Due</div>
                    <div style={{ 
                      fontSize: '24px', 
                      fontWeight: 600, 
                      color: feeData.some(fee => fee.balance > 0) ? '#dc2626' : '#059669' 
                    }}>
                      ₹{feeData.reduce((sum, fee) => sum + (fee.balance > 0 ? fee.balance : 0), 0).toLocaleString()}
                      {feeData.some(fee => fee.balance > 0) ? ' (Due)' : ' (Paid)'}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                      {feeData.filter(fee => fee.balance > 0).length} pending item{feeData.filter(fee => fee.balance > 0).length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                
                {/* Payment Progress */}
                <div style={{ margin: '24px 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Payment Progress</span>
                    <span>{
                      Math.round((feeData.reduce((sum, fee) => sum + (fee.paid || 0), 0) / 
                      Math.max(1, feeData.reduce((sum, fee) => sum + (fee.amount || 0), 1)) * 100))}%</span>
                  </div>
                  <div style={{ 
                    height: '8px', 
                    backgroundColor: '#e5e7eb', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div 
                      style={{ 
                        width: `${Math.min(100, (feeData.reduce((sum, fee) => sum + (fee.paid || 0), 0) / 
                          Math.max(1, feeData.reduce((sum, fee) => sum + (fee.amount || 0), 1)) * 100))}%`,
                        height: '100%',
                        backgroundColor: feeData.every(fee => fee.balance <= 0) ? '#10b981' : '#3b82f6',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                No fee records available to display summary.
              </div>
            )}
          </div>

          {/* Fee Breakdown */}
          <div style={styles.card}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>Fee Breakdown</h3>
            {feeData && feeData.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f3f4f6' }}>
                      <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Fee Type</th>
                      <th style={{ textAlign: 'right', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Amount</th>
                      <th style={{ textAlign: 'right', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Paid</th>
                      <th style={{ textAlign: 'right', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Balance</th>
                      <th style={{ textAlign: 'center', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Status</th>
                      <th style={{ textAlign: 'right', padding: '12px', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeData.map((fee) => (
                      <tr key={fee.id || fee._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 500 }}>{fee.feeType?.name || fee.feeType || 'General Fee'}</div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {fee.semester || 'N/A'} • {fee.session || 'N/A'}
                          </div>
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px' }}>₹{(fee.amount || 0).toLocaleString()}</td>
                        <td style={{ textAlign: 'right', padding: '12px', color: '#10b981' }}>₹{(fee.paid || 0).toLocaleString()}</td>
                        <td style={{ textAlign: 'right', padding: '12px', color: (fee.balance || 0) > 0 ? '#ef4444' : '#10b981' }}>
                          ₹{Math.abs(fee.balance || 0).toLocaleString()}
                        </td>
                        <td style={{ textAlign: 'center', padding: '12px' }}>
                          <Tag 
                            color={
                              fee.status === 'Paid' || fee.balance <= 0 ? 'success' : 
                              fee.status === 'Partial' || fee.paid > 0 ? 'warning' : 'error'
                            }
                            style={{ margin: 0 }}
                          >
                            {fee.status || ((fee.balance || 0) <= 0 ? 'Paid' : (fee.paid > 0 ? 'Partial' : 'Unpaid'))}
                          </Tag>
                        </td>
                        <td style={{ textAlign: 'right', padding: '12px' }}>
                          {(fee.balance || 0) > 0 && (
                            <Button 
                              type="primary" 
                              size="small"
                              onClick={() => {
                                setSelectedFees([fee]);
                                setPaymentAmount(fee.balance);
                                setSelectedStudentForFee(user);
                                setFeeModalVisible(true);
                              }}
                            >
                              Pay Now
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
                No fee records found for this student.
              </div>
            )}
          </div>

          {/* Payment Banner */}
          {feeData && feeData.some(fee => fee.balance > 0) && (
            <div style={{
              backgroundColor: '#eff6ff',
              borderLeft: '4px solid #3b82f6',
              padding: '16px',
              borderRadius: '4px',
              marginBottom: '24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px'
            }}>
              <div>
                <h4 style={{ margin: 0, color: '#1e40af', fontWeight: 500 }}>
                  Outstanding Balance: ₹{feeData.reduce((sum, fee) => sum + (fee.balance > 0 ? fee.balance : 0), 0).toLocaleString()}
                </h4>
                <p style={{ margin: '4px 0 0 0', color: '#3b82f6' }}>
                  Please complete your payment to avoid any late fees.
                </p>
              </div>
              <button 
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  ':hover': {
                    backgroundColor: '#2563eb'
                  }
                }}
                onClick={() => {
                  const unpaidFees = feeData.filter(fee => fee.balance > 0);
                  setSelectedFees(unpaidFees);
                  setPaymentAmount(unpaidFees.reduce((sum, fee) => sum + fee.balance, 0));
                  setFeeModalVisible(true);
                }}
              >
                Pay Now
              </button>
            </div>
          )}
        </div>
      ) : (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '40px', 
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            fontSize: '48px',
            color: '#9ca3af',
            marginBottom: '16px'
          }}>📊</div>
          <h3 style={{ margin: '0 0 8px 0', color: '#111827' }}>No Fee Details Found</h3>
          <p style={{ color: '#6b7280', margin: '0 0 24px 0' }}>
            We couldn't find any fee details for your account.
          </p>
          <button 
            onClick={fetchFeeDetails}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Refresh
          </button>
        </div>
      )}

      {renderFeeModal()}
    </div>
  );
};

export default StudentFees;