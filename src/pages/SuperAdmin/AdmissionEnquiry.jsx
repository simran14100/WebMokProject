import React, { useEffect, useState } from 'react';
import { 
  Table, Button, Input, Select, Card, Tag, Space, Modal, 
  message, Tooltip, Dropdown, Row, Col, Typography, Form, DatePicker, Checkbox
} from 'antd';
import { 
  SearchOutlined, EyeOutlined, DeleteOutlined, 
  PhoneOutlined, MailOutlined, UserOutlined, 
  DownOutlined, CalendarOutlined, BookOutlined,
  HomeOutlined, TeamOutlined, IdcardOutlined,
  EnvironmentOutlined, RiseOutlined, BranchesOutlined,
  ClockCircleOutlined, MoreOutlined, CheckCircleOutlined, EditOutlined
} from '@ant-design/icons';
import { axiosInstance as apiConnector } from '../../services/apiConnector';
import { 
  getAllAdmissionEnquiries, 
  deleteAdmissionEnquiry, 
  updateEnquiryStatus,
  processEnquiryToAdmission 
} from '../../services/operations/admissionEnquiryApi';
import { useSelector, useDispatch } from 'react-redux';
import moment from 'moment';
import { 
  isSuperAdmin, 
  hasAdminAccess, 
  isAdmin, 
  isStaff, 
  isInstructor, 
  isStudent 
} from '../../utils/roleUtils';
import { ACCOUNT_TYPE } from '../../utils/constants';

const { Title, Text } = Typography;
const { Option } = Select;

