import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showError } from '../utils/toast';
import { apiConnector } from '../services/apiConnector';
import { profile } from '../services/apis';
import { VscPlay, VscBook, VscCalendar, VscPerson } from 'react-icons/vsc';
import DashboardLayout from '../components/common/DashboardLayout';

const { GET_ENROLLED_COURSES_API } = profile;

export default function ActiveCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        const response = await apiConnector(
          "GET",
          GET_ENROLLED_COURSES_API,
          null,
          {
            Authorization: `Bearer ${token}`,
          }
        );

        console.log("Enrolled courses response:", response);
        
        if (response.data.success) {
          setEnrolledCourses(response.data.data);
        } else {
          console.error("Failed to fetch enrolled courses:", response.data.message);
          showError("Failed to fetch enrolled courses");
        }
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        if (error.response?.status === 401) {
          showError("Please login to view your courses");
        } else {
          showError("Failed to load enrolled courses");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchEnrolledCourses();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleCourseClick = (courseId) => {
    navigate(`/course/${courseId}/0/0`);
  };

  if (!token) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
          <div style={{ textAlign: 'center' }}>
            <VscBook style={{ width: '64px', height: '64px', color: '#666', margin: '0 auto 1rem' }} />
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#191A1F', marginBottom: '1rem' }}>Active Courses</h1>
            <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '1.5rem' }}>Please login to view your enrolled courses.</p>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: '#07A698',
                color: 'white',
                fontWeight: '600',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#059a8c'}
              onMouseOut={(e) => e.target.style.background = '#07A698'}
            >
              Login
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p style={{ color: '#666' }}>Loading your courses...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
          <div style={{ textAlign: 'center' }}>
            <VscBook style={{ width: '64px', height: '64px', color: '#666', margin: '0 auto 1rem' }} />
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#191A1F', marginBottom: '1rem' }}>Active Courses</h1>
            <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '1.5rem' }}>You have no active courses at the moment.</p>
            <button
              onClick={() => navigate('/catalog/all')}
              style={{
                background: '#07A698',
                color: 'white',
                fontWeight: '600',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => e.target.style.background = '#059a8c'}
              onMouseOut={(e) => e.target.style.background = '#07A698'}
            >
              Browse Courses
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#191A1F', marginBottom: '0.5rem' }}>Active Courses</h1>
          <p style={{ color: '#666' }}>Continue learning from where you left off</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              onClick={() => handleCourseClick(course._id)}
            >
              {/* Course Thumbnail */}
              <div className="relative">
                <img
                  src={course.thumbnail || 'https://via.placeholder.com/400x250?text=Course+Image'}
                  alt={course.courseName}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
                  <VscPlay className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Course Content */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  {course.courseName}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {course.courseDescription}
                </p>

                {/* Course Metadata */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <VscPerson className="w-4 h-4 mr-2" />
                    <span>{course.instructor?.firstName} {course.instructor?.lastName}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <VscCalendar className="w-4 h-4 mr-2" />
                    <span>{course.durationInSeconds ? `${Math.round(course.durationInSeconds / 60)} minutes` : 'Duration not available'}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{course.progressPercentage || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${course.progressPercentage || 0}%`,
                        backgroundColor: '#07A698'
                      }}
                    ></div>
                  </div>
                </div>

                {/* Continue Button */}
                <button 
                  className="w-full text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                  style={{
                    backgroundColor: '#07A698'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#059a8c'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#07A698'}
                >
                  <VscPlay className="w-4 h-4 mr-2" />
                  Continue Learning
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
} 