import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, Button, message, Space, Card, Row, Col, Select, Input, Table } from 'antd';
import { PlusOutlined, UploadOutlined, DownloadOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
// Import components
import ResultList from './ResultList';
import ResultForm from './ResultForm';
import ResultUpload from './ResultUpload';

// Import API services
import { getResults, createResult, updateResult, deleteResult } from '../../../../../services/resultApi';
import { listExamSessions } from '../../../../../services/examSessionApi';
import { listStudents } from '../../../../../services/operations/studentApi';
import { listCourses } from '../../../../../services/operations/courseApi';
import { listSessions } from '../../../../../services/sessionApi';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api/v1';

// Download marksheet
const downloadMarksheet = async (resultId) => {
  try {
    const response = await axios.get(`${API_URL}/coursework/results/${resultId}/download`, {
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Accept': 'application/pdf, application/octet-stream'
      }
    });

    // Create a download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `marksheet-${resultId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    
    return {
      success: true,
      message: 'Marksheet downloaded successfully'
    };
  } catch (error) {
    console.error('Error downloading marksheet:', error);
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Failed to download marksheet'
    };
  }
};

// Get courses with filters
const getCourses = async (filters = {}) => {
  try {
    console.log('Fetching courses with filters:', filters);
    const token = localStorage.getItem('token');
    console.log('Using API URL:', API_URL);
    
    const response = await axios.get(`${API_URL}/ugpg/courses`, {
      params: {
        ...filters,
        status: 'active' // Only fetch active courses by default
      },
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Raw API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data
    });
    
    // Standardize the response format
    if (response.data && response.data.success) {
      const coursesData = response.data.data || response.data.courses || [];
      console.log('Courses data received:', coursesData);
      
      return {
        success: true,
        data: coursesData,
        total: response.data.total || coursesData.length,
        message: response.data.message
      };
    } else {
      const errorMsg = response.data?.message || 'Invalid response format from server';
      console.error('Invalid response format:', response.data);
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('Error in getCourses:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        params: error.config?.params
      }
    });
    
    const errorMessage = error.response?.data?.message || 
                        error.message || 
                        'Failed to fetch courses';
    
    throw new Error(errorMessage);
  }
};

