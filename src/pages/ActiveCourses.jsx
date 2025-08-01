import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { apiConnector } from '../services/apiConnector';
import { profile } from '../services/apis';
import { VscPlay, VscBook, VscCalendar, VscPerson } from 'react-icons/vsc';

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
          toast.error("Failed to fetch enrolled courses");
        }
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        if (error.response?.status === 401) {
          toast.error("Please login to view your courses");
        } else {
          toast.error("Failed to load enrolled courses");
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <VscBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Active Courses</h1>
          <p className="text-lg text-gray-600 mb-6">Please login to view your enrolled courses.</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#009e5c] hover:bg-[#008a4f] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009e5c] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your courses...</p>
        </div>
      </div>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <VscBook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Active Courses</h1>
          <p className="text-lg text-gray-600 mb-6">You have no active courses at the moment.</p>
          <button
            onClick={() => navigate('/catalog/all')}
            className="bg-[#009e5c] hover:bg-[#008a4f] text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Browse Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Active Courses</h1>
          <p className="text-gray-600">Continue learning from where you left off</p>
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
                      className="bg-[#009e5c] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${course.progressPercentage || 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Continue Button */}
                <button className="w-full bg-[#009e5c] hover:bg-[#008a4f] text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center">
                  <VscPlay className="w-4 h-4 mr-2" />
                  Continue Learning
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 