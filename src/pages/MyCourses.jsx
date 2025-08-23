// // import React, { useEffect, useState } from 'react';
// // import { useSelector, useDispatch } from 'react-redux';
// // import { useNavigate } from 'react-router-dom';
// // import { apiConnector } from '../services/apiConnector';
// // import { course as courseApi, profile as profileApi } from '../services/apis';
// // import { deleteCourse } from '../services/operations/courseDetailsAPI';
// // import { VscEdit, VscTrash, VscEye, VscSearch, VscFilter } from 'react-icons/vsc';
// // import { showSuccess, showError } from '../utils/toast';
// // import { setCourse, setEditCourse } from '../store/slices/courseSlice';
// // import ConfirmationModal from '../components/common/ConfirmationModal';

// // const TAWKTO_GREEN = '#009e5c';

// // export default function MyCourses() {
// //   const { token } = useSelector((state) => state.auth);
// //   const { user } = useSelector((state) => state.profile);
// //   const dispatch = useDispatch();
// //   const navigate = useNavigate();
// //   const [courses, setCourses] = useState([]);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [statusFilter, setStatusFilter] = useState('all');
// //   const [confirmationModal, setConfirmationModal] = useState(null);

// //   // Debug: Log current state
// //   console.log('=== COMPONENT RENDER ===');
// //   console.log('Token:', token ? 'Present' : 'Missing');
// //   console.log('User:', user);
// //   console.log('User account type:', user?.accountType);
// //   console.log('Courses state:', courses);
// //   console.log('Loading:', loading);
// //   console.log('Error:', error);

// //   useEffect(() => {
// //     async function fetchInstructorCourses() {
// //       setLoading(true);
// //       setError(null);
// //       try {
// //         console.log('=== FETCHING INSTRUCTOR COURSES ===');
// //         console.log('Token:', token ? 'Present' : 'Missing');
// //         console.log('User:', user);
// //         console.log('User account type:', user?.accountType);
        
// //         const response = await apiConnector(
// //           'GET',
// //           courseApi.GET_INSTRUCTOR_COURSES_API,
// //           null,
// //           token ? { Authorization: `Bearer ${token}` } : undefined
// //         );
        
// //         console.log('=== API RESPONSE ===');
// //         console.log('Full response:', response);
// //         console.log('Response data:', response.data);
// //         console.log('Response success:', response.data?.success);
// //         console.log('Response data.data:', response.data?.data);
        
// //         if (response.data && response.data.success) {
// //           const coursesData = response.data.data || [];
// //           console.log('Setting courses:', coursesData);
// //           setCourses(coursesData);
// //         } else {
// //           console.log('API returned success: false');
// //           setCourses([]);
// //           setError('Failed to load courses.');
// //         }
// //       } catch (err) {
// //         console.log('=== API ERROR ===');
// //         console.log('Error:', err);
// //         console.log('Error response:', err.response);
// //         console.log('Error message:', err.message);
// //         setCourses([]);
// //         setError('Failed to load courses.');
// //       } finally {
// //         setLoading(false);
// //       }
// //     }

// //     async function fetchStudentBatchCourses() {
// //       setLoading(true);
// //       setError(null);
// //       try {
// //         console.log('=== FETCHING STUDENT BATCH COURSES ===');
// //         const response = await apiConnector(
// //           'GET',
// //           profileApi.BATCH_COURSES_API,
// //           null,
// //           token ? { Authorization: `Bearer ${token}` } : undefined
// //         );
// //         console.log('=== STUDENT API RESPONSE ===', response?.data);
// //         if (response.data && response.data.success) {
// //           const coursesData = response.data.data || [];
// //           setCourses(coursesData);
// //         } else {
// //           setCourses([]);
// //           setError('Failed to load assigned courses.');
// //         }
// //       } catch (err) {
// //         console.log('Student courses fetch error:', err);
// //         setCourses([]);
// //         setError('Failed to load assigned courses.');
// //       } finally {
// //         setLoading(false);
// //       }
// //     }

// //     const role = user?.accountType;
// //     if (role === 'Instructor') {
// //       console.log('User is instructor, fetching courses...');
// //       fetchInstructorCourses();
// //     } else if (role === 'Student') {
// //       console.log('User is student, fetching batch-assigned courses...');
// //       fetchStudentBatchCourses();
// //     } else {
// //       console.log('User role not supported for MyCourses page yet:', role);
// //     }
// //   }, [token, user]);

// //   // Filter courses based on search term and status
// //   const isInstructor = user?.accountType === 'Instructor';
// //   const isStudent = user?.accountType === 'Student';

// //   const filteredCourses = courses.filter(course => {
// //     const matchesSearch = course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //                          course.courseDescription?.toLowerCase().includes(searchTerm.toLowerCase());
// //     const matchesStatus = isInstructor ? (statusFilter === 'all' || course.status === statusFilter) : true;
// //     return matchesSearch && matchesStatus;
// //   });

// //   // Debug log for courses state
// //   useEffect(() => {
// //     console.log('=== COURSES STATE UPDATED ===');
// //     console.log('Current courses:', courses);
// //     console.log('Courses length:', courses.length);
// //     console.log('Filtered courses:', filteredCourses);
// //     console.log('Filtered courses length:', filteredCourses.length);
// //   }, [courses, filteredCourses]);

// //   // Calculate statistics
// //   const totalCourses = courses.length;
// //   const publishedCourses = isInstructor ? courses.filter(course => course.status === 'Published').length : 0;
// //   const draftCourses = isInstructor ? courses.filter(course => course.status === 'Draft').length : 0;
// //   const totalStudents = isInstructor ? courses.reduce((sum, course) => sum + (course.studentsEnrolled?.length || 0), 0) : 0;
// //   const totalRevenue = isInstructor ? courses.reduce((sum, course) => {
// //     const enrolledCount = course.studentsEnrolled?.length || 0;
// //     return sum + (enrolledCount * (course.price || 0));
// //   }, 0) : 0;