// Get students with filters
const getStudents = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_URL}/university/registered-students`, {
      params: {
        ...filters,
        status: 'approved', // Ensure we only get approved students
      },
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    // Handle different response formats
    const responseData = response.data;
    let students = [];
    
    if (Array.isArray(responseData)) {
      students = responseData;
    } else if (responseData && Array.isArray(responseData.data)) {
      students = responseData.data;
    } else if (responseData && Array.isArray(responseData.students)) {
      students = responseData.students;
    }

    return {
      success: true,
      data: students,
      pagination: responseData.pagination || {
        total: students.length,
        current: 1,
        pageSize: 10,
      },
    };
  } catch (error) {
    console.error('Error in getStudents:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch students';
    return {
      success: false,
      message: errorMessage,
      data: []
    };
  }
};



const { TabPane } = Tabs;
const { Option } = Select;

const ResultGeneration = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [editingResult, setEditingResult] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleTabChange = (key) => {
    if (key === 'add') {
      // Clear editing state when switching to add mode
      setEditingResult(null);
    }
    setActiveTab(key);
  };
  
  // Table columns configuration
  const columns = [
    {
      title: 'Student',
      dataIndex: ['student', 'name'],
      key: 'student',
      render: (_, record) => record.student?.name || record.studentId || 'N/A',
    },
    {
      title: 'Course',
      dataIndex: ['course', 'name'],
      key: 'course',
      render: (_, record) => record.course?.name || record.courseId || 'N/A',
    },
    {
      title: 'Exam Session',
      dataIndex: ['examSession', 'name'],
      key: 'examSession',
      render: (_, record) => record.examSession?.name || record.examSessionId || 'N/A',
    },
    {
      title: 'Marks',
      dataIndex: 'marks',
      key: 'marks',
      render: (marks) => marks ? Number(marks).toFixed(2) : 'N/A',
    },
    {
      title: 'Grade',
      dataIndex: 'grade',
      key: 'grade',
      render: (grade) => grade || 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => status ? status.charAt(0).toUpperCase() + status.slice(1) : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            onClick={() => handleViewResult(record)}
            icon={<EditOutlined />}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            danger
            onClick={() => handleDeleteResult(record._id)}
            icon={<DeleteOutlined />}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];
  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    course: '',
    semester: '',
    examType: '',
    search: '',
  });
  const [courses, setCourses] = useState([]);
  const [examSessions, setExamSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const navigate = useNavigate();

  // Fetch students with proper error handling and formatting
  const fetchStudents = async () => {
    try {
      setLoading(true);
      console.log('Fetching students...');
      
      // First, try with approved status (as per the API)
      let response = await getStudents({ 
        status: 'approved', // Changed from 'active' to 'approved' to match API
        limit: 1000,
        populate: 'course'
      });
      
      console.log('Students API response:', JSON.stringify(response, null, 2));
      
      if (response.success) {
        // Handle both array and object responses
        let studentsData = [];
        
        if (Array.isArray(response.data)) {
          studentsData = response.data;
        } else if (response.data && response.data.data) {
          studentsData = Array.isArray(response.data.data) 
            ? response.data.data 
            : [response.data.data];
        } else if (response.data) {
          studentsData = [response.data];
        }
        
        console.log('Processed students data:', studentsData);
        
        if (studentsData.length === 0) {
          console.warn('No approved students found');
          message.warning('No approved students found. Please approve students first.');
          setStudents([]);
          setFilteredStudents([]);
          return [];
        }
        
        // Map the student data to the expected format
        const formattedStudents = studentsData.map(student => {
          const firstName = student.firstName || '';
          const lastName = student.lastName || '';
          const studentName = student.user?.name || 
                            `${firstName} ${lastName}`.trim() ||
                            `Student ${student._id?.substring(0, 6)}`;
          
          const formattedStudent = {
            ...student,
            _id: student._id,
            value: student._id,
            label: student.registrationNumber 
              ? `${studentName} (${student.registrationNumber})`
              : studentName,
            name: studentName,
            email: student.email,
            phone: student.phone,
            courseId: student.course?._id || student.course || student.courseId,
            courseName: student.course?.name || student.courseName,
            registrationNumber: student.registrationNumber
          };
          
          console.log('Formatted student:', formattedStudent);
          return formattedStudent;
        });
        
        console.log('Setting students:', formattedStudents);
        setStudents(formattedStudents);
        setFilteredStudents(formattedStudents);
        return formattedStudents;
      } else {
        throw new Error(response.message || 'Failed to fetch students');
      }
    } catch (error) {
      console.error('Error in fetchStudents:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      message.error(error.message || 'Failed to fetch students');
      setStudents([]);
      setFilteredStudents([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch courses with proper error handling and formatting
  const fetchCourses = async () => {
    try {
      console.log('Starting to fetch courses...');
      setLoading(true);
      
      const response = await getCourses({ 
        status: 'active',
        populate: 'school,session,subjects',
        limit: 1000 // Get all active courses
      });
      
      console.log('Courses API Response:', {
        success: response.success,
        data: response.data,
        pagination: response.pagination,
        message: response.message
      });
      
      if (response.success) {
        // Ensure we have an array of courses
        const coursesData = Array.isArray(response.data) 
          ? response.data 
          : response.data?.data || [];
        
        if (coursesData.length === 0) {
          console.warn('No active courses found');
          message.warning('No active courses found. Please add courses first.');
          setCourses([]);
          return [];
        }
        
        // Map the response to match the expected format
        const formattedCourses = coursesData.map(course => {
          // Create a proper label using courseName, courseType, and school name
          const courseLabel = [
            course.courseName || course.name,
            course.courseType && `(${course.courseType})`,
            course.school?.name && `- ${course.school.name}`
          ].filter(Boolean).join(' ');
          
          const formattedCourse = {
            ...course,
            _id: course._id,
            value: course._id,
            label: courseLabel || `Course ${course._id?.substring(0, 6)}`,
            name: course.courseName || course.name,
            courseName: course.courseName,
            schoolName: course.school?.name,
            sessionName: course.session?.name,
            subjects: Array.isArray(course.subjects) 
              ? course.subjects 
              : []
          };
          
          console.log('Processed Course:', formattedCourse);
          return formattedCourse;
        });
        
        console.log('Setting courses data:', formattedCourses);
        setCourses(formattedCourses);
        return formattedCourses;
      } else {
        const errorMsg = response.message || 'Failed to fetch courses';
        console.error('Error in fetchCourses:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error('Error in fetchCourses:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      message.error(error.message || 'Failed to fetch courses');
      setCourses([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Format exam sessions for dropdown
  const formatExamSessions = (sessions) => {
    console.log('Formatting exam sessions:', sessions);
    if (!Array.isArray(sessions)) return [];
    
    return sessions.map(session => {
      if (!session) return null;
      
      // Use the exact name from the session data
      const displayName = session.name || 'Session';
      
      return {
        ...session,
        value: session._id,
        label: displayName, // Display the exact name
        name: displayName,
        examDate: session.startDate,
        examType: 'Regular',
        semester: 'N/A',
        courseName: 'UG/PG Session',
        // Include the enrollmentSeries from the session
        enrollmentSeries: session.enrollmentSeries || ''
      };
    }).filter(Boolean); // Remove any null entries
  };

  // Format students for dropdown - just return as is since we already formatted them
  const formatStudents = (students) => {
    console.log('Formatting students:', students);
    return students;
  };

  // Format courses for dropdown - just return as is since we already formatted them
  const formatCourses = (courses) => {
    console.log('Formatting courses:', courses);
    return courses;
  };

  // Format and prepare data for display
  const prepareResultsData = (results) => {
    if (!Array.isArray(results)) return [];
    
    return results.map(result => {
      // Find the course in the courses list
      const courseData = courses.find(c => c._id === result.course?._id);
      
      return {
        ...result,
        student: {
          ...result.student,
          firstName: result.student?.firstName || '',
          lastName: result.student?.lastName || '',
          enrollmentNumber: result.student?.enrollmentNumber || 'N/A'
        },
        course: {
          ...result.course,
          // Use the course name from the courses list if available
          name: courseData?.name || courseData?.label || result.course?.name || 'N/A',
          _id: result.course?._id || ''
        },
        examSession: {
          ...(result.examSession || { name: 'N/A' }),
          enrollmentSeries: result.examSession?.enrollmentSeries || ''
        },
        subjectResults: Array.isArray(result.subjectResults) ? result.subjectResults : []
      };
    });
  };

  // Fetch initial data
  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      try {
        setLoading(true);
        console.log('Loading initial data...');
        
        // First, fetch courses
        const courses = await fetchCourses();
        console.log('Courses loaded:', courses.length);
        
        if (!isMounted) return;
        
        // Then fetch students and exam sessions in parallel
        const [students, examSessions] = await Promise.all([
          fetchStudents(),
          fetchExamSessions()
        ]);
        
        console.log('Initial data loaded:', {
          courses: courses.length,
          students: students.length,
          examSessions: examSessions.length
        });
        
        if (!isMounted) return;
        
        // Initial fetch of results
        await refreshResults();
        
      } catch (error) {
        console.error('Error loading initial data:', {
          message: error.message,
          stack: error.stack,
          response: error.response?.data
        });
        message.error('Failed to load initial data. Please refresh the page.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadInitialData();
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Function to fetch all active UGPG sessions
  const fetchExamSessions = async () => {
    try {
      setLoading(true);
      console.log('Fetching all active UGPG exam sessions...');
      
      // Fetch UGPG sessions using axios
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/ugpg/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          status: 'Active',
          limit: 1000
        }
      });
      
      console.log('UGPG Sessions API response:', response);
      
      let sessions = [];
      
      // Handle different response structures
      if (response?.data?.data) {
        // If response has data.data (common structure)
        sessions = Array.isArray(response.data.data) ? response.data.data : [];
      } else if (Array.isArray(response?.data)) {
        // If response.data is directly the array
        sessions = response.data;
      } else {
        throw new Error('Invalid response format');
      }
      
      console.log(`Found ${sessions.length} active UGPG sessions`);
      
      if (sessions.length === 0) {
        console.warn('No active UGPG sessions found');
        message.info('No active exam sessions found. Please create UGPG sessions first.');
        setExamSessions([]);
        return [];
      }
      
      // Format sessions using the formatExamSessions function
      const formattedSessions = formatExamSessions(sessions);
      console.log('Formatted UGPG exam sessions:', formattedSessions);
      setExamSessions(formattedSessions);
      return formattedSessions;
    } catch (error) {
      console.error('Error in fetchExamSessions:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      message.error(error.message || 'Failed to fetch exam sessions');
      setExamSessions([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Update results when filters or pagination changes
  useEffect(() => {
    let isMounted = true;
    let timeoutId = null;
    
    const fetchWithFilters = async () => {
      // Only fetch if we have the necessary data loaded
      if (students.length > 0 && courses.length > 0 && examSessions.length > 0) {
        try {
          setLoading(true);
          const response = await getResults({
            ...filters,
            page: pagination.current,
            limit: pagination.pageSize,
          });

          if (isMounted) {
            if (response.success) {
              setResults(response.data || []);
              setPagination(prev => ({
                ...prev,
                total: response.pagination?.total || 0,
              }));
            } else {
              throw new Error(response.message || 'Failed to fetch results');
            }
          }
        } catch (error) {
          console.error('Error in fetchWithFilters:', error);
          message.error(error.message || 'Failed to fetch results');
          if (isMounted) {
            setResults([]);
          }
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }
    };
    
    // Add a small debounce to prevent too many API calls
    timeoutId = setTimeout(fetchWithFilters, 300);
    
    // Cleanup function
    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [filters, pagination.current, pagination.pageSize, students.length, courses.length, examSessions.length]);


 

  // Function to refresh results
  const refreshResults = async () => {
    try {
      setLoading(true);
      console.log('Refreshing results with filters:', {
        ...filters,
        page: pagination.current,
        limit: pagination.pageSize,
      });
      
      const response = await getResults({
        ...filters,
        page: pagination.current,
        limit: pagination.pageSize,
      });
      
      console.log('Results API Response:', response);
      
      if (response.success) {
        setResults(Array.isArray(response.data) ? response.data : []);
        setPagination({
          current: response.pagination?.current || 1,
          pageSize: response.pagination?.pageSize || 10,
          total: response.pagination?.total || 0,
        });
      } else {
        console.warn('Failed to fetch results:', response.message);
        message.warning(response.message || 'No results found');
        setResults([]);
      }
    } catch (error) {
      console.error('Error in refreshResults:', error);
      message.error(error.message || 'Failed to load results');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (pagination, filters, sorter) => {
    // Update pagination state
    setPagination(prev => ({
      ...prev,
      current: pagination.current,
      pageSize: pagination.pageSize,
    }));

    // Handle sorting
    if (sorter.field) {
      setFilters(prev => ({
        ...prev,
        sortBy: sorter.field,
        sortOrder: sorter.order === 'ascend' ? 'asc' : 'desc',
      }));
    }
  };

  const handleFilterChange = (key, value) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    
    setFilters(newFilters);
    
    // Reset to first page when filters change
    setPagination(prev => ({
      ...prev,
      current: 1,
    }));
  };

  const handleSearch = (value) => {
    const newFilters = {
      ...filters,
      search: value,
    };
    
    setFilters(newFilters);
    
    // Reset to first page when search changes
    setPagination(prev => ({
      ...prev,
      current: 1,
    }));
  };

  const handleDownloadMarksheet = async (resultId) => {
    try {
      await downloadMarksheet(resultId);
      message.success('Marksheet downloaded successfully');
    } catch (error) {
      message.error('Failed to download marksheet');
    }
  };

  const handleSuccess = () => {
    message.success('Operation completed successfully');
    refreshResults();
    setActiveTab('list');
  };

  const handleViewResult = (result) => {
    console.log('Viewing result:', result);
    setEditingResult(result);
    setActiveTab('add');
  };

  const handleDeleteResult = async (resultId) => {
    if (!resultId) {
      message.error('Invalid result ID');
      return;
    }

    try {
      setLoading(true);
      const response = await deleteResult(resultId);
      
      if (response.success) {
        message.success('Result deleted successfully');
        await refreshResults();
      } else {
        throw new Error(response.message || 'Failed to delete result');
      }
    } catch (error) {
      console.error('Error deleting result:', error);
      message.error(error.message || 'Failed to delete result');
    } finally {
      setLoading(false);
    }
  };

  // Format results for the ResultList component
  const formatResults = (results) => {
    if (!Array.isArray(results)) return [];
    
    console.log('Available exam sessions:', examSessions);
    
    return results.map(result => {
      // Find the course in the courses list
      const courseData = courses.find(c => c._id === result.course?._id);
      
      // Get the exam session to access enrollmentSeries
      const examSession = examSessions.find(s => s._id === (result.examSession?._id || result.examSession));
      console.log('Found exam session for result:', examSession);
      
      // Get enrollment series from exam session or use default from first available session
      let enrollmentSeries = '';
      if (examSession?.enrollmentSeries) {
        enrollmentSeries = examSession.enrollmentSeries;
      } else if (examSessions.length > 0) {
        // Fallback to first available session's enrollment series
        enrollmentSeries = examSessions[0]?.enrollmentSeries || '';
      }
      
      console.log('Exam Session:', examSession);
      console.log('Enrollment Series:', enrollmentSeries);
      console.log('Student Data:', result.student);
      
      // Get the original enrollment number
      const originalEnrollmentNumber = result.student?.enrollmentNumber || result.student?.originalEnrollmentNumber;
      let enrollmentNumber = 'N/A';
      
      console.log('Original Enrollment Number:', originalEnrollmentNumber);
      
      // If we have an original enrollment number, use it
      if (originalEnrollmentNumber) {
        enrollmentNumber = originalEnrollmentNumber;
      } 
      // Otherwise, generate one from the enrollment series and student ID
      else if (enrollmentSeries && result.student?._id) {
        const studentId = result.student._id.substring(result.student._id.length - 4).toLowerCase();
        enrollmentNumber = `${enrollmentSeries}${studentId}`.toUpperCase();
      }
      
      console.log('Final Enrollment Number:', enrollmentNumber);
      
      return {
        ...result,
        student: {
          ...result.student,
          firstName: result.student?.firstName || '',
          lastName: result.student?.lastName || '',
          enrollmentNumber: enrollmentNumber,
          // Store the original enrollment number if it exists
          originalEnrollmentNumber: originalEnrollmentNumber || enrollmentNumber,
          // Include the enrollment series from the exam session
          enrollmentSeries: enrollmentSeries
        },
        course: {
          ...result.course,
          // Use the course name from the courses list if available
          name: courseData?.name || courseData?.label || result.course?.name || 'N/A',
          _id: result.course?._id || ''
        },
        examSession: {
          ...(examSession || result.examSession || { name: examSessions[0]?.name || 'N/A' }),
          enrollmentSeries: enrollmentSeries,
          // Include all exam session data if available
          ...(examSession || {})
        },
        subjectResults: Array.isArray(result.subjectResults) ? result.subjectResults : []
      };
    });
  };

  return (
    <div style={{
      padding: "20px",
      backgroundColor: "#f9f9f9",
      marginTop: "8rem"
    }}>
      <Card
        title="Result Management"
        extra={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                // Clear any existing form data and switch to add tab
                setEditingResult(null);
                setActiveTab('list'); // First switch to list to reset the form
                setTimeout(() => setActiveTab('add'), 0); // Then switch to add tab in the next tick
              }}
            >
              Add Result
            </Button>
            <Button
              type="default"
              icon={<UploadOutlined />}
              onClick={() => setActiveTab("upload")}
            >
              Bulk Upload
            </Button>
          </Space>
        }
        style={{
          width: "100%",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: "8px",
        }}
      >
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <TabPane tab="Results List" key="list">
            <div style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Select Course"
                    style={{ width: "100%" }}
                    allowClear
                    onChange={(value) => handleFilterChange("course", value)}
                    value={filters.course || null}
                  >
                    {courses.map((course) => (
                      <Option key={course._id} value={course._id}>
                        {course.label || course.name}
                      </Option>
                    ))}
                  </Select>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Select
                    placeholder="Select Exam Type"
                    style={{ width: "100%" }}
                    allowClear
                    onChange={(value) => handleFilterChange("examType", value)}
                    value={filters.examType || null}
                  >
                    <Option value="midterm">Mid Term</Option>
                    <Option value="final">Final Term</Option>
                    <Option value="internal">Internal</Option>
                  </Select>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <Input
                    placeholder="Search by student name or enrollment"
                    prefix={<SearchOutlined />}
                    onChange={(e) => handleSearch(e.target.value)}
                    allowClear
                    style={{
                      width: "100%",
                    }}
                  />
                </Col>
              </Row>
            </div>

            <ResultList
              data={formatResults(results)}
              loading={loading}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
              }}
              onChange={handleTableChange}
              onDownload={handleDownloadMarksheet}
              onView={handleViewResult}
            />
      </TabPane>

      <TabPane tab="Add/Edit Result" key="add">
        <ResultForm
          initialValues={editingResult}
          onSuccess={() => {
            setActiveTab('list');
            refreshResults();
          }}
          onCancel={() => setActiveTab('list')}
          courses={formatCourses(courses)}
          examSessions={formatExamSessions(examSessions)}
          students={formatStudents(students)}
        />
      </TabPane>

      <TabPane tab="Bulk Upload" key="upload">
        <ResultUpload
          courses={courses}
          examSessions={examSessions}
          onSuccess={handleSuccess}
          onCancel={() => setActiveTab("list")}
        />
      </TabPane>
    </Tabs>
  </Card>
</div>

  );
};

export default ResultGeneration;