const AdmissionEnquiry = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ 
    current: 1, 
    pageSize: 10, 
    total: 0 
  });
  const [filters, setFilters] = useState({ 
    search: '', 
    status: '',
    programType: '' // No default program type
  });
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isProcessModalVisible, setIsProcessModalVisible] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [form] = Form.useForm();
  const [processingStatus, setProcessingStatus] = useState('contacted');
  const [processingNotes, setProcessingNotes] = useState('');
  
  const dispatch = useDispatch();
  const { token, user, loading: authLoading } = useSelector((state) => {
    const authState = state.auth || {};
    const profileUser = state.profile?.user;
    
    // Prefer user from auth state, fallback to profile user
    const currentUser = authState.user || profileUser;
    
    console.log('Redux state updated:', { 
      auth: authState,
      profile: state.profile,
      hasUser: !!currentUser,
      user: currentUser,
      loading: authState.loading
    });
    
    return {
      ...authState,
      user: currentUser,
      loading: authState.loading
    };
  });
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [authError, setAuthError] = useState(null);
  
  // Initialize auth check on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth check...');
        
        // If we already have a user, no need to fetch again
        if (user) {
          console.log('User already exists in store:', user);
          setIsInitialized(true);
          return;
        }
        
        console.log('No user found, fetching current user...');
        const { getCurrentUser } = await import('../../services/operations/authApi');
        const result = await dispatch(getCurrentUser());
        
        if (result?.payload?.user) {
          console.log('Successfully loaded user:', result.payload.user);
        } else {
          console.warn('No user data in response:', result);
          setAuthError('Failed to load user data');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setAuthError(error.message || 'Failed to initialize authentication');
      } finally {
        setIsInitialized(true);
      }
    };
    
    initializeAuth();
  }, [dispatch]);
  
  // Debug user info
  useEffect(() => {
    if (user) {
      console.log('Current user from Redux:', {
        user,
        accountType: user?.accountType,
        role: user?.role,
        isSuperAdmin: isSuperAdmin(user),
        hasAdminAccess: hasAdminAccess(user),
        isAdmin: isAdmin(user)
      });
    }
  }, [user]);
  
  // Main function to fetch enquiries with current filters and pagination
  const fetchEnquiries = async () => {
    try {
      console.log('Starting to fetch enquiries...');
      
      if (!token) {
        const errorMsg = 'Authentication token is missing';
        console.error(errorMsg);
        throw new Error(errorMsg);
      }
      
    
      
      setLoading(true);
      const { current, pageSize } = pagination;
      const { search, status, programType } = filters;

      console.log('Current filters:', { search, status, programType });
      console.log('Pagination:', { current, pageSize });

      try {
        // Fetch all enquiries using the debug endpoint
        console.log('Fetching all enquiries using debug endpoint...');
        const response = await apiConnector({
          method: 'GET',
          url: '/api/v1/admission-enquiries/debug',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          }
        });

        console.log('Debug API Response:', response);
        
        if (!response?.data?.success) {
          throw new Error('Failed to fetch enquiries: Invalid response format');
        }

        let allEnquiries = response.data.data || [];
        console.log('Total Enquiries in DB:', allEnquiries.length);
        
        if (allEnquiries.length > 0) {
          console.log('Sample Enquiry:', allEnquiries[0]);
        } else {
          console.log('No enquiries found in the database.');
        }

        // Apply client-side filtering
        let filteredEnquiries = [...allEnquiries];

        // Apply search filter
        if (search) {
          const searchLower = search.toLowerCase();
          filteredEnquiries = filteredEnquiries.filter(enquiry => 
            (enquiry.name && enquiry.name.toLowerCase().includes(searchLower)) ||
            (enquiry.email && enquiry.email.toLowerCase().includes(searchLower)) ||
            (enquiry.phone && enquiry.phone.includes(search)) ||
            (enquiry.fatherName && enquiry.fatherName.toLowerCase().includes(searchLower))
          );
        }

        // Apply status filter
        if (status) {
          filteredEnquiries = filteredEnquiries.filter(enquiry => 
            enquiry.status && enquiry.status.toLowerCase() === status.toLowerCase()
          );
        }

        // Apply program type filter
        if (programType) {
          filteredEnquiries = filteredEnquiries.filter(enquiry => 
            enquiry.programType && enquiry.programType.toUpperCase() === programType.toUpperCase()
          );
        }

        // Apply pagination
        const startIndex = (current - 1) * pageSize;
        const paginatedEnquiries = filteredEnquiries.slice(startIndex, startIndex + pageSize);
        
        // Format the enquiries for the table
        const formattedEnquiries = paginatedEnquiries.map(enquiry => ({
          ...enquiry,
          key: enquiry._id || enquiry.id,
          fullName: enquiry.name,
          contact: enquiry.phone,
          email: enquiry.email,
          programType: enquiry.programType || 'N/A',
          status: enquiry.status || 'new',
          createdAt: enquiry.createdAt ? new Date(enquiry.createdAt).toLocaleDateString() : 'N/A'
        }));
        
        // Update state with the filtered and paginated data
        setEnquiries(formattedEnquiries);
        setPagination(prev => ({
          ...prev,
          total: filteredEnquiries.length,
          current: current > Math.ceil(filteredEnquiries.length / pageSize) ? 1 : current,
          pageSize: pageSize
        }));
        
        // Show success message
        if (formattedEnquiries.length === 0) {
          message.info('No enquiries found with the current filters');
        } else {
          const showingCount = Math.min(filteredEnquiries.length - startIndex, pageSize);
          message.success(`Showing ${showingCount} of ${filteredEnquiries.length} filtered enquiries`);
        }
        
      } catch (apiError) {
        console.error('API Call Error:', {
          message: apiError.message,
          stack: apiError.stack,
          response: apiError.response?.data
        });
        
        const errorMessage = apiError.response?.data?.message || 
                           apiError.message || 
                           'An error occurred while fetching enquiries';
        
        message.error(errorMessage);
        
        if (apiError.response?.status === 401) {
          console.log('Authentication error, redirecting to login...');
          // You might want to redirect to login here
          // navigate('/login');
        }
        
        throw apiError;
      }
    } catch (error) {
      console.error('Error fetching enquiries:', error);
      message.error(error.message || 'Failed to fetch enquiries');
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch all enquiries without filters (for debugging)
  const fetchAllEnquiries = async () => {
    try {
      console.log('Fetching all enquiries using debug endpoint...');
      const response = await apiConnector({
        method: 'GET',
        url: '/api/v1/admission-enquiries/debug',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        }
      });
      
      console.log('Debug API Response:', response);
      
      if (response?.data?.success) {
        console.log('Total Enquiries in DB:', response.data.count);
        if (response.data.data && response.data.data.length > 0) {
          console.log('Sample Enquiry:', response.data.data[0]);
        } else {
          console.log('No enquiries found in the database.');
        }
      }
    } catch (error) {
      console.error('Error fetching all enquiries:', error);
    }
  };

  // Fetch enquiries on component mount and when filters/pagination change
  useEffect(() => {
    // Add a small delay to ensure state updates before fetching
    const timer = setTimeout(() => {
      fetchEnquiries();
      // Check for any enquiries in the database (debugging)
      fetchAllEnquiries();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [filters, pagination.current, pagination.pageSize]);
  
  // Show loading state while initializing
  if (!isInitialized || authLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading your account information...</p>
        </div>
      </div>
    );
  }

  // Handle auth errors
  if (authError) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Authentication Error</h4>
          <p>{authError}</p>
          <div className="mt-3">
            <button 
              className="btn btn-primary me-2"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
            <button 
              className="btn btn-outline-secondary"
              onClick={() => window.location.href = '/login'}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('No user found, redirecting to login...');
    // Using a small timeout to ensure the error message is shown before redirect
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
    
    return (
      <div className="text-center p-5">
        <div className="alert alert-warning">
          <h4>Authentication Required</h4>
          <p>You need to be logged in to access this page.</p>
          <p>Redirecting to login page...</p>
        </div>
      </div>
    );
  }
  
  // Check if user has admin or super admin access
  const checkAdminAccess = () => {
    console.log('checkAdminAccess called with state:', {
      isInitialized,
      authLoading,
      user: user ? {
        ...user,
        role: user.role,
        accountType: user.accountType,
        isSuperAdmin: isSuperAdmin(user),
        hasAdminAccess: hasAdminAccess(user)
      } : null
    });

    // If still loading or not initialized, return false but don't show error
    if (!isInitialized || authLoading) {
      console.log('Access check: Waiting for initialization or auth to load');
      return false;
    }
    
    // If no user after loading is complete, show login message
    if (!user) {
      const errorMsg = 'No user object found in Redux store';
      console.error(errorMsg);
      message.error('Please log in to access this page');
      return false;
    }
    
    // Check if user has admin access
    const adminAccess = hasAdminAccess(user);
    const superAdmin = isSuperAdmin(user);
    const userRole = user.role || user.accountType;
    
    console.log('Admin access check result:', {
      hasAdminAccess: adminAccess,
      isSuperAdmin: superAdmin,
      userRole,
      accountType: user.accountType
    });
    
    if (!adminAccess && !superAdmin) {
      console.warn('User does not have admin access:', {
        userId: user._id,
        email: user.email,
        role: userRole,
        accountType: user.accountType
      });
      return false;
    }
    
    console.log('Access granted - User has admin or super admin privileges');
    return true;
  };

  // Check admin access after we're sure user is loaded
  const hasAccess = checkAdminAccess();
  if (!hasAccess) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Access Denied</h4>
          <p>You don't have permission to view this page.</p>
          <p>Please contact an administrator if you believe this is an error.</p>
          <div className="mt-3">
            <button 
              className="btn btn-primary me-2" 
              onClick={() => window.location.href = '/dashboard'}
            >
              Go to Dashboard
            </button>
            <button 
              className="btn btn-outline-secondary" 
              onClick={() => window.location.href = '/login'}
            >
              Switch Account
            </button>
          </div>
        </div>
      </div>
    );
  }

  const programTypeOptions = [
    { value: 'UG', label: 'UG', color: 'blue' },
    { value: 'PG', label: 'PG', color: 'purple' },
    { value: 'PHD', label: 'PhD', color: 'orange' }
  ];

  const handleMenuClick = (key, record) => {
    switch (key) {
      case 'view':
        setSelectedEnquiry(record);
        setIsModalVisible(true);
        break;
      case 'process':
        setSelectedEnquiry(record);
        setProcessingStatus(record.status || 'contacted');
        setProcessingNotes(record.notes || '');
        setIsProcessModalVisible(true);
        break;
      case 'delete':
        handleDeleteEnquiry(record._id);
        break;
      default:
        break;
    }
  };

  const handleProcessSubmit = async () => {
    if (!selectedEnquiry) return;
    
    try {
      await updateEnquiryStatus(
        selectedEnquiry._id, 
        { 
          status: processingStatus,
          notes: processingNotes 
        },
        token
      );
      
      // Refresh the enquiries list
      fetchEnquiries();
      message.success('Enquiry processed successfully');
      setIsProcessModalVisible(false);
    } catch (error) {
      console.error('Error processing enquiry:', error);
      message.error(error.message || 'Failed to process enquiry');
    }
  };

  const menuItems = [
    {
      key: 'view',
      label: 'View Details',
      icon: <EyeOutlined />,
    },
    {
      key: 'process',
      label: 'Process to Admission',
      icon: <CheckCircleOutlined />,
      onClick: (record) => {
        setSelectedEnquiry(record);
        setIsProcessModalVisible(true);
      },
    },
    
    {
      type: 'divider',
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: <DeleteOutlined />,
      danger: true,
    },
  ];

  const columns = [
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'left',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: menuItems,
            onClick: ({ key }) => handleMenuClick(key, record),
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<MoreOutlined style={{ fontSize: '18px' }} />} />
        </Dropdown>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      fixed: 'left',
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      render: (text) => (
        <div className="flex items-center">
          <IdcardOutlined className="mr-2 text-blue-500" />
          <span>{text || 'N/A'}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 250,
      render: (email) => (
        <div className="flex items-center">
          <MailOutlined className="mr-2 text-blue-500" />
          <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
            {email || 'N/A'}
          </a>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (phone) => (
        <div className="flex items-center">
          <PhoneOutlined className="mr-2 text-green-500" />
          {phone || 'N/A'}
        </div>
      ),
    },
    {
      title: 'Program',
      dataIndex: 'programType',
      key: 'programType',
      width: 120,
      render: (type) => {
        const program = programTypeOptions.find(p => p.value === type) || {};
        return (
          <Tag color={program.color || 'default'}>
            {program.label || type || 'N/A'}
          </Tag>
        );
      },
      filters: programTypeOptions.map(p => ({
        text: p.label,
        value: p.value
      })),
      onFilter: (value, record) => record.programType === value,
      filterMultiple: false,
    },
    
    {
      title: 'Contact',
      key: 'contact',
      width: 200,
      render: (_, record) => (
        <div className="space-y-1">
          <div className="flex items-center">
            <MailOutlined className="mr-2 text-blue-500" />
            <a href={`mailto:${record.email}`} className="text-blue-600 hover:underline">
              {record.email || 'N/A'}
            </a>
          </div>
          <div className="flex items-center">
            <PhoneOutlined className="mr-2 text-green-500" />
            {record.phone || 'N/A'}
          </div>
          {record.alternateNumber && (
            <div className="flex items-center text-sm text-gray-500">
              <PhoneOutlined className="mr-2" />
              {record.alternateNumber} (Alt)
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Personal Info',
      key: 'personalInfo',
      width: 200,
      render: (_, record) => (
        <div className="space-y-1">
          <div><CalendarOutlined className="mr-2" /> 
            {record.dateOfBirth ? new Date(record.dateOfBirth).toLocaleDateString() : 'N/A'}
          </div>
          <div><UserOutlined className="mr-2" /> {record.gender || 'N/A'}</div>
          <div><TeamOutlined className="mr-2" /> {record.parentName || 'N/A'}</div>
        </div>
      ),
    },
    {
      title: 'Address',
      key: 'address',
      width: 200,
      render: (_, record) => {
        const address = typeof record.address === 'object' 
          ? `${record.address.street || ''}, ${record.address.city || ''} ${record.address.state || ''} ${record.address.pincode || ''}`.replace(/\s+/g, ' ').trim()
          : record.address;
          
        const location = [record.city, record.state].filter(Boolean).join(', ') || 
                       (record.address && record.address.city && record.address.state 
                         ? `${record.address.city}, ${record.address.state}` 
                         : 'N/A');
                          
        return (
          <div className="space-y-1">
            <div><EnvironmentOutlined className="mr-2" /> {address || 'N/A'}</div>
            <div className="text-sm text-gray-600">
              {location}
            </div>
          </div>
        );
      },
    },
    {
      title: 'Highest Qualification',
      key: 'academicInfo',
      width: 250,
      render: (_, record) => (
        <div className="space-y-1">
          <div><BookOutlined className="mr-2" /> {record.lastClass || 'N/A'}</div>
          <div className="text-sm">{record.boardSchoolName || 'N/A'}</div>
          {record.percentage && (
            <div><RiseOutlined className="mr-2" /> {record.percentage}%</div>
          )}
        </div>
      ),
    },
    
    // {
    //   title: 'Additional Info',
    //   key: 'additionalInfo',
    //   width: 200,
    //   render: (_, record) => (
    //     <div className="space-y-1">
    //       <div><CalendarOutlined className="mr-2" /> {record.academicYear || 'N/A'}</div>
    //       <div><BranchesOutlined className="mr-2" /> {record.stream || 'N/A'}</div>
    //       <div><ClockCircleOutlined className="mr-2" /> {record.modeOfStudy || 'Day School'}</div>
    //     </div>
    //   ),
    // },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status) => {
        const statusMap = {
          'pending': { color: 'orange', text: 'Pending' },
          'contacted': { color: 'blue', text: 'Contacted' },
          'admitted': { color: 'green', text: 'Admitted' },
          'rejected': { color: 'red', text: 'Rejected' },
          'new': { color: 'blue', text: 'New' },
          'follow up': { color: 'orange', text: 'Follow Up' },
          'converted': { color: 'green', text: 'Converted' }
        };
        
        const statusInfo = statusMap[status?.toLowerCase()] || { color: 'default', text: status || 'N/A' };
        
        return (
          <Tag 
            color={statusInfo.color} 
            className="capitalize flex items-center justify-center"
            style={{ minWidth: '100px' }}
          >
            {statusInfo.text}
          </Tag>
        );
      },
      filters: [
        { text: 'New', value: 'new' },
        { text: 'Pending', value: 'pending' },
        { text: 'Contacted', value: 'contacted' },
        { text: 'Follow Up', value: 'follow up' },
        { text: 'Admitted', value: 'admitted' },
        { text: 'Converted', value: 'converted' },
        { text: 'Rejected', value: 'rejected' },
      ],
      onFilter: (value, record) => record.status?.toLowerCase() === value.toLowerCase(),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'date',
      width: 150,
      render: (date) => (
        <div className="flex items-center">
          <CalendarOutlined className="mr-2 text-blue-500" />
          <span>{date ? moment(date).format('DD MMM YYYY') : 'N/A'}</span>
        </div>
      ),
      sorter: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
    },
    
    
    // {
    //   title: 'Qualification',
    //   dataIndex: 'qualification',
    //   key: 'qualification',
    //   width: 150,
    //   render: (qualification) => qualification || 'N/A',
    // },
    {
      title: 'Applying Course',
      dataIndex: 'graduationCourse',
      key: 'graduationCourse',
      width: 150,
      render: (graduationCourse) => graduationCourse || 'N/A',
    },
   
];

 
  // Handle table change (pagination, filters, sorter)
  const handleTableChange = (newPagination, tableFilters, sorter) => {
    const newFilters = { ...filters };
    
    // Update status filter if changed
    if (tableFilters.status) {
      newFilters.status = tableFilters.status[0] || '';
    }
    
    // Update program type filter if changed
    if (tableFilters.programType) {
      newFilters.programType = tableFilters.programType[0] || '';
    }
    
    // Update pagination
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));
    
    // Only update filters if they actually changed
    if (JSON.stringify(newFilters) !== JSON.stringify(filters)) {
      setFilters(newFilters);
    }
    
    // Add a small delay to ensure state updates before fetching
    setTimeout(() => {
      fetchEnquiries();
    }, 0);
  };
  
  // Handle status update
  const handleStatusUpdate = async (enquiryId, newStatus) => {
    try {
      await updateEnquiryStatus(enquiryId, { status: newStatus }, token);
      message.success(`Enquiry marked as ${newStatus}`);
      fetchEnquiries(); // Refresh the list
    } catch (error) {
      console.error('Error updating status:', error);
      message.error(error.message || 'Failed to update status');
    }
  };

  // Handle filter changes
  const handleFilterChange = (filterName, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [filterName]: value,
      ...(filterName === 'programType' && value === '' ? { programType: undefined } : {})
    }));
    
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  };

  // Handle delete enquiry
  const handleDeleteEnquiry = async (enquiryId) => {
    try {
      await deleteAdmissionEnquiry(enquiryId, token);
      message.success('Enquiry deleted successfully');
      fetchEnquiries(); // Refresh the list
    } catch (error) {
      console.error('Error deleting enquiry:', error);
      message.error(error.message || 'Failed to delete enquiry');
    }
  };

  // Render the component
  return (
    <div style={{
      marginTop: '4rem',
      padding: '0 1rem',
      maxWidth: '100%',
      overflowX: 'auto'
    }}>
      <Card 
        style={{
          marginTop: '8rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          borderRadius: '0.5rem',
          overflow: 'hidden',
          marginBottom: '2rem'
        }}
        title={
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            color: '#1a365d'
          }}>
            Admission Enquiries
          </span>
        }
        extra={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <Input
              prefix={<SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.25)' }} />}
              placeholder="Search enquiries..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
            <Select
              placeholder="Program Type"
              style={{ width: 120 }}
              value={filters.programType}
              onChange={(value) => handleFilterChange('programType', value)}
              styles={{
                popup: {
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <Option value="UG">UG</Option>
              <Option value="PG">PG</Option>
              <Option value="PHD">PhD</Option>
            </Select>
            <Select
              placeholder="Status"
              style={{ width: 150 }}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              allowClear
              styles={{
                popup: {
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <Option value="new">New</Option>
              <Option value="contacted">Contacted</Option>
              <Option value="follow up">Follow Up</Option>
              <Option value="admitted">Admitted</Option>
              <Option value="rejected">Rejected</Option>
            </Select>
          </div>
        }
      >
        <div style={{ overflowX: 'auto' }}>
          <Table
            columns={columns}
            dataSource={Array.isArray(enquiries) ? enquiries : []}
            rowKey="_id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showTotal: (total) => (
                <span style={{ 
                  fontSize: '0.875rem',
                  color: '#4a5568',
                  marginRight: '1rem'
                }}>
                  Total {total} enquiries
                </span>
              ),
              pageSizeOptions: ['10', '20', '50', '100'],
              style: {
                margin: '16px 0',
                padding: '0 16px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px'
              },
              showQuickJumper: true,
              showSizeChanger: true,
              size: 'default',
              position: ['bottomRight']
            }}
            onChange={handleTableChange}
            scroll={{ x: 'max-content' }}
            style={{
              width: '100%',
              border: '1px solid #f0f0f0',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
            rowClassName={() => 'table-row'}
          />
        </div>
      </Card>

      {/* Enquiry Details Modal */}
      <Modal
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: '1.25rem',
            fontWeight: 500
          }}>
            <UserOutlined style={{ 
              color: '#1890ff',
              marginRight: '8px',
              fontSize: '1.1em'
            }} />
            <span>Enquiry Details</span>
          </div>
        }
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button 
            key="close" 
            onClick={() => setIsModalVisible(false)}
            style={{
              marginRight: '8px',
              borderRadius: '4px',
              padding: '0 16px',
              height: '32px',
              fontSize: '14px',
              border: '1px solid #d9d9d9',
              background: '#fff',
              color: 'rgba(0, 0, 0, 0.65)'
            }}
          >
            Close
          </Button>,
          selectedEnquiry?.status !== 'admitted' && selectedEnquiry?.status !== 'rejected' && (
            <Dropdown
              key="status"
              menu={{
                items: [
                  {
                    key: 'pending',
                    label: 'Mark as Pending',
                    onClick: () => handleStatusUpdate(selectedEnquiry._id, 'pending')
                  },
                  {
                    key: 'contacted',
                    label: 'Mark as Contacted',
                    onClick: () => handleStatusUpdate(selectedEnquiry._id, 'contacted')
                  },
                  {
                    key: 'admitted',
                    label: 'Mark as Admitted',
                    danger: true,
                    onClick: () => handleStatusUpdate(selectedEnquiry._id, 'admitted')
                  },
                  {
                    key: 'rejected',
                    label: 'Reject Application',
                    danger: true,
                    onClick: () => handleStatusUpdate(selectedEnquiry._id, 'rejected')
                  },
                ],
              }}
              placement="topRight"
              overlayStyle={{
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              <Button 
                type="primary"
                style={{
                  borderRadius: '4px',
                  padding: '0 15px',
                  height: '32px',
                  fontSize: '14px',
                  fontWeight: 400,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Update Status 
                <DownOutlined style={{ fontSize: '12px' }} />
              </Button>
            </Dropdown>
          ),
        ]}
        width={800}
        styles={{
          body: { 
            maxHeight: '70vh', 
            overflowY: 'auto',
            padding: '0 24px 24px 24px'
          }
        }}
      >
        {selectedEnquiry && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Text type="secondary" className="block mb-1">Full Name</Text>
                  <Text strong className="text-lg">
                    {selectedEnquiry.fullName || 
                     `${selectedEnquiry.firstName || ''} ${selectedEnquiry.lastName || ''}`.trim() || 'N/A'}
                  </Text>
                </div>
                
                <div>
                  <Text type="secondary" className="block mb-1">Email</Text>
                  <div className="flex items-center">
                    <MailOutlined className="mr-2 text-blue-500" />
                    <a 
                      href={`mailto:${selectedEnquiry.email}`} 
                      className="text-blue-600 hover:underline"
                    >
                      {selectedEnquiry.email || 'N/A'}
                    </a>
                  </div>
                </div>
                
                <div>
                  <Text type="secondary" className="block mb-1">Phone</Text>
                  <div className="flex items-center">
                    <PhoneOutlined className="mr-2 text-green-500" />
                    <a 
                      href={`tel:${selectedEnquiry.mobileNumber || selectedEnquiry.phone}`}
                      className="text-gray-800 hover:text-blue-600"
                    >
                      {selectedEnquiry.mobileNumber || selectedEnquiry.phone || 'N/A'}
                    </a>
                  </div>
                </div>
                
                {selectedEnquiry.alternateNumber && (
                  <div>
                    <Text type="secondary" className="block mb-1">Alternate Phone</Text>
                    <div className="flex items-center">
                      <PhoneOutlined className="mr-2 text-gray-500" />
                      <a 
                        href={`tel:${selectedEnquiry.alternateNumber}`}
                        className="text-gray-800 hover:text-blue-600"
                      >
                        {selectedEnquiry.alternateNumber}
                      </a>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <Text type="secondary" className="block mb-1">Program Type</Text>
                  <Tag 
                    color={selectedEnquiry.programType === 'UG' ? 'blue' : 
                          selectedEnquiry.programType === 'PG' ? 'green' : 'purple'}
                    className="text-sm"
                  >
                    {selectedEnquiry.programType || 'N/A'}
                  </Tag>
                </div>
                
                <div>
                  <Text type="secondary" className="block mb-1">Education</Text>
                  <div>
                    <div className="font-medium">
                      {selectedEnquiry.lastClass || selectedEnquiry.qualification || 'N/A'}
                    </div>
                    {selectedEnquiry.boardSchoolName && (
                      <div className="text-sm text-gray-600 mt-1">
                        {selectedEnquiry.boardSchoolName}
                      </div>
                    )}
                    {selectedEnquiry.percentage && (
                      <div className="text-sm text-gray-600">
                        Percentage: {selectedEnquiry.percentage}%
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <Text type="secondary" className="block mb-1">Address</Text>
                  <div className="flex items-start">
                    <HomeOutlined className="mr-2 mt-1 text-blue-500 flex-shrink-0" />
                    <div>
                      {selectedEnquiry.address && typeof selectedEnquiry.address === 'object' ? (
                        <>
                          <div>{selectedEnquiry.address.street || 'N/A'}</div>
                          <div className="text-gray-600">
                            {[
                              selectedEnquiry.address.city, 
                              selectedEnquiry.address.state, 
                              selectedEnquiry.address.pincode
                            ].filter(Boolean).join(', ')}
                          </div>
                        </>
                      ) : (
                        <>
                          <div>{selectedEnquiry.address || 'N/A'}</div>
                          {(selectedEnquiry.city || selectedEnquiry.state) && (
                            <div className="text-gray-600">
                              {[
                                selectedEnquiry.city, 
                                selectedEnquiry.state, 
                                selectedEnquiry.pincode
                              ].filter(Boolean).join(', ')}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div>
                <Text type="secondary" className="block text-sm">Enquiry Status</Text>
                <Tag 
                  color={{
                    'new': 'blue',
                    'pending': 'orange',
                    'contacted': 'green',
                    'follow up': 'orange',
                    'admitted': 'green',
                    'converted': 'green',
                    'rejected': 'red'
                  }[selectedEnquiry.status?.toLowerCase()] || 'default'}
                  className="capitalize text-sm py-1 px-3"
                >
                  {selectedEnquiry.status || 'N/A'}
                </Tag>
              </div>
              
              <div className="text-right">
                <Text type="secondary" className="block text-sm">Submitted On</Text>
                <Text className="font-medium">
                  {selectedEnquiry.createdAt && moment(new Date(selectedEnquiry.createdAt)).isValid() 
                    ? moment(new Date(selectedEnquiry.createdAt)).format('DD MMM YYYY hh:mm A')
                    : 'N/A'}
                </Text>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Process Admission Modal */}
      <Modal
        title={
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            fontSize: '18px',
            color: '#1d4ed8'
          }}>
            <CheckCircleOutlined style={{ color: '#10b981' }} />
            <span>Process Admission</span>
          </div>
        }
        open={isProcessModalVisible}
        onCancel={() => {
          setIsProcessModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setIsProcessModalVisible(false);
            form.resetFields();
          }}>
            Cancel
          </Button>,
          <Button 
            key="process" 
            type="primary" 
            loading={processing}
            onClick={() => form.submit()}
            style={{ backgroundColor: '#10b981', borderColor: '#10b981' }}
          >
            Process Admission
          </Button>,
        ]}
        width={700}
      >
        {selectedEnquiry && (
          <Form
            form={form}
            layout="vertical"
            onFinish={async (values) => {
              try {
                setProcessing(true);
                
                // Prepare the data to send to the backend
                const admissionData = {
                  source: values.source,
                  isScholarship: values.isScholarship || false,
                  ...(values.isScholarship && { scholarshipType: values.scholarshipType }),
                  followUpDate: values.followUpDate.format('YYYY-MM-DD'),
                  notes: values.notes
                };
                
                await processEnquiryToAdmission(selectedEnquiry._id, admissionData, token);
                
                message.success('Admission processed successfully');
                setIsProcessModalVisible(false);
                form.resetFields();
                fetchEnquiries(); // Refresh the list
              } catch (error) {
                console.error('Error processing admission:', error);
                message.error(error.message || 'Failed to process admission');
              } finally {
                setProcessing(false);
              }
            }}
          >
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Student Information</h3>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Full Name">
                      <Input value={selectedEnquiry.fullName || `${selectedEnquiry.firstName || ''} ${selectedEnquiry.lastName || ''}`.trim()} disabled />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Email">
                      <Input value={selectedEnquiry.email} disabled />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item label="Phone">
                      <Input value={selectedEnquiry.mobileNumber || selectedEnquiry.phone} disabled />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="City">
                      <Input value={selectedEnquiry.city || 'N/A'} disabled />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item label="Address">
                      <Input.TextArea 
                        value={selectedEnquiry.address || 'N/A'} 
                        disabled 
                        autoSize={{ minRows: 2, maxRows: 4 }}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Admission Details</h3>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="followUpDate"
                      label="Follow Up Date"
                      rules={[{ required: true, message: 'Please select follow up date' }]}
                    >
                      <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="source"
                      label="Source"
                      rules={[{ required: true, message: 'Please select source' }]}
                    >
                      <Select placeholder="Select source">
                        <Option value="website">Website</Option>
                        <Option value="walkin">Walk-in</Option>
                        <Option value="reference">Reference</Option>
                        <Option value="social_media">Social Media</Option>
                        <Option value="newspaper">Newspaper</Option>
                        <Option value="other">Other</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="isScholarship"
                      label="Scholarship"
                      valuePropName="checked"
                      initialValue={false}
                    >
                      <Checkbox>Eligible for Scholarship</Checkbox>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      noStyle
                      shouldUpdate={(prevValues, currentValues) => 
                        prevValues.isScholarship !== currentValues.isScholarship
                      }
                    >
                      {({ getFieldValue }) =>
                        getFieldValue('isScholarship') ? (
                          <Form.Item
                            name="scholarshipType"
                            label="Scholarship Type"
                            rules={[{ required: true, message: 'Please select scholarship type' }]}
                          >
                            <Select placeholder="Select scholarship type">
                              <Option value="merit">Merit-based</Option>
                              <Option value="sports">Sports Quota</Option>
                              <Option value="minority">Minority</Option>
                              <Option value="other">Other</Option>
                            </Select>
                          </Form.Item>
                        ) : null
                      }
                    </Form.Item>
                  </Col>
                </Row>
                {/* <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="fees"
                      label="Fees (₹)"
                      rules={[{ required: true, message: 'Please enter fees' }]}
                    >
                      <Input type="number" placeholder="Enter fees" />
                    </Form.Item>
                  </Col>
                </Row> */}
              </div>

              <Form.Item
                name="notes"
                label="Additional Notes"
              >
                <Input.TextArea rows={4} placeholder="Enter any additional notes" />
              </Form.Item>
            </div>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default AdmissionEnquiry;