// //   const getStatusBadge = (status) => {
// //     const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
// //     if (status === 'Published') {
// //       return <span className={`${baseClasses} bg-green-100 text-green-800`}>Published</span>;
// //     } else {
// //       return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Draft</span>;
// //     }
// //   };

// //   const handleEditCourse = async (courseId) => {
// //     try {
// //       // Navigate directly to edit course page
// //       navigate(`/instructor/edit-course/${courseId}`);
// //       showSuccess(`Editing course...`);
// //     } catch (error) {
// //       console.error('Error navigating to edit course:', error);
// //       showError('Failed to open edit course page');
// //     }
// //   };

// //   const handleDeleteCourse = (courseId) => {
// //     setConfirmationModal({
// //       text1: 'Delete Course',
// //       text2: 'Are you sure you want to delete this course? This action cannot be undone.',
// //       btn1Text: 'Delete',
// //       btn2Text: 'Cancel',
// //       btn1Handler: async () => {
// //         setConfirmationModal(null);
// //         try {
// //           await deleteCourse({ courseId }, token);
// //           setCourses((prev) => prev.filter((c) => c._id !== courseId));
// //           showSuccess('Course deleted successfully');
// //         } catch (error) {
// //           showError('Failed to delete course');
// //         }
// //       },
// //       btn2Handler: () => setConfirmationModal(null),
// //     });
// //   };

// //   const handleViewCourse = (courseId) => {
// //     // Navigate to course viewer with screenshot protection
// //     navigate(`/course/${courseId}/view`);
// //     showSuccess('Opening course viewer with protection enabled');
// //   };

// //   return (
// //     <div className="min-h-screen bg-gray-50 p-6">
// //       <div className="max-w-7xl mx-auto">
// //         {/* Header with optional Add Course Button */}
// //         <div className="mb-8 flex justify-between items-center">
// //           <div>
// //             <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
// //             <p className="text-gray-600">
// //               {isInstructor ? 'Manage and track all your created courses' : 'Courses assigned to you by your institution'}
// //             </p>
// //           </div>
// //           {isInstructor && (
// //             <button 
// //               onClick={() => {
// //                 dispatch(setEditCourse(false));
// //                 dispatch(setCourse({}));
// //                 navigate('/instructor/add-course');
// //               }}
// //               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
// //             >
// //               <VscEdit className="w-5 h-5" />
// //               Add Course +
// //             </button>
// //           )}
// //         </div>

// //         {/* Statistics Cards */}
// //         {isInstructor ? (
// //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
// //             <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
// //               <div className="flex items-center">
// //                 <div className="p-2 bg-blue-100 rounded-lg">
// //                   <VscEye className="w-6 h-6 text-blue-600" />
// //                 </div>
// //                 <div className="ml-4">
// //                   <p className="text-sm font-medium text-gray-600">Total Courses</p>
// //                   <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
// //               <div className="flex items-center">
// //                 <div className="p-2 bg-green-100 rounded-lg">
// //                   <VscEdit className="w-6 h-6 text-green-600" />
// //                 </div>
// //                 <div className="ml-4">
// //                   <p className="text-sm font-medium text-gray-600">Published</p>
// //                   <p className="text-2xl font-bold text-gray-900">{publishedCourses}</p>
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
// //               <div className="flex items-center">
// //                 <div className="p-2 bg-yellow-100 rounded-lg">
// //                   <VscFilter className="w-6 h-6 text-yellow-600" />
// //                 </div>
// //                 <div className="ml-4">
// //                   <p className="text-sm font-medium text-gray-600">Draft</p>
// //                   <p className="text-2xl font-bold text-gray-900">{draftCourses}</p>
// //                 </div>
// //               </div>
// //             </div>

// //             <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
// //               <div className="flex items-center">
// //                 <div className="p-2 bg-purple-100 rounded-lg">
// //                   <VscSearch className="w-6 h-6 text-purple-600" />
// //                 </div>
// //                 <div className="ml-4">
// //                   <p className="text-sm font-medium text-gray-600">Total Students</p>
// //                   <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         ) : (
// //           <div className="grid grid-cols-1 gap-6 mb-8">
// //             <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
// //               <div className="flex items-center">
// //                 <div className="p-2 bg-blue-100 rounded-lg">
// //                   <VscEye className="w-6 h-6 text-blue-600" />
// //                 </div>
// //                 <div className="ml-4">
// //                   <p className="text-sm font-medium text-gray-600">Assigned Courses</p>
// //                   <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
// //                 </div>
// //               </div>
// //             </div>
// //           </div>
// //         )}

// //         {/* Search and Filter */}
// //         <div className="bg-white rounded-lg shadow p-6 mb-8">
// //           <div className="flex flex-col md:flex-row gap-4">
// //             <div className="flex-1">
// //               <div className="relative">
// //                 <VscSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
// //                 <input
// //                   type="text"
// //                   placeholder="Search courses..."
// //                   value={searchTerm}
// //                   onChange={(e) => setSearchTerm(e.target.value)}
// //                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                 />
// //               </div>
// //             </div>
// //             {isInstructor && (
// //               <div className="md:w-48">
// //                 <select
// //                   value={statusFilter}
// //                   onChange={(e) => setStatusFilter(e.target.value)}
// //                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
// //                 >
// //                   <option value="all">All Status</option>
// //                   <option value="Published">Published</option>
// //                   <option value="Draft">Draft</option>
// //                 </select>
// //               </div>
// //             )}
// //           </div>
// //         </div>

// //         {/* Loading State */}
// //         {loading && (
// //           <div className="text-center py-12">
// //             <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-blue-600">
// //               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
// //                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
// //                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
// //               </svg>
// //               Loading courses...
// //             </div>
// //           </div>
// //         )}

// //         {/* Error State */}
// //         {error && (
// //           <div className="text-center py-12">
// //             <div className="bg-red-50 border border-red-200 rounded-lg p-6">
// //               <p className="text-red-600 font-semibold">{error}</p>
// //             </div>
// //           </div>
// //         )}

