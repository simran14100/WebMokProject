

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { FiEdit2, FiTrash2, FiSearch, FiFilter, FiPlus, FiChevronDown, FiChevronUp, FiDollarSign, FiBookOpen, FiCalendar, FiLayers } from "react-icons/fi";
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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteResult, setDeleteResult] = useState(null);
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
      
      const apiUrl = `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/university/fee-assignments`;
      
      const params = {
        limit: 100,
        page: 1,
        all: true,
        includeAll: true,
        showAll: true,
        session: 'all',
      };
      
      const queryString = new URLSearchParams(params).toString();
      const urlWithParams = `${apiUrl}?${queryString}`;
      
      console.log('Fetching from URL:', urlWithParams);
      
      const response = await apiConnector("GET", urlWithParams, null, {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      
      console.log('Fee assignments API response:', response);
      
      if (response.data?.success) {
        console.log(`📊 API returned ${response.data.data?.length || 0} out of ${response.data.total} total records`);
        
        if (response.data.total > (response.data.data?.length || 0)) {
          console.log('🚨 Not getting all records. Trying without parameters...');
          
          const simpleResponse = await apiConnector("GET", apiUrl, null, {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          });
          
          console.log('Simple response (no params):', simpleResponse.data);
          
          if (simpleResponse.data?.success) {
            setFeeAssignments(simpleResponse.data.data || []);
            return;
          }
        }
        
        setFeeAssignments(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching fee assignments:", error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Failed to fetch fee assignments. Please try again.';
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
  };

  // Process fee assignments to group by course only
  const processFeeAssignments = (assignments) => {
    console.log('🔍 RAW assignments from API:', assignments);
    console.log('📊 Total assignments count:', assignments.length);

    const processed = assignments.map(item => {
      let courseData = {
        _id: 'N/A',
        name: 'Unknown Course',
        code: 'N/A',
        type: 'N/A'
      };

      if (item.course) {
        if (typeof item.course === 'string') {
          courseData = {
            _id: item.course,
            name: courseNameMap[item.course] || 'BTech',
            code: item.course.slice(-6).toUpperCase(),
            type: 'Yearly'
          };
        } else if (typeof item.course === 'object' && item.course !== null) {
          courseData = {
            _id: item.course._id || 'N/A',
            name: item.course.courseName || item.course.name || 'Unnamed Course',
            code: item.course.courseCode || item.course.code || 'N/A',
            type: item.course.type || item.course.courseType || 'Yearly'
          };
        }
      }

      return {
        ...item,
        course: courseData,
        displayName: courseData.name
      };
    });

    console.log('✅ PROCESSED assignments:', processed);

    const groupedByCourse = {};
    
    processed.forEach((item, index) => {
      const courseId = item.course._id;
      
      console.log(`📝 Processing item ${index}:`, {
        courseId: courseId,
        courseName: item.course.name,
        amount: item.amount,
        semester: item.semester
      });
      
      if (!groupedByCourse[courseId]) {
        groupedByCourse[courseId] = {
          _id: courseId,
          name: item.course.name,
          code: item.course.code,
          type: item.course.type,
          fees: [],
          totalFees: 0,
          feeCount: 0,
          isExpanded: true
        };
      }
      
      groupedByCourse[courseId].fees.push(item);
      const amount = parseFloat(item.amount) || 0;
      groupedByCourse[courseId].totalFees += amount;
      groupedByCourse[courseId].feeCount += 1;

      console.log(`➡️ Added to course ${courseId}:`, {
        currentFeesCount: groupedByCourse[courseId].fees.length,
        currentTotal: groupedByCourse[courseId].totalFees
      });
    });
    
    const result = Object.values(groupedByCourse).sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    console.log('🎯 FINAL Grouped courses:', result);
    
    result.forEach(course => {
      console.log(`📊 Course: ${course.name}`, {
        feeCount: course.feeCount,
        totalFees: course.totalFees,
        fees: course.fees.map(f => ({ amount: f.amount, semester: f.semester }))
      });
    });

    return result;
  };

  const [expandedCourses, setExpandedCourses] = useState({});
  const [expandedSemesters, setExpandedSemesters] = useState({});
  
  const toggleCourse = useCallback((courseId) => {
    setExpandedCourses(prev => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  }, []);
  
  const toggleSemester = useCallback((courseId, semester) => {
    setExpandedSemesters(prev => ({
      ...prev,
      [`${courseId}-${semester}`]: !prev[`${courseId}-${semester}`]
    }));
  }, []);
  
  const groupedFeeAssignments = processFeeAssignments(feeAssignments);

  // Filter and search logic
  const filterAndSearchAssignments = (assignments) => {
    if (!searchTerm && !filters.session && !filters.course && !filters.type) {
      return assignments;
    }
    
    const searchLower = searchTerm.toLowerCase();
    
    return assignments.filter(course => {
      const courseMatchesSearch = 
        course.name.toLowerCase().includes(searchLower) ||
        course.code.toLowerCase().includes(searchLower);
      
      const feeMatchesSearch = course.fees.some(fee => 
        (fee.feeType?.name?.toLowerCase() || '').includes(searchLower) ||
        (fee.session?.toLowerCase() || '').includes(searchLower) ||
        (fee.semesterDisplay?.toLowerCase() || '').includes(searchLower)
      );
      
      const matchesFilters = 
        (!filters.session || 
          course.fees.some(fee => fee.session === filters.session)
        ) &&
        (!filters.course || course.name === filters.course) &&
        (!filters.type || 
          course.fees.some(fee => fee.feeType?.type === filters.type));
      
      return (courseMatchesSearch || feeMatchesSearch) && matchesFilters;
    });
  };

  const filteredData = filterAndSearchAssignments(groupedFeeAssignments);
  console.log('Filtered data:', filteredData);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setCurrentPage(1);
  };

  // Get unique values for filters
  const uniqueSessions = [...new Set(feeAssignments.flatMap(item => item.session).filter(Boolean))];
  const uniqueCourses = [...new Set(feeAssignments.map(item => item.course?.name).filter(Boolean))];
  const uniqueTypes = [...new Set(feeAssignments.map(item => item.feeType?.type).filter(Boolean))];

  const isFormValid = useCallback(() => {
    return (
      selectedItem?.feeType?._id &&
      selectedItem?.session?.trim() &&
      selectedItem?.course?._id &&
      selectedItem?.amount > 0
    );
  }, [selectedItem]);

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
      
      await fetchFeeAssignments();
      setShowAssignModal(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Error saving fee assignment:', error);
      toast.error(error.response?.data?.message || 'Failed to save fee assignment');
    }
  }, [selectedItem, token, user, isFormValid]);

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
  }, [token]);

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

  const handleAddNew = useCallback(() => {
    setSelectedItem({
      feeType: {},
      session: '',
      course: {},
      amount: ''
    });
    setShowAssignModal(true);
  }, []);

  const handleDeleteClick = useCallback((id) => {
    handleDelete(id);
  }, [handleDelete]);

  // Delete confirmation handler
  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const response = await apiConnector(
        "DELETE",
        `${process.env.REACT_APP_BASE_URL}/api/v1/fee-types/${feeToDelete._id}`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );
      
      if (response.data.success) {
        setDeleteResult({
          success: true,
          deletedAssignmentsCount: response.data.deletedAssignmentsCount
        });
        fetchFeeAssignments();
      } else {
        setDeleteResult({
          success: false,
          message: response.data.message || 'Failed to delete fee type'
        });
      }
    } catch (error) {
      console.error('Error deleting fee type:', error);
      setDeleteResult({
        success: false,
        message: error.response?.data?.message || 'An error occurred while deleting the fee type'
      });
    } finally {
      setDeleting(false);
    }
  };

  const closeDeleteModal = () => {
    setShowDeleteConfirm(false);
    setFeeToDelete(null);
    setDeleteResult(null);
  };

  const renderDeleteConfirmationModal = () => {
    if (!showDeleteConfirm) return null;
    
    return (
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
          padding: '24px',
          maxWidth: '400px',
          width: '90%'
        }}>
          <h3>Confirm Delete</h3>
          <p>Are you sure you want to delete this fee type?</p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
            <button onClick={closeDeleteModal}>Cancel</button>
            <button onClick={handleDeleteConfirm} disabled={deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    );
  };

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
        overflow: 'hidden',
        marginBottom: '24px'
      }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#757575' }}>
            Loading fee assignments...
          </div>
        ) : filteredData.length === 0 ? (
          <div style={{ 
            padding: '40px', 
            textAlign: 'center', 
            color: '#757575', 
            backgroundColor: '#fafafa',
            borderRadius: '8px',
            border: '1px dashed #e0e0e0',
            margin: '16px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
            <h3 style={{ margin: '0 0 8px', color: '#4a4a4a' }}>No fee assignments found</h3>
            <p style={{ margin: '0 0 16px', color: '#757575' }}>
              Try adjusting your search or filters, or add a new fee assignment.
            </p>
            <button 
              onClick={handleAddNew}
              style={{
                backgroundColor: '#6c5ce7',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px'
              }}
            >
              <FiPlus size={16} />
              Add New Fee Assignment
            </button>
          </div>
        ) : (
          <div>
            {/* Table Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '40px 1fr 1fr 120px 100px',
              backgroundColor: '#f5f7fa',
              borderBottom: '1px solid #e0e0e0',
              fontWeight: '600',
              color: '#4a4a4a',
              fontSize: '14px'
            }}>
              <div style={{ padding: '16px', textAlign: 'center' }}></div>
              <div style={{ padding: '16px' }}>Course Details</div>
              <div style={{ padding: '16px' }}>Fee Structure</div>
              <div style={{ padding: '16px', textAlign: 'right' }}>Total Fees</div>
              <div style={{ padding: '16px', textAlign: 'center' }}>Actions</div>
            </div>
            
            {/* Course Rows */}
            {currentItems.map((course, courseIndex) => {
              const isExpanded = expandedCourses[course._id] !== false;
              
              const feesBySemester = course.fees.reduce((acc, fee) => {
                const semester = fee.semester || 'general';
                if (!acc[semester]) {
                  acc[semester] = [];
                }
                acc[semester].push(fee);
                return acc;
              }, {});
              
              const semesters = Object.entries(feesBySemester).map(([semester, fees]) => ({
                semester,
                fees,
                total: fees.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0)
              })).sort((a, b) => a.semester.localeCompare(b.semester));
              
              return (
                <div key={course._id || courseIndex} style={{
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: isExpanded ? '#ffffff' : '#fafafa'
                }}>
                  {/* Course Summary Row */}
                  <div 
                    onClick={() => toggleCourse(course._id)}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '40px 1fr 1fr 120px 100px',
                      cursor: 'pointer',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: isExpanded ? '1px solid #f0f0f0' : 'none',
                      backgroundColor: isExpanded ? '#f9f9f9' : 'transparent'
                    }}
                  >
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: '#6c5ce7',
                      transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                      transition: 'transform 0.2s ease'
                    }}>
                      <FiChevronDown size={20} />
                    </div>
                    
                    <div style={{ padding: '0 8px' }}>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        marginBottom: '4px'
                      }}>
                        <FiBookOpen size={16} style={{ marginRight: '8px', color: '#6c5ce7' }} />
                        <span style={{ 
                          fontWeight: '600',
                          color: isExpanded ? '#4a4a4a' : '#333',
                          fontSize: '15px'
                        }}>
                          {course.name}
                        </span>
                        {course.code && course.code !== 'N/A' && (
                          <span style={{
                            marginLeft: '8px',
                            fontSize: '12px',
                            backgroundColor: '#e0f2fe',
                            color: '#0369a1',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: '500'
                          }}>
                            {course.code}
                          </span>
                        )}
                      </div>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        fontSize: '13px',
                        color: '#666',
                        marginLeft: '24px'
                      }}>
                        {course.type && (
                          <span style={{
                            backgroundColor: '#dcfce7',
                            color: '#166534',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            marginRight: '8px'
                          }}>
                            {course.type}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center' }}>
                          <FiLayers size={12} style={{ marginRight: '4px' }} />
                          {new Set(course.fees?.map(f => f.semester) || []).size} Semester{new Set(course.fees?.map(f => f.semester) || []).size !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ padding: '0 8px', fontSize: '14px', color: '#666' }}>
                      {course.fees?.length || 0} fee component{course.fees?.length !== 1 ? 's' : ''} defined
                    </div>
                    
                    <div style={{ 
                      padding: '0 8px',
                      textAlign: 'right',
                      fontWeight: '600',
                      color: '#4a4a4a',
                      fontSize: '16px'
                    }}>
                      ₹{course.totalFees?.toLocaleString('en-IN') || '0'}
                    </div>
                    
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit({
                            ...course,
                            semester: semesters[0]?.semester || '1',
                            feeType: semesters[0]?.fees[0]?.feeType || {}
                          });
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#6c5ce7',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Edit Course Fees"
                      >
                        <FiEdit2 size={16} />
                      </button>
                      <button 
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (window.confirm(`Are you sure you want to delete all fee assignments for ${course.name}?`)) {
                            try {
                              await Promise.all(
                                semesters.flatMap(sem => 
                                  sem.fees.map(fee => handleDelete(fee._id))
                                )
                              );
                              toast.success('All fees deleted successfully');
                            } catch (error) {
                              console.error('Error deleting fees:', error);
                              toast.error('Failed to delete some fees');
                            }
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '13px',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}
                      >
                        <FiTrash2 size={14} />
                        <span>Delete All</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Semester Rows - Only show if expanded */}
                  {isExpanded && semesters.map((semester, semIndex) => {
                    const isSemesterExpanded = expandedSemesters[`${course._id}-${semester.semester}`] !== false;
          
                    return (
                      <div key={`${course._id}-${semester.semester}-${semIndex}`}>
                        {/* Semester Summary Row */}
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSemester(course._id, semester.semester);
                          }}
                          style={{
                            display: 'grid',
                            gridTemplateColumns: '60px 1fr 1fr 120px 100px',
                            backgroundColor: isSemesterExpanded ? '#f9f9f9' : '#f5f7fa',
                            borderBottom: isSemesterExpanded ? '1px solid #f0f0f0' : 'none',
                            cursor: 'pointer',
                            padding: '10px 0',
                            paddingLeft: '16px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <div style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: '#e0e7ff',
                              color: '#4f46e5',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              S{semester.semester}
                            </div>
                          </div>
                          
                          <div style={{ padding: '0 8px', display: 'flex', alignItems: 'center' }}>
                            <span style={{ 
                              fontWeight: '500',
                              color: '#4a4a4a',
                              fontSize: '14px'
                            }}>
                              Semester {semester.semester} Fees
                            </span>
                          </div>
                          
                          <div style={{ 
                            padding: '0 8px',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '13px',
                            color: '#666'
                          }}>
                            {semester.fees.length} fee component{semester.fees.length !== 1 ? 's' : ''}
                          </div>
                          
                          <div style={{ 
                            padding: '0 8px',
                            textAlign: 'right',
                            fontWeight: '600',
                            color: '#4a4a4a',
                            fontSize: '15px'
                          }}>
                            ₹{semester.total.toLocaleString('en-IN')}
                          </div>
                          
                          <div style={{ 
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <div style={{
                              transform: isSemesterExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                              transition: 'transform 0.2s',
                              color: '#6c5ce7'
                            }}>
                              <FiChevronDown size={16} />
                            </div>
                          </div>
                        </div>
                        
                        {/* Fee Components - Only show if semester is expanded */}
                        {isSemesterExpanded && (
                          <div style={{
                            backgroundColor: '#fcfcff',
                            borderBottom: '1px solid #f0f0f0',
                            padding: '8px 0'
                          }}>
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: '60px 1fr 1fr 1fr 100px',
                              backgroundColor: '#f5f7fa',
                              padding: '8px 0',
                              margin: '0 16px 8px',
                              borderRadius: '6px',
                              fontWeight: '500',
                              fontSize: '13px',
                              color: '#4a4a4a'
                            }}>
                              <div style={{ padding: '0 8px' }}>#</div>
                              <div style={{ padding: '0 8px' }}>Fee Type</div>
                              <div style={{ padding: '0 8px' }}>Session</div>
                              <div style={{ padding: '0 8px' }}>Amount</div>
                              <div style={{ padding: '0 8px', textAlign: 'center' }}>Actions</div>
                            </div>
                            
                            {semester.fees.map((fee, feeIndex) => (
                              <div 
                                key={fee._id || feeIndex}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: '60px 1fr 1fr 1fr 100px',
                                  padding: '12px 0',
                                  margin: '0 16px',
                                  borderBottom: '1px solid #f5f5f5'
                                }}
                              >
                                <div style={{ 
                                  padding: '0 8px',
                                  color: '#757575',
                                  fontSize: '13px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}>
                                  {feeIndex + 1}.
                                </div>
                                
                                <div style={{ 
                                  padding: '0 8px',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  justifyContent: 'center'
                                }}>
                                  <div style={{ 
                                    fontWeight: '500',
                                    color: '#4a4a4a',
                                    fontSize: '14px',
                                    marginBottom: '2px'
                                  }}>
                                    {fee.feeType?.name || fee.feeType?.category || 'N/A'}
                                  </div>
                                  <div style={{ 
                                    fontSize: '12px',
                                    color: '#666',
                                    backgroundColor: '#f0f0f0',
                                    padding: '2px 6px',
                                    borderRadius: '4px',
                                    display: 'inline-block',
                                    width: 'fit-content'
                                  }}>
                                    {fee.feeType?.type || 'N/A'}
                                  </div>
                                </div>
                                
                                <div style={{ 
                                  padding: '0 8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  fontSize: '13px',
                                  color: '#666'
                                }}>
                                  <FiCalendar size={14} style={{ marginRight: '6px', color: '#6c5ce7' }} />
                                  {fee.session || 'N/A'}
                                </div>
                                
                                <div style={{ 
                                  padding: '0 8px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  fontSize: '14px',
                                  color: '#4a4a4a',
                                  fontWeight: '500'
                                }}>
                                  <FiDollarSign size={14} style={{ marginRight: '4px', color: '#10b981' }} />
                                  ₹{fee.amount?.toLocaleString('en-IN') || '0'}
                                </div>
                                
                                <div style={{ 
                                  padding: '0 8px',
                                  display: 'flex',
                                  justifyContent: 'center',
                                  alignItems: 'center',
                                  gap: '8px'
                                }}>
                                  <button 
                                    onClick={() => handleEdit(fee)}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#6c5ce7',
                                      cursor: 'pointer',
                                      padding: '4px',
                                      borderRadius: '4px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    title="Edit"
                                  >
                                    <FiEdit2 size={16} />
                                  </button>
                                  <button 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteClick(fee._id);
                                    }}
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: '#ff5252',
                                      cursor: 'pointer',
                                      padding: '4px',
                                      borderRadius: '4px',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center'
                                    }}
                                    title="Delete"
                                  >
                                    <FiTrash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
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
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredData.length)} of {filteredData.length} courses
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
                color: currentPage === 1 ? '#9e9e9e' : '#4a4a4a'
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
                    border: `1px solid ${currentPage === pageNum ? '#6c5ce7' : '#e0e0e0'}`,
                    backgroundColor: currentPage === pageNum ? '#6c5ce7' : 'white',
                    color: currentPage === pageNum ? 'white' : '#4a4a4a',
                    borderRadius: '4px',
                    cursor: 'pointer'
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
                color: currentPage === totalPages ? '#9e9e9e' : '#4a4a4a'
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
                  padding: '6px 8px',
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
            overflow: 'hidden'
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
                  borderRadius: '4px'
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
                    outline: 'none'
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
                    outline: 'none'
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
                    outline: 'none'
                  }}
                  value={selectedItem.course?._id || ''}
                  onChange={(e) => setSelectedItem({
                    ...selectedItem,
                    course: {
                      ...selectedItem.course,
                      _id: e.target.value
                    }
                  })}
                >
                  <option value="">-- Select Course --</option>
                  {[...new Set(feeAssignments.map(item => item.course?._id).filter(Boolean))].map((courseId, index) => {
                    const course = feeAssignments.find(item => item.course?._id === courseId)?.course;
                    return (
                      <option key={courseId} value={courseId}>
                        {course?.name || `Course ${index + 1}`}
                      </option>
                    );
                  })}
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
                    outline: 'none'
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
                    cursor: 'pointer'
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
                    backgroundColor: isFormValid() ? '#6c5ce7' : '#cccccc',
                    borderRadius: '6px',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: isFormValid() ? 'pointer' : 'not-allowed'
                  }}
                >
                  {selectedItem._id ? 'Update' : 'Assign Fee'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {renderDeleteConfirmationModal()}
    </div>
  );
};

export default ManageFee;