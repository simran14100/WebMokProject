import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../../store/slices/authSlice';
import { apiConnector } from "../../services/apiConnector";
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  DatePicker,
  Row,
  Col,
  message,
  Radio,
  InputNumber,
  Checkbox,
  Upload,
  Avatar,
  Progress,
  Modal,
  Spin,
  notification
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  IdcardOutlined,
  CalendarOutlined,
  HomeOutlined,
  BookOutlined,
  PlusOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  UploadOutlined,
  CameraOutlined,
  EditOutlined,
  DownOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  CreditCardOutlined,
  BankOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';


// Custom hook to force component re-render
const useForceUpdate = () => {
  const [, updateState] = useState();
  return useCallback(() => updateState({}), []);
};

const { Option } = Select;
const { TextArea } = Input;

const NewRegistration = () => {
  const forceUpdate = useForceUpdate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
 // Get auth state from Redux - FIXED: Use consistent naming
 const { token: authToken, user, isAuthenticated } = useSelector((state) => state.auth);
  
  const [showParentFields, setShowParentFields] = useState(true);
  const [showGuardianFields, setShowGuardianFields] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [signatureFile, setSignatureFile] = useState(null);
  const [signaturePreview, setSignaturePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
 
  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);


    // Add debugging for token state
    useEffect(() => {
      console.log('🔍 Token State Debug:', {
        reduxToken: authToken,
        localStorageToken: localStorage.getItem('token'),
        isAuthenticated: isAuthenticated,
        hasUser: !!user
      });
    }, [authToken, isAuthenticated, user]);
  // For photo upload
  const handlePhotoChange = (info) => {
    if (info.file) {
      const file = info.file.originFileObj || info.file;
      if (file instanceof File) {
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setPhotoPreview(e.target.result);
        reader.readAsDataURL(file);
      }
    }
    return false;
  };

  // For signature upload
  const handleSignatureChange = (info) => {
    if (info.file) {
      const file = info.file.originFileObj || info.file;
      if (file instanceof File) {
        setSignatureFile(file);
        const reader = new FileReader();
        reader.onload = (e) => setSignaturePreview(e.target.result);
        reader.readAsDataURL(file);
      }
    }
    return false;
  };

  const beforeUpload = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
      return Upload.LIST_IGNORE;
    }
    
    const maxSizeMB = 10;
    const isLt10M = file.size / 1024 / 1024 < maxSizeMB;
    if (!isLt10M) {
      message.error(`Photo must be smaller than ${maxSizeMB}MB!`);
      return Upload.LIST_IGNORE;
    }
    
    return true;
  };
  
  const beforeUploadSignature = (file) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('You can only upload JPG/PNG files!');
      return Upload.LIST_IGNORE;
    }
    
    const maxSizeMB = 5;
    const isLt5M = file.size / 1024 / 1024 < maxSizeMB;
    if (!isLt5M) {
      message.error(`Signature must be smaller than ${maxSizeMB}MB!`);
      return Upload.LIST_IGNORE;
    }
    
    return true;
  };

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoadingCourses(true);
        const response = await apiConnector("GET", "/api/v1/ugpg/courses");
        setCourses(response?.data?.data || []);
      }catch(error) {
        console.error('Error fetching courses:', error);
        message.error('Failed to load courses');
      } finally {
        setLoadingCourses(false);
      }
    };

    fetchCourses();
  }, []);

  // Check if student with Aadhar already exists
 // Check if student with Aadhar already exists