// //         {/* Empty State */}
// //         {!loading && !error && filteredCourses.length === 0 && (
// //           <div className="text-center py-12">
// //             <div className="bg-gray-50 rounded-lg p-8">
// //               <VscEdit className="w-16 h-16 text-gray-400 mx-auto mb-4" />
// //               <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
// //               <p className="text-gray-600 mb-6">
// //                 {courses.length === 0 
// //                   ? "You haven't created any courses yet. Start by creating your first course!"
// //                   : "No courses match your search criteria."
// //                 }
// //               </p>
// //               {courses.length === 0 && (
// //                 <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
// //                   Create Your First Course
// //                 </button>
// //               )}
// //             </div>
// //           </div>
// //         )}

// //         {/* Courses Table */}
// //         {!loading && !error && filteredCourses.length > 0 && (
// //           <div className="bg-white rounded-lg shadow overflow-hidden">
// //         <div className="overflow-x-auto">
// //               <table className="min-w-full divide-y divide-gray-200">
// //                 <thead className="bg-gray-50">
// //                   <tr>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                       COURSES
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                       DURATION
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                       PRICE
// //                     </th>
// //                     <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
// //                       {isInstructor ? 'ACTIONS' : 'VIEW'}
// //                     </th>
// //               </tr>
// //             </thead>
// //                 <tbody className="bg-white divide-y divide-gray-200">
// //                   {filteredCourses.map(course => (
// //                     <tr key={course._id} className="hover:bg-gray-50">
// //                       <td className="px-6 py-4">
// //                         <div className="flex items-start space-x-4">
// //                           <div className="flex-shrink-0 h-28 w-40">
// //                             {course.thumbnail ? (
// //                               <img 
// //                                 className="h-28 w-40 rounded-lg object-cover" 
// //                                 src={course.thumbnail} 
// //                                 alt={course.courseName}
// //                               />
// //                             ) : (
// //                               <div className="h-28 w-40 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
// //                                 <VscEdit className="w-12 h-12 text-white" />
// //                               </div>
// //                             )}
// //                           </div>
// //                           <div className="flex-1 min-w-0">
// //                             <div className="text-sm font-medium text-gray-900 mb-1">
// //                               {course.courseName || 'Untitled Course'}
// //                             </div>
// //                             <div className="text-sm text-gray-500 mb-2">
// //                               {course.courseDescription 
// //                                 ? (course.courseDescription.length > 60 
// //                                     ? course.courseDescription.substring(0, 60) + '...' 
// //                                     : course.courseDescription)
// //                                 : 'No description available'
// //                               }
// //                             </div>
// //                             <div className="text-xs text-gray-400 mb-2">
// //                               Created: {new Date(course.createdAt).toLocaleDateString('en-US', {
// //                                 year: 'numeric',
// //                                 month: 'long',
// //                                 day: 'numeric'
// //                               })} | {new Date(course.createdAt).toLocaleTimeString('en-US', {
// //                                 hour: '2-digit',
// //                                 minute: '2-digit'
// //                               })}
// //                             </div>
// //                             {isInstructor && getStatusBadge(course.status)}
// //                           </div>
// //                         </div>
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
// //                         {course.courseContent && course.courseContent.length > 0 
// //                           ? `${course.courseContent.length} sections`
// //                           : 'No content'
// //                         }
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
// //                         ₹{course.price || 0}
// //                       </td>
// //                       <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
// //                         {isInstructor ? (
// //                           <div className="flex space-x-3">
// //                             <button
// //                               onClick={() => navigate(`/courses/${course._id}`)}
// //                               className="text-green-600 hover:text-green-900 p-1 rounded"
// //                               title="View Details"
// //                             >
// //                               <VscEye className="w-5 h-5" />
// //                             </button>
// //                             <button
// //                               onClick={() => handleEditCourse(course._id)}
// //                               className="text-blue-600 hover:text-blue-900 p-1 rounded"
// //                               title="Edit Course"
// //                             >
// //                               <VscEdit className="w-5 h-5" />
// //                             </button>
// //                             <button
// //                               onClick={() => handleDeleteCourse(course._id)}
// //                               className="text-red-600 hover:text-red-900 p-1 rounded"
// //                               title="Delete Course"
// //                             >
// //                               <VscTrash className="w-5 h-5" />
// //                             </button>
// //                           </div>
// //                         ) : (
// //                           <div className="flex">
// //                             <button
// //                               onClick={() => handleViewCourse(course._id)}
// //                               className="text-green-600 hover:text-green-900 p-1 rounded flex items-center gap-2"
// //                               title="Open Course"
// //                             >
// //                               <VscEye className="w-5 h-5" />
// //                               <span className="sr-only">Open</span>
// //                             </button>
// //                           </div>
// //                         )}
// //                       </td>
// //                 </tr>
// //               ))}
// //             </tbody>
// //           </table>
// //             </div>
// //           </div>
// //         )}

// //         {/* Results Summary */}
// //         {!loading && !error && filteredCourses.length > 0 && (
// //           <div className="mt-8 text-center text-sm text-gray-600">
// //             Showing {filteredCourses.length} of {courses.length} courses
// //         </div>
// //       )}
// //       </div>
// //       <ConfirmationModal modalData={confirmationModal} />
// //     </div>
// //   );
// // } 



// import React, { useEffect, useState } from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { useNavigate, Link } from 'react-router-dom';
// import { motion } from 'framer-motion';
// import { useInView } from 'react-intersection-observer';
// import { apiConnector } from '../services/apiConnector';
// import { course as courseApi, profile as profileApi } from '../services/apis';
// import { deleteCourse } from '../services/operations/courseDetailsAPI';
// import { VscEdit, VscTrash, VscEye, VscSearch, VscFilter } from 'react-icons/vsc';
// import { FaFile, FaUser, FaEye, FaStar, FaLightbulb } from 'react-icons/fa';
// import { showSuccess, showError } from '../utils/toast';
// import { setCourse, setEditCourse } from '../store/slices/courseSlice';
// import ConfirmationModal from '../components/common/ConfirmationModal';

