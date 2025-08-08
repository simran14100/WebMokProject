import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { apiConnector } from '../services/apiConnector';
import { course as courseApi } from '../services/apis';
import DashboardLayout from '../components/common/DashboardLayout';

const TAWKTO_GREEN = '#009e5c';

export default function EnrolledStudents() {
  const { token } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState(null);

  useEffect(() => {
    async function fetchCourses() {
      setLoadingCourses(true);
      setCoursesError(null);
      try {
        const response = await apiConnector(
          'GET',
          courseApi.GET_ALL_COURSES_API,
          null,
          token ? { Authorization: `Bearer ${token}` } : undefined
        );
        if (response.data && response.data.success) {
          setCourses(response.data.data || []);
        } else {
          setCourses([]);
          setCoursesError('Failed to load courses.');
        }
      } catch (error) {
        setCourses([]);
        setCoursesError('Failed to load courses.');
      } finally {
        setLoadingCourses(false);
      }
    }
    fetchCourses();
  }, [token]);

  // Hide footer for this page
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (footer) {
      footer.style.display = 'none';
    }
    
    return () => {
      if (footer) {
        footer.style.display = 'block';
      }
    };
  }, []);

  // Helper to get unique students by _id
  function getUniqueStudents(studentsArr) {
    const map = new Map();
    for (const s of studentsArr) {
      if (s && s._id) map.set(s._id, s);
    }
    return Array.from(map.values());
  }

  // Filtering logic
  const getFilteredStudents = () => {
    if (selectedCourse === 'all') {
      // Show all unique students enrolled in any course
      const allStudents = courses.flatMap(course => {
        const students = course.studentsEnrolled;
        
        // Handle different data types
        if (Array.isArray(students)) {
          return students;
        } else if (students && typeof students === 'object') {
          // If it's an object but not an array, try to convert it
          return Object.values(students);
        } else {
          return [];
        }
      });
      
      return getUniqueStudents(allStudents);
    } else {
      const course = courses.find(c => c._id === selectedCourse);
      
      if (!course) return [];
      
      const students = course.studentsEnrolled;
      if (Array.isArray(students)) {
        return students;
      } else if (students && typeof students === 'object') {
        return Object.values(students);
      } else {
        return [];
      }
    }
  };

  const filteredStudents = getFilteredStudents();

  return (
    <DashboardLayout>
      <div style={{ 
        width: '100%', 
        maxWidth: '100%', 
        margin: '0 auto', 
        marginLeft: '250px',
        padding: '20px',
        overflowX: 'hidden',
        backgroundColor: '#f8fafc',
        minHeight: '100vh'
      }}>
      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '16px' 
        }}>
                     <div style={{
             width: '48px',
             height: '48px',
             background: 'linear-gradient(135deg, #07A698 0%, #059a8c 100%)',
             borderRadius: '12px',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             marginRight: '16px'
           }}>
            <svg style={{ width: '24px', height: '24px', color: 'white' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <div>
                         <h1 style={{
               fontSize: '36px',
               fontWeight: 'bold',
               background: 'linear-gradient(135deg, #07A698 0%, #059a8c 100%)',
               WebkitBackgroundClip: 'text',
               WebkitTextFillColor: 'transparent',
               margin: '0'
             }}>
              Enrolled Students
            </h1>
            <p style={{ color: '#666', margin: '4px 0 0 0', fontSize: '18px' }}>
              Manage and view all students actively enrolled in courses
            </p>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '32px'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '24px',
            transition: 'box-shadow 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#dbeafe',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                <svg style={{ width: '20px', height: '20px', color: '#2563eb' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0' }}>Total Students</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0' }}>{filteredStudents.length}</p>
              </div>
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '24px',
            transition: 'box-shadow 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                                 backgroundColor: '#e6f7f5',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                                 <svg style={{ width: '20px', height: '20px', color: '#07A698' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0' }}>Available Courses</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0' }}>{courses.length}</p>
              </div>
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb',
            padding: '24px',
            transition: 'box-shadow 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#f3e8ff',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px'
              }}>
                <svg style={{ width: '20px', height: '20px', color: '#9333ea' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '500', color: '#6b7280', margin: '0' }}>Active Enrollments</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', margin: '0' }}>
                  {courses.reduce((total, course) => {
                    const students = course.studentsEnrolled;
                    if (Array.isArray(students)) {
                      return total + students.length;
                    } else if (students && typeof students === 'object') {
                      return total + Object.values(students).length;
                    } else {
                      return total;
                    }
                  }, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filter Section */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <label style={{ 
            fontSize: '18px', 
            fontWeight: '600', 
            color: '#374151',
            display: 'flex',
            alignItems: 'center'
          }}>
                         <svg style={{ width: '20px', height: '20px', marginRight: '8px', color: '#07A698' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter by Course:
          </label>
          {loadingCourses ? (
                         <div style={{ display: 'flex', alignItems: 'center', color: '#07A698', fontWeight: '600' }}>
              <div style={{
                width: '16px',
                height: '16px',
                                 border: '2px solid #07A698',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '8px'
              }}></div>
              Loading courses...
            </div>
          ) : coursesError ? (
            <span style={{ color: '#ef4444', fontWeight: '600', display: 'flex', alignItems: 'center' }}>
              <svg style={{ width: '20px', height: '20px', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {coursesError}
            </span>
          ) : (
            <select
              style={{
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                padding: '12px 16px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#374151',
                backgroundColor: 'white',
                minWidth: '200px',
                outline: 'none'
              }}
              value={selectedCourse}
              onChange={e => setSelectedCourse(e.target.value)}
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course._id} value={course._id}>{course.courseName}</option>
              ))}
            </select>
          )}
        </div>
        </div>
        
      {/* Table Section */}
      {(() => {
        if (loadingCourses) {
          return (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              padding: '48px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                                 border: '3px solid #07A698',
                borderTop: '3px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 16px'
              }}></div>
                             <p style={{ fontSize: '18px', color: '#07A698', fontWeight: '600', margin: '0 0 8px 0' }}>Loading courses...</p>
              <p style={{ color: '#6b7280', margin: '0' }}>Please wait while we fetch the data</p>
            </div>
          );
        } else if (coursesError) {
          return (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              padding: '48px',
              textAlign: 'center'
            }}>
              <div style={{
                width: '64px',
                height: '64px',
                backgroundColor: '#fef2f2',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <svg style={{ width: '32px', height: '32px', color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
          </div>
              <p style={{ fontSize: '18px', color: '#ef4444', fontWeight: '600', margin: '0 0 8px 0' }}>{coursesError}</p>
              <p style={{ color: '#6b7280', margin: '0' }}>Please try refreshing the page</p>
          </div>
          );
        } else {
          return (
            <div style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #e5e7eb',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                                         <tr style={{ background: 'linear-gradient(135deg, #07A698 0%, #059a8c 100%)' }}>
                      <th style={{ padding: '16px 24px', textAlign: 'left', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Student Name</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Email Address</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Courses Enrolled</th>
                      <th style={{ padding: '16px 24px', textAlign: 'left', color: 'white', fontWeight: 'bold', fontSize: '18px' }}>Total Courses</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length === 0 ? (
                  <tr>
                        <td colSpan={4} style={{ padding: '48px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                              width: '64px',
                              height: '64px',
                              backgroundColor: '#f3f4f6',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: '16px'
                            }}>
                              <svg style={{ width: '32px', height: '32px', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                              </svg>
                            </div>
                            <p style={{ fontSize: '20px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>No enrolled students found</p>
                            <p style={{ color: '#6b7280', margin: '0' }}>There are currently no students enrolled in the selected course.</p>
                          </div>
                        </td>
                  </tr>
                ) : (
                      filteredStudents.map((student, index) => (
                        <tr key={student._id} style={{ 
                          borderBottom: '1px solid #f3f4f6',
                          backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'
                        }}>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{
                                width: '40px',
                                height: '40px',
                                                                 background: 'linear-gradient(135deg, #07A698 0%, #059a8c 100%)',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '12px'
                              }}>
                                <span style={{ color: 'white', fontWeight: '600', fontSize: '14px' }}>
                                  {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p style={{ fontWeight: '600', color: '#111827', margin: '0' }}>{student.firstName} {student.lastName}</p>
                                <p style={{ fontSize: '14px', color: '#6b7280', margin: '0' }}>Student ID: {student._id?.slice(-6)}</p>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <svg style={{ width: '16px', height: '16px', color: '#9ca3af', marginRight: '8px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              <span style={{ color: '#374151' }}>{student.email}</span>
                            </div>
                          </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {courses.filter(course => {
                                const students = course.studentsEnrolled;
                                if (Array.isArray(students)) {
                                  return students.some(s => s._id === student._id);
                                } else if (students && typeof students === 'object') {
                                  return Object.values(students).some(s => s._id === student._id);
                                } else {
                                  return false;
                                }
                              }).map(course => (
                                <span key={course._id} style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  padding: '4px 12px',
                                  borderRadius: '16px',
                                  fontSize: '12px',
                                  fontWeight: '500',
                                                                     backgroundColor: '#07A698',
                                  color: 'white'
                                }}>
                                  {course.courseName}
                                </span>
                              ))}
                            </div>
                      </td>
                          <td style={{ padding: '16px 24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              <div style={{
                                width: '32px',
                                height: '32px',
                                backgroundColor: '#dbeafe',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginRight: '8px'
                              }}>
                                <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '14px' }}>
                                  {courses.filter(course => {
                                    const students = course.studentsEnrolled;
                                    if (Array.isArray(students)) {
                                      return students.some(s => s._id === student._id);
                                    } else if (students && typeof students === 'object') {
                                      return Object.values(students).some(s => s._id === student._id);
                                    } else {
                                      return false;
                                    }
                                  }).length}
                                </span>
                              </div>
                              <span style={{ color: '#374151', fontWeight: '500' }}>courses</span>
                            </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
      </div>
    </div>
          );
        }
      })()}
      
             <style>
         {`
           @keyframes spin {
             0% { transform: rotate(0deg); }
             100% { transform: rotate(360deg); }
           }
         `}
       </style>
       </div>
     </DashboardLayout>
  );
} 