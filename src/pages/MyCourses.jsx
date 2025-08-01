import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { apiConnector } from '../services/apiConnector';
import { course as courseApi } from '../services/apis';
import { deleteCourse } from '../services/operations/courseDetailsAPI';
import { VscEdit, VscTrash, VscEye, VscSearch, VscFilter } from 'react-icons/vsc';
import { toast } from 'react-hot-toast';
import { setCourse, setEditCourse } from '../store/slices/courseSlice';
import ConfirmationModal from '../components/common/ConfirmationModal';

const TAWKTO_GREEN = '#009e5c';

export default function MyCourses() {
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [confirmationModal, setConfirmationModal] = useState(null);

  // Debug: Log current state
  console.log('=== COMPONENT RENDER ===');
  console.log('Token:', token ? 'Present' : 'Missing');
  console.log('User:', user);
  console.log('User account type:', user?.accountType);
  console.log('Courses state:', courses);
  console.log('Loading:', loading);
  console.log('Error:', error);

  useEffect(() => {
    async function fetchInstructorCourses() {
      setLoading(true);
      setError(null);
      try {
        console.log('=== FETCHING INSTRUCTOR COURSES ===');
        console.log('Token:', token ? 'Present' : 'Missing');
        console.log('User:', user);
        console.log('User account type:', user?.accountType);
        
        const response = await apiConnector(
          'GET',
          courseApi.GET_INSTRUCTOR_COURSES_API,
          null,
          token ? { Authorization: `Bearer ${token}` } : undefined
        );
        
        console.log('=== API RESPONSE ===');
        console.log('Full response:', response);
        console.log('Response data:', response.data);
        console.log('Response success:', response.data?.success);
        console.log('Response data.data:', response.data?.data);
        
        if (response.data && response.data.success) {
          const coursesData = response.data.data || [];
          console.log('Setting courses:', coursesData);
          setCourses(coursesData);
        } else {
          console.log('API returned success: false');
          setCourses([]);
          setError('Failed to load courses.');
        }
      } catch (err) {
        console.log('=== API ERROR ===');
        console.log('Error:', err);
        console.log('Error response:', err.response);
        console.log('Error message:', err.message);
        setCourses([]);
        setError('Failed to load courses.');
      } finally {
        setLoading(false);
      }
    }
    
    if (user?.accountType === 'Instructor') {
      console.log('User is instructor, fetching courses...');
      fetchInstructorCourses();
    } else {
      console.log('User is not instructor or user not loaded yet');
      console.log('User account type:', user?.accountType);
    }
  }, [token, user]);

  // Filter courses based on search term and status
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.courseDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Debug log for courses state
  useEffect(() => {
    console.log('=== COURSES STATE UPDATED ===');
    console.log('Current courses:', courses);
    console.log('Courses length:', courses.length);
    console.log('Filtered courses:', filteredCourses);
    console.log('Filtered courses length:', filteredCourses.length);
  }, [courses, filteredCourses]);

  // Calculate statistics
  const totalCourses = courses.length;
  const publishedCourses = courses.filter(course => course.status === 'Published').length;
  const draftCourses = courses.filter(course => course.status === 'Draft').length;
  const totalStudents = courses.reduce((sum, course) => sum + (course.studentsEnrolled?.length || 0), 0);
  const totalRevenue = courses.reduce((sum, course) => {
    const enrolledCount = course.studentsEnrolled?.length || 0;
    return sum + (enrolledCount * (course.price || 0));
  }, 0);

  const getStatusBadge = (status) => {
    const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
    if (status === 'Published') {
      return <span className={`${baseClasses} bg-green-100 text-green-800`}>Published</span>;
    } else {
      return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Draft</span>;
    }
  };

  const handleEditCourse = async (courseId) => {
    try {
      // Navigate directly to edit course page
      navigate(`/instructor/edit-course/${courseId}`);
      toast.success(`Editing course...`);
    } catch (error) {
      console.error('Error navigating to edit course:', error);
      toast.error('Failed to open edit course page');
    }
  };

  const handleDeleteCourse = (courseId) => {
    setConfirmationModal({
      text1: 'Delete Course',
      text2: 'Are you sure you want to delete this course? This action cannot be undone.',
      btn1Text: 'Delete',
      btn2Text: 'Cancel',
      btn1Handler: async () => {
        setConfirmationModal(null);
        try {
          await deleteCourse({ courseId }, token);
          setCourses((prev) => prev.filter((c) => c._id !== courseId));
          toast.success('Course deleted successfully');
        } catch (error) {
          toast.error('Failed to delete course');
        }
      },
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  const handleViewCourse = (courseId) => {
    // Navigate to course viewer with screenshot protection
    navigate(`/course/${courseId}/view`);
    toast.success('Opening course viewer with protection enabled');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Add Course Button */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
            <p className="text-gray-600">Manage and track all your created courses</p>
          </div>
          <button 
            onClick={() => {
              dispatch(setEditCourse(false));
              dispatch(setCourse({}));
              navigate('/instructor/add-course');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <VscEdit className="w-5 h-5" />
            Add Course +
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <VscEye className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Courses</p>
                <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <VscEdit className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Published</p>
                <p className="text-2xl font-bold text-gray-900">{publishedCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <VscFilter className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-900">{draftCourses}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <VscSearch className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <VscSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Published">Published</option>
                <option value="Draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-blue-600">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading courses...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <p className="text-red-600 font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-gray-50 rounded-lg p-8">
              <VscEdit className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600 mb-6">
                {courses.length === 0 
                  ? "You haven't created any courses yet. Start by creating your first course!"
                  : "No courses match your search criteria."
                }
              </p>
              {courses.length === 0 && (
                <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Create Your First Course
                </button>
              )}
            </div>
          </div>
        )}

        {/* Courses Table */}
        {!loading && !error && filteredCourses.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      COURSES
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      DURATION
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      PRICE
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ACTIONS
                    </th>
              </tr>
            </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCourses.map(course => (
                    <tr key={course._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 h-28 w-40">
                            {course.thumbnail ? (
                              <img 
                                className="h-28 w-40 rounded-lg object-cover" 
                                src={course.thumbnail} 
                                alt={course.courseName}
                              />
                            ) : (
                              <div className="h-28 w-40 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <VscEdit className="w-12 h-12 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              {course.courseName || 'Untitled Course'}
                            </div>
                            <div className="text-sm text-gray-500 mb-2">
                              {course.courseDescription 
                                ? (course.courseDescription.length > 60 
                                    ? course.courseDescription.substring(0, 60) + '...' 
                                    : course.courseDescription)
                                : 'No description available'
                              }
                            </div>
                            <div className="text-xs text-gray-400 mb-2">
                              Created: {new Date(course.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })} | {new Date(course.createdAt).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            {getStatusBadge(course.status)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.courseContent && course.courseContent.length > 0 
                          ? `${course.courseContent.length} sections`
                          : 'No content'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        ₹{course.price || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => navigate(`/courses/${course._id}`)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="View Details"
                          >
                            <VscEye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditCourse(course._id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Edit Course"
                          >
                            <VscEdit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(course._id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete Course"
                          >
                            <VscTrash className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                </tr>
              ))}
            </tbody>
          </table>
            </div>
          </div>
        )}

        {/* Results Summary */}
        {!loading && !error && filteredCourses.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-600">
            Showing {filteredCourses.length} of {courses.length} courses
        </div>
      )}
      </div>
      <ConfirmationModal modalData={confirmationModal} />
    </div>
  );
} 