// const TAWKTO_GREEN = '#009e5c';

// export default function MyCourses() {
//   const { token } = useSelector((state) => state.auth);
//   const { user } = useSelector((state) => state.profile);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const [courses, setCourses] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [statusFilter, setStatusFilter] = useState('all');
//   const [confirmationModal, setConfirmationModal] = useState(null);
//   const [ref, inView] = useInView({
//     triggerOnce: false,
//     threshold: 0.1,
//   });

//   useEffect(() => {
//     async function fetchInstructorCourses() {
//       setLoading(true);
//       setError(null);
//       try {
//         const response = await apiConnector(
//           'GET',
//           courseApi.GET_INSTRUCTOR_COURSES_API,
//           null,
//           token ? { Authorization: `Bearer ${token}` } : undefined
//         );
        
//         if (response.data && response.data.success) {
//           const coursesData = response.data.data || [];
//           setCourses(coursesData);
//         } else {
//           setCourses([]);
//           setError('Failed to load courses.');
//         }
//       } catch (err) {
//         setCourses([]);
//         setError('Failed to load courses.');
//       } finally {
//         setLoading(false);
//       }
//     }

//     async function fetchStudentBatchCourses() {
//       setLoading(true);
//       setError(null);
//       try {
//         const response = await apiConnector(
//           'GET',
//           profileApi.BATCH_COURSES_API,
//           null,
//           token ? { Authorization: `Bearer ${token}` } : undefined
//         );
        
//         if (response.data && response.data.success) {
//           const coursesData = response.data.data || [];
//           setCourses(coursesData);
//         } else {
//           setCourses([]);
//           setError('Failed to load assigned courses.');
//         }
//       } catch (err) {
//         setCourses([]);
//         setError('Failed to load assigned courses.');
//       } finally {
//         setLoading(false);
//       }
//     }

//     const role = user?.accountType;
//     if (role === 'Instructor') {
//       fetchInstructorCourses();
//     } else if (role === 'Student') {
//       fetchStudentBatchCourses();
//     }
//   }, [token, user]);

//   // Filter courses based on search term and status
//   const isInstructor = user?.accountType === 'Instructor';
//   const isStudent = user?.accountType === 'Student';

//   const filteredCourses = courses.filter(course => {
//     const matchesSearch = course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          course.courseDescription?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus = isInstructor ? (statusFilter === 'all' || course.status === statusFilter) : true;
//     return matchesSearch && matchesStatus;
//   });

//   // Calculate statistics
//   const totalCourses = courses.length;
//   const publishedCourses = isInstructor ? courses.filter(course => course.status === 'Published').length : 0;
//   const draftCourses = isInstructor ? courses.filter(course => course.status === 'Draft').length : 0;
//   const totalStudents = isInstructor ? courses.reduce((sum, course) => sum + (course.studentsEnrolled?.length || 0), 0) : 0;
//   const totalRevenue = isInstructor ? courses.reduce((sum, course) => {
//     const enrolledCount = course.studentsEnrolled?.length || 0;
//     return sum + (enrolledCount * (course.price || 0));
//   }, 0) : 0;

//   const getCourseThumbnail = (course) => {
//     return course.thumbnail || '/assets/img/images/course-thumb.jpg';
//   };

//   const getStatusBadge = (status) => {
//     const baseClasses = "px-3 py-1 rounded-full text-xs font-semibold";
//     if (status === 'Published') {
//       return <span className={`${baseClasses} bg-green-100 text-green-800`}>Published</span>;
//     } else {
//       return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Draft</span>;
//     }
//   };

//   const handleEditCourse = async (courseId) => {
//     try {
//       navigate(`/instructor/edit-course/${courseId}`);
//       showSuccess(`Editing course...`);
//     } catch (error) {
//       showError('Failed to open edit course page');
//     }
//   };

//   const handleDeleteCourse = (courseId) => {
//     setConfirmationModal({
//       text1: 'Delete Course',
//       text2: 'Are you sure you want to delete this course? This action cannot be undone.',
//       btn1Text: 'Delete',
//       btn2Text: 'Cancel',
//       btn1Handler: async () => {
//         setConfirmationModal(null);
//         try {
//           await deleteCourse({ courseId }, token);
//           setCourses((prev) => prev.filter((c) => c._id !== courseId));
//           showSuccess('Course deleted successfully');
//         } catch (error) {
//           showError('Failed to delete course');
//         }
//       },
//       btn2Handler: () => setConfirmationModal(null),
//     });
//   };

//   const handleViewCourse = (courseId) => {
//     navigate(`/course/${courseId}/view`);
//     showSuccess('Opening course viewer with protection enabled');
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Header with optional Add Course Button */}
//         <div className="mb-8 flex justify-between items-center">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">My Courses</h1>
//             <p className="text-gray-600">
//               {isInstructor ? 'Manage and track all your created courses' : 'Courses assigned to you by your institution'}
//             </p>
//           </div>
//           {isInstructor && (
//             <motion.button 
//               onClick={() => {
//                 dispatch(setEditCourse(false));
//                 dispatch(setCourse({}));
//                 navigate('/instructor/add-course');
//               }}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <VscEdit className="w-5 h-5" />
//               Add Course +
//             </motion.button>
//           )}
//         </div>

