// // import React, { useState, useEffect } from 'react';
// // import { useSelector } from 'react-redux';
// // import { useNavigate } from 'react-router-dom';
// // import { showError } from '../utils/toast';
// // import { apiConnector } from '../services/apiConnector';
// // import { profile } from '../services/apis';
// // import { VscPlay, VscBook, VscCalendar, VscPerson } from 'react-icons/vsc';
// // import DashboardLayout from '../components/common/DashboardLayout';

// // const { GET_ENROLLED_COURSES_API } = profile;

// // export default function ActiveCourses() {
// //   const [enrolledCourses, setEnrolledCourses] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const { token } = useSelector((state) => state.auth);
// //   const { user } = useSelector((state) => state.profile);
// //   const navigate = useNavigate();

// //   useEffect(() => {
// //     const fetchEnrolledCourses = async () => {
// //       try {
// //         setLoading(true);
// //         const response = await apiConnector(
// //           "GET",
// //           GET_ENROLLED_COURSES_API,
// //           null,
// //           {
// //             Authorization: `Bearer ${token}`,
// //           }
// //         );

// //         console.log("Enrolled courses response:", response);
        
// //         if (response.data.success) {
// //           setEnrolledCourses(response.data.data);
// //         } else {
// //           console.error("Failed to fetch enrolled courses:", response.data.message);
// //           showError("Failed to fetch enrolled courses");
// //         }
// //       } catch (error) {
// //         console.error("Error fetching enrolled courses:", error);
// //         if (error.response?.status === 401) {
// //           showError("Please login to view your courses");
// //         } else {
// //           showError("Failed to load enrolled courses");
// //         }
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     if (token) {
// //       fetchEnrolledCourses();
// //     } else {
// //       setLoading(false);
// //     }
// //   }, [token]);

// //   const handleCourseClick = (courseId) => {
// //     navigate(`/course/${courseId}/0/0`);
// //   };

// //   if (!token) {
// //     return (
// //       <DashboardLayout>
// //         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
// //           <div style={{ textAlign: 'center' }}>
// //             <VscBook style={{ width: '64px', height: '64px', color: '#666', margin: '0 auto 1rem' }} />
// //             <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#191A1F', marginBottom: '1rem' }}>Active Courses</h1>
// //             <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '1.5rem' }}>Please login to view your enrolled courses.</p>
// //             <button
// //               onClick={() => navigate('/login')}
// //               style={{
// //                 background: '#07A698',
// //                 color: 'white',
// //                 fontWeight: '600',
// //                 padding: '12px 24px',
// //                 borderRadius: '8px',
// //                 border: 'none',
// //                 cursor: 'pointer',
// //                 transition: 'background 0.2s'
// //               }}
// //               onMouseOver={(e) => e.target.style.background = '#059a8c'}
// //               onMouseOut={(e) => e.target.style.background = '#07A698'}
// //             >
// //               Login
// //             </button>
// //           </div>
// //         </div>
// //       </DashboardLayout>
// //     );
// //   }

// //   if (loading) {
// //     return (
// //       <DashboardLayout>
// //         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
// //           <div style={{ textAlign: 'center' }}>
// //             <div className="spinner" style={{ margin: '0 auto 1rem' }}></div>
// //             <p style={{ color: '#666' }}>Loading your courses...</p>
// //           </div>
// //         </div>
// //       </DashboardLayout>
// //     );
// //   }

// //   if (enrolledCourses.length === 0) {
// //     return (
// //       <DashboardLayout>
// //         <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)' }}>
// //           <div style={{ textAlign: 'center' }}>
// //             <VscBook style={{ width: '64px', height: '64px', color: '#666', margin: '0 auto 1rem' }} />
// //             <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#191A1F', marginBottom: '1rem' }}>Active Courses</h1>
// //             <p style={{ fontSize: '1.125rem', color: '#666', marginBottom: '1.5rem' }}>You have no active courses at the moment.</p>
// //             <button
// //               onClick={() => navigate('/catalog/all')}
// //               style={{
// //                 background: '#07A698',
// //                 color: 'white',
// //                 fontWeight: '600',
// //                 padding: '12px 24px',
// //                 borderRadius: '8px',
// //                 border: 'none',
// //                 cursor: 'pointer',
// //                 transition: 'background 0.2s'
// //               }}
// //               onMouseOver={(e) => e.target.style.background = '#059a8c'}
// //               onMouseOut={(e) => e.target.style.background = '#07A698'}
// //             >
// //               Browse Courses
// //             </button>
// //           </div>
// //         </div>
// //       </DashboardLayout>
// //     );
// //   }

// //   return (
// //     <DashboardLayout>
// //       <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
// //         <div style={{ marginBottom: '2rem' }}>
// //           <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#191A1F', marginBottom: '0.5rem' }}>Active Courses</h1>
// //           <p style={{ color: '#666' }}>Continue learning from where you left off</p>
// //         </div>

// //         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// //           {enrolledCourses.map((course) => (
// //             <div
// //               key={course._id}
// //               className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
// //               onClick={() => handleCourseClick(course._id)}
// //             >
// //               {/* Course Thumbnail */}
// //               <div className="relative">
// //                 <img
// //                   src={course.thumbnail || 'https://via.placeholder.com/400x250?text=Course+Image'}
// //                   alt={course.courseName}
// //                   className="w-full h-48 object-cover"
// //                 />
// //                 <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
// //                   <VscPlay className="w-12 h-12 text-white" />
// //                 </div>
// //               </div>

// //               {/* Course Content */}
// //               <div className="p-6">
// //                 <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
// //                   {course.courseName}
// //                 </h3>
// //                 <p className="text-gray-600 text-sm mb-4 line-clamp-3">
// //                   {course.courseDescription}
// //                 </p>

// //                 {/* Course Metadata */}
// //                 <div className="space-y-2 mb-4">
// //                   <div className="flex items-center text-sm text-gray-500">
// //                     <VscPerson className="w-4 h-4 mr-2" />
// //                     <span>{course.instructor?.firstName} {course.instructor?.lastName}</span>
// //                   </div>
// //                   <div className="flex items-center text-sm text-gray-500">
// //                     <VscCalendar className="w-4 h-4 mr-2" />
// //                     <span>{course.durationInSeconds ? `${Math.round(course.durationInSeconds / 60)} minutes` : 'Duration not available'}</span>
// //                   </div>
// //                 </div>

// //                 {/* Progress Bar */}
// //                 <div className="mb-4">
// //                   <div className="flex justify-between text-sm text-gray-600 mb-1">
// //                     <span>Progress</span>
// //                     <span>{course.progressPercentage || 0}%</span>
// //                   </div>
// //                   <div className="w-full bg-gray-200 rounded-full h-2">
// //                     <div
// //                       className="h-2 rounded-full transition-all duration-300"
// //                       style={{ 
// //                         width: `${course.progressPercentage || 0}%`,
// //                         backgroundColor: '#07A698'
// //                       }}
// //                     ></div>
// //                   </div>
// //                 </div>

// //                 {/* Continue Button */}
// //                 <button 
// //                   className="w-full text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
// //                   style={{
// //                     backgroundColor: '#07A698'
// //                   }}
// //                   onMouseOver={(e) => e.target.style.backgroundColor = '#059a8c'}
// //                   onMouseOut={(e) => e.target.style.backgroundColor = '#07A698'}
// //                 >
// //                   <VscPlay className="w-4 h-4 mr-2" />
// //                   Continue Learning
// //                 </button>
// //               </div>
// //             </div>
// //           ))}
// //         </div>
// //       </div>
// //     </DashboardLayout>
// //   );
// // } 

// import React, { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { showError } from '../utils/toast';
// import { apiConnector } from '../services/apiConnector';
// import { profile } from '../services/apis';
// import { VscPlay, VscBook, VscCalendar, VscPerson, VscEye } from 'react-icons/vsc';
// import DashboardLayout from '../components/common/DashboardLayout';

// const { GET_ENROLLED_COURSES_API } = profile;

// const ED_TEAL = '#07A698';
// const ED_TEAL_DARK = '#059a8c';
// const BORDER = '#e0e0e0';
// const TEXT_DARK = '#191A1F';
// // Inline SVG data-URIs to avoid external placeholder network errors
// const COURSE_PLACEHOLDER =
//   'data:image/svg+xml;utf8,' +
//   encodeURIComponent(
//     `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#6b7280">Course Image</text></svg>`
//   );
// const AVATAR_PLACEHOLDER =
//   'data:image/svg+xml;utf8,' +
//   encodeURIComponent(
//     `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="100%" height="100%" rx="20" ry="20" fill="#e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#6b7280">I</text></svg>`
//   );

// export default function ActiveCourses() {
//   const [enrolledCourses, setEnrolledCourses] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const { token } = useSelector((state) => state.auth);
//   const { user } = useSelector((state) => state.profile);
//   const navigate = useNavigate();

//   // Format duration like: 1m 26s, 52s, 1h 45m
//   const formatDuration = (seconds) => {
//     if (!seconds || isNaN(seconds)) return '—';
//     const s = Math.floor(seconds % 60);
//     const m = Math.floor((seconds / 60) % 60);
//     const h = Math.floor(seconds / 3600);
//     if (h > 0) return `${h}h ${m}m`;
//     if (m > 0) return `${m}m ${s}s`;
//     return `${s}s`;
//   };

//   useEffect(() => {
//     const fetchEnrolledCourses = async () => {
//       try {
//         setLoading(true);
//         const response = await apiConnector(
//           "GET",
//           GET_ENROLLED_COURSES_API,
//           null,
//           {
//             Authorization: `Bearer ${token}`,
//           }
//         );

//         console.log("Enrolled courses response:", response);
        
//         if (response.data.success) {
//           setEnrolledCourses(response.data.data);
//         } else {
//           console.error("Failed to fetch enrolled courses:", response.data.message);
//           showError("Failed to fetch enrolled courses");
//         }
//       } catch (error) {
//         console.error("Error fetching enrolled courses:", error);
//         if (error.response?.status === 401) {
//           showError("Please login to view your courses");
//         } else {
//           showError("Failed to load enrolled courses");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (token) {
//       fetchEnrolledCourses();
//     } else {
//       setLoading(false);
//     }
//   }, [token]);

//   const handleCourseClick = (courseId) => {
//     // Go to ViewCourse route; it will redirect to the first valid lecture if needed
//     navigate(`/viewcourse/${courseId}`);
//   };

//   if (!token) {
//     return (
//       <DashboardLayout>
//         <div style={{ 
//           display: 'flex', 
//           justifyContent: 'center', 
//           alignItems: 'center', 
//           minHeight: 'calc(100vh - 80px)',
//           padding: '20px' 
//         }}>
//           <div style={{ textAlign: 'center', maxWidth: '400px' }}>
//             <VscBook style={{ 
//               width: '64px', 
//               height: '64px', 
//               color: '#666', 
//               margin: '0 auto 1rem' 
//             }} />
//             <h1 style={{ 
//               fontSize: '2rem', 
//               fontWeight: 'bold', 
//               color: TEXT_DARK, 
//               marginBottom: '1rem' 
//             }}>
//               Active Courses
//             </h1>
//             <p style={{ 
//               fontSize: '1.125rem', 
//               color: '#666', 
//               marginBottom: '1.5rem' 
//             }}>
//               Please login to view your enrolled courses.
//             </p>
//             <button
//               onClick={() => navigate('/login')}
//               style={{
//                 background: ED_TEAL,
//                 color: 'white',
//                 fontWeight: '600',
//                 padding: '12px 24px',
//                 borderRadius: '8px',
//                 border: 'none',
//                 cursor: 'pointer',
//                 transition: 'all 0.3s ease',
//                 fontSize: '16px'
//               }}
//               onMouseOver={(e) => {
//                 e.target.style.background = ED_TEAL_DARK;
//                 e.target.style.transform = 'translateY(-2px)';
//                 e.target.style.boxShadow = '0 4px 12px rgba(7, 166, 152, 0.3)';
//               }}
//               onMouseOut={(e) => {
//                 e.target.style.background = ED_TEAL;
//                 e.target.style.transform = 'translateY(0)';
//                 e.target.style.boxShadow = 'none';
//               }}
//             >
//               Login
//             </button>
//           </div>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   if (loading) {
//     return (
//       <DashboardLayout>
//         <div style={{ 
//           display: 'flex', 
//           justifyContent: 'center', 
//           alignItems: 'center', 
//           minHeight: 'calc(100vh - 80px)' 
//         }}>
//           <div style={{ textAlign: 'center' }}>
//             <div 
//               style={{ 
//                 width: '40px',
//                 height: '40px',
//                 border: `4px solid ${BORDER}`,
//                 borderTop: `4px solid ${ED_TEAL}`,
//                 borderRadius: '50%',
//                 animation: 'spin 1s linear infinite',
//                 margin: '0 auto 1rem'
//               }}
//             ></div>
//             <p style={{ color: '#666', fontSize: '16px' }}>Loading your courses...</p>
//           </div>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   if (enrolledCourses.length === 0) {
//     return (
//       <DashboardLayout>
//         <div style={{ 
//           display: 'flex', 
//           justifyContent: 'center', 
//           alignItems: 'center', 
//           minHeight: 'calc(100vh - 80px)',
//           padding: '20px' 
//         }}>
//           <div style={{ textAlign: 'center', maxWidth: '400px' }}>
//             <VscBook style={{ 
//               width: '64px', 
//               height: '64px', 
//               color: '#666', 
//               margin: '0 auto 1rem' 
//             }} />
//             <h1 style={{ 
//               fontSize: '2rem', 
//               fontWeight: 'bold', 
//               color: TEXT_DARK, 
//               marginBottom: '1rem' 
//             }}>
//               Active Courses
//             </h1>
//             <p style={{ 
//               fontSize: '1.125rem', 
//               color: '#666', 
//               marginBottom: '1.5rem' 
//             }}>
//               You have no active courses at the moment.
//             </p>
//             <button
//               onClick={() => navigate('/catalog/all')}
//               style={{
//                 background: ED_TEAL,
//                 color: 'white',
//                 fontWeight: '600',
//                 padding: '12px 24px',
//                 borderRadius: '8px',
//                 border: 'none',
//                 cursor: 'pointer',
//                 transition: 'all 0.3s ease',
//                 fontSize: '16px'
//               }}
//               onMouseOver={(e) => {
//                 e.target.style.background = ED_TEAL_DARK;
//                 e.target.style.transform = 'translateY(-2px)';
//                 e.target.style.boxShadow = '0 4px 12px rgba(7, 166, 152, 0.3)';
//               }}
//               onMouseOut={(e) => {
//                 e.target.style.background = ED_TEAL;
//                 e.target.style.transform = 'translateY(0)';
//                 e.target.style.boxShadow = 'none';
//               }}
//             >
//               Browse Courses
//             </button>
//           </div>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
//         <div style={{ marginBottom: '24px' }}>
//           <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: TEXT_DARK, marginBottom: '0.5rem' }}>
//             Enrolled Courses
//           </h1>
//         </div>

//         <div style={{
//           backgroundColor: '#0f172a',
//           borderRadius: '10px',
//           padding: '12px',
//           overflowX: 'auto'
//         }}>
//           <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
//             <thead>
//               <tr style={{ backgroundColor: '#374151', color: 'white' }}>
//                 <th style={{ textAlign: 'left', padding: '12px 16px', borderTopLeftRadius: '8px' }}>Course Name</th>
//                 <th style={{ textAlign: 'left', padding: '12px 16px' }}>Duration</th>
//                 <th style={{ textAlign: 'left', padding: '12px 16px', borderTopRightRadius: '8px' }}>Progress</th>
//               </tr>
//             </thead>
//             <tbody>
//               {enrolledCourses.map((course, idx) => {
//                 const progress = Math.min(100, Math.max(0, course.progressPercentage || 0));
//                 return (
//                   <tr 
//                     key={course._id}
//                     onClick={() => handleCourseClick(course._id)}
//                     style={{ 
//                       cursor: 'pointer',
//                       backgroundColor: idx % 2 === 0 ? '#0b1220' : '#0a1020',
//                       borderBottom: '1px solid #1f2937'
//                     }}
//                     onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#111827'}
//                     onMouseOut={(e) => e.currentTarget.style.backgroundColor = (idx % 2 === 0 ? '#0b1220' : '#0a1020')}
//                   >
//                     {/* Course Name + thumbnail */}
//                     <td style={{ padding: '16px' }}>
//                       <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'white' }}>
//                         <img 
//                           src={course.thumbnail || COURSE_PLACEHOLDER}
//                           alt={course.courseName}
//                           style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #334155' }}
//                           onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = COURSE_PLACEHOLDER; }}
//                         />
//                         <div>
//                           <div style={{ fontWeight: 700, fontSize: '16px' }}>{course.courseName}</div>
//                           <div style={{ fontSize: '12px', color: '#94a3b8' }}>{course.instructor?.firstName || ''} {course.instructor?.lastName || ''}</div>
//                         </div>
//                       </div>
//                     </td>

//                     {/* Duration */}
//                     <td style={{ padding: '16px', color: 'white' }}>
//                       {formatDuration(course.durationInSeconds)}
//                     </td>

//                     {/* Progress */}
//                     <td style={{ padding: '16px', color: 'white', minWidth: '240px' }}>
//                       <div style={{ marginBottom: '8px' }}>Progress: {progress}%</div>
//                       <div style={{ width: '100%', height: '8px', backgroundColor: '#d1d5db', borderRadius: '9999px' }}>
//                         <div style={{ width: `${progress}%`, height: '100%', backgroundColor: '#7c3aed', borderRadius: '9999px', transition: 'width 0.3s ease' }}></div>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       <style jsx>{`
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
        
//         @media (max-width: 768px) {
//           .course-grid {
//             grid-template-columns: 1fr !important;
//             gap: 20px !important;
//           }
//         }
        
//         @media (max-width: 480px) {
//           .course-grid {
//             gap: 16px !important;
//           }
//         }
//       `}</style>
//     </DashboardLayout>
//   );
// }

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { showError } from '../utils/toast';
import { apiConnector } from '../services/apiConnector';
import { profile } from '../services/apis';
import { VscPlay, VscBook, VscCalendar, VscPerson, VscEye, VscChevronRight } from 'react-icons/vsc';
import DashboardLayout from '../components/common/DashboardLayout';

const { GET_ENROLLED_COURSES_API } = profile;

const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const ED_TEAL_LIGHT = '#e6f7f5';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';
const TEXT_LIGHT = '#666666';
const BG_LIGHT = '#f8fafc';

const COURSE_PLACEHOLDER =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="100%" height="100%" fill="#e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#6b7280">Course Image</text></svg>`
  );

export default function ActiveCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const navigate = useNavigate();

  // Format duration like: 1m 26s, 52s, 1h 45m
  const formatDuration = (seconds) => {
    if (!seconds || isNaN(seconds)) return '—';
    const s = Math.floor(seconds % 60);
    const m = Math.floor((seconds / 60) % 60);
    const h = Math.floor(seconds / 3600);
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      try {
        setLoading(true);
        
        // Using native fetch API
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL || 'http://localhost:4000'}/api/v1/profile/getEnrolledCourses`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            credentials: 'include',
          }
        );

        const data = await response.json();
        console.log("Enrolled courses response:", data);
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch enrolled courses');
        }
        
        if (data.success) {
          setEnrolledCourses(Array.isArray(data.data) ? data.data : []);
        } else {
          throw new Error(data.message || 'No courses found');
        }
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
        
        let errorMessage = "Failed to load enrolled courses. ";
        
        // Handle fetch API errors
        if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          errorMessage = "Unable to connect to the server. Please check your internet connection.";
        } 
        // Handle JSON parsing errors
        else if (error.name === 'SyntaxError') {
          errorMessage = "Error processing server response. Please try again later.";
          console.error('JSON Parse Error:', error);
        }
        // Handle our custom errors
        else if (error.message) {
          errorMessage = error.message;
        }
        
        showError(errorMessage);
        setEnrolledCourses([]); // Reset to empty array on error
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
    navigate(`/viewcourse/${courseId}`);
  };

  if (!token) {
    return (
      <DashboardLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 'calc(100vh - 80px)',
          padding: '20px',
          backgroundColor: BG_LIGHT
        }}>
          <div style={{ 
            textAlign: 'center', 
            maxWidth: '400px',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <VscBook style={{ 
              width: '64px', 
              height: '64px', 
              color: ED_TEAL, 
              margin: '0 auto 1rem' 
            }} />
            <h1 style={{ 
              fontSize: '1.75rem', 
              fontWeight: '700', 
              color: TEXT_DARK, 
              marginBottom: '1rem' 
            }}>
              Active Courses
            </h1>
            <p style={{ 
              fontSize: '1rem', 
              color: TEXT_LIGHT, 
              marginBottom: '1.5rem',
              lineHeight: '1.5'
            }}>
              Please login to view your enrolled courses.
            </p>
            <button
              onClick={() => navigate('/login')}
              style={{
                background: ED_TEAL,
                color: 'white',
                fontWeight: '600',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '16px',
                boxShadow: '0 4px 6px rgba(7, 166, 152, 0.2)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = ED_TEAL_DARK;
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 12px rgba(7, 166, 152, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = ED_TEAL;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px rgba(7, 166, 152, 0.2)';
              }}
            >
              Login to Continue
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 'calc(100vh - 80px)',
          backgroundColor: BG_LIGHT
        }}>
          <div style={{ 
            textAlign: 'center',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <div 
              style={{ 
                width: '40px',
                height: '40px',
                border: `4px solid ${ED_TEAL_LIGHT}`,
                borderTop: `4px solid ${ED_TEAL}`,
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem'
              }}
            ></div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: TEXT_DARK, 
              marginBottom: '0.5rem' 
            }}>
              Loading Your Courses
            </h2>
            <p style={{ color: TEXT_LIGHT, fontSize: '16px' }}>We're preparing your learning journey...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <DashboardLayout>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 'calc(100vh - 80px)',
          padding: '20px',
          backgroundColor: BG_LIGHT
        }}>
          <div style={{ 
            textAlign: 'center', 
            maxWidth: '400px',
            padding: '40px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <VscBook style={{ 
              width: '64px', 
              height: '64px', 
              color: ED_TEAL, 
              margin: '0 auto 1rem' 
            }} />
            <h1 style={{ 
              fontSize: '1.75rem', 
              fontWeight: '700', 
              color: TEXT_DARK, 
              marginBottom: '1rem' 
            }}>
              No Courses Yet
            </h1>
            <p style={{ 
              fontSize: '1rem', 
              color: TEXT_LIGHT, 
              marginBottom: '1.5rem',
              lineHeight: '1.5'
            }}>
              You haven't enrolled in any courses yet. Explore our catalog to start learning.
            </p>
            <button
              onClick={() => navigate('/catalog/all')}
              style={{
                background: ED_TEAL,
                color: 'white',
                fontWeight: '600',
                padding: '12px 24px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                fontSize: '16px',
                boxShadow: '0 4px 6px rgba(7, 166, 152, 0.2)'
              }}
              onMouseOver={(e) => {
                e.target.style.background = ED_TEAL_DARK;
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 12px rgba(7, 166, 152, 0.3)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = ED_TEAL;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 6px rgba(7, 166, 152, 0.2)';
              }}
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
      <div style={{ 
        // maxWidth: '1200px', 
        width: '80%',
        marginLeft: '100px', 
        padding: '10px',
        minHeight: 'calc(100vh - 80px)',
        backgroundColor: BG_LIGHT
      }}>
        <div style={{ 
          marginBottom: '24px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }}>
          <h1 style={{ 
            fontSize: '1.75rem', 
            fontWeight: '700', 
            color: TEXT_DARK, 
            marginBottom: '0.5rem' 
          }}>
            My Learning
          </h1>
          <p style={{ 
            color: TEXT_LIGHT,
            fontSize: '1rem'
          }}>
            Continue your learning journey from where you left off
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          marginBottom: '24px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 24px',
            backgroundColor: ED_TEAL_LIGHT,
            borderBottom: `1px solid ${BORDER}`
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: TEXT_DARK,
              margin: 0
            }}>
              Enrolled Courses ({enrolledCourses.length})
            </h2>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: ED_TEAL,
              fontSize: '14px',
              fontWeight: '500'
            }}>
              <span>Sorted by: Recent</span>
              <VscChevronRight style={{ marginLeft: '4px' }} />
            </div>
          </div>

          <div style={{ padding: '0' }}>
            {enrolledCourses.map((course, idx) => {
              const progress = Math.min(100, Math.max(0, course.progressPercentage || 0));
              return (
                <div 
                  key={course._id}
                  onClick={() => handleCourseClick(course._id)}
                  style={{ 
                    display: 'flex',
                    padding: '20px 24px',
                    borderBottom: idx < enrolledCourses.length - 1 ? `1px solid ${BORDER}` : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    backgroundColor: 'white'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = ED_TEAL_LIGHT;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  {/* Course thumbnail */}
                  <div style={{ 
                    width: '160px', 
                    height: '90px', 
                    borderRadius: '8px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    marginRight: '20px',
                    position: 'relative'
                  }}>
                    <img 
                      src={course.thumbnail || COURSE_PLACEHOLDER}
                      alt={course.courseName}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = COURSE_PLACEHOLDER; }}
                    />
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s ease'
                    }}>
                      <VscPlay style={{ color: 'white', width: '24px', height: '24px' }} />
                    </div>
                  </div>

                  {/* Course details */}
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: TEXT_DARK, 
                      margin: '0 0 8px 0',
                      lineHeight: '1.4'
                    }}>
                      {course.courseName}
                    </h3>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      marginBottom: '12px',
                      fontSize: '14px',
                      color: TEXT_LIGHT
                    }}>
                      <VscPerson style={{ marginRight: '6px' }} />
                      <span style={{ marginRight: '16px' }}>
                        {course.instructor?.firstName || 'Instructor'} {course.instructor?.lastName || ''}
                      </span>
                      <VscCalendar style={{ marginRight: '6px' }} />
                      <span>{formatDuration(course.durationInSeconds)}</span>
                    </div>

                    {/* Progress bar */}
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        fontSize: '14px',
                        color: TEXT_LIGHT,
                        marginBottom: '6px'
                      }}>
                        <span>Your progress</span>
                        <span style={{ fontWeight: '600', color: ED_TEAL }}>{progress}% Complete</span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '8px', 
                        backgroundColor: ED_TEAL_LIGHT, 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${progress}%`, 
                          height: '100%', 
                          backgroundColor: ED_TEAL, 
                          borderRadius: '4px',
                          transition: 'width 0.5s ease'
                        }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Continue button */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    paddingLeft: '20px'
                  }}>
                    <button style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: ED_TEAL,
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '10px 16px',
                      fontSize: '14px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      whiteSpace: 'nowrap'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = ED_TEAL_DARK;
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = ED_TEAL;
                    }}
                    >
                      <VscPlay style={{ marginRight: '6px' }} />
                      Continue
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 768px) {
          .course-item {
            flex-direction: column !important;
          }
          
          .course-thumbnail {
            width: 100% !important;
            height: 160px !important;
            margin-right: 0 !important;
            margin-bottom: 16px;
          }
          
          .continue-button {
            width: 100%;
            margin-top: 16px;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}