const checkIfStudentExists = async (aadharNumber, providedToken = null) => {
  if (!aadharNumber) {
    console.log('No Aadhar number provided');
    return false;
  }
  
  try {
    console.log('🔍 Checking if student exists with Aadhar:', aadharNumber);
    
    // Try to refresh token if needed before making the request
    const { refreshTokenIfNeeded } = await import('../../utils/tokenUtils');
    const refreshSuccess = await refreshTokenIfNeeded();
    
    if (!refreshSuccess) {
      console.error('❌ Failed to refresh token');
      dispatch(setToken(null));
      localStorage.removeItem('token');
      navigate('/login');
      throw new Error('Your session has expired. Please log in again.');
    }
    
    // Get the latest token after potential refresh
    const currentToken = providedToken || authToken || localStorage.getItem('token');
    
    if (!currentToken) {
      console.error('❌ No authentication token found after refresh');
      dispatch(setToken(null));
      localStorage.removeItem('token');
      navigate('/login');
      throw new Error('Your session has expired. Please log in again.');
    }
    
    console.log('🔑 Token being used for Aadhar check:', {
      tokenExists: !!currentToken,
      tokenPrefix: currentToken ? currentToken.substring(0, 10) + '...' : 'none',
      tokenLength: currentToken?.length || 0
    });
    
    // Use axios directly instead of apiConnector to ensure headers are properly set
    const apiUrl = `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/university/registered-students/check-aadhar/${aadharNumber}`;
    
    const response = await axios.get(apiUrl, {
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'X-Requested-With': 'XMLHttpRequest'
      },
      withCredentials: true,
      validateStatus: function (status) {
        return status < 500; // Resolve only if the status code is less than 500
      }
    });

    // Handle 403 specifically
    if (response?.status === 403) {
      console.error('Access forbidden - checking response details:', response.data);
      
      // Don't clear the token automatically for 403 errors
      // It might be a permission issue, not a token issue
      if (response.data?.message?.includes('role') || 
          response.data?.message?.includes('authorized') ||
          response.data?.message?.includes('Student')) {
        // It's a permission issue
        console.error('Permission denied for this action');
        throw new Error('PERMISSION_DENIED');
      } else {
        // It's likely a token issue
        console.error('Token may be invalid');
        throw new Error('ACCESS_DENIED');
      }
    }
    
    console.log('Aadhar check response:', response);
    
    // Check if the response has the expected structure
    if (response && response.data) {
      console.log('Student exists:', response.data.exists);
      return response.data.exists === true;
    }
    
    console.log('Unexpected response format:', response);
    return false;
    
  } catch (error) { // ✅ FIXED: Added 'error' parameter here
    console.error('Error checking student existence:', error);
    
    if (error.response) {
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', error.response.data);
      
      // If the error is 404, it means the student doesn't exist
      if (error.response.status === 404) {
        return false;
      }
      
      // Handle 403 Forbidden (token expired)
      if (error.response.status === 403) {
        console.log('Permission issue detected, not clearing token');
        // Don't clear token for permission issues
        throw new Error('PERMISSION_DENIED');
      }
    }
    
    // For other errors, we'll assume the student doesn't exist to prevent blocking
    return false;
  }
};


  // Handle form submission
  const onFinish = async (values) => {
    console.log('Form submitted with values:', values);
    console.log('Current paymentMethod:', paymentMethod);
    
    try {
      setSubmitting(true);
      
      // For both online and offline, check if student exists first
      console.log('Checking if student exists with Aadhar:', values.aadharNumber);
      const currentToken = authToken || localStorage.getItem('token');
      const studentExists = await checkIfStudentExists(values.aadharNumber, currentToken);
      console.log('Student exists check result:', studentExists);
      
      if (studentExists) {
        console.log('Student already exists, showing error notification');
        
        // Show a more prominent toast notification
        notification.error({
          message: '❌ Registration Blocked',
          description: (
            <div style={{ padding: '8px 0' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '12px',
                fontWeight: 500,
                fontSize: '15px'
              }}>
                <ExclamationCircleOutlined style={{ 
                  color: '#ff4d4f', 
                  fontSize: '20px',
                  marginRight: '10px' 
                }} />
                User Already Registered!
              </div>
              <div style={{ 
                backgroundColor: '#fff2f0',
                border: '1px solid #ffccc7',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '12px'
              }}>
                <div style={{ marginBottom: '6px' }}>
                  A student with Aadhar number ending with <strong>{values.aadharNumber ? values.aadharNumber.slice(-4) : 'N/A'}</strong> is already registered in our system.
                </div>
                <div style={{ color: '#ff4d4f', fontWeight: 500 }}>
                  Please do not submit the registration again.
                </div>
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#8c8c8c',
                borderTop: '1px solid #f0f0f0',
                paddingTop: '10px',
                marginTop: '10px'
              }}>
                If you believe this is an error, please contact support.
              </div>
            </div>
          ),
          duration: 15,
          style: {
            width: 420,
            marginTop: '20px',
            borderLeft: '4px solid #ff4d4f',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1001
          },
          placement: 'topRight',
          closeIcon: <span style={{ fontSize: '16px', padding: '0 8px' }}>×</span>
        });
        
        setSubmitting(false);
        return;
      }
      
      // If student doesn't exist and payment is online, show payment modal
      if (paymentMethod === 'online') {
        console.log('Online payment selected, showing payment modal');
        setShowPaymentModal(true);
        return;
      }
      
      // For offline payment, submit the form directly
      // Skip Aadhar check since we already did it above
      await submitForm({
        ...values,
        paymentMode: 'cash', // Explicitly set paymentMode to 'cash' for offline payments
        paymentDetails: {
          method: 'offline',
          status: 'pending',
          amount: 0,
          transactionDate: new Date().toISOString()
        }
      }, { skipAadharCheck: true });
      
    } catch (error) {
      console.error('Error during form submission:', error);
      message.error(error.message || 'Failed to submit form. Please try again.');
      setSubmitting(false);
    }
  };

  // Check if email is already registered
  const checkEmailExists = async (email) => {
    try {
      const response = await apiConnector(
        'POST',
        '/api/v1/students/check-email',
        { email }
      );
      return response.data.exists || false;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };

  // Handle payment
  // const handlePayment = async () => {
  //   // Reset all states at the beginning
  //   setPaymentStatus(null);
  //   setPaymentError(null);
  //   setPaymentLoading(true);
  //   // Set payment mode to online
  //   setPaymentMethod('online');
    
  //   try {
  //     // Get form values
  //     const formValues = form.getFieldsValue();
  //     const { aadharNumber, email } = formValues;
      
  //     if (!aadharNumber) {
  //       message.error('Aadhar number is required');
  //       setPaymentLoading(false);
  //       return;
  //     }
      
  //     // Validate email format
  //     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //     if (!email || !emailRegex.test(email)) {
  //       message.error('Please enter a valid email address');
  //       setPaymentLoading(false);
  //       return;
  //     }
      
  //     try {
  //       // Check if email already exists
  //       const emailExists = await checkEmailExists(email);
  //       if (emailExists) {
  //         // Reset loading states immediately
  //         setPaymentLoading(false);
  //         setSubmitting(false);
          
  //         notification.error({
  //           message: '❌ Email Already Registered',
  //           description: (
  //             <div style={{ padding: '8px 0' }}>
  //               <div style={{ 
  //                 display: 'flex', 
  //                 alignItems: 'center', 
  //                 marginBottom: '8px',
  //                 fontWeight: 500,
  //                 color: '#ff4d4f'
  //               }}>
  //                 <ExclamationCircleOutlined style={{ 
  //                   fontSize: '18px',
  //                   marginRight: '8px' 
  //                 }} />
  //                 Email Already In Use
  //               </div>
  //               <div style={{ 
  //                 backgroundColor: '#fff2f0',
  //                 border: '1px solid #ffccc7',
  //                 padding: '10px',
  //                 borderRadius: '4px',
  //                 marginBottom: '8px'
  //               }}>
  //                 The email address <strong>{email}</strong> is already registered in our system.
  //                 <div style={{ marginTop: '8px', fontSize: '13px', color: '#8c8c8c' }}>
  //                   Please use a different email address or contact support if you believe this is an error.
  //                 </div>
  //               </div>
  //               <div style={{ textAlign: 'right' }}>
  //                 <Button 
  //                   type="link" 
  //                   size="small" 
  //                   onClick={() => {
  //                     notification.destroy();
  //                     form.setFieldsValue({
  //                       ...formValues,
  //                       email: ''
  //                     });
  //                     // Focus on the email field after clearing it
  //                     const emailInput = document.querySelector('input[type="email"]');
  //                     if (emailInput) {
  //                       setTimeout(() => emailInput.focus(), 100);
  //                     }
  //                   }}
  //                 >
  //                   Change Email
  //                 </Button>
  //               </div>
  //             </div>
  //           ),
  //           duration: 10,
  //           style: {
  //             width: 450,
  //             marginTop: '20px',
  //             borderLeft: '4px solid #ff4d4f',
  //             borderRadius: '4px',
  //             boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  //           },
  //           onClose: () => {
  //             // Ensure states are reset when notification is closed
  //             setPaymentLoading(false);
  //             setSubmitting(false);
  //             setPaymentStatus(null);
  //           }
  //         });
  //         return;
  //       }
  //     } catch (error) {
  //       console.error('Error checking email:', error);
  //       message.error('Error checking email. Please try again.');
  //       setPaymentLoading(false);
  //       return;
  //     }
      
  //     // First check if student exists
  //     const studentExists = await checkIfStudentExists(aadharNumber);
  //     if (studentExists) {
  //       notification.error({
  //         message: '❌ Registration Blocked',
  //         description: (
  //           <div style={{ padding: '8px 0' }}>
  //             <div style={{ 
  //               display: 'flex', 
  //               alignItems: 'center', 
  //               marginBottom: '12px',
  //               fontWeight: 500,
  //               fontSize: '15px'
  //             }}>
  //               <ExclamationCircleOutlined style={{ 
  //                 color: '#ff4d4f', 
  //                 fontSize: '20px',
  //                 marginRight: '10px' 
  //               }} />
  //               User Already Registered!
  //             </div>
  //             <div style={{ 
  //               backgroundColor: '#fff2f0',
  //               border: '1px solid #ffccc7',
  //               padding: '12px',
  //               borderRadius: '4px',
  //               marginBottom: '12px'
  //             }}>
  //               <div style={{ marginBottom: '6px' }}>
  //                 A student with Aadhar number ending with <strong>{aadharNumber.slice(-4)}</strong> is already registered in our system.
  //               </div>
  //               <div style={{ color: '#ff4d4f', fontWeight: 500 }}>
  //                 Please do not submit the registration again.
  //               </div>
  //             </div>
  //           </div>
  //         ),
  //         duration: 15,
  //         style: {
  //           width: 420,
  //           marginTop: '20px',
  //           borderLeft: '4px solid #ff4d4f',
  //           borderRadius: '4px',
  //           boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  //           zIndex: 1001
  //         }
  //       });
        
  //       setPaymentLoading(false);
  //       setShowPaymentModal(false);
  //       setSubmitting(false);
  //       return;
  //     }
      
  //     // If we get here, student doesn't exist, proceed with payment
  
  //     // Check if Razorpay is loaded
  //     if (!window.Razorpay) {
  //       throw new Error('Razorpay SDK failed to load. Please try again later.');
  //     }
  
  //     const amount = 1000; // 10.00 INR in paise
  //     const receipt = `receipt_${Date.now()}`;
  
  //     console.log('Creating payment order with:', {
  //       amount,
  //       currency: 'INR',
  //       receipt
  //     });
  
  //     // Create order with Aadhar number
  //     const orderResponse = await apiConnector(
  //       'POST',
  //       '/api/v1/payments/create-order',
  //       {
  //         amount,
  //         currency: 'INR',
  //         receipt,
  //         aadharNumber: formValues.aadharNumber // Pass Aadhar number to check for duplicates
  //       }
  //     );

  //     // Double check for duplicate (in case of race condition)
  //     if (orderResponse.data.isDuplicate) {
  //       throw new Error('DUPLICATE_AADHAR');
  //     }
  
  //     console.log('Order creation response:', orderResponse.data);
  
  //     if (!orderResponse.data.success || !orderResponse.data.order) {
  //       throw new Error(orderResponse.data.message || 'Failed to create payment order');
  //     }
      
  //     const order = orderResponse.data.order;
  
  //     // Track if modal is open
  //     let isModalOpen = true;
      
  //     // Handle modal close event
  //     const handleModalClose = () => {
  //       if (isModalOpen) {
  //         console.log('Razorpay modal closed by user');
  //         setPaymentStatus('cancelled');
  //         setPaymentLoading(false);
  //         setSubmitting(false);
  //         setUploading(false);
  //         setPaymentError(null);
  //         isModalOpen = false;
  //         message.warning('Payment was cancelled. You can try again if needed.');
  //       }
  //     };

  //     // Initialize Razorpay options
  //     const options = {
  //       key: process.env.REACT_APP_RAZORPAY_KEY,
  //       amount: order.amount,
  //       currency: order.currency,
  //       name: "WebMok Education",
  //       description: `Registration for ${formValues.firstName} ${formValues.lastName || ''}`.trim(),
  //       order_id: order.id,
  //       handler: async function (response) {
  //         try {
  //           setPaymentLoading(true);
  //           setUploading(true);
            
  //           // Get form values and update payment mode to online
  //           const formValues = form.getFieldsValue();
            
  //           // Create FormData instance (same as offline payment)
  //           const formData = new FormData();
            
  //           // Helper function to log file info
  //           const logFileInfo = (file, name) => {
  //             if (!file) {
  //               console.log(`${name}: No file provided`);
  //               return null;
  //             }
              
  //             const fileObj = file.originFileObj || file;
  //             console.log(`${name} file details:`, {
  //               name: fileObj.name,
  //               size: fileObj.size,
  //               type: fileObj.type,
  //               isFile: fileObj instanceof File,
  //               isBlob: fileObj instanceof Blob,
  //               constructorName: fileObj.constructor.name,
  //               keys: Object.keys(fileObj)
  //             });
  //             return fileObj;
  //           };
            
  //           // Append files first (same as offline payment)
  //           if (photoFile) {
  //             const photoToUpload = logFileInfo(photoFile, 'Photo');
  //             if (photoToUpload) {
  //               formData.append('photo', photoToUpload);
  //             }
  //           }
            
  //           if (signatureFile) {
  //             const signatureToUpload = logFileInfo(signatureFile, 'Signature');
  //             if (signatureToUpload) {
  //               formData.append('signature', signatureToUpload);
  //             }
  //           }
            
  //           // Log FormData contents before sending
  //           console.log('FormData entries before sending:');
  //           for (let [key, value] of formData.entries()) {
  //             if (value instanceof File || value instanceof Blob) {
  //               console.log(`${key}: File - ${value.name} (${value.size} bytes, ${value.type})`);
  //             } else {
  //               console.log(`${key}:`, value);
  //             }
  //           }
            
  //           // Process and append form values (same as offline payment)
  //           const { photo, signature, dateOfBirth, yearOfPassing,academics ,  ...values } = formValues;
            
  //           // Convert dates to strings (same as offline payment)
  //           if (dateOfBirth) {
  //             values.dateOfBirth = dayjs(dateOfBirth).format('YYYY-MM-DD');
  //           }
            
  //           if (yearOfPassing) {
  //             values.yearOfPassing = dayjs(yearOfPassing).format('YYYY');
  //           }
  //           // Process academics data FIRST - before other fields
  //     if (academics && Array.isArray(academics)) {
  //       // Clean and validate academics data
  //       const processedAcademics = academics.map(academic => {
  //         // Ensure we have the required fields in the correct format
  //         const cleanAcademic = {
  //           level: academic.level || academic.qualification,
  //           boardUniversity: academic.boardUniversity || '',
  //           percentage: academic.percentage || 0,
  //           year: academic.year || academic.yearOfPassing
  //         };
          
  //         // Validate required fields
  //         if (!cleanAcademic.level || !cleanAcademic.boardUniversity) {
  //           console.warn('Invalid academic record:', academic);
  //           return null;
  //         }
          
  //         return cleanAcademic;
  //       }).filter(academic => academic !== null); // Remove invalid records
        
  //       console.log('Processed academics:', processedAcademics);
        
  //       // Stringify and append academics array
  //       if (processedAcademics.length > 0) {
  //         formData.append('academics', JSON.stringify(processedAcademics));
  //         console.log('Appended academics:', JSON.stringify(processedAcademics));
  //       }
  //     }
      
  //           // Add payment details (specific to online payment)
  //           values.paymentDetails = {
  //             method: 'online',
  //             status: 'completed',
  //             amount: order.amount / 100, // Convert back to rupees
  //             transactionId: response.razorpay_payment_id,
  //             orderId: order.id,
  //             transactionDate: new Date().toISOString()
  //           };
            
  //           // Add all form fields with better handling (same as offline payment)
  //           Object.entries(values).forEach(([key, value]) => {
  //             if (value !== null && value !== undefined && value !== '') {
  //               // Handle nested objects (like address, paymentDetails)
  //               if (typeof value === 'object' && !dayjs.isDayjs(value) && !Array.isArray(value)) {
  //                 Object.entries(value).forEach(([nestedKey, nestedValue]) => {
  //                   if (nestedValue !== null && nestedValue !== undefined && nestedValue !== '') {
  //                     formData.append(`${key}.${nestedKey}`, nestedValue.toString());
  //                     console.log(`Appended nested field: ${key}.${nestedKey} = ${nestedValue}`);
  //                   }
  //                 });
  //               } 
  //               // Handle regular values
  //               else {
  //                 formData.append(key, value.toString());
  //                 console.log(`Appended field: ${key} = ${value}`);
  //               }
  //             }
  //           });
            
  //           // Add payment verification details
  //           formData.append('orderId', order.id);
  //           formData.append('paymentId', response.razorpay_payment_id);
  //           formData.append('signature', response.razorpay_signature);
            
  //           // Ensure academic data is included
  //           if (values.academics && values.academics.length > 0) {
  //             formData.append('academics', JSON.stringify(values.academics));
  //           }
            
  //           // Log FormData for debugging
  //           console.log('FormData entries before verification:');
  //           for (let pair of formData.entries()) {
  //             console.log(pair[0] + ': ', pair[0] === 'academics' ? JSON.parse(pair[1]) : pair[1]);
  //           }
            
  //           // Make the API call with FormData
  //           console.log('Sending request to /api/v1/payments/verify');
            
  //           // Use axios directly for better control over the request
  //           const apiResponse = await axios.post(
  //             'http://localhost:4000/api/v1/payments/verify',
  //             formData,
  //             {
  //               headers: {
  //                 'Content-Type': 'multipart/form-data',
  //                 'Authorization': `Bearer ${authToken || localStorage.getItem('token')}`
  //               },
  //               withCredentials: true,
  //               transformRequest: (data, headers) => {
  //                 // Remove the content-type header and let the browser set it with the correct boundary
  //                 delete headers['Content-Type'];
  //                 return data;
  //               }
  //             }
  //           );
            
  //           console.log('Upload completed:', response);
            
  //           // Handle successful verification
  //           if (response.data.success) {
  //             setPaymentStatus('success');
              
  //             // Store registration success data
  //             const registrationData = {
  //               name: `${formValues.firstName} ${formValues.lastName || ''}`.trim(),
  //               email: formValues.email,
  //               referenceNumber: response.razorpay_payment_id,
  //               date: new Date().toLocaleString()
  //             };
              
  //             // Update button to show completed state
  //             setPaymentLoading(false);
  //             setUploading(false);
  //             setSubmitting(false);
  //             setShowPaymentModal(false);
              
  //             // Store registration completion state
  //             setPaymentStatus('completed');
              
  //             // Show success modal
  //             Modal.success({
  //               title: '🎉 Registration Successful!',
  //               content: (
  //                 <div style={{ padding: '16px' }}>
  //                   <p>Thank you for registering with WebMok Education!</p>
  //                   <div style={{ margin: '16px 0', padding: '12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '4px' }}>
  //                     <p><strong>Name:</strong> {registrationData.name}</p>
  //                     <p><strong>Email:</strong> {registrationData.email}</p>
  //                     <p><strong>Reference #:</strong> {registrationData.referenceNumber}</p>
  //                     <p><strong>Date:</strong> {registrationData.date}</p>
  //                   </div>
  //                   <p>A confirmation email has been sent to your registered email address.</p>
  //                 </div>
  //               ),
  //               okText: 'Done',
  //               width: 500,
  //               onOk: () => {
  //                 // Reset form and states but keep the completed status
  //                 form.resetFields();
  //                 setShowPaymentModal(false);
  //               },
  //               afterClose: () => {
  //                 // Reset form but keep the completed status
  //                 form.resetFields();
  //                 setShowPaymentModal(false);
  //               }
  //             });
              
  //             return; // Exit the function after successful registration
  //           }
            
  //           throw new Error(response.data.message || 'Payment verification failed');
  //       } catch (error) {
  //         console.error('Payment verification error:', {
  //           message: error.message,
  //           response: error.response?.data,
  //           stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  //           errorObject: error // Log the full error object for debugging
  //         });
          
  //         // Reset all loading states
  //         setPaymentStatus('failed');
  //         setPaymentLoading(false);
  //         setUploading(false);
  //         setSubmitting(false);
          
  //         // Handle JSON parsing errors specifically
  //         if (error.message.includes('JSON') || error.message.includes('parsing')) {
  //           message.error('Error processing payment. Please try again or contact support.');
  //           console.error('JSON parsing error details:', {
  //             error: error.toString(),
  //             response: error.response,
  //             request: error.request
  //           });
  //           return;
  //         }
          
  //         // Handle network errors
  //         if (error.message === 'Network Error') {
  //           message.error('Network error. Please check your connection and try again.');
  //           return;
  //         }
          
  //         // Handle duplicate Aadhar case
  //         if (error.response?.data?.isDuplicate) {
  //           const aadharNumber = error.response.data.aadharNumber || '';
  //           const maskedAadhar = aadharNumber ? 
  //             `XXXX-XXXX-${aadharNumber.slice(-4)}` : 
  //             '';
              
  //           const errorMsg = `A student with Aadhar number ending with ${maskedAadhar} is already registered.`;
  //             setPaymentError(errorMsg);
              
  //             notification.error({
  //               message: 'Duplicate Aadhar Number',
  //               message: '❌ Registration Failed',
  //               description: errorMsg,
  //               duration: 10,
  //               style: {
  //                 width: 420,
  //                 marginTop: '20px',
  //                 borderLeft: '4px solid #ff4d4f',
  //                 borderRadius: '4px',
  //                 boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  //               },
  //               onClose: () => {
  //                 setPaymentLoading(false);
  //                 setPaymentError(null);
  //               }
  //             });
  //           } 
  //           // Handle duplicate email case
  //           else if ((error.response?.data?.message?.includes('already registered') || 
  //                    error.response?.data?.message?.includes('email')) && 
  //                   error.response?.data?.email) {
  //             const email = error.response.data.email;
  //             const errorMsg = `The email ${email} is already registered.`;
  //             setPaymentError(errorMsg);
              
  //             notification.error({
  //               message: '❌ Email Already Registered',
  //               description: (
  //                 <div style={{ padding: '8px 0' }}>
  //                   <div style={{ 
  //                     display: 'flex', 
  //                     alignItems: 'center', 
  //                     marginBottom: '8px',
  //                     fontWeight: 500,
  //                     color: '#ff4d4f'
  //                   }}>
  //                     <ExclamationCircleOutlined style={{ 
  //                       fontSize: '18px',
  //                       marginRight: '8px' 
  //                     }} />
  //                     Email Already In Use
  //                   </div>
  //                   <div style={{ 
  //                     backgroundColor: '#fff2f0',
  //                     border: '1px solid #ffccc7',
  //                     padding: '10px',
  //                     borderRadius: '4px',
  //                     marginBottom: '8px'
  //                   }}>
  //                     The email address <strong>{email}</strong> is already registered in our system.
  //                     <div style={{ marginTop: '8px', fontSize: '13px', color: '#8c8c8c' }}>
  //                       Please use a different email address or contact support if you believe this is an error.
  //                     </div>
  //                   </div>
  //                   <div style={{ textAlign: 'right' }}>
  //                     <Button 
  //                       type="link" 
  //                       size="small" 
  //                       onClick={() => {
  //                         notification.destroy();
  //                         // Pre-fill the form with the existing values but allow editing
  //                         form.setFieldsValue({
  //                           ...form.getFieldsValue(),
  //                           email: '' // Clear the email field
  //                         });
  //                       }}
  //                     >
  //                       Change Email
  //                     </Button>
  //                   </div>
  //                 </div>
  //               ),
  //               duration: 15,
  //               style: {
  //                 width: 450,
  //                 marginTop: '20px',
  //                 borderLeft: '4px solid #ff4d4f',
  //                 borderRadius: '4px',
  //                 boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  //               },
  //               onClose: () => {
  //                 setPaymentLoading(false);
  //                 setPaymentError(null);
  //               }
  //             });
  //           }
  //           // Handle other errors
  //           else {
  //             const errorMsg = error.response?.data?.message || 
  //                            error.message || 
  //                            'Payment verification failed. Please contact support.';
  //             setPaymentError(errorMsg);
              
  //             notification.error({
  //               message: '❌ Payment Error',
  //               description: errorMsg,
  //               duration: 10,
  //               style: {
  //                 width: 420,
  //                 marginTop: '20px',
  //                 borderLeft: '4px solid #ff4d4f',
  //                 borderRadius: '4px',
  //                 boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
  //               },
  //               onClose: () => {
  //                 setPaymentLoading(false);
  //                 setPaymentError(null);
  //               }
  //             });
  //           }
  //         }
  //       },
  //       modal: {
  //         ondismiss: function() {
  //           setPaymentStatus('cancelled');
  //           setPaymentError('Payment was cancelled by the user');
  //           message.warning('Payment was cancelled. Please try again if you want to continue.');
  //         }
  //       }
  //     };

  //     // Create Razorpay instance with updated options
  //     const rzp = new window.Razorpay({
  //       ...options,
  //       modal: {
  //         ...options.modal,
  //         ondismiss: handleModalClose
  //       }
  //     });
      
  //     // Log Razorpay instance for debugging
  //     console.log('Razorpay instance created:', rzp);
      
  //     // Override the modal close handler
  //     const originalClose = rzp._modal && rzp._modal.close;
  //     if (rzp._modal) {
  //       rzp._modal.close = function() {
  //         handleModalClose();
  //         if (originalClose) {
  //           return originalClose.apply(this, arguments);
  //         }
  //       };
  //     }
      
  //     // Handle ESC key press
  //     const handleEsc = (e) => {
  //       if (e.key === 'Escape' && isModalOpen) {
  //         handleModalClose();
  //       }
  //     };
      
  //     // Add event listener for ESC key
  //     document.addEventListener('keydown', handleEsc);
      
  //     // Cleanup function
  //     const cleanup = () => {
  //       document.removeEventListener('keydown', handleEsc);
  //       isModalOpen = false;
  //     };
      
  //     // Add cleanup when the component unmounts or modal is closed
  //     const originalUnmount = rzp._componentWillUnmount;
  //     if (rzp._componentWillUnmount) {
  //       rzp._componentWillUnmount = function() {
  //         cleanup();
  //         if (originalUnmount) {
  //           return originalUnmount.apply(this, arguments);
  //         }
  //       };
  //     }
      
  //     // Handle payment failures
  //     rzp.on('payment.failed', function (response) {
  //       console.error('Payment failed:', response.error);
  //       setPaymentStatus('failed');
  //       setPaymentLoading(false);
  //       setSubmitting(false);
  //       setUploading(false);
  //       const errorMessage = response.error?.description || 'Payment failed. Please try again.';
  //       setPaymentError(errorMessage);
  //       message.error(errorMessage);
  //     });
      
  //     // Add error handler for Razorpay
  //     rzp.on('payment.error', function(error) {
  //       console.error('Razorpay error:', error);
  //       setPaymentStatus('failed');
  //       setPaymentLoading(false);
  //       setSubmitting(false);
  //       setUploading(false);
  //       message.error('Payment processing error: ' + (error.error?.description || 'Unknown error'));
  //     });
      
  //     // Handle successful payment
  //     rzp.on('payment.success', async function(response) {
  //       console.log('Payment success event triggered with response:', response);
        
  //       try {
  //         // Immediately update the UI to show processing
  //         setPaymentStatus('success');
  //         setPaymentLoading(true);
          
  //         // Get the latest form values
  //         const formValues = form.getFieldsValue();
          
  //         // Log the payment response for debugging
  //         console.log('Payment success response:', response);
          
  //         // Ensure we have all required payment details before submission
  //         if (!response.razorpay_payment_id) {
  //           throw new Error('Missing payment ID in response');
  //         }
          
  //         // Use order ID from response or fallback to the one we have
  //         const orderId = response.razorpay_order_id || order.id;
          
  //         if (!orderId) {
  //           throw new Error('Missing order ID in payment response');
  //         }
          
  //         console.log('Payment details:', {
  //           paymentId: response.razorpay_payment_id,
  //           orderId: orderId,
  //           amount: order.amount / 100
  //         });
          
  //         // Verify and record the payment with the university payment endpoint
  //         try {
  //           const paymentData = {
  //             amount: order.amount / 100, // Convert back to rupees
  //             paymentMethod: 'online',
  //             feeType: formValues.feeType,
  //             feeAssignmentId: formValues.feeAssignmentId,
  //             isOnlinePayment: true,
  //             // Razorpay details
  //             razorpay_order_id: orderId,
  //             razorpay_payment_id: response.razorpay_payment_id,
  //             razorpay_signature: response.razorpay_signature,
  //             // Other payment details
  //             remarks: 'Online payment via Razorpay',
  //             paymentDate: new Date().toISOString(),
  //             // Include student data
  //             studentData: JSON.parse(JSON.stringify(formValues))
  //           };

  //           console.log('Sending payment data to university payment endpoint:', paymentData);

  //           // Verify and record the payment
  //           const paymentResponse = await apiConnector(
  //             'POST',
  //             `/api/v1/university/payments/${formValues.studentId || 'new'}`,
  //             paymentData,
  //             {
  //               headers: {
  //                 'Content-Type': 'application/json',
  //                 'Authorization': `Bearer ${authToken || localStorage.getItem('token')}`
  //               }
  //             }
  //           );
            
  //           console.log('University payment response:', paymentResponse.data);
            
  //           if (!paymentResponse.data.success) {
  //             throw new Error(paymentResponse.data.message || 'Payment recording failed');
  //           }

  //           // Prepare submission data with payment details
  //           const submissionData = {
  //             ...formValues,
  //             paymentDetails: {
  //               method: 'online',
  //               status: 'completed',
  //               amount: order.amount / 100,
  //               transactionId: response.razorpay_payment_id,
  //               orderId: orderId,
  //               transactionDate: new Date().toISOString(),
  //               razorpaySignature: response.razorpay_signature
  //             }
  //           };
            
  //           console.log('Preparing to submit form with data:', JSON.stringify(submissionData, null, 2));
            
  //           // Show loading state
  //           message.loading('Processing your registration...', 0);
            
  //           try {
  //             // Submit the form with payment details
  //             console.log('Calling submitForm...');
  //             await submitForm(submissionData);
              
  //             // If we get here, submission was successful
  //             console.log('Form submission completed successfully');
              
  //             // Close the payment modal and show success message
  //             setShowPaymentModal(false);
  //             message.destroy();
  //             message.success('Registration completed successfully!');
              
  //           } catch (submitError) {
  //             console.error('Error in form submission:', submitError);
  //             message.error('Registration submitted but there was an error processing your payment. Please contact support with payment ID: ' + response.razorpay_payment_id);
  //           }
  //         } catch (verificationError) {
  //           console.error('Payment verification failed:', verificationError);
  //           throw new Error(`Payment verification failed: ${verificationError.message || 'Unknown error'}`);
  //         }
  //       } catch (error) {
  //         console.error('Error in payment success handler:', error);
  //         setPaymentStatus('failed');
  //         setPaymentLoading(false);
  //         message.error('Error processing payment: ' + (error.message || 'Unknown error'));
  //       } finally {
  //         // Ensure loading state is always reset
  //         setPaymentLoading(false);
          
  //         // Force a re-render to ensure UI updates
  //         forceUpdate();
  //       }
  //     });
  
  //     // Add a timeout to ensure the payment loading state is reset if something goes wrong
  //     const paymentTimeout = setTimeout(() => {
  //       if (paymentLoading) {
  //         console.warn('Payment processing timed out after 2 minutes');
  //         setPaymentLoading(false);
  //         setPaymentStatus('failed');
  //         message.error('Payment processing timed out. Please try again or contact support.');
  //       }
  //     }, 120000); // 2 minute timeout
      
  //     // Open the Razorpay payment form
  //     console.log('Opening Razorpay payment form...');
  //     rzp.open();
      
  //     // Set a timeout to ensure loading state is reset if modal fails to open
  //     const modalOpenCheck = setTimeout(() => {
  //       if (isModalOpen && typeof rzp._modal === 'undefined') {
  //         console.log('Razorpay modal failed to open, resetting state');
  //         handleModalClose();
  //         clearTimeout(paymentTimeout);
  //       }
  //     }, 3000);
      
  //     // Reset payment loading state if user closes the modal without completing payment
  //     rzp.on('modal.closed', function() {
  //       console.log('Razorpay modal closed, current paymentStatus:', paymentStatus);
  //       clearTimeout(modalOpenCheck);
  //       if (paymentStatus !== 'success') {
  //         console.log('Resetting payment loading state');
  //         setPaymentLoading(false);
  //         clearTimeout(paymentTimeout);
  //       }
  //     });
      
  //   } catch (error) {
  //     console.error('Payment error:', {
  //       message: error.message,
  //       response: error.response?.data,
  //       stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
  //     });
      
  //     // Handle duplicate Aadhar case with toast message
  //     if (error.message === 'DUPLICATE_AADHAR' || error.response?.data?.isDuplicate) {
  //       const aadharNumber = form.getFieldValue('aadharNumber') || '';
  //       const toastMessage = 'A student with this Aadhar number is already registered. Please use a different Aadhar number.';
  //       setPaymentError(toastMessage);
  //       message.info({
  //         content: (
  //           <div>
  //             <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Registration Notice</div>
  //             <div>A student with Aadhar number ending with <strong>{aadharNumber.slice(-4)}</strong> is already registered.</div>
  //           </div>
  //         ),
  //         duration: 5,
  //         style: { 
  //           marginTop: '50px',
  //           backgroundColor: '#e6f7ff',
  //           border: '1px solid #91d5ff',
  //           borderRadius: '4px'
  //         }
  //       });
  //     } else {
  //       // Handle other errors with toast
  //       const errorMessage = error.response?.data?.message || 
  //                          error.message || 
  //                          'Payment processing failed. Please try again.';
  //       setPaymentError(errorMessage);
  //       message.warning(errorMessage);
  //     }
  //   }
  // };

 
 
  // Submit fo// Handle payment
const handlePayment = async () => {
  // Reset all states at the beginning
  setPaymentStatus(null);
  setPaymentError(null);
  setPaymentLoading(true);
  setPaymentMethod('online');
  
  try {
    // Get form values
    const formValues = form.getFieldsValue();
    const { aadharNumber, email } = formValues;
    
    if (!aadharNumber) {
      message.error('Aadhar number is required');
      setPaymentLoading(false);
      return;
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      message.error('Please enter a valid email address');
      setPaymentLoading(false);
      return;
    }
    
    try {
      // Check if email already exists
      const emailExists = await checkEmailExists(email);
      if (emailExists) {
        setPaymentLoading(false);
        setSubmitting(false);
        
        notification.error({
          message: '❌ Email Already Registered',
          description: (
            <div style={{ padding: '8px 0' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '8px',
                fontWeight: 500,
                color: '#ff4d4f'
              }}>
                <ExclamationCircleOutlined style={{ 
                  fontSize: '18px',
                  marginRight: '8px' 
                }} />
                Email Already In Use
              </div>
              <div style={{ 
                backgroundColor: '#fff2f0',
                border: '1px solid #ffccc7',
                padding: '10px',
                borderRadius: '4px',
                marginBottom: '8px'
              }}>
                The email address <strong>{email}</strong> is already registered in our system.
                <div style={{ marginTop: '8px', fontSize: '13px', color: '#8c8c8c' }}>
                  Please use a different email address or contact support if you believe this is an error.
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <Button 
                  type="link" 
                  size="small" 
                  onClick={() => {
                    notification.destroy();
                    form.setFieldsValue({
                      ...formValues,
                      email: ''
                    });
                    const emailInput = document.querySelector('input[type="email"]');
                    if (emailInput) {
                      setTimeout(() => emailInput.focus(), 100);
                    }
                  }}
                >
                  Change Email
                </Button>
              </div>
            </div>
          ),
          duration: 10,
          style: {
            width: 450,
            marginTop: '20px',
            borderLeft: '4px solid #ff4d4f',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          },
          onClose: () => {
            setPaymentLoading(false);
            setSubmitting(false);
            setPaymentStatus(null);
          }
        });
        return;
      }
    } catch (error) {
      console.error('Error checking email:', error);
      message.error('Error checking email. Please try again.');
      setPaymentLoading(false);
      return;
    }
    
    // First check if student exists
    const studentExists = await checkIfStudentExists(aadharNumber);
    if (studentExists) {
      notification.error({
        message: '❌ Registration Blocked',
        description: (
          <div style={{ padding: '8px 0' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '12px',
              fontWeight: 500,
              fontSize: '15px'
            }}>
              <ExclamationCircleOutlined style={{ 
                color: '#ff4d4f', 
                fontSize: '20px',
                marginRight: '10px' 
              }} />
              User Already Registered!
            </div>
            <div style={{ 
              backgroundColor: '#fff2f0',
              border: '1px solid #ffccc7',
              padding: '12px',
              borderRadius: '4px',
              marginBottom: '12px'
            }}>
              <div style={{ marginBottom: '6px' }}>
                A student with Aadhar number ending with <strong>{aadharNumber.slice(-4)}</strong> is already registered in our system.
              </div>
              <div style={{ color: '#ff4d4f', fontWeight: 500 }}>
                Please do not submit the registration again.
              </div>
            </div>
          </div>
        ),
        duration: 15,
        style: {
          width: 420,
          marginTop: '20px',
          borderLeft: '4px solid #ff4d4f',
          borderRadius: '4px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1001
        }
      });
      
      setPaymentLoading(false);
      setShowPaymentModal(false);
      setSubmitting(false);
      return;
    }
    
    // If we get here, student doesn't exist, proceed with payment

    // Check if Razorpay is loaded
    if (!window.Razorpay) {
      throw new Error('Razorpay SDK failed to load. Please try again later.');
    }

    const amount = 1000; // 10.00 INR in paise
    const receipt = `receipt_${Date.now()}`;

    console.log('Creating payment order with:', {
      amount,
      currency: 'INR',
      receipt
    });

    // Create order with Aadhar number
    const orderResponse = await apiConnector(
      'POST',
      '/api/v1/payments/create-order',
      {
        amount,
        currency: 'INR',
        receipt,
        aadharNumber: formValues.aadharNumber
      }
    );

    // Double check for duplicate (in case of race condition)
    if (orderResponse.data.isDuplicate) {
      throw new Error('DUPLICATE_AADHAR');
    }

    console.log('Order creation response:', orderResponse.data);

    if (!orderResponse.data.success || !orderResponse.data.order) {
      throw new Error(orderResponse.data.message || 'Failed to create payment order');
    }
    
    const order = orderResponse.data.order;

    // Track if modal is open
    let isModalOpen = true;
    
    // Handle modal close event
    const handleModalClose = () => {
      if (isModalOpen) {
        console.log('Razorpay modal closed by user');
        setPaymentStatus('cancelled');
        setPaymentLoading(false);
        setSubmitting(false);
        setUploading(false);
        setPaymentError(null);
        isModalOpen = false;
        message.warning('Payment was cancelled. You can try again if needed.');
      }
    };

    // Initialize Razorpay options
    const options = {
      key: process.env.REACT_APP_RAZORPAY_KEY,
      amount: order.amount,
      currency: order.currency,
      name: "WebMok Education",
      description: `Registration for ${formValues.firstName} ${formValues.lastName || ''}`.trim(),
      order_id: order.id,
      handler: async function (response) {
        try {
          setPaymentLoading(true);
          setUploading(true);
          
          // Get form values
          const formValues = form.getFieldsValue();
          
          // Create FormData instance
          const formData = new FormData();
          
          // Helper function to log file info
          const logFileInfo = (file, name) => {
            if (!file) {
              console.log(`${name}: No file provided`);
              return null;
            }
            
            const fileObj = file.originFileObj || file;
            console.log(`${name} file details:`, {
              name: fileObj.name,
              size: fileObj.size,
              type: fileObj.type,
              isFile: fileObj instanceof File,
              isBlob: fileObj instanceof Blob,
              constructorName: fileObj.constructor.name,
              keys: Object.keys(fileObj)
            });
            return fileObj;
          };
          
          // Append files first
          if (photoFile) {
            const photoToUpload = logFileInfo(photoFile, 'Photo');
            if (photoToUpload) {
              formData.append('photo', photoToUpload);
            }
          }
          
          if (signatureFile) {
            const signatureToUpload = logFileInfo(signatureFile, 'Signature');
            if (signatureToUpload) {
              formData.append('signature', signatureToUpload);
            }
          }
          
          // Process form values
          const { photo, signature, dateOfBirth, yearOfPassing, academics, ...values } = formValues;
          
          // Convert dates to strings
          if (dateOfBirth) {
            values.dateOfBirth = dayjs(dateOfBirth).format('YYYY-MM-DD');
          }
          
          if (yearOfPassing) {
            values.yearOfPassing = dayjs(yearOfPassing).format('YYYY');
          }
          
          // Process academics data - FIXED: Only process once
          if (academics && Array.isArray(academics)) {
            const processedAcademics = academics.map(academic => {
              const cleanAcademic = {
                level: academic.level || academic.qualification,
                boardUniversity: academic.boardUniversity || '',
                percentage: academic.percentage || 0,
                year: academic.year || academic.yearOfPassing
              };
              
              if (!cleanAcademic.level || !cleanAcademic.boardUniversity) {
                console.warn('Invalid academic record:', academic);
                return null;
              }
              
              return cleanAcademic;
            }).filter(academic => academic !== null);
            
            console.log('Processed academics:', processedAcademics);
            
            if (processedAcademics.length > 0) {
              formData.append('academics', JSON.stringify(processedAcademics));
              console.log('Appended academics:', JSON.stringify(processedAcademics));
            }
          }
          
          // Add payment details
          values.paymentDetails = {
            method: 'online',
            status: 'completed',
            amount: order.amount / 100,
            transactionId: response.razorpay_payment_id,
            orderId: order.id,
            transactionDate: new Date().toISOString()
          };
          
          // Add all form fields
          Object.entries(values).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
              if (typeof value === 'object' && !dayjs.isDayjs(value) && !Array.isArray(value)) {
                Object.entries(value).forEach(([nestedKey, nestedValue]) => {
                  if (nestedValue !== null && nestedValue !== undefined && nestedValue !== '') {
                    formData.append(`${key}.${nestedKey}`, nestedValue.toString());
                    console.log(`Appended nested field: ${key}.${nestedKey} = ${nestedValue}`);
                  }
                });
              } else {
                formData.append(key, value.toString());
                console.log(`Appended field: ${key} = ${value}`);
              }
            }
          });
          
          // Add payment verification details
          formData.append('orderId', order.id);
          formData.append('paymentId', response.razorpay_payment_id);
          formData.append('signature', response.razorpay_signature);
          
          // Log FormData for debugging
          console.log('FormData entries before verification:');
          for (let pair of formData.entries()) {
            try {
              if (pair[0] === 'academics') {
                console.log(pair[0] + ': ', JSON.parse(pair[1]));
              } else {
                console.log(pair[0] + ': ', pair[1]);
              }
            } catch (e) {
              console.log(pair[0] + ' (raw):', pair[1]);
            }
          }
          
          // Make the API call with FormData - FIXED: Use proper error handling
          console.log('Sending request to /api/v1/payments/verify');
          
          const apiResponse = await axios.post(
            'http://localhost:4000/api/v1/payments/verify',
            formData,
            {
              headers: {
                'Authorization': `Bearer ${authToken || localStorage.getItem('token')}`
              },
              withCredentials: true,
               timeout: 60000, // Increase timeout to 60 seconds
            }
          );
          
          console.log('Upload completed:', apiResponse.data);
          
          // Handle successful verification - FIXED: Use apiResponse instead of response
          if (apiResponse.data.success) {
            setPaymentStatus('success');
            
            // Store registration success data
            const registrationData = {
              name: `${formValues.firstName} ${formValues.lastName || ''}`.trim(),
              email: formValues.email,
              referenceNumber: response.razorpay_payment_id,
              date: new Date().toLocaleString()
            };
            
            // Update states
            setPaymentLoading(false);
            setUploading(false);
            setSubmitting(false);
            setShowPaymentModal(false);
            setPaymentStatus('completed');
            
            // Show success modal
            Modal.success({
              title: '🎉 Registration Successful!',
              content: (
                <div style={{ padding: '16px' }}>
                  <p>Thank you for registering with WebMok Education!</p>
                  <div style={{ margin: '16px 0', padding: '12px', backgroundColor: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '4px' }}>
                    <p><strong>Name:</strong> {registrationData.name}</p>
                    <p><strong>Email:</strong> {registrationData.email}</p>
                    <p><strong>Reference #:</strong> {registrationData.referenceNumber}</p>
                    <p><strong>Date:</strong> {registrationData.date}</p>
                  </div>
                  <p>A confirmation email has been sent to your registered email address.</p>
                </div>
              ),
              okText: 'Done',
              width: 500,
              onOk: () => {
                form.resetFields();
                setShowPaymentModal(false);
              },
              afterClose: () => {
                form.resetFields();
                setShowPaymentModal(false);
              }
            });
            
            return;
          }
          
          throw new Error(apiResponse.data.message || 'Payment verification failed');
          
        } catch (error) {
          console.error('Payment verification error:', {
            message: error.message,
            response: error.response?.data,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
            errorObject: error
          });
          
          // Reset all loading states
          setPaymentStatus('failed');
          setPaymentLoading(false);
          setUploading(false);
          setSubmitting(false);
          
          // Handle JSON parsing errors specifically
          if (error.message.includes('JSON') || error.message.includes('parsing')) {
            message.error('Error processing payment. Please try again or contact support.');
            console.error('JSON parsing error details:', {
              error: error.toString(),
              response: error.response?.data,
              request: error.request
            });
            return;
          }
          
          // Handle network errors
          if (error.message === 'Network Error') {
            message.error('Network error. Please check your connection and try again.');
            return;
          }
          
          // Handle duplicate Aadhar case
          if (error.response?.data?.isDuplicate) {
            const aadharNumber = error.response.data.aadharNumber || '';
            const maskedAadhar = aadharNumber ? `XXXX-XXXX-${aadharNumber.slice(-4)}` : '';
            const errorMsg = `A student with Aadhar number ending with ${maskedAadhar} is already registered.`;
            
            setPaymentError(errorMsg);
            notification.error({
              message: '❌ Registration Failed',
              description: errorMsg,
              duration: 10,
              style: {
                width: 420,
                marginTop: '20px',
                borderLeft: '4px solid #ff4d4f',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              },
              onClose: () => {
                setPaymentLoading(false);
                setPaymentError(null);
              }
            });
          } 
          // Handle duplicate email case
          else if ((error.response?.data?.message?.includes('already registered') || 
                   error.response?.data?.message?.includes('email')) && 
                  error.response?.data?.email) {
            const email = error.response.data.email;
            const errorMsg = `The email ${email} is already registered.`;
            setPaymentError(errorMsg);
            
            notification.error({
              message: '❌ Email Already Registered',
              description: (
                <div style={{ padding: '8px 0' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '8px',
                    fontWeight: 500,
                    color: '#ff4d4f'
                  }}>
                    <ExclamationCircleOutlined style={{ 
                      fontSize: '18px',
                      marginRight: '8px' 
                    }} />
                    Email Already In Use
                  </div>
                  <div style={{ 
                    backgroundColor: '#fff2f0',
                    border: '1px solid #ffccc7',
                    padding: '10px',
                    borderRadius: '4px',
                    marginBottom: '8px'
                  }}>
                    The email address <strong>{email}</strong> is already registered in our system.
                    <div style={{ marginTop: '8px', fontSize: '13px', color: '#8c8c8c' }}>
                      Please use a different email address or contact support if you believe this is an error.
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => {
                        notification.destroy();
                        form.setFieldsValue({
                          ...form.getFieldsValue(),
                          email: ''
                        });
                      }}
                    >
                      Change Email
                    </Button>
                  </div>
                </div>
              ),
              duration: 15,
              style: {
                width: 450,
                marginTop: '20px',
                borderLeft: '4px solid #ff4d4f',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              },
              onClose: () => {
                setPaymentLoading(false);
                setPaymentError(null);
              }
            });
          }
          // Handle other errors
          else {
            const errorMsg = error.response?.data?.message || 
                           error.message || 
                           'Payment verification failed. Please contact support.';
            setPaymentError(errorMsg);
            
            notification.error({
              message: '❌ Payment Error',
              description: errorMsg,
              duration: 10,
              style: {
                width: 420,
                marginTop: '20px',
                borderLeft: '4px solid #ff4d4f',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              },
              onClose: () => {
                setPaymentLoading(false);
                setPaymentError(null);
              }
            });
          }
        }
      },
      modal: {
        ondismiss: handleModalClose
      }
    };

    // Create Razorpay instance
    const rzp = new window.Razorpay(options);
    
    // Handle payment failures
    rzp.on('payment.failed', function (response) {
      console.error('Payment failed:', response.error);
      setPaymentStatus('failed');
      setPaymentLoading(false);
      setSubmitting(false);
      setUploading(false);
      const errorMessage = response.error?.description || 'Payment failed. Please try again.';
      setPaymentError(errorMessage);
      message.error(errorMessage);
    });

    // Open payment modal
    rzp.open();
    
  } catch (error) {
    console.error('Payment error:', {
      message: error.message,
      response: error.response?.data,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
    
    setPaymentLoading(false);
    
    // Handle duplicate Aadhar case
    if (error.message === 'DUPLICATE_AADHAR' || error.response?.data?.isDuplicate) {
      const aadharNumber = form.getFieldValue('aadharNumber') || '';
      const toastMessage = 'A student with this Aadhar number is already registered. Please use a different Aadhar number.';
      setPaymentError(toastMessage);
      message.info({
        content: (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Registration Notice</div>
            <div>A student with Aadhar number ending with <strong>{aadharNumber.slice(-4)}</strong> is already registered.</div>
          </div>
        ),
        duration: 5,
        style: { 
          marginTop: '50px',
          backgroundColor: '#e6f7ff',
          border: '1px solid #91d5ff',
          borderRadius: '4px'
        }
      });
    } else {
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Payment processing failed. Please try again.';
      setPaymentError(errorMessage);
      message.warning(errorMessage);
    }
  }
};


  const submitForm = async (formValues, { skipAadharCheck = false } = {}) => {
    if (submitting) return;
    
    console.log('=== FORM SUBMISSION STARTED ===');
    console.log('Form values:', JSON.stringify(formValues, null, 2));
    console.log('Photo file:', photoFile);
    console.log('Signature file:', signatureFile);
    
    // Validate files
    if (!photoFile || !signatureFile) {
      message.error('Please upload both photo and signature files');
      setSubmitting(false);
      return;
    }
    
    try {
      setUploading(true);
      setSubmitting(true);
      
      // ✅ FIXED: Use different variable name to avoid conflict
      const currentToken = authToken || localStorage.getItem('token');
      
      console.log('🔍 Submit Form Token Debug:', {
        reduxToken: !!authToken,
        localStorageToken: !!localStorage.getItem('token'),
        currentToken: !!currentToken
      });
      
      if (!currentToken) {
        console.error('No authentication token found. Redirecting to login...');
        dispatch(setToken(null));
        localStorage.removeItem('token');
      
        throw new Error('Your session has expired. Please log in again.');
      }

      // Check token expiration
      try {
        const decodedToken = JSON.parse(atob(currentToken.split('.')[1]));
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          console.error('Token has expired');
          dispatch(setToken(null));
          localStorage.removeItem('token');
          navigate('/login');
          throw new Error('Your session has expired. Please log in again.');
        }
      } catch (decodeError) {
        console.error('Error decoding token:', decodeError);
        // Continue with the request even if we can't decode the token
      }
      
      // Check if student exists before proceeding with form submission
      // Skip this check if it was already done in onFinish
      if (!skipAadharCheck && formValues.aadharNumber) {
        console.log('Checking if student exists with Aadhar:', formValues.aadharNumber);
        try {
          const studentExists = await checkIfStudentExists(formValues.aadharNumber, currentToken);
          
          if (studentExists) {
            console.log('Student already exists, showing error notification');
            notification.error({
              message: '❌ Registration Blocked',
              description: (
                <div style={{ padding: '8px 0' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '12px',
                    fontWeight: 500,
                    fontSize: '15px'
                  }}>
                    <ExclamationCircleOutlined style={{ 
                      color: '#ff4d4f', 
                      fontSize: '20px',
                      marginRight: '10px' 
                    }} />
                    User Already Registered!
                  </div>
                  <div style={{ 
                    backgroundColor: '#fff2f0',
                    border: '1px solid #ffccc7',
                    padding: '12px',
                    borderRadius: '4px',
                    marginBottom: '12px'
                  }}>
                    <div style={{ marginBottom: '6px' }}>
                      A student with Aadhar number ending with <strong>{formValues.aadharNumber.slice(-4)}</strong> is already registered in our system.
                    </div>
                    <div style={{ color: '#ff4d4f', fontWeight: 500 }}>
                      Please do not submit the registration again.
                    </div>
                  </div>
                </div>
              ),
              duration: 15,
              style: {
                width: 420,
                marginTop: '20px',
                borderLeft: '4px solid #ff4d4f',
                borderRadius: '4px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 1001
              },
              placement: 'topRight',
              closeIcon: <span style={{ fontSize: '16px', padding: '0 8px' }}>×</span>
            });
            
            setSubmitting(false);
            setUploading(false);
            return;
          }
        } catch (aadharError) {
          console.error('Aadhar check failed, but continuing with submission:', aadharError);
          // Continue with submission even if Aadhar check fails
        }
      }
      
      // Create a new FormData instance
      const formData = new FormData();
      
      // Append files first
      if (photoFile) {
        formData.append('photo', photoFile);
        console.log('Photo file appended:', photoFile.name, photoFile.size);
      }
      
      if (signatureFile) {
        formData.append('signature', signatureFile);
        console.log('Signature file appended:', signatureFile.name, signatureFile.size);
      }
      
      // Process and append form values
      const { photo, signature, dateOfBirth, yearOfPassing, paymentDetails, academics, ...values } = formValues;
      
      // Convert dates to strings
      if (dateOfBirth) {
        values.dateOfBirth = dayjs(dateOfBirth).format('YYYY-MM-DD');
      }
      
      if (yearOfPassing) {
        values.yearOfPassing = dayjs(yearOfPassing).format('YYYY');
      }
      
      // Process academic records
      if (academics && Array.isArray(academics)) {
        values.academics = academics.map(record => {
          const academicRecord = {
            level: record.qualification || record.level,
            boardUniversity: record.boardUniversity,
            percentage: record.percentage
          };
          
          // Handle year of passing (it might be a Date object or a string)
          if (record.yearOfPassing) {
            academicRecord.year = dayjs(record.yearOfPassing).isValid() 
              ? dayjs(record.yearOfPassing).year() 
              : record.yearOfPassing;
          } else if (record.year) {
            academicRecord.year = record.year;
          }
          
          return academicRecord;
        }).filter(record => record.level && record.boardUniversity); // Filter out incomplete records
        
        console.log('Processed academic records:', values.academics);
        
        // Add academics as a JSON string since we're using FormData
        if (values.academics.length > 0) {
          formData.append('academics', JSON.stringify(values.academics));
        }
      }
      
      // Add payment details if available
      if (paymentDetails) {
        values.paymentDetails = paymentDetails;
      }
      
      console.log('Processed values for FormData:', values);
      
      // Add all form fields with better handling
      Object.entries(values).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          // Handle nested objects (like address, paymentDetails)
          if (typeof value === 'object' && !dayjs.isDayjs(value) && !Array.isArray(value)) {
            Object.entries(value).forEach(([nestedKey, nestedValue]) => {
              if (nestedValue !== null && nestedValue !== undefined && nestedValue !== '') {
                formData.append(`${key}.${nestedKey}`, nestedValue.toString());
                console.log(`Appended nested field: ${key}.${nestedKey} = ${nestedValue}`);
              }
            });
          } 
          // Handle regular values
          else {
            formData.append(key, value.toString());
            console.log(`Appended field: ${key} = ${value}`);
          }
        }
      });
      
      // Double check auth token
      const finalAuthToken = currentToken || localStorage.getItem('token');
      if (!finalAuthToken) {
        console.error('No authentication token found before final submission. Redirecting to login...');
        dispatch(setToken(null));
        localStorage.removeItem('token');
        navigate('/login');
        throw new Error('Your session has expired. Please log in again.');
      }
      
      // Prepare request config
      const config = {
        headers: {
          'Authorization': `Bearer ${finalAuthToken}`,
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.lengthComputable) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percentCompleted);
            console.log(`Upload progress: ${percentCompleted}%`);
          }
        },
        timeout: 300000,
      };
      
      // Make the API request
      const apiUrl = `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/university/registered-students/register`;
      
      console.log('Making final submission to:', apiUrl);
      console.log('FormData entries:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ', pair[1]);
      }
      
      const response = await axios.post(apiUrl, formData, config);
      const { data } = response;
      
      console.log('Server response:', data);
      
      if (data.success) {
        // Reset all loading states first
        setSubmitting(false);
        setUploading(false);
        setUploadProgress(0);
        
        // Show success notification
        notification.success({
          message: '🎉 Registration Successful!',
          description: (
            <div style={{ padding: '8px 0' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '12px',
                fontWeight: 500,
                fontSize: '15px',
                color: '#52c41a'
              }}>
                <CheckCircleOutlined style={{ 
                  fontSize: '20px',
                  marginRight: '10px' 
                }} />
                Registration Completed Successfully!
              </div>
              <div style={{ 
                backgroundColor: '#f6ffed',
                border: '1px solid #b7eb8f',
                padding: '12px',
                borderRadius: '4px',
                marginBottom: '12px'
              }}>
                <div style={{ marginBottom: '6px' }}>
                  Student <strong>{formValues.firstName} {formValues.lastName}</strong> has been registered successfully.
                </div>
                <div style={{ color: '#52c41a', fontWeight: 500 }}>
                  Registration ID: {data.data?.registrationId || 'N/A'}
                </div>
              </div>
              <div style={{ 
                fontSize: '13px', 
                color: '#8c8c8c',
                borderTop: '1px solid #f0f0f0',
                paddingTop: '10px',
                marginTop: '10px'
              }}>
                An email with registration details has been sent to {formValues.email}
              </div>
            </div>
          ),
          duration: 10,
          style: {
            width: 450,
            marginTop: '20px',
            borderLeft: '4px solid #52c41a',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1001
          },
          placement: 'topRight',
          closeIcon: <span style={{ fontSize: '16px', padding: '0 8px' }}>×</span>
        });
        
        // Reset form and file states
        try {
          if (form && typeof form.resetFields === 'function') {
            form.resetFields();
          }
        } catch (formError) {
          console.error('Error resetting form:', formError);
        }
        
        setPhotoFile(null);
        setSignatureFile(null);
        setPhotoPreview(null);
        setSignaturePreview(null);
        setPaymentStatus(null);
        setPaymentError(null);
        
        // Reset any other relevant states
        setPaymentMethod('offline');
        setShowPaymentModal(false);
        
        // Reset file lists for upload components
        try {
          if (form && typeof form.setFieldsValue === 'function') {
            form.setFieldsValue({ 
              photo: undefined,
              signature: undefined 
            });
          }
        } catch (setFieldsError) {
          console.error('Error resetting file fields:', setFieldsError);
        }
        
        // Force a re-render to update the UI
        if (forceUpdate && typeof forceUpdate === 'function') {
          forceUpdate();
        }
        
        // Redirect if needed
        if (data.redirectUrl) {
          navigate(data.redirectUrl);
        }
        
        return data;
      } else {
        const errorMsg = data.message || 'Failed to register student';
        
        // Handle validation errors
        if (data.errors) {
          console.error('Validation errors:', data.errors);
          Object.entries(data.errors).forEach(([field, errorMessage]) => {
            try {
              const fieldPath = field.split('.');
              if (form && typeof form.setFields === 'function') {
                form.setFields([{
                  name: fieldPath,
                  errors: [errorMessage]
                }]);
              }
            } catch (error) {
              console.error('Error setting field error:', error);
            }
          });
        }
        
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      
      // Handle 403 Forbidden (token expired)
      if (error.response && error.response.status === 403) {
        console.log('Token expired, logging out...');
        dispatch(setToken(null));
        localStorage.removeItem('token');
        navigate('/login');
        message.error('Your session has expired. Please log in again.');
        return;
      }
      
      // Reset all loading states
      setSubmitting(false);
      setUploading(false);
      setUploadProgress(0);
      setShowPaymentModal(false);
      
      // Enhanced error handling
      let errorMessage = 'Failed to submit form. Please try again.';
      
      if (error.response) {
        const { status, data } = error.response;
        console.error('Response error:', { status, data });
        
        if (status === 400) {
          errorMessage = data.message || 'Invalid request. Please check your input.';
        } else if (status === 401) {
          errorMessage = 'Session expired. Please log in again.';
          dispatch(setToken(null));
          localStorage.removeItem('token');
          navigate('/login');
          return;
        } else if (status === 413) {
          errorMessage = 'File size is too large. Maximum size is 10MB for photos and 5MB for signatures.';
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
        errorMessage = 'No response from server. Please check your internet connection.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your internet connection.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again with smaller files.';
      } else {
        errorMessage = error.message || errorMessage;
      }
      
      message.error(errorMessage);
      throw error;
    } finally {
      setSubmitting(false);
      setUploading(false);
      console.log('=== FORM SUBMISSION COMPLETED ===');
    }
  };

 
  // Render payment method section
  const renderPaymentMethodSection = () => (
    <div className="mb-8">
      <h3 className="text-lg font-medium mb-4 flex items-center">
        <CreditCardOutlined className="mr-2 text-blue-500" />
        Payment Method
      </h3>
      <Form.Item
        name="paymentMethod"
        label="Select Payment Method"
        rules={[{ required: true, message: 'Please select a payment method' }]}
        initialValue="online"
      >
        <Radio.Group
          onChange={(e) => {
            // Set paymentMode to 'cash' when offline is selected, otherwise use the selected value
            setPaymentMethod(e.target.value === 'offline' ? 'cash' : e.target.value);
            setPaymentStatus(null);
            setPaymentError(null);
          }}
        >
          <Radio value="online">
            <div className="flex items-center">
              <CreditCardOutlined className="mr-2" />
              <span>Online Payment (Credit/Debit Card, UPI, Net Banking)</span>
            </div>
          </Radio>
          <Radio value="offline">
            <div className="flex items-center">
              <BankOutlined className="mr-2" />
              <span>Pay at Institute</span>
            </div>
          </Radio>
        </Radio.Group>
      </Form.Item>
  
      {paymentMethod === 'online' ? (
        <div className="mt-4">
          <Button
            type={paymentStatus === 'completed' ? 'default' : 'primary'}
            onClick={handlePayment}
            loading={paymentLoading}
            className="w-full"
            icon={paymentStatus === 'completed' ? <CheckCircleOutlined /> : <CreditCardOutlined />}
            disabled={!photoFile || !signatureFile || paymentStatus === 'completed'}
          >
            {paymentLoading 
              ? 'Processing...' 
              : paymentStatus === 'completed' 
                ? 'Registration Completed' 
                : 'Pay Now 1000'
            }
          </Button>
          {paymentStatus === 'success' && (
            <div className="mt-2 text-green-600">
              <CheckCircleOutlined className="mr-2" />
              Payment successful! Click submit to complete registration.
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 text-gray-600">
          <InfoCircleOutlined className="mr-2" />
          Please submit the form to complete your registration. You can pay the fees at the institute.
        </div>
      )}
    </div>
  );

  // Render payment modal
  const renderPaymentModal = () => (
    <Modal
      title="Complete Your Payment"
      open={showPaymentModal}
      onCancel={() => {
        if (!paymentLoading) {
          setShowPaymentModal(false);
        }
      }}
      footer={null}
      width={500}
      closable={!paymentLoading}
      maskClosable={!paymentLoading}
    >
      <div className="text-center p-4">
        {paymentLoading && !paymentStatus && (
          <div className="py-8">
            <Spin size="large" />
            <div className="mt-4 text-gray-600">Processing your payment...</div>
          </div>
        )}

        {!paymentLoading && paymentStatus !== 'success' && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Registration Fee</span>
                <span className="font-bold">1000</span>
              </div>
              <div className="text-sm text-gray-500">Secure payment powered by Razorpay</div>
            </div>

            <Button
              type="primary"
              size="large"
              block
              onClick={handlePayment}
              loading={paymentLoading}
              className="h-12 text-base"
              icon={<CreditCardOutlined />}
            >
              Pay ₹10.00 Now
            </Button>

            <Button
              type="default"
              size="large"
              block
              onClick={() => setShowPaymentModal(false)}
              disabled={paymentLoading}
              className="h-12 text-base"
            >
              Cancel
            </Button>

            <div className="mt-6 text-xs text-gray-400 text-center">
              <p>Your payment is secure and encrypted.</p>
              <p>By continuing, you agree to our Terms & Conditions and Privacy Policy.</p>
            </div>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="py-4">
            <CheckCircleOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
            <div className="text-xl font-medium mt-4">Payment Successful!</div>
            <p className="text-gray-600 mt-2">Your registration is being processed.</p>
            <Button
              type="primary"
              className="mt-6"
              onClick={() => {
                setShowPaymentModal(false);
                form.submit();
              }}
            >
              Complete Registration
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center">
            <IdcardOutlined className="mr-2 text-blue-600" />
            <span>New Student Registration</span>
          </div>
        }
        className="shadow-lg"
      >
        {uploading && (
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span>Uploading files...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress percent={uploadProgress} status="active" />
          </div>
        )}
        
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            gender: 'male',
            sameAsPermanent: true
          }}
          scrollToFirstError={true}
        >
          {/* Personal Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <UserOutlined className="mr-2 text-blue-500" />
              Personal Information
            </h3>
          
            {/* Photo and Signature Upload */}
            <Row gutter={24} className="mb-6">
              <Col xs={24} sm={12} md={6} lg={4} className="mb-4">
                <div className="text-center">
                  <div className="relative inline-block mb-2">
                    <Avatar 
                      size={120} 
                      icon={<UserOutlined />} 
                      src={photoPreview}
                      className="border-2 border-dashed border-gray-300"
                    />
                    <Upload
                      name="photo"
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={beforeUpload}
                      onChange={handlePhotoChange}
                      customRequest={({ onSuccess }) => onSuccess('ok')}
                    >
                      <Button 
                        type="link" 
                        icon={<CameraOutlined />}
                        className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md"
                      >
                        {photoFile ? 'Change' : 'Upload'}
                      </Button>
                    </Upload>
                  </div>
                  <div className="text-sm text-gray-500">Student Photo (Max 10MB)</div>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={6} lg={4} className="mb-4">
                <div className="text-center">
                  <div className="relative inline-block mb-2">
                    <div className="w-30 h-20 border-2 border-dashed border-gray-300 flex items-center justify-center">
                      {signaturePreview ? (
                        <img 
                          src={signaturePreview} 
                          alt="Signature Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <div className="text-gray-400">Signature</div>
                      )}
                    </div>
                    <Upload
                      name="signature"
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={beforeUploadSignature}
                      onChange={handleSignatureChange}
                      customRequest={({ onSuccess }) => onSuccess('ok')}
                    >
                      <Button 
                        type="link" 
                        icon={<EditOutlined />}
                        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-2 shadow-md"
                      >
                        {signatureFile ? 'Change' : 'Upload'}
                      </Button>
                    </Upload>
                  </div>
                  <div className="text-sm text-gray-500 mt-6">Signature (Max 5MB)</div>
                </div>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="firstName"
                  label="First Name"
                  rules={[{ required: true, message: 'Please enter first name' }]}
                >
                  <Input placeholder="First Name" prefix={<UserOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="lastName"
                  label="Last Name"
                  rules={[{ required: true, message: 'Please enter last name' }]}
                >
                  <Input placeholder="Last Name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name={['parent', 'fatherName']}
                  label="Father's Name"
                  rules={[{ required: true, message: "Please enter father's name" }]}
                >
                  <Input placeholder="Father's Name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="dateOfBirth"
                  label="Date of Birth"
                  rules={[{ required: true, message: 'Please select date of birth' }]}
                >
                  <DatePicker 
                    style={{ width: '100%' }} 
                    placeholder="Select date of birth"
                    suffixIcon={<CalendarOutlined />}
                    disabledDate={(current) => {
                      return current && current > dayjs().endOf('day');
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="gender"
                  label="Gender"
                  rules={[{ required: true, message: 'Please select gender' }]}
                >
                  <Radio.Group>
                    <Radio value="male">Male</Radio>
                    <Radio value="female">Female</Radio>
                    <Radio value="other">Other</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="aadharNumber"
                  label="Aadhar Number"
                  rules={[
                    { required: true, message: 'Please enter Aadhar number' },
                    { pattern: /^[2-9]{1}[0-9]{11}$/, message: 'Please enter a valid 12-digit Aadhar number' }
                  ]}
                >
                  <Input 
                    placeholder="Enter 12-digit Aadhar number" 
                    maxLength={12}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
          
          {/* Contact Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <PhoneOutlined className="mr-2 text-blue-500" />
              Contact Information
            </h3>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="source"
                  label="How did you hear about us?"
                  rules={[{ required: true, message: 'Please select source' }]}
                >
                  <Select placeholder="Select source">
                    <Option value="newspaper">Newspaper</Option>
                    <Option value="social_media">Social Media</Option>
                    <Option value="friend">Friend/Family</Option>
                    <Option value="hoarding">Hoarding/Poster</Option>
                    <Option value="website">Website</Option>
                    <Option value="other">Other</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="referenceName"
                  label="Reference Name (If any)"
                >
                  <Input placeholder="Reference person name" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="referenceContact"
                  label="Reference Contact"
                  rules={[
                    { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit number' }
                  ]}
                >
                  <Input placeholder="Reference contact number" maxLength={10} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="referenceRelation"
                  label="Reference Relation"
                >
                  <Input placeholder="e.g., Friend, Relative, etc." />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input placeholder="Email" prefix={<MailOutlined />} />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[
                    { required: true, message: 'Please enter phone number' },
                    { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit number' }
                  ]}
                >
                  <Input 
                    placeholder="Phone Number" 
                    prefix={<PhoneOutlined />} 
                    maxLength={10}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="alternatePhone"
                  label="Alternate Phone"
                >
                  <Input 
                    placeholder="Alternate Phone" 
                    prefix={<PhoneOutlined />} 
                    maxLength={10}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Hostel & Transport Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <HomeOutlined className="mr-2 text-blue-500" />
              Accommodation & Transport
            </h3>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="hostelRequired"
                  label="Hostel Required"
                  rules={[{ required: true, message: 'Please select hostel requirement' }]}
                >
                  <Select placeholder="Select hostel requirement">
                    <Option value="yes">Yes</Option>
                    <Option value="no">No</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="hostelType"
                  label="Hostel Type"
                  dependencies={['hostelRequired']}
                  rules={[
                    ({ getFieldValue }) => ({
                      required: getFieldValue('hostelRequired') === 'yes',
                      message: 'Please select hostel type',
                    }),
                  ]}
                >
                  <Select 
                    placeholder="Select hostel type"
                    disabled={!form.getFieldValue('hostelRequired') === 'yes'}
                  >
                    <Option value="ac">AC</Option>
                    <Option value="non_ac">Non-AC</Option>
                    <Option value="deluxe">Deluxe</Option>
                    <Option value="standard">Standard</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="transportRequired"
                  label="Transport Required"
                  rules={[{ required: true, message: 'Please select transport requirement' }]}
                >
                  <Select placeholder="Select transport requirement">
                    <Option value="yes">Yes</Option>
                    <Option value="no">No</Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </div>

         

          {/* Address Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <HomeOutlined className="mr-2 text-blue-500" />
              Address Information
            </h3>
            <Row gutter={16}>
              <Col span={24} className="mb-4">
                <Form.Item
                  name={['address', 'line1']}
                  label="Address Line 1"
                  rules={[{ required: true, message: 'Please enter address' }]}
                >
                  <Input placeholder="Address Line 1" />
                </Form.Item>
              </Col>
              <Col span={24} className="mb-4">
                <Form.Item
                  name={['address', 'line2']}
                  label="Address Line 2 (Optional)"
                >
                  <Input placeholder="Address Line 2" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name={['address', 'city']}
                  label="City"
                  rules={[{ required: true, message: 'Please select your city' }]}
                >
                  <Select
                    showSearch
                    placeholder="Select your city"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={[
                      'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad',
                      'Chennai', 'Kolkata', 'Surat', 'Pune', 'Jaipur',
                      'Lucknow', 'Kanpur', 'Nagpur', 'Visakhapatnam', 'Indore',
                      'Thane', 'Bhopal', 'Patna', 'Vadodara', 'Ghaziabad'
                    ].map(city => ({ value: city, label: city }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name={['address', 'state']}
                  label="State"
                  rules={[{ required: true, message: 'Please select your state' }]}
                >
                  <Select
                    showSearch
                    placeholder="Select your state"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={[
                      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
                      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
                      'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
                      'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
                      'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
                      'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
                      'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
                      'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
                    ].map(state => ({ value: state, label: state }))}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name={['address', 'country']}
                  label="Country"
                  rules={[{ required: true, message: 'Please select your country' }]}
                >
                  <Select
                    showSearch
                    placeholder="Select your country"
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                    options={[
                      { value: 'India', label: 'India' },
                      { value: 'United States', label: 'United States' },
                      { value: 'United Kingdom', label: 'United Kingdom' },
                      { value: 'Canada', label: 'Canada' },
                      { value: 'Australia', label: 'Australia' },
                      { value: 'Germany', label: 'Germany' },
                      { value: 'France', label: 'France' },
                      { value: 'Japan', label: 'Japan' },
                      { value: 'China', label: 'China' },
                      { value: 'Russia', label: 'Russia' },
                      { value: 'Brazil', label: 'Brazil' },
                      { value: 'Mexico', label: 'Mexico' },
                      { value: 'Italy', label: 'Italy' },
                      { value: 'Spain', label: 'Spain' },
                      { value: 'South Korea', label: 'South Korea' },
                      { value: 'Singapore', label: 'Singapore' },
                      { value: 'Malaysia', label: 'Malaysia' },
                      { value: 'Saudi Arabia', label: 'Saudi Arabia' },
                      { value: 'United Arab Emirates', label: 'United Arab Emirates' },
                      { value: 'South Africa', label: 'South Africa' }
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name={['address', 'pincode']}
                  label="Pincode"
                  rules={[
                    { required: true, message: 'Please enter pincode' },
                    { pattern: /^[0-9]{6}$/, message: 'Please enter a valid 6-digit pincode' }
                  ]}
                >
                  <Input placeholder="Pincode" maxLength={6} />
                </Form.Item>
              </Col>
            </Row>
          </div>

          {/* Academic Information Section */}
         
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <BookOutlined className="mr-2 text-blue-500" />
              Academic Information
             </h3>
            <Form.List name="academics">
          {(fields, { add, remove }) => (
                <div className="space-y-4">
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className="border rounded-lg p-4">
                      <Row gutter={16}>
                        <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                          <Form.Item
                            {...restField}
                            name={[name, 'qualification']}
                            label="Qualification"
                            rules={[{ required: true, message: 'Please select qualification' }]}
                          >
                            <Select placeholder="Select qualification">
                              <Option value="10th">10th Standard</Option>
                              <Option value="12th">12th Standard</Option>
                              <Option value="diploma">Diploma</Option>
                              <Option value="bachelor">Bachelor's Degree</Option>
                              <Option value="master">Master's Degree</Option>
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                          <Form.Item
                            {...restField}
                            name={[name, 'yearOfPassing']}
                            label="Year of Passing"
                            rules={[{ required: true, message: 'Please select year' }]}
                          >
                            <DatePicker picker="year" style={{ width: '100%' }} placeholder="Select year" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                          <Form.Item
                            {...restField}
                            name={[name, 'boardUniversity']}
                            label="Board/University"
                            rules={[{ required: true, message: 'Please enter board/university' }]}
                          >
                            <Input placeholder="Board/University" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                          <Form.Item
                            {...restField}
                            name={[name, 'percentage']}
                            label="Percentage/CGPA"
                            rules={[{ required: true, message: 'Please enter percentage/CGPA' }]}
                          >
                            <InputNumber style={{ width: '100%' }} min={0} max={100} placeholder="Percentage/CGPA" />
                          </Form.Item>
                        </Col>
                      </Row>
                      {fields.length > 1 && (
                        <div className="text-right">
                          <Button 
                            type="link" 
                            danger 
                            onClick={() => remove(name)}
                            icon={<CloseCircleOutlined />}
                          >
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                  <Form.Item>
                    <Button 
                      type="dashed" 
                      onClick={() => add()} 
                      block 
                      icon={<PlusOutlined />}
                    >
                      Add Academic Record
                    </Button>
                  </Form.Item>
                </div>
              )}
            </Form.List>
        </div>

          {/* Course Selection Section */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <BankOutlined className="mr-2 text-blue-500" />
              Course Selection
            </h3>
            <Row gutter={16}>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="course"
                  label="Select Course"
                  rules={[{ required: true, message: 'Please select a course' }]}
                >
                  <Select 
                    placeholder={loadingCourses ? 'Loading courses...' : 'Select course'}
                    loading={loadingCourses}
                    showSearch
                    optionFilterProp="children"
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    {courses.map(course => (
                      <Option key={course._id} value={course._id}>
                        {course.courseName} {course.code ? `(${course.code})` : ''}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="specialization"
                  label="Specialization"
                >
                  <Select placeholder="Select specialization">
                    <Option value="cse">Computer Science</Option>
                    <Option value="it">Information Technology</Option>
                    <Option value="mechanical">Mechanical</Option>
                    <Option value="civil">Civil</Option>
                    <Option value="electrical">Electrical</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6} className="mb-4">
                <Form.Item
                  name="isScholarship"
                  valuePropName="checked"
                  style={{ marginTop: '30px' }}
                >
                  <Checkbox>Scholarship Student</Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </div>
 {/* Undertaking Section */}
 <div className="mb-8">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <InfoCircleOutlined className="mr-2 text-blue-500" />
              Declaration
            </h3>
            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="undertakingAccepted"
                  valuePropName="checked"
                  rules={[
                    {
                      validator: (_, value) =>
                        value ? Promise.resolve() : Promise.reject(new Error('You must accept the undertaking to proceed')),
                    },
                  ]}
                >
                  <Checkbox>
                    I hereby declare that all the information provided is true to the best of my knowledge. 
                    I understand that any false information may lead to cancellation of my registration.
                  </Checkbox>
                </Form.Item>
              </Col>
            </Row>
          </div>
          
          {/* Payment Method Section - This contains the payment button */}
          {renderPaymentMethodSection()}

          {/* Submit Button - Only show for offline payments */}
          {paymentMethod !== 'online' && (
            <Form.Item>
              <div className="flex justify-end">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md shadow-sm"
                >
                  {submitting ? 'Submitting...' : 'Submit Registration'}
                </Button>
              </div>
            </Form.Item>
          )}
        </Form>
      </Card>

      {/* Payment Modal - Using the renderPaymentModal function */}
      {renderPaymentModal()}
    </div>
  );
};

export default NewRegistration;