//         {/* Statistics Cards */}
//         {isInstructor ? (
//           <motion.div 
//             className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
//               <div className="flex items-center">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <VscEye className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Total Courses</p>
//                   <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
//               <div className="flex items-center">
//                 <div className="p-2 bg-green-100 rounded-lg">
//                   <VscEdit className="w-6 h-6 text-green-600" />
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Published</p>
//                   <p className="text-2xl font-bold text-gray-900">{publishedCourses}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
//               <div className="flex items-center">
//                 <div className="p-2 bg-yellow-100 rounded-lg">
//                   <VscFilter className="w-6 h-6 text-yellow-600" />
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Draft</p>
//                   <p className="text-2xl font-bold text-gray-900">{draftCourses}</p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
//               <div className="flex items-center">
//                 <div className="p-2 bg-purple-100 rounded-lg">
//                   <VscSearch className="w-6 h-6 text-purple-600" />
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Total Students</p>
//                   <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         ) : (
//           <motion.div 
//             className="grid grid-cols-1 gap-6 mb-8"
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
//               <div className="flex items-center">
//                 <div className="p-2 bg-blue-100 rounded-lg">
//                   <VscEye className="w-6 h-6 text-blue-600" />
//                 </div>
//                 <div className="ml-4">
//                   <p className="text-sm font-medium text-gray-600">Assigned Courses</p>
//                   <p className="text-2xl font-bold text-gray-900">{totalCourses}</p>
//                 </div>
//               </div>
//             </div>
//           </motion.div>
//         )}

//         {/* Search and Filter */}
//         <motion.div 
//           className="bg-white rounded-lg shadow p-6 mb-8"
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5, delay: 0.1 }}
//         >
//           <div className="flex flex-col md:flex-row gap-4">
//             <div className="flex-1">
//               <div className="relative">
//                 <VscSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//                 <input
//                   type="text"
//                   placeholder="Search courses..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             </div>
//             {isInstructor && (
//               <div className="md:w-48">
//                 <select
//                   value={statusFilter}
//                   onChange={(e) => setStatusFilter(e.target.value)}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 >
//                   <option value="all">All Status</option>
//                   <option value="Published">Published</option>
//                   <option value="Draft">Draft</option>
//                 </select>
//               </div>
//             )}
//           </div>
//         </motion.div>

//         {/* Loading State */}
//         {loading && (
//           <div className="text-center py-12">
//             <div className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-blue-600">
//               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//               </svg>
//               Loading courses...
//             </div>
//           </div>
//         )}

//         {/* Error State */}
//         {error && (
//           <motion.div 
//             className="text-center py-12"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             <div className="bg-red-50 border border-red-200 rounded-lg p-6">
//               <p className="text-red-600 font-semibold">{error}</p>
//             </div>
//           </motion.div>
//         )}

//         {/* Empty State */}
//         {!loading && !error && filteredCourses.length === 0 && (
//           <motion.div 
//             className="text-center py-12"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             <div className="bg-gray-50 rounded-lg p-8">
//               <VscEdit className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//               <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
//               <p className="text-gray-600 mb-6">
//                 {courses.length === 0 
//                   ? "You haven't created any courses yet. Start by creating your first course!"
//                   : "No courses match your search criteria."
//                 }
//               </p>
//               {courses.length === 0 && isInstructor && (
//                 <button 
//                   className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//                   onClick={() => navigate('/instructor/add-course')}
//                 >
//                   Create Your First Course
//                 </button>
//               )}
//             </div>
//           </motion.div>
//         )}

//         {/* Courses Grid */}
//         {!loading && !error && filteredCourses.length > 0 && (
//           <motion.div 
//             className="grid grid-cols-1 gap-6 mb-8"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             {filteredCourses.map((course, index) => (
//               <motion.div 
//                 key={course._id}
//                 className="bg-white rounded-lg shadow overflow-hidden"
//                 initial={{ opacity: 0, y: 30 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6, delay: index * 0.1 }}
//                 whileHover={{ y: -5 }}
//                 ref={ref}
//               >
//                 <div className="grid grid-cols-1 md:grid-cols-[236px_1fr]">
//                   {/* Course Thumbnail */}
//                   <div className="h-48 md:h-full">
//                     <img 
//                       src={getCourseThumbnail(course)} 
//                       alt={course.courseName}
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
                  
//                   {/* Course Content */}
//                   <div className="p-6 flex flex-col justify-between">
//                     <div>
//                       <div className="flex justify-between items-start mb-3">
//                         <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
//                           {course.level || "All Levels"}
//                         </span>
//                         {isInstructor && getStatusBadge(course.status)}
//                       </div>
                      
//                       <h3 className="text-xl font-bold text-gray-900 mb-2">
//                         {course.courseName || 'Untitled Course'}
//                       </h3>
                      
//                       <p className="text-gray-600 mb-4 line-clamp-2">
//                         {course.courseDescription || 'No description available'}
//                       </p>
                      
//                       <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500">
//                         <div className="flex items-center">
//                           <FaFile className="mr-1 text-blue-500" />
//                           <span>{course.courseContent?.length || 0} Lessons</span>
//                         </div>
//                         <div className="flex items-center">
//                           <FaUser className="mr-1 text-green-500" />
//                           <span>{course.studentsEnrolled?.length || 0} Students</span>
//                         </div>
//                         <div className="flex items-center">
//                           <FaEye className="mr-1 text-purple-500" />
//                           <span>12K Views</span>
//                         </div>
//                       </div>
//                     </div>
                    
//                     <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
//                       <div className="flex items-center">
//                         <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
//                           <img 
//                             src={course.instructor?.image || "/assets/img/images/course-author-1.png"} 
//                             alt={course.instructor?.firstName || "Instructor"}
//                             className="w-full h-full object-cover"
//                           />
//                         </div>
//                         <div>
//                           <h4 className="text-sm font-medium text-gray-900">
//                             {course.instructor?.firstName} {course.instructor?.lastName || "Instructor"}
//                           </h4>
//                           <p className="text-xs text-gray-500">Instructor</p>
//                         </div>
//                       </div>
                      
//                       <div className="flex items-center">
//                         <div className="flex mr-2">
//                           {[...Array(5)].map((_, i) => (
//                             <FaStar key={i} className="text-yellow-400 text-sm" />
//                           ))}
//                         </div>
//                         <span className="text-sm text-gray-600">(4.7)</span>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
                
