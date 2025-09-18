import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { FiEdit2, FiTrash2, FiSearch, FiFilter, FiPlus } from "react-icons/fi";
import { apiConnector } from "../../../../services/apiConnector";
import { useSelector } from "react-redux";

const ManageFee = () => {
  const [feeAssignments, setFeeAssignments] = useState([]);
  const [feeTypes, setFeeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filters, setFilters] = useState({
    session: "",
    course: "",
    type: ""
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { token, user } = useSelector((state) => state.auth);

  // Fetch fee assignments
  const fetchFeeAssignments = async () => {
    try {
      setLoading(true);
      console.log('Fetching fee assignments...');
      
      // Log the exact URL being called
      const apiUrl = `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/university/fee-assignments`;
      console.log('API URL:', apiUrl);
      
      // Add query parameters for pagination and sorting
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };
      
      // Convert params to query string
      const queryString = new URLSearchParams(params).toString();
      const urlWithParams = `${apiUrl}?${queryString}`;
      
      console.log('Fetching from URL:', urlWithParams);
      
      const response = await apiConnector(
        "GET",
        urlWithParams,
        null,
        {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      );
      
      console.log('Fee assignments API response:', response);
      
      if (response.data?.success) {
        console.log('Raw fee assignments data:', response.data.data);
        
        // Log course data for each assignment
        if (response.data.data && Array.isArray(response.data.data)) {
          response.data.data.forEach((assignment, index) => {
            console.log(`Assignment ${index} course data:`, assignment.course);
          });
        }
        
        setFeeAssignments(response.data.data || []);
      } else {
        const errorMessage = response.data?.message || 'Failed to fetch fee assignments';
        console.error('API Error:', errorMessage, response.data);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error fetching fee assignments:", error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to fetch fee assignments. Please try again.';
      
      console.error('Full error details:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        config: error.config
      });
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('Component mounted, fetching data...');
    const fetchData = async () => {
      try {
        await Promise.all([
          fetchFeeAssignments(),
          fetchFeeTypes()
        ]);
      } catch (error) {
        console.error('Error in fetchData:', error);
      }
    };
    fetchData();
    
    return () => {
      console.log('Component unmounting...');
    };
  }, []);

  const fetchFeeTypes = async () => {
    try {
      const response = await apiConnector(
        'GET',
        `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/university/fee-types`,
        null,
        {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      );
      if (response.data?.success) {
        setFeeTypes(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching fee types:', error);
      toast.error('Failed to load fee types');
    }
  };


  // Map of known course IDs to their display names
  const courseNameMap = {
    '68c00f3f897d026b46cdf21f': 'B.Tech in Computer Science',
    'btech_it': 'B.Tech in Information Technology',
    // Add more course mappings as needed
  };

  // Process fee assignments to ensure consistent data structure
  const processedFeeAssignments = feeAssignments.map(item => {
    // Initialize course data with defaults
    let courseData = {
      _id: 'N/A',
      name: 'N/A',
      code: 'N/A',
      type: 'N/A',
      semester: item.semester || 'N/A'
    };
    
    // Process course information if it exists
    if (item.course) {
      const course = item.course;
      const isCourseObject = typeof course === 'object' && course !== null;
      
      courseData = {
        _id: isCourseObject ? course._id : course,
        name: isCourseObject ? (course.courseName || course.name || 'Unnamed Course') : `Course (${course.slice(-4)})`,
        code: isCourseObject ? (course.courseCode || course.code || 'N/A') : course.slice(-6).toUpperCase(),
      
        semester: item.semester || (isCourseObject ? course.semester : 'N/A') || 'N/A'
      };
    }
    // Handle semester
    let semester = 'N/A';
    if (item.semester) {
      semester = item.semester;
    } else if (item.course?.semester) {
      semester = item.course.semester;
    } else if (item.feeType?.semester) {
      semester = item.feeType.semester;
    }
    
    return {
      ...item,
      course: courseData,
      semester: semester.toString(),
      // Add a display name that combines course name and code if available
      displayName: courseData.code 
        ? `${courseData.name} (${courseData.code})`
        : courseData.name
    };
  });

  // Filter and search logic
  const filteredData = processedFeeAssignments.filter(item => {
    console.log('Filtering item:', item);
    
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      (item.feeType?.name?.toLowerCase().includes(searchLower)) ||
      (typeof item.course === 'object' ? item.course?.name?.toLowerCase().includes(searchLower) : String(item.course).toLowerCase().includes(searchLower)) ||
      (item.session?.toLowerCase().includes(searchLower)) ||
      (item.semester?.toString().toLowerCase().includes(searchLower));
      
    const matchesFilters = 
      (!filters.session || item.session === filters.session) &&
      (!filters.course || (typeof item.course === 'object' ? item.course?.name === filters.course : item.course === filters.course)) &&
      (!filters.type || item.feeType?.type === filters.type);
    
    console.log('Item matches search:', matchesSearch, 'matches filters:', matchesFilters);
    return matchesSearch && matchesFilters;
  });
  
  console.log('Filtered data:', filteredData);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  // Get unique values for filters
  const uniqueSessions = [...new Set(feeAssignments.map(item => item.session))];
  const uniqueCourses = [...new Set(feeAssignments.map(item => item.course?.name).filter(Boolean))];
  const uniqueTypes = [...new Set(feeAssignments.map(item => item.feeType?.type).filter(Boolean))];

  // Form validation
  const isFormValid = useCallback(() => {
    return (
      selectedItem?.feeType?._id &&
      selectedItem?.session?.trim() &&
      selectedItem?.course?._id &&
      selectedItem?.amount > 0
    );
  }, [selectedItem]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    if (!isFormValid()) return;
    
    try {
      const payload = {
        feeType: selectedItem.feeType._id,
        session: selectedItem.session,
        course: selectedItem.course._id,
        amount: parseFloat(selectedItem.amount),
        assignedBy: user?._id,
        university: user?.university
      };
      
      if (selectedItem._id) {
        // Update existing fee assignment
        await apiConnector(
          'PUT',
          `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/university/fee-assignments/${selectedItem._id}`,
          payload,
          {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        );
        toast.success('Fee assignment updated successfully');
      } else {
        // Create new fee assignment
        await apiConnector(
          'POST',
          `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/university/fee-assignments`,
          payload,
          {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        );
        toast.success('Fee assigned successfully');
      }
      
      // Refresh the list and close modal
      await fetchFeeAssignments();
      setShowAssignModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error saving fee assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to save fee assignment');
    }
  }, [selectedItem, token, user, isFormValid]);

  // Handle delete fee assignment
  const handleDelete = useCallback(async (id) => {
    if (window.confirm('Are you sure you want to delete this fee assignment?')) {
      try {
        await apiConnector(
          'DELETE',
          `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/university/fee-types/assignments/${id}`,
          null,
          {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        );
        
        toast.success('Fee assignment deleted successfully');
        await fetchFeeAssignments();
      } catch (error) {
        console.error('Error deleting fee assignment:', error);
        toast.error(error.response?.data?.message || 'Failed to delete fee assignment');
      }
    }
  }, [token, fetchFeeAssignments]);

  // Handle edit fee assignment
  const handleEdit = useCallback((assignment) => {
    setSelectedItem({
      _id: assignment._id,
      feeType: assignment.feeType,
      session: assignment.session,
      course: assignment.course,
      amount: assignment.amount
    });
    setShowAssignModal(true);
  }, []);

  // Handle add new fee assignment
  const handleAddNew = useCallback(() => {
    setSelectedItem({
      feeType: {},
      session: '',
      course: {},
      amount: ''
    });
    setShowAssignModal(true);
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "'Poppins', sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#4a4a4a', fontSize: '24px', fontWeight: '600' }}>Manage Fee</h2>
        <button 
          onClick={handleAddNew}
          style={{
            backgroundColor: '#6c5ce7',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          <FiPlus size={18} />
          Add New Fee
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '8px', 
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', gap: '16px', marginBottom: showFilters ? '16px' : 0 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <FiSearch style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9e9e9e'
            }} />
            <input
              type="text"
              placeholder="Search by fee name, course, or session..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px 10px 40px',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.3s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#6c5ce7'}
              onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            style={{
              backgroundColor: showFilters ? '#f5f5f5' : 'white',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: '#4a4a4a',
              fontWeight: '500'
            }}
          >
            <FiFilter size={16} />
            Filters
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
            paddingTop: '16px',
            borderTop: '1px solid #f0f0f0',
            marginTop: '16px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#757575',
                marginBottom: '4px',
                fontWeight: '500'
              }}>
                Session
              </label>
              <select 
                name="session"
                value={filters.session}
                onChange={handleFilterChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Sessions</option>
                {uniqueSessions.map(session => (
                  <option key={session} value={session}>{session}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#757575',
                marginBottom: '4px',
                fontWeight: '500'
              }}>
                Course
              </label>
              <select 
                name="course"
                value={filters.course}
                onChange={handleFilterChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Courses</option>
                {uniqueCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                color: '#757575',
                marginBottom: '4px',
                fontWeight: '500'
              }}>
                Fee Type
              </label>
              <select 
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Fee Assignments Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 1fr 1fr 100px',
          backgroundColor: '#f9f9f9',
          borderBottom: '1px solid #f0f0f0',
          fontWeight: '600',
          color: '#4a4a4a',
          fontSize: '14px'
        }}>
          <div style={{ padding: '16px', textAlign: 'center' }}>#</div>
          <div style={{ padding: '16px' }}>Fee Name</div>
          <div style={{ padding: '16px' }}>Fee Type</div>
          <div style={{ padding: '16px' }}>Session</div>
          <div style={{ padding: '16px' }}>Course</div>
          <div style={{ padding: '16px' }}>Semester</div>
          <div style={{ padding: '16px', textAlign: 'right' }}>Amount</div>
          <div style={{ padding: '16px', textAlign: 'center' }}>Action</div>
        </div>
        {/* Table Rows */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
            Loading fee assignments...
          </div>
        ) : currentItems.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#757575', gridColumn: '1 / -1' }}>
            No fee assignments found. Try adjusting your filters or add a new fee assignment.
          </div>
        ) : (
          currentItems.map((item, index) => (
            <div 
              key={item._id || index}
              style={{
                display: 'grid',
                gridTemplateColumns: '60px 1fr 1fr 1fr 1fr 1fr 1fr 100px',
                borderBottom: '1px solid #f5f5f5',
                transition: 'background-color 0.2s',
                ':hover': {
                  backgroundColor: '#fafafa'
                }
              }}
            >
              <div style={{ 
                padding: '16px', 
                color: '#757575',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {indexOfFirstItem + index + 1}
              </div>
              <div style={{ 
                padding: '16px',
                color: '#333',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center'
              }}>
                {item.feeType?.name || 'N/A'}
              </div>
              <div style={{ 
                padding: '16px',
                color: '#666',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center'
              }}>
                {item.feeType?.type || 'N/A'}
              </div>
              <div style={{ 
                padding: '16px',
                color: '#666',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center'
              }}>
                {item.session || 'N/A'}
              </div>
              <div style={{ 
                padding: '16px',
                color: '#666',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center'
              }}>
                {item.course ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontWeight: 500 }}>
                      {item.course?.name || `Course (${item.course?._id || 'N/A'})`}
                    </div>
                    {item.course && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '4px' }}>
                        {item.course.code && item.course.code !== 'N/A' && (
                          <span style={{ 
                            fontSize: '12px',
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}>
                            {item.course.code}
                          </span>
                        )}
                        {item.course.type && (
                          <span style={{ 
                            fontSize: '12px',
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}>
                            {item.course.type}
                          </span>
                        )}
                        {item.semester && (
                          <span style={{ 
                            fontSize: '12px',
                            backgroundColor: '#f3e8ff',
                            color: '#6b21a8',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            display: 'inline-flex',
                            alignItems: 'center'
                          }}>
                            Sem {item.semester}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <span style={{ color: '#757575', fontSize: '14px' }}>No course assigned</span>
                )}
              </div>
              <div style={{ 
                padding: '16px',
                color: '#666',
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center'
              }}>
                {item.semester || 'N/A'}
              </div>
              <div style={{ 
                padding: '16px',
                color: '#333',
                fontSize: '14px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingRight: '24px'
              }}>
                ₹{item.amount?.toLocaleString('en-IN') || '0'}
              </div>
              <div style={{ 
                padding: '16px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px'
              }}>
                <button 
                  onClick={() => handleEdit(item)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#6c5ce7',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ':hover': {
                      backgroundColor: 'rgba(108, 92, 231, 0.1)'
                    }
                  }}
                  title="Edit"
                >
                  <FiEdit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(item._id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff5252',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ':hover': {
                      backgroundColor: 'rgba(255, 82, 82, 0.1)'
                    }
                  }}
                  title="Delete"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          padding: '16px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
        }}>
          <div style={{ color: '#757575', fontSize: '14px' }}>
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} entries
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                padding: '6px 12px',
                border: '1px solid #e0e0e0',
                backgroundColor: 'white',
                borderRadius: '4px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.6 : 1,
                color: currentPage === 1 ? '#9e9e9e' : '#4a4a4a',
                ':hover': {
                  backgroundColor: currentPage === 1 ? 'white' : '#f5f5f5'
                }
              }}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  style={{
                    padding: '6px 12px',
                    border: '1px solid #e0e0e0',
                    backgroundColor: currentPage === pageNum ? '#6c5ce7' : 'white',
                    color: currentPage === pageNum ? 'white' : '#4a4a4a',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    ':hover': {
                      backgroundColor: currentPage === pageNum ? '#5a4fcf' : '#f5f5f5'
                    }
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                padding: '6px 12px',
                border: '1px solid #e0e0e0',
                backgroundColor: 'white',
                borderRadius: '4px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.6 : 1,
                color: currentPage === totalPages ? '#9e9e9e' : '#4a4a4a',
                ':hover': {
                  backgroundColor: currentPage === totalPages ? 'white' : '#f5f5f5'
                }
              }}
            >
              Next
            </button>
            
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '16px' }}>
              <span style={{ marginRight: '8px', fontSize: '14px', color: '#757575' }}>Show</span>
              <select 
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  padding: '6px',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span style={{ marginLeft: '8px', fontSize: '14px', color: '#757575' }}>entries</span>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Fee Assignment Modal */}
      {showAssignModal && selectedItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            overflow: 'hidden',
            animation: 'modalFadeIn 0.3s ease-out'
          }}>
            <div style={{
              padding: '16px 24px',
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                color: '#333',
                fontWeight: '600'
              }}>
                {selectedItem._id ? 'Edit Fee Assignment' : 'Assign New Fee'}
              </h3>
              <button 
                onClick={() => setShowAssignModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  color: '#757575',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '4px',
                  ':hover': {
                    backgroundColor: '#f5f5f5',
                    color: '#333'
                  }
                }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ padding: '24px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#555',
                  fontWeight: '500'
                }}>
                  Fee Type
                </label>
                <select 
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    outline: 'none',
                    ':focus': {
                      borderColor: '#6c5ce7',
                      boxShadow: '0 0 0 2px rgba(108, 92, 231, 0.2)'
                    }
                  }}
                  value={selectedItem.feeType?._id || ''}
                  onChange={(e) => setSelectedItem({
                    ...selectedItem,
                    feeType: {
                      ...selectedItem.feeType,
                      _id: e.target.value
                    }
                  })}
                >
                  <option value="">-- Select Fee Type --</option>
                  {feeTypes.map(type => (
                    <option key={type._id} value={type._id}>
                      {type.name} ({type.type})
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#555',
                  fontWeight: '500'
                }}>
                  Session
                </label>
                <input 
                  type="text"
                  placeholder="e.g. 2023-24"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    ':focus': {
                      borderColor: '#6c5ce7',
                      boxShadow: '0 0 0 2px rgba(108, 92, 231, 0.2)'
                    }
                  }}
                  value={selectedItem.session || ''}
                  onChange={(e) => setSelectedItem({
                    ...selectedItem,
                    session: e.target.value
                  })}
                />
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#555',
                  fontWeight: '500'
                }}>
                  Course
                </label>
                <select 
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    outline: 'none',
                    ':focus': {
                      borderColor: '#6c5ce7',
                      boxShadow: '0 0 0 2px rgba(108, 92, 231, 0.2)'
                    }
                  }}
                  value={selectedItem.course || ''}
                  onChange={(e) => setSelectedItem({
                    ...selectedItem,
                    course: e.target.value
                  })}
                >
                  <option value="">-- Select Course --</option>
                  {[...new Set(feeAssignments.map(item => item.course))].map((course, index) => (
                    <option key={index} value={course}>
                      {course}
                    </option>
                  ))}
                </select>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  color: '#555',
                  fontWeight: '500'
                }}>
                  Amount (₹)
                </label>
                <input 
                  type="number"
                  placeholder="Enter amount"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none',
                    ':focus': {
                      borderColor: '#6c5ce7',
                      boxShadow: '0 0 0 2px rgba(108, 92, 231, 0.2)'
                    }
                  }}
                  value={selectedItem.amount || ''}
                  onChange={(e) => setSelectedItem({
                    ...selectedItem,
                    amount: parseFloat(e.target.value) || 0
                  })}
                />
              </div>
              
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                marginTop: '24px',
                paddingTop: '16px',
                borderTop: '1px solid #f0f0f0'
              }}>
                <button
                  onClick={() => setShowAssignModal(false)}
                  style={{
                    padding: '8px 20px',
                    border: '1px solid #e0e0e0',
                    backgroundColor: 'white',
                    borderRadius: '6px',
                    color: '#4a4a4a',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    ':hover': {
                      backgroundColor: '#f5f5f5'
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid()}
                  style={{
                    padding: '8px 20px',
                    border: 'none',
                    backgroundColor: isFormValid() ? '#6c5ce7' : '#b8b5ff',
                    color: 'white',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isFormValid() ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    ':hover': isFormValid() ? {
                      backgroundColor: '#5a4fcf'
                    } : {}
                  }}
                >
                  {selectedItem._id ? 'Update Fee' : 'Assign Fee'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Global styles for modal animation */}
      <style jsx global>{`
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default ManageFee;