//                 {/* Action Buttons */}
//                 <div className="px-6 py-4 bg-gray-50 flex justify-between items-center">
//                   <div className="text-lg font-bold text-gray-900">
//                     {course.price ? `₹${course.price}` : 'Free'}
//                   </div>
                  
//                   <div className="flex space-x-2">
//                     {isInstructor ? (
//                       <>
//                         <button
//                           onClick={() => navigate(`/courses/${course._id}`)}
//                           className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 transition-colors"
//                           title="View Details"
//                         >
//                           <VscEye className="w-5 h-5" />
//                         </button>
//                         <button
//                           onClick={() => handleEditCourse(course._id)}
//                           className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
//                           title="Edit Course"
//                         >
//                           <VscEdit className="w-5 h-5" />
//                         </button>
//                         <button
//                           onClick={() => handleDeleteCourse(course._id)}
//                           className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
//                           title="Delete Course"
//                         >
//                           <VscTrash className="w-5 h-5" />
//                         </button>
//                       </>
//                     ) : (
//                       <button
//                         onClick={() => handleViewCourse(course._id)}
//                         className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
//                       >
//                         <VscEye className="w-4 h-4" />
//                         Open Course
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </motion.div>
//             ))}
//           </motion.div>
//         )}

//         {/* Results Summary */}
//         {!loading && !error && filteredCourses.length > 0 && (
//           <motion.div 
//             className="mt-8 text-center text-sm text-gray-600"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ duration: 0.5, delay: 0.3 }}
//           >
//             Showing {filteredCourses.length} of {courses.length} courses
//           </motion.div>
//         )}
//       </div>
//       <ConfirmationModal modalData={confirmationModal} />
//     </div>
//   );
// }



import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { apiConnector } from '../services/apiConnector';
import { course as courseApi, profile as profileApi } from '../services/apis';
import { deleteCourse } from '../services/operations/courseDetailsAPI';
import { VscEdit, VscTrash, VscEye, VscSearch, VscFilter, VscBook } from 'react-icons/vsc';
import { FaFile, FaUser, FaEye, FaStar, FaLightbulb, FaPlay, FaClock, FaUsers, FaChartLine } from 'react-icons/fa';
import { showSuccess, showError } from '../utils/toast';
import { setCourse, setEditCourse } from '../store/slices/courseSlice';
import ConfirmationModal from '../components/common/ConfirmationModal';

// Color constants
const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';

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
  const [ref, inView] = useInView({
    triggerOnce: false,
    threshold: 0.1,
  });

  useEffect(() => {
    async function fetchInstructorCourses() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiConnector(
          'GET',
          courseApi.GET_INSTRUCTOR_COURSES_API,
          null,
          token ? { Authorization: `Bearer ${token}` } : undefined
        );
        console.log('Course  Response:', response.data); // Add this line
        if (response.data && response.data.success) {
          const coursesData = response.data.data || [];
          setCourses(coursesData);
        } else {
          setCourses([]);
          setError('Failed to load courses.');
        }
      } catch (err) {
        setCourses([]);
        setError('Failed to load courses.');
      } finally {
        setLoading(false);
      }
    }

    async function fetchStudentBatchCourses() {
      setLoading(true);
      setError(null);
      try {
        const response = await apiConnector(
          'GET',
          profileApi.BATCH_COURSES_API,
          null,
          token ? { Authorization: `Bearer ${token}` } : undefined
        );
        
        if (response.data && response.data.success) {
          const coursesData = response.data.data || [];
          setCourses(coursesData);

          if (coursesData.length > 0) {
            console.log('First course:', coursesData[0]);
          }
        } else {
          setCourses([]);
          setError('Failed to load assigned courses.');
        }
      } catch (err) {
        setCourses([]);
        setError('Failed to load assigned courses.');
      } finally {
        setLoading(false);
      }
    }

    const role = user?.accountType;
    if (role === 'Instructor') {
      fetchInstructorCourses();
    } else if (role === 'Student') {
      fetchStudentBatchCourses();
    }
  }, [token, user]);

  // Filter courses based on search term and status
  const isInstructor = user?.accountType === 'Instructor';
  const isStudent = user?.accountType === 'Student';

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.courseName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.courseDescription?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = isInstructor ? (statusFilter === 'all' || course.status === statusFilter) : true;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalCourses = courses.length;
  const publishedCourses = isInstructor ? courses.filter(course => course.status === 'Published').length : 0;
  const draftCourses = isInstructor ? courses.filter(course => course.status === 'Draft').length : 0;
  const totalStudents = isInstructor ? courses.reduce((sum, course) => sum + (course.studentsEnrolled?.length || 0), 0) : 0;
  const totalRevenue = isInstructor ? courses.reduce((sum, course) => {
    const enrolledCount = course.studentsEnrolled?.length || 0;
    return sum + (enrolledCount * (course.price || 0));
  }, 0) : 0;

  const getCourseThumbnail = (course) => {
    return course.thumbnail || '/assets/img/images/course-thumb.jpg';
  };

  const getStatusBadge = (status) => {
    const baseStyle = {
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    };
    
    if (status === 'Published') {
      return (
        <span style={{
          ...baseStyle,
          backgroundColor: '#dcfce7',
          color: '#166534'
        }}>
          Published
        </span>
      );
    } else {
      return (
        <span style={{
          ...baseStyle,
          backgroundColor: '#fef3c7',
          color: '#92400e'
        }}>
          Draft
        </span>
      );
    }
  };

  const handleEditCourse = async (courseId) => {
    try {
      navigate(`/instructor/edit-course/${courseId}`);
      showSuccess(`Editing course...`);
    } catch (error) {
      showError('Failed to open edit course page');
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
          showSuccess('Course deleted successfully');
        } catch (error) {
          showError('Failed to delete course');
        }
      },
      btn2Handler: () => setConfirmationModal(null),
    });
  };

  const handleViewCourse = (courseId) => {
    navigate(`/course/${courseId}/view`);
    showSuccess('Opening course viewer with protection enabled');
  };

  const cardContainerStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
    gap: '24px',
    marginBottom: '32px'
  };

  const courseCardStyle = {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    border: `1px solid ${BORDER}`,
    position: 'relative'
  };

  const priceTagStyle = {
    position: 'absolute',
    top: '16px',
    left: '16px',
    backgroundColor: ED_TEAL,
    color: 'white',
    padding: '6px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '700',
    zIndex: 2,
    boxShadow: '0 2px 8px rgba(7, 166, 152, 0.3)'
  };

  const thumbnailStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    backgroundColor: '#f8fafc'
  };

  const cardContentStyle = {
    padding: '24px'
  };

  const titleStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: '8px',
    lineHeight: '1.3'
  };

  const descriptionStyle = {
    color: '#64748b',
    fontSize: '14px',
    lineHeight: '1.5',
    marginBottom: '16px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden'
  };

  const statsRowStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '16px',
    flexWrap: 'wrap'
  };

  const statItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#64748b'
  };

  const instructorRowStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: '16px',
    borderTop: `1px solid ${BORDER}`,
    marginBottom: '16px'
  };

  const instructorInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  };

  const avatarStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: `2px solid ${BORDER}`
  };

  const ratingStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end'
  };

  const buttonBaseStyle = {
    padding: '8px 12px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.2s ease'
  };

  const primaryButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: ED_TEAL,
    color: 'white'
  };

  const secondaryButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: '#f1f5f9',
    color: '#475569'
  };

  const deleteButtonStyle = {
    ...buttonBaseStyle,
    backgroundColor: '#fee2e2',
    color: '#dc2626'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ 
          marginBottom: '32px', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems:"center",
          flexWrap: 'wrap',
          gap: '16px',
          marginTop:'2rem'
        }}>
          <div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: '800', 
              color: TEXT_DARK, 
              marginBottom: '8px',
              lineHeight: '1.2'
            }}>
              My Courses
            </h1>
            {/* <p style={{ color: '#64748b', fontSize: '16px', lineHeight: '1.5' }}>
              {isInstructor ? 'Manage and track all your created courses' : 'Courses assigned to you by your institution'}
            </p> */}
          </div>
          {isInstructor && (
            <motion.button 
              onClick={() => {
                dispatch(setEditCourse(false));
                dispatch(setCourse({}));
                navigate('/instructor/add-course');
              }}
              style={{
                backgroundColor: ED_TEAL,
                color: 'white',
                padding: '12px 24px',
                borderRadius: '12px',
                border: 'none',
                fontWeight: '600',
                fontSize: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(7, 166, 152, 0.3)'
              }}
              whileHover={{ scale: 1.05, backgroundColor: ED_TEAL_DARK }}
              whileTap={{ scale: 0.95 }}
            >
              <VscEdit style={{ fontSize: '16px' }} />
              Add New Course
            </motion.button>
          )}
        </div>

        {/* Statistics Cards */}
        {/* {isInstructor ? (
          <motion.div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '20px',
              marginBottom: '32px'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {[
              { title: 'Total Courses', value: totalCourses, icon: VscBook, color: '#3b82f6', bgColor: '#dbeafe' },
              { title: 'Published', value: publishedCourses, icon: VscEye, color: ED_TEAL, bgColor: '#dcfce7' },
              { title: 'Draft', value: draftCourses, icon: VscEdit, color: '#f59e0b', bgColor: '#fef3c7' },
              { title: 'Total Students', value: totalStudents, icon: FaUsers, color: '#8b5cf6', bgColor: '#ede9fe' }
            ].map((stat, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                border: `1px solid ${BORDER}`,
                borderLeft: `4px solid ${stat.color}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    padding: '12px',
                    backgroundColor: stat.bgColor,
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <stat.icon style={{ fontSize: '24px', color: stat.color }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
                      {stat.title}
                    </p>
                    <p style={{ fontSize: '28px', fontWeight: '700', color: TEXT_DARK }}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            style={{ marginBottom: '32px' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
              border: `1px solid ${BORDER}`,
              borderLeft: `4px solid ${ED_TEAL}`,
              maxWidth: '300px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  padding: '12px',
                  backgroundColor: '#dcfce7',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <VscBook style={{ fontSize: '24px', color: ED_TEAL }} />
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px', fontWeight: '500' }}>
                    Assigned Courses
                  </p>
                  <p style={{ fontSize: '28px', fontWeight: '700', color: TEXT_DARK }}>
                    {totalCourses}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )} */}

        {/* Search and Filter */}
        <motion.div 
          style={{
            backgroundColor: 'white',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '32px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
            border: `1px solid ${BORDER}`
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div style={{ 
            display: 'flex', 
            gap: '16px',
            flexDirection: window.innerWidth < 768 ? 'column' : 'row'
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <VscSearch style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)', 
                color: '#94a3b8', 
                fontSize: '18px' 
              }} />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '44px',
                  paddingRight: '16px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  border: `2px solid ${BORDER}`,
                  borderRadius: '12px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = ED_TEAL}
                onBlur={(e) => e.target.style.borderColor = BORDER}
              />
            </div>
            {isInstructor && (
              <div style={{ minWidth: '180px' }}>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `2px solid ${BORDER}`,
                    borderRadius: '12px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all">All Status</option>
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            )}
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', color: ED_TEAL, fontSize: '16px', fontWeight: '600' }}>
              <svg style={{ animation: 'spin 1s linear infinite', marginRight: '12px', width: '20px', height: '20px' }} 
                   xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Loading courses...
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div 
            style={{ textAlign: 'center', padding: '48px 0' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '24px',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              <p style={{ color: '#dc2626', fontWeight: '600' }}>{error}</p>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCourses.length === 0 && (
          <motion.div 
            style={{ textAlign: 'center', padding: '48px 0' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '48px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
              border: `1px solid ${BORDER}`,
              maxWidth: '500px',
              margin: '0 auto'
            }}>
              <VscEdit style={{ fontSize: '64px', color: '#94a3b8', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: TEXT_DARK, marginBottom: '8px' }}>
                No courses found
              </h3>
              <p style={{ color: '#64748b', marginBottom: '24px', lineHeight: '1.5' }}>
                {courses.length === 0 
                  ? "You haven't created any courses yet. Start by creating your first course!"
                  : "No courses match your search criteria."
                }
              </p>
              {courses.length === 0 && isInstructor && (
                <button 
                  style={{
                    backgroundColor: ED_TEAL,
                    color: 'white',
                    padding: '12px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  onClick={() => navigate('/instructor/add-course')}
                >
                  Create Your First Course
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Courses Grid */}
        {!loading && !error && filteredCourses.length > 0 && (
          <motion.div 
            style={cardContainerStyle}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {filteredCourses.map((course, index) => (
              <motion.div 
                key={course._id}
                style={courseCardStyle}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -8, boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)' }}
                ref={ref}
              >
                {/* Price Tag */}
                <div style={priceTagStyle}>
                  ₹{course.price || '30'}
                </div>

                {/* Course Thumbnail */}
                <div style={{ position: 'relative' }}>
                  <img 
                    src={getCourseThumbnail(course)} 
                    alt={course.courseName}
                    style={thumbnailStyle}
                  />
                </div>
                
                {/* Course Content */}
                <div style={cardContentStyle}>
                  <div style={{ marginBottom: '16px' }}>
                    <h3 style={titleStyle}>
                      {course.courseName || 'Untitled Course'}
                    </h3>
                    
                    {/* <p style={descriptionStyle}>
                      {course.courseDescription || 'No description available'}
                    </p> */}
                  </div>
                  
                  <div style={statsRowStyle}>
                    <div style={statItemStyle}>
                      <FaFile style={{ color: ED_TEAL, fontSize: '14px' }} />
                      <span>Lesson {course.courseContent?.length || 0}</span>
                    </div>
                    <div style={statItemStyle}>
                      <FaUsers style={{ color: '#8b5cf6', fontSize: '14px' }} />
                      <span>Students {course.studentsEnrolled?.length || 1}</span>
                    </div>
                    <div style={statItemStyle}>
                      <FaEye style={{ color: '#f59e0b', fontSize: '14px' }} />
                      <span>View: 12K</span>
                    </div>
                  </div>
                  
                  <div style={instructorRowStyle}>
                    <div style={instructorInfoStyle}>
                      <img 
                        src={course.instructor?.image || "/assets/img/images/course-author-1.png"} 
                        alt={course.instructor?.firstName || "Instructor"}
                        style={avatarStyle}
                      />
                      <div>
                        <h4 style={{ fontSize: '14px', fontWeight: '600', color: TEXT_DARK, marginBottom: '2px' }}>
                          {course.instructor?.firstName || "poonam"}.jha
                        </h4>
                        <p style={{ fontSize: '12px', color: '#64748b' }}>Instructor</p>
                      </div>
                    </div>
                    
                    <div style={ratingStyle}>
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} style={{ color: '#fbbf24', fontSize: '14px' }} />
                      ))}
                      <span style={{ fontSize: '13px', color: '#64748b', marginLeft: '4px' }}>(4.7)</span>
                    </div>
                  </div>
                  
                  {/* Status Badge */}
                  {isInstructor && (
                    <div style={{ marginBottom: '16px' }}>
                      {getStatusBadge(course.status)}
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div style={actionButtonsStyle}>
                    {isInstructor ? (
                      <>
                        <button
                          onClick={() => navigate(`/courses/${course._id}`)}
                          style={secondaryButtonStyle}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#e2e8f0'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                          title="View Details"
                        >
                          <VscEye />
                        </button>
                        <button
                          onClick={() => handleEditCourse(course._id)}
                          style={primaryButtonStyle}
                          onMouseEnter={(e) => e.target.style.backgroundColor = ED_TEAL_DARK}
                          onMouseLeave={(e) => e.target.style.backgroundColor = ED_TEAL}
                          title="Edit Course"
                        >
                          <VscEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course._id)}
                          style={deleteButtonStyle}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#fecaca'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#fee2e2'}
                          title="Delete Course"
                        >
                          <VscTrash />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleViewCourse(course._id)}
                        style={{
                          ...primaryButtonStyle,
                          padding: '10px 20px',
                          fontSize: '14px'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = ED_TEAL_DARK}
                        onMouseLeave={(e) => e.target.style.backgroundColor = ED_TEAL}
                      >
                        View Details
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Results Summary */}
        {!loading && !error && filteredCourses.length > 0 && (
          <motion.div 
            style={{ 
              marginTop: '32px', 
              textAlign: 'center', 
              fontSize: '14px', 
              color: '#64748b',
              fontWeight: '500'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Showing {filteredCourses.length} of {courses.length} courses
          </motion.div>
        )}
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal modalData={confirmationModal} />
      
      {/* Add custom styles for animations */}
      <style>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @media (max-width: 768px) {
          .course-grid {
            grid-template-columns: 1fr !important;
          }
          
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)) !important;
          }
        }
        
        @media (max-width: 480px) {
          .course-card {
            margin: 0 -8px;
          }
          
          .course-card-content {
            padding: 16px !important;
          }
          
          .stats-card {
            padding: 16px !important;
          }
        }
        
        /* Hover effects */
        .course-card:hover .course-thumbnail {
          transform: scale(1.05);
        }
        
        .course-thumbnail {
          transition: transform 0.3s ease;
        }
        
        /* Focus states for accessibility */
        input:focus,
        select:focus,
        button:focus {
          outline: 2px solid ${ED_TEAL};
          outline-offset: 2px;
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${ED_TEAL};
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${ED_TEAL_DARK};
        }
        
        /* Responsive text sizes */
        @media (max-width: 640px) {
          .main-title {
            font-size: 24px !important;
          }
          
          .card-title {
            font-size: 18px !important;
          }
          
          .stat-value {
            font-size: 24px !important;
          }
        }
      `}</style>
    </div>
  );
}