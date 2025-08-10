// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useSelector } from 'react-redux';
// import ScreenshotProtection from '../components/common/ScreenshotProtection';
// import CourseVideoPlayer from '../components/core/CourseViewer/CourseVideoPlayer';
// import { apiConnector } from '../services/apiConnector';
// import { course as courseApi } from '../services/apis';
// import { toast } from 'react-hot-toast';

// const CourseViewer = () => {
//   const { courseId, sectionId, subsectionId } = useParams();
//   const navigate = useNavigate();
//   const { token } = useSelector((state) => state.auth);
//   const { user } = useSelector((state) => state.profile);
  
//   const [course, setCourse] = useState(null);
//   const [currentSection, setCurrentSection] = useState(null);
//   const [currentSubsection, setCurrentSubsection] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchCourseDetails();
//   }, [courseId]);

//   const fetchCourseDetails = async () => {
//     try {
//       setLoading(true);
//       const response = await apiConnector(
//         'POST',
//         courseApi.GET_FULL_COURSE_DETAILS_AUTHENTICATED,
//         { courseId },
//         { Authorization: `Bearer ${token}` }
//       );

//       if (response.data?.success) {
//         const courseData = response.data.data.courseDetails;
//         setCourse(courseData);
        
//         // Find current section and subsection
//         if (sectionId && subsectionId) {
//           const section = courseData.courseContent?.find(s => s._id === sectionId);
//           const subsection = section?.subSection?.find(ss => ss._id === subsectionId);
          
//           setCurrentSection(section);
//           setCurrentSubsection(subsection);
//         }
//       } else {
//         setError('Failed to load course details');
//       }
//     } catch (err) {
//       console.error('Error fetching course:', err);
//       setError('Failed to load course');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleVideoComplete = async () => {
//     try {
//       // Mark video as completed
//       const response = await apiConnector(
//         'POST',
//         courseApi.LECTURE_COMPLETION_API,
//         {
//           courseId,
//           subsectionId: currentSubsection._id
//         },
//         { Authorization: `Bearer ${token}` }
//       );

//       if (response.data?.success) {
//         toast.success('Video marked as completed!');
//       }
//     } catch (err) {
//       console.error('Error marking video complete:', err);
//     }
//   };

//   const handleVideoProgress = (currentTime, duration) => {
//     // Track progress if needed
//     console.log(`Progress: ${currentTime}/${duration}`);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="spinner"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
//           <p className="text-gray-600 mb-4">{error}</p>
//           <button 
//             onClick={() => navigate(-1)}
//             className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!course) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <h2 className="text-2xl font-semibold text-gray-600 mb-4">Course not found</h2>
//           <button 
//             onClick={() => navigate(-1)}
//             className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
//           >
//             Go Back
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <ScreenshotProtection enabled={true}>
//       <div className="min-h-screen bg-gray-50">
//         {/* Header */}
//         <div className="bg-white shadow-sm border-b">
//           <div className="max-w-7xl mx-auto px-4 py-4">
//             <div className="flex items-center justify-between">
//               <div>
//                 <h1 className="text-2xl font-bold text-gray-900">{course.courseName}</h1>
//                 <p className="text-gray-600 mt-1">Course Tutorial</p>
//               </div>
//               <button 
//                 onClick={() => navigate(-1)}
//                 className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
//               >
//                 Back to Course
//               </button>
//             </div>
//           </div>
//         </div>

//         <div className="max-w-7xl mx-auto px-4 py-8">
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             {/* Video Player */}
//             <div className="lg:col-span-2">
//               {currentSubsection ? (
//                 <CourseVideoPlayer
//                   courseId={courseId}
//                   subsectionId={currentSubsection._id}
//                   title={currentSubsection.title}
//                   description={currentSubsection.description}
//                   onComplete={handleVideoComplete}
//                   onProgress={handleVideoProgress}
//                   enableProtection={true}
//                 />
//               ) : (
//                 <div className="bg-white rounded-lg p-8 text-center">
//                   <p className="text-gray-600">Select a video to start learning</p>
//                 </div>
//               )}
//             </div>

//             {/* Course Content Sidebar */}
//             <div className="lg:col-span-1">
//               <div className="bg-white rounded-lg shadow-sm p-6">
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h3>
                
//                 {course.courseContent?.map((section, sectionIndex) => (
//                   <div key={section._id} className="mb-4">
//                     <h4 className="font-medium text-gray-800 mb-2">
//                       Section {sectionIndex + 1}: {section.sectionName}
//                     </h4>
                    
//                     <div className="space-y-1">
//                       {section.subSection?.map((subsection, subsectionIndex) => (
//                         <button
//                           key={subsection._id}
//                           onClick={() => {
//                             setCurrentSection(section);
//                             setCurrentSubsection(subsection);
//                             navigate(`/course/${courseId}/${section._id}/${subsection._id}`);
//                           }}
//                           className={`w-full text-left p-2 rounded text-sm transition-colors ${
//                             currentSubsection?._id === subsection._id
//                               ? 'bg-green-100 text-green-800 border border-green-200'
//                               : 'text-gray-600 hover:bg-gray-50'
//                           }`}
//                         >
//                           <div className="flex items-center">
//                             <span className="mr-2">
//                               {subsectionIndex + 1}.
//                             </span>
//                             <span className="truncate">{subsection.title}</span>
//                           </div>
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </ScreenshotProtection>
//   );
// };

// export default CourseViewer;



// import React from 'react';
// import { FaPhone, FaMapMarkerAlt, FaClock, FaUser, FaShoppingCart, FaHeart, FaBars, FaTimes, FaStar, FaLock, FaUnlock, FaShareAlt, FaEnvelope, FaFacebookF, FaInstagram, FaBehance, FaPinterest, FaYoutube } from 'react-icons/fa';

// import React, { useState } from 'react';
// import { FaPhone, FaMapMarkerAlt, FaClock, FaUser, FaShoppingCart, FaHeart, FaBars, FaTimes, FaStar, FaLock, FaUnlock, FaShareNodes, FaEnvelope, FaFacebookF, FaInstagram, FaBehance, FaPinterest, FaYoutube, FaBookmark, FaBook, FaUser as FaUserIcon, FaStar as FaStarIcon, FaShareAlt } from 'react-icons/fa';
// import pageHeaderShape1 from '../assets/img/shapes/page-header-shape-1.png';
// import pageHeaderShape2 from '../assets/img/shapes/page-header-shape-2.png';
// import pageHeaderShape3 from '../assets/img/shapes/page-header-shape-3.png';
// import pageHeaderBg from '../assets/img/bg-img/page-header-bg.png';
// import courseDetailsImg from '../assets/img/service/course-details-img.png';
// import '../../src/index.css'


// import { Link } from 'react-router-dom';
// import Footer from '../components/common/Footer';

// const EdCareReact = () => {

//     const [activeTab, setActiveTab] = useState('overview');
//   const [expandedAccordion, setExpandedAccordion] = useState('foundations');
//   const [isHovered, setIsHovered] = useState(false);

//   const toggleAccordion = (section) => {
//     setExpandedAccordion(expandedAccordion === section ? null : section);
//   };

//   return (
//     <div className="edcare-react " >
     
//       <section style={{ 
//         position: 'relative', 
//         padding: '120px 0', 
//         overflow: 'hidden',
//         borderBottom: '1px solid #e5e7eb',
//         marginTop:'4rem'
//       }}>
//         {/* Background Image */}
//         <div style={{ 
//           position: 'absolute', 
//           inset: 0, 
//           backgroundImage: `url(${pageHeaderBg})`,
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//           backgroundRepeat: 'no-repeat',
//           marginTop:'4rem'
//         }}></div>
        
//         {/* Dark Overlay */}
//         <div style={{ 
//           position: 'absolute', 
//           inset: 0, 
//           backgroundColor: 'black', 
//           opacity: 0.4 
//         }}></div>
        
//         {/* Background Shapes */}
//         <div style={{ position: 'absolute', inset: 0 }}>
//           <div style={{ 
//             position: 'absolute', 
//             top: '40px', 
//             left: '40px', 
//             opacity: 0.1 
//           }}>
//             <img src={pageHeaderShape1} alt="shape" style={{ width: '80px', height: '80px' }} />
//           </div>
//           <div style={{ 
//             position: 'absolute', 
//             top: '80px', 
//             right: '80px', 
//             opacity: 0.1 
//           }}>
//             <img src={pageHeaderShape2} alt="shape" style={{ width: '64px', height: '64px' }} />
//           </div>
//           <div style={{ 
//             position: 'absolute', 
//             bottom: '40px', 
//             left: '25%', 
//             opacity: 0.1 
//           }}>
//             <img src={pageHeaderShape3} alt="shape" style={{ width: '48px', height: '48px' }} />
//           </div>
//         </div>
        
//         {/* Content Container */}
//         <div style={{ 
//           position: 'relative', 
//           maxWidth: '1280px', 
//           margin: '0 auto', 
//           padding: '0 16px' 
//         }}>
//           <div style={{ 
//             display: 'flex',
//             flexDirection: 'column',
//             justifyContent: 'center',
//             minHeight: '220px',
//             gap: '16px'
//           }}>

//              {/* Main Title */}
//             <h1 style={{ 
//               fontSize: '48px', 
//               fontWeight: '800', 
//               color: 'white', 
//               margin: 0,
//               display: 'flex',
//               alignItems: 'center',
//               gap: '16px'
//             }}>
//               <span style={{ 
//                 display: 'inline-block',
//                 width: '4px',
//                 height: '40px',
//                 backgroundColor: '#07A698',
//                 borderRadius: '2px'
//               }}></span>
//               Course Details
//             </h1>
//             {/* Breadcrumb Navigation */}
//             <div style={{ 
//               display: 'flex', 
//               alignItems: 'center', 
//               gap: '8px', 
//               color: 'rgba(255,255,255,0.8)',
//               fontSize: '14px',
//               textTransform: 'uppercase',
//               letterSpacing: '1px'
//             }}>
//               <Link to="/" style={{ 
//                 color: 'rgba(255,255,255,0.8)', 
//                 textDecoration: 'none',
//                 transition: 'color 0.3s',
//                 ':hover': {
//                   color: 'white'
//                 }
//               }}>
//                 Home
//               </Link>
//               <span>/</span>
//               <Link to="/catalog" style={{ 
//                 color: 'rgba(255,255,255,0.8)', 
//                 textDecoration: 'none',
//                 transition: 'color 0.3s',
//                 ':hover': {
//                   color: 'white'
//                 }
//               }}>
//                 Course Details
//               </Link>
              
//             </div>
            
           
            
//             {/* Description */}
//             {/* <p style={{ 
//               maxWidth: '600px',
//               color: 'rgba(255,255,255,0.9)',
//               fontSize: '18px',
//               lineHeight: '1.6',
//               margin: 0
//             }}>
//               {catalogPageData?.data?.selectedCategory?.description}
//             </p> */}
//           </div>
//         </div>
//       </section>

//       <section className="course-details pt-120 pb-120" style={{
//         padding: '120px 0',
//         backgroundColor: '#ffffff'
//       }}>
//         <div className="container" style={{
//           maxWidth: '1400px',  // Increased from 1200px to 1400px
//           margin: '0 auto',
//           padding: '0 15px'
//         }}>
//           <div className="row" style={{
//             display: 'flex',
//             flexWrap: 'wrap',
//             margin: '0 -15px'
//           }}>
//             <div className="col-xl-9 col-lg-12" style={{
//               flex: '0 0 75%',
//               maxWidth: '75%',
//               padding: '0 15px'
//             }}>
//               <div className="course-details-content">
//                 {/* Course Image and Basic Info - Same as before */}
//                 <div className="course-details-img" style={{
//                   marginBottom: '30px',
//                   borderRadius: '10px',
//                   overflow: 'hidden'
//                 }}>
//                   <img src={courseDetailsImg }alt="course" style={{
//                     width: '100%',
//                     height: 'auto',
//                     display: 'block'
//                   }} />
//                 </div>
                
//                 <div className="details-inner" style={{
//                   marginBottom: '30px'
//                 }}>
//                   <ul className="details-meta" style={{
//                     display: 'flex',
//                     listStyle: 'none',
//                     margin: '0 0 15px 0',
//                     padding: 0,
//                     gap: '10px'
//                   }}>
//                     <li style={{
//                       backgroundColor: '#07A698',
//                       color: '#ffffff',
//                       padding: '5px 15px',
//                       borderRadius: '20px',
//                       fontSize: '14px'
//                     }}>Best Seller</li>
//                     <li style={{
//                       backgroundColor: '#FFD700',
//                       color: '#000000',
//                       padding: '5px 15px',
//                       borderRadius: '20px',
//                       fontSize: '14px'
//                     }}>Latest</li>
//                   </ul>
                  
//                   <h2 className="title" style={{
//                     fontSize: '36px',
//                     fontWeight: '700',
//                     marginBottom: '20px',
//                     lineHeight: '1.3'
//                   }}>User Experience Design Essentials - Adobe XD UI UX Design Course For Limited Time</h2>
                  
//                   <ul className="course-details-list" style={{
//                     display: 'flex',
//                     listStyle: 'none',
//                     margin: '0 0 30px 0',
//                     padding: 0,
//                     gap: '20px',
//                     flexWrap: 'wrap',
//                     alignItems: 'center',
//                     fontSize: '14px',
//                     color: '#666666'
//                   }}>
//                     <li style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
//                       <img src="assets/img/service/course-details-author.png" alt="author" style={{
//                         width: '30px',
//                         height: '30px',
//                         borderRadius: '50%'
//                       }} />
//                       <span style={{ fontWeight: '600' }}>Instructor:</span> Kevin Perry
//                     </li>
//                     <li style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
//                       <i className="fa-solid fa-tags"></i>Web Development
//                     </li>
//                     <li style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
//                       <i className="fa-light fa-calendar"></i>04 April, 2022
//                     </li>
//                     <li className="review-wrap" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
//                       <ul style={{
//                         display: 'flex',
//                         listStyle: 'none',
//                         margin: 0,
//                         padding: 0,
//                         gap: '2px'
//                       }}>
//                         {[...Array(5)].map((_, i) => (
//                           <li key={i}><FaStar style={{ color: '#FFD700', fontSize: '14px' }} /></li>
//                         ))}
//                       </ul>
//                       (4.88)
//                     </li>
//                   </ul>
//                 </div>
//                 {/* ... */}


//                 {/* Course Tabs */}
//                 <div className="course-details-tab" style={{
//                   border: '1px solid #e0e0e0',
//                   borderRadius: '10px',
//                   overflow: 'hidden'
//                 }}>
//                   <ul className="nav nav-tabs" style={{
//                     display: 'flex',
//                     listStyle: 'none',
//                     margin: 0,
//                     padding: 0,
//                     backgroundColor: '#f8f9fa',
//                     borderBottom: '1px solid #e0e0e0'
//                   }}>
//                     <li className="nav-item" style={{ flex: 1 }}>
//                       <button 
//                         onClick={() => setActiveTab('overview')}
//                         style={{
//                           width: '100%',
//                           padding: '15px',
//                           border: 'none',
//                           backgroundColor: activeTab === 'overview' ? '#ffffff' : 'transparent',
//                           cursor: 'pointer',
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                           gap: '5px',
//                           fontWeight: '600',
//                           color: activeTab === 'overview' ? '#07A698' : '#666666',
//                           borderBottom: activeTab === 'overview' ? '2px solid #07A698' : 'none'
//                         }}
//                       >
//                         <FaBookmark /> Overview
//                       </button>
//                     </li>
//                     <li className="nav-item" style={{ flex: 1 }}>
//                       <button 
//                         onClick={() => setActiveTab('curriculum')}
//                         style={{
//                           width: '100%',
//                           padding: '15px',
//                           border: 'none',
//                           backgroundColor: activeTab === 'curriculum' ? '#ffffff' : 'transparent',
//                           cursor: 'pointer',
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                           gap: '5px',
//                           fontWeight: '600',
//                           color: activeTab === 'curriculum' ? '#07A698' : '#666666',
//                           borderBottom: activeTab === 'curriculum' ? '2px solid #07A698' : 'none'
//                         }}
//                       >
//                         <FaBook /> Curriculum
//                       </button>
//                     </li>
//                     <li className="nav-item" style={{ flex: 1 }}>
//                       <button 
//                         onClick={() => setActiveTab('instructor')}
//                         style={{
//                           width: '100%',
//                           padding: '15px',
//                           border: 'none',
//                           backgroundColor: activeTab === 'instructor' ? '#ffffff' : 'transparent',
//                           cursor: 'pointer',
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                           gap: '5px',
//                           fontWeight: '600',
//                           color: activeTab === 'instructor' ? '#07A698' : '#666666',
//                           borderBottom: activeTab === 'instructor' ? '2px solid #07A698' : 'none'
//                         }}
//                       >
//                         <FaUserIcon /> Instructor
//                       </button>
//                     </li>
//                     <li className="nav-item" style={{ flex: 1 }}>
//                       <button 
//                         onClick={() => setActiveTab('reviews')}
//                         style={{
//                           width: '100%',
//                           padding: '15px',
//                           border: 'none',
//                           backgroundColor: activeTab === 'reviews' ? '#ffffff' : 'transparent',
//                           cursor: 'pointer',
//                           display: 'flex',
//                           alignItems: 'center',
//                           justifyContent: 'center',
//                           gap: '5px',
//                           fontWeight: '600',
//                           color: activeTab === 'reviews' ? '#07A698' : '#666666',
//                           borderBottom: activeTab === 'reviews' ? '2px solid #07A698' : 'none'
//                         }}
//                       >
//                         <FaStarIcon /> Reviews
//                       </button>
//                     </li>
//                   </ul>
                  
//                   <div className="tab-content" style={{ padding: '30px' }}>
//                     {/* Overview Tab */}
//                     {activeTab === 'overview' && (
//                       <div className="tab-overview">
//                         <h3 className="title" style={{
//                           fontSize: '24px',
//                           fontWeight: '700',
//                           marginBottom: '15px'
//                         }}>Description</h3>
//                         <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
//                           Rapidiously develop parallel e-markets via worldwide paradigms. Quickly synergize cutting-edge scenarios and professional results. Assertively deliver cross-media results before client-centric results. Uniquely initiate intuitive communities through process-centric internal or "organic" sources. Energistically reinvent distinctive value via parallel services.
//                         </p>
//                         <p style={{ marginBottom: '30px', lineHeight: '1.6' }}>
//                           Professionally expedite synergistic technology without out-of-the-box human capital. Enthusiastically coordinate state of the art leadership after professional manufactured products. Distinctively enhance future-proof e-services whereas functionalized partnerships. Quickly streamline focused paradigms via orthogonal "outside the box" thinking. Rapidiously administrate 2.0 total linkage for cross-platform channels.
//                         </p>
//                         <h3 className="title" style={{
//                           fontSize: '24px',
//                           fontWeight: '700',
//                           marginBottom: '15px'
//                         }}>What Will You Learn?</h3>
//                         <p style={{ marginBottom: 0, lineHeight: '1.6' }}>
//                           Quickly synergize cutting-edge scenarios and professional results. Assertively deliver cross-media results before client-centric results. Uniquely initiate intuitive communities through process-centric internal or "organic" sources. Energistically reinvent distinctive value via parallel services extensive paradigms cross-unit manufactured products.
//                         </p>
//                       </div>
//                     )}

//                     {/* Curriculum Tab */}
//                     {activeTab === 'curriculum' && (
//                       <div className="curriculam-area">
//                         <div className="accordion">
//                           {/* Foundations Accordion */}
//                           <div className="accordion-item" style={{
//                             border: '1px solid #e0e0e0',
//                             borderRadius: '5px',
//                             marginBottom: '15px',
//                             overflow: 'hidden'
//                           }}>
//                             <h2 className="accordion-header">
//                               <button 
//   onClick={() => toggleAccordion('foundations')}
//   style={{
//     width: '100%',
//     padding: '10px 15px',
//     border: '1px solid #e0e0e0',  // Added border for visibility
//     backgroundColor: expandedAccordion === 'foundations' ? '#f8f9fa' : '#ffffff',
//     color: '#333',  // Explicit text color
//     textAlign: 'left',
//     cursor: 'pointer',
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     fontWeight: '600',
//     fontSize: '20px',  // Increased font size for better readability
//     borderRadius: '4px',  // Added rounded corners
//     boxShadow: '0 2px 4px rgba(0,0,0,0.05)',  // Subtle shadow
//     transition: 'all 0.3s ease',  // Smooth transitions
//     ':hover': {
//       backgroundColor: '#f0f0f0'  // Hover state
//     }
//   }}
// >
//   Foundations of Fluent English Speaking
//   <span style={{
//     transform: expandedAccordion === 'foundations' ? 'rotate(180deg)' : 'rotate(0deg)',
//     transition: 'transform 0.3s ease',
//     color: '#07A698',  // Chevron color
//     fontSize: '14px'  // Chevron size
//   }}>
//     ▼
//   </span>
// </button>
//                             </h2>
//                             {expandedAccordion === 'foundations' && (
//                               <div className="accordion-body" style={{
//                                 padding: '0 20px 20px',
//                                 backgroundColor: 'white',
//                                  marginTop: '15px'
//                               }}>
//                                 <ul className="curri-list" style={{
//                                   listStyle: 'none',
//                                   margin: 0,
//                                   padding: 0
//                                 }}>
//                                   <li style={{
//                                     display: 'flex',
//                                     justifyContent: 'space-between',
//                                     padding: '10px 0',
//                                     borderBottom: '1px solid #e0e0e0'
//                                   }}>
//                                     <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                                       <span style={{ color: '#07A698' }}>▶</span> Mastering Pronunciation and Intonation
//                                     </span>
//                                     <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
//                                       54.23 <FaUnlock style={{ color: '#07A698' }} />
//                                     </span>
//                                   </li>
//                                   <li style={{
//                                     display: 'flex',
//                                     justifyContent: 'space-between',
//                                     padding: '10px 0',
//                                     borderBottom: '1px solid #e0e0e0'
//                                   }}>
//                                     <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                                       <span style={{ color: '#07A698' }}>▶</span> Building a Strong Vocabulary for Everyday Communication
//                                     </span>
//                                     <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
//                                       45.05 <FaUnlock style={{ color: '#07A698' }} />
//                                     </span>
//                                   </li>
//                                   <li style={{
//                                     display: 'flex',
//                                     justifyContent: 'space-between',
//                                     padding: '10px 0'
//                                   }}>
//                                     <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                                       <span style={{ color: '#666666' }}>📄</span> Understanding Basic Sentence Structure and Grammar
//                                     </span>
//                                     <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
//                                       1.6hr <FaLock style={{ color: '#666666' }} />
//                                     </span>
//                                   </li>
//                                 </ul>
//                               </div>
//                             )}
//                           </div>

//                           {/* User Research Accordion */}
//                           <div className="accordion-item" style={{
//                             border: '1px solid #e0e0e0',
//                             borderRadius: '5px',
//                             marginBottom: '15px',
//                             overflow: 'hidden'
//                           }}>
//                             <h2 className="accordion-header">
//                               <button 
//   onClick={() => toggleAccordion('research')}
//   style={{
//     width: '100%',
//     padding: '10px 15px',
//     border: '1px solid #e0e0e0',  // Added border for visibility
//     backgroundColor: expandedAccordion === 'research' ? '#f8f9fa' : '#ffffff',
//     color: '#333',  // Explicit text color
//     textAlign: 'left',
//     cursor: 'pointer',
//     display: 'flex',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     fontWeight: '600',
//     fontSize: '20px',  // Increased font size for better readability
//     borderRadius: '4px',  // Added rounded corners
//     boxShadow: '0 2px 4px rgba(0,0,0,0.05)',  // Subtle shadow
//     transition: 'all 0.3s ease',  // Smooth transitions
//     ':hover': {
//       backgroundColor: '#f0f0f0'  // Hover state
//     }
//   }}
// >
//   User Research Technique
//   <span style={{
//     transform: expandedAccordion === 'research'  ? 'rotate(180deg)' : 'rotate(0deg)',
//     transition: 'transform 0.3s ease',
//     color: '#07A698',  // Chevron color
//     fontSize: '14px'  // Chevron size
//   }}>
//     ▼
//   </span>
// </button>
//                             </h2>
//                             {expandedAccordion === 'research' && (
//                               <div className="accordion-body" style={{
//                                 padding: '0 20px 20px',
//                                 backgroundColor: 'white',
//                                 marginTop: '15px'
//                               }}>
//                                 <ul className="curri-list" style={{
//                                   listStyle: 'none',
//                                   margin: 0,
//                                   padding: 0
//                                 }}>
//                                   <li style={{
//                                     display: 'flex',
//                                     justifyContent: 'space-between',
//                                     padding: '10px 0',
//                                     borderBottom: '1px solid #e0e0e0'
//                                   }}>
//                                     <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                                       <span style={{ color: '#07A698' }}>▶</span> Mastering Pronunciation and Intonation
//                                     </span>
//                                     <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
//                                       54.23 <FaUnlock style={{ color: '#07A698' }} />
//                                     </span>
//                                   </li>
//                                   <li style={{
//                                     display: 'flex',
//                                     justifyContent: 'space-between',
//                                     padding: '10px 0',
//                                     borderBottom: '1px solid #e0e0e0'
//                                   }}>
//                                     <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                                       <span style={{ color: '#07A698' }}>▶</span> Building a Strong Vocabulary for Everyday Communication
//                                     </span>
//                                     <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
//                                       45.05 <FaUnlock style={{ color: '#07A698' }} />
//                                     </span>
//                                   </li>
//                                   <li style={{
//                                     display: 'flex',
//                                     justifyContent: 'space-between',
//                                     padding: '10px 0'
//                                   }}>
//                                     <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
//                                       <span style={{ color: '#666666' }}>📄</span> Understanding Basic Sentence Structure and Grammar
//                                     </span>
//                                     <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
//                                       1.6hr <FaLock style={{ color: '#666666' }} />
//                                     </span>
//                                   </li>
//                                 </ul>
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {/* Instructor Tab */}
//                     {activeTab === 'instructor' && (
//                       <div className="instructor-tab">
//                         <div className="row team-wrap-2 gy-lg-0 gy-4 justify-content-center" style={{
//                           display: 'flex',
//                           flexWrap: 'wrap',
//                           margin: '0 -15px'
//                         }}>
//                           {/* Instructor 1 */}
//                           <div className="col-lg-4 col-md-6" style={{
//                             flex: '0 0 33.333%',
//                             maxWidth: '33.333%',
//                             padding: '0 15px',
//                             marginBottom: '30px'
//                           }}>
//                             <div className="team-item-3 team-item-5" style={{
//                               backgroundColor: '#ffffff',
//                               borderRadius: '10px',
//                               overflow: 'hidden',
//                               boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
//                               textAlign: 'center'
//                             }}>
//                               <div className="team-thumb" style={{
//                                 position: 'relative',
//                                 padding: '20px'
//                               }}>
//                                 <div className="team-men">
//                                   <img src="assets/img/team/team-men-1.png" alt="team" style={{
//                                     width: '150px',
//                                     height: '150px',
//                                     borderRadius: '50%',
//                                     objectFit: 'cover',
//                                     border: '5px solid #f8f9fa'
//                                   }} />
//                                 </div>
//                               </div>
//                               <div className="team-content" style={{ padding: '20px' }}>
//                                 <h3 className="title" style={{
//                                   fontSize: '20px',
//                                   fontWeight: '700',
//                                   marginBottom: '5px'
//                                 }}>Mason D. Logan</h3>
//                                 <span style={{
//                                   display: 'block',
//                                   color: '#07A698',
//                                   marginBottom: '15px'
//                                 }}>IT Trainer</span>
//                                 <ul className="social-list" style={{
//                                   display: 'flex',
//                                   listStyle: 'none',
//                                   margin: 0,
//                                   padding: 0,
//                                   justifyContent: 'center',
//                                   gap: '10px'
//                                 }}>
//                                   <li><a href="#" style={{
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center',
//                                     width: '35px',
//                                     height: '35px',
//                                     backgroundColor: '#f8f9fa',
//                                     borderRadius: '50%',
//                                     color: '#07A698',
//                                     transition: 'all 0.3s ease'
//                                   }}><FaFacebookF /></a></li>
//                                   <li><a href="#" style={{
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center',
//                                     width: '35px',
//                                     height: '35px',
//                                     backgroundColor: '#f8f9fa',
//                                     borderRadius: '50%',
//                                     color: '#07A698',
//                                     transition: 'all 0.3s ease'
//                                   }}><FaInstagram /></a></li>
//                                   <li><a href="#" style={{
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center',
//                                     width: '35px',
//                                     height: '35px',
//                                     backgroundColor: '#f8f9fa',
//                                     borderRadius: '50%',
//                                     color: '#07A698',
//                                     transition: 'all 0.3s ease'
//                                   }}><FaBehance /></a></li>
//                                 </ul>
//                               </div>
//                             </div>
//                           </div>

//                           {/* Instructor 2 */}
//                           <div className="col-lg-4 col-md-6" style={{
//                             flex: '0 0 33.333%',
//                             maxWidth: '33.333%',
//                             padding: '0 15px',
//                             marginBottom: '30px'
//                           }}>
//                             <div className="team-item-3 team-item-5" style={{
//                               backgroundColor: '#ffffff',
//                               borderRadius: '10px',
//                               overflow: 'hidden',
//                               boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
//                               textAlign: 'center'
//                             }}>
//                               <div className="team-thumb" style={{
//                                 position: 'relative',
//                                 padding: '20px'
//                               }}>
//                                 <div className="team-men">
//                                   <img src="assets/img/team/team-men-2.png" alt="team" style={{
//                                     width: '150px',
//                                     height: '150px',
//                                     borderRadius: '50%',
//                                     objectFit: 'cover',
//                                     border: '5px solid #f8f9fa'
//                                   }} />
//                                 </div>
//                               </div>
//                               <div className="team-content" style={{ padding: '20px' }}>
//                                 <h3 className="title" style={{
//                                   fontSize: '20px',
//                                   fontWeight: '700',
//                                   marginBottom: '5px'
//                                 }}>Scarlett Hannah</h3>
//                                 <span style={{
//                                   display: 'block',
//                                   color: '#07A698',
//                                   marginBottom: '15px'
//                                 }}>IT Trainer</span>
//                                 <ul className="social-list" style={{
//                                   display: 'flex',
//                                   listStyle: 'none',
//                                   margin: 0,
//                                   padding: 0,
//                                   justifyContent: 'center',
//                                   gap: '10px'
//                                 }}>
//                                   <li><a href="#" style={{
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center',
//                                     width: '35px',
//                                     height: '35px',
//                                     backgroundColor: '#f8f9fa',
//                                     borderRadius: '50%',
//                                     color: '#07A698',
//                                     transition: 'all 0.3s ease'
//                                   }}><FaFacebookF /></a></li>
//                                   <li><a href="#" style={{
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center',
//                                     width: '35px',
//                                     height: '35px',
//                                     backgroundColor: '#f8f9fa',
//                                     borderRadius: '50%',
//                                     color: '#07A698',
//                                     transition: 'all 0.3s ease'
//                                   }}><FaInstagram /></a></li>
//                                   <li><a href="#" style={{
//                                     display: 'flex',
//                                     alignItems: 'center',
//                                     justifyContent: 'center',
//                                     width: '35px',
//                                     height: '35px',
//                                     backgroundColor: '#f8f9fa',
//                                     borderRadius: '50%',
//                                     color: '#07A698',
//                                     transition: 'all 0.3s ease'
//                                   }}><FaBehance /></a></li>
//                                 </ul>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}

//                     {/* Reviews Tab */}
//                     {activeTab === 'reviews' && (
//                       <div className="reviewr-wrap">
//                         <div className="review-list">
//                           {/* Review 1 */}
//                           <div className="review-item" style={{
//                             display: 'flex',
//                             gap: '20px',
//                             marginBottom: '30px',
//                             paddingBottom: '30px',
//                             borderBottom: '1px solid #e0e0e0'
//                           }}>
//                             <div className="review-thumb">
//                               <img src="assets/img/shop/review-list-1.jpg" alt="img" style={{
//                                 width: '70px',
//                                 height: '70px',
//                                 borderRadius: '50%',
//                                 objectFit: 'cover'
//                               }} />
//                             </div>
//                             <div className="content" style={{ flex: 1 }}>
//                               <div className="content-top" style={{
//                                 display: 'flex',
//                                 justifyContent: 'space-between',
//                                 alignItems: 'center',
//                                 marginBottom: '10px'
//                               }}>
//                                 <h4 className="name" style={{
//                                   margin: 0,
//                                   fontSize: '18px',
//                                   fontWeight: '600'
//                                 }}>
//                                   Eleanor Fant <span style={{
//                                     display: 'block',
//                                     fontSize: '14px',
//                                     color: '#666666',
//                                     fontWeight: 'normal'
//                                   }}>06 March, 2023</span>
//                                 </h4>
//                                 <ul className="review" style={{
//                                   display: 'flex',
//                                   listStyle: 'none',
//                                   margin: 0,
//                                   padding: 0,
//                                   gap: '5px'
//                                 }}>
//                                   {[...Array(5)].map((_, i) => (
//                                     <li key={i}><FaStar style={{ color: '#FFD700' }} /></li>
//                                   ))}
//                                 </ul>
//                               </div>
//                               <p style={{ margin: 0, lineHeight: '1.6' }}>
//                                 Mauris non dignissim purus, ac commodo diam. Donec sit amet lacinia nulla. Aliquam quis purus in justo pulvinar tempor.
//                               </p>
//                             </div>
//                           </div>

//                           {/* Review 2 */}
//                           <div className="review-item" style={{
//                             display: 'flex',
//                             gap: '20px'
//                           }}>
//                             <div className="review-thumb">
//                               <img src="assets/img/shop/review-list-2.jpg" alt="img" style={{
//                                 width: '70px',
//                                 height: '70px',
//                                 borderRadius: '50%',
//                                 objectFit: 'cover'
//                               }} />
//                             </div>
//                             <div className="content" style={{ flex: 1 }}>
//                               <div className="content-top" style={{
//                                 display: 'flex',
//                                 justifyContent: 'space-between',
//                                 alignItems: 'center',
//                                 marginBottom: '10px'
//                               }}>
//                                 <h4 className="name" style={{
//                                   margin: 0,
//                                   fontSize: '18px',
//                                   fontWeight: '600'
//                                 }}>
//                                   Haliey White <span style={{
//                                     display: 'block',
//                                     fontSize: '14px',
//                                     color: '#666666',
//                                     fontWeight: 'normal'
//                                   }}>06 March, 2023</span>
//                                 </h4>
//                                 <ul className="review" style={{
//                                   display: 'flex',
//                                   listStyle: 'none',
//                                   margin: 0,
//                                   padding: 0,
//                                   gap: '5px'
//                                 }}>
//                                   {[...Array(5)].map((_, i) => (
//                                     <li key={i}><FaStar style={{ color: '#FFD700' }} /></li>
//                                   ))}
//                                 </ul>
//                               </div>
//                               <p style={{ margin: 0, lineHeight: '1.6' }}>
//                                 Designed very similarly to the nearly double priced Galaxy tab S6, with the only removal being.Mauris non dignissim purus, ac commodo diam. Donec sit amet lacinia nulla. Aliquam quis purus in justo pulvinar tempor.
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Sidebar - Same as before */}
//             <div className="col-xl-3 col-lg-12" style={{
//               flex: '0 0 25%',
//               maxWidth: '25%',
//               padding: '0 15px'
//             }}>
//               <div className="course-sidebar price-box" style={{
//                 backgroundColor: '#ffffff',
//                 borderRadius: '10px',
//                 padding: '20px',
//                 marginBottom: '30px',
//                 boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
//                 border: '1px solid #e0e0e0'
//               }}>
//                 <h4 className="price" style={{
//                   fontSize: '36px',
//                   fontWeight: '700',
//                   color: '#07A698',
//                   marginBottom: '20px',
//                   display: 'flex',
//                   alignItems: 'center',
//                   gap: '10px'
//                 }}>
//                   $90.00 <span style={{
//                     fontSize: '16px',
//                     color: '#ffffff',
//                     backgroundColor: '#FF6B6B',
//                     padding: '3px 10px',
//                     borderRadius: '5px'
//                   }}>25% off</span>
//                 </h4>
//                 <a href="cart.html" className="ed-primary-btn" style={{
//                   display: 'block',
//                   textAlign: 'center',
//                   backgroundColor: '#07A698',
//                   color: '#ffffff',
//                   padding: '12px',
//                   borderRadius: '5px',
//                   textDecoration: 'none',
//                   fontWeight: '600',
//                   marginBottom: '10px',
//                   transition: 'all 0.3s ease',
//                   ':hover': {
//                     backgroundColor: '#059a8c'
//                   }
//                 }}>Add to Cart</a>
//                 <a href="cart.html" className=" buy-btn custom-buy-btn " style={{
//                   display: 'block',
//                   textAlign: 'center',
//                  backgroundColor: isHovered ? '#07A698' : 'white',
//                  color: isHovered ? '#ffffff' : '#07A698',
//                   padding: '12px',
//                   borderRadius: '5px',
//                   textDecoration: 'none',
//                   fontWeight: '600',
//                   border: '1px solid #07A698',
//                   transition: 'all 0.3s ease',
                  
//                 }}
//                 onMouseEnter={() => setIsHovered(true)}
//                 onMouseLeave={() => setIsHovered(false)}
//                 >Buy Now</a>
//               </div>
              
//               <div className="course-sidebar sticky-widget" style={{
//                 backgroundColor: '#ffffff',
//                 borderRadius: '10px',
//                 padding: '20px',
//                 boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
//                 border: '1px solid #e0e0e0'
//               }}>
//                 <h4 className="sidebar-title" style={{
//                   fontSize: '20px',
//                   fontWeight: '700',
//                   marginBottom: '20px',
//                   paddingBottom: '15px',
//                   borderBottom: '1px solid #e0e0e0'
//                 }}>Course Information</h4>
                
//                 <ul className="course-sidebar-list" style={{
//                   listStyle: 'none',
//                   margin: 0,
//                   padding: 0
//                 }}>
//                   <li style={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     padding: '10px 0',
//                     borderBottom: '1px solid #f0f0f0'
//                   }}>
//                     <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666666' }}>
//                       <i className="fa-solid fa-house-chimney"></i>Instructor:
//                     </span>
//                     <span style={{ fontWeight: '600' }}>Kevin Perry</span>
//                   </li>
//                   <li style={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     padding: '10px 0',
//                     borderBottom: '1px solid #f0f0f0'
//                   }}>
//                     <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666666' }}>
//                       <i className="fa-solid fa-book"></i>Lessons:
//                     </span>
//                     <span style={{ fontWeight: '600' }}>8</span>
//                   </li>
//                   <li style={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     padding: '10px 0',
//                     borderBottom: '1px solid #f0f0f0'
//                   }}>
//                     <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666666' }}>
//                       <i className="fa-solid fa-clock"></i>Duration:
//                     </span>
//                     <span style={{ fontWeight: '600' }}>15h 30m 36s</span>
//                   </li>
//                   <li style={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     padding: '10px 0',
//                     borderBottom: '1px solid #f0f0f0'
//                   }}>
//                     <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666666' }}>
//                       <i className="fa-solid fa-tag"></i>Course level:
//                     </span>
//                     <span style={{ fontWeight: '600' }}>Beginners</span>
//                   </li>
//                   <li style={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     padding: '10px 0',
//                     borderBottom: '1px solid #f0f0f0'
//                   }}>
//                     <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666666' }}>
//                       <i className="fa-solid fa-globe"></i>Language:
//                     </span>
//                     <span style={{ fontWeight: '600' }}>English</span>
//                   </li>
//                   <li style={{
//                     display: 'flex',
//                     justifyContent: 'space-between',
//                     padding: '10px 0'
//                   }}>
//                     <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666666' }}>
//                       <i className="fa-solid fa-puzzle-piece"></i>Quizzes:
//                     </span>
//                     <span style={{ fontWeight: '600' }}>04</span>
//                   </li>
//                 </ul>
                
//                 <div className="share-btn" style={{ marginTop: '20px' }}>
//                   <button className="ed-primary-btn" style={{
//                     width: '100%',
//                     backgroundColor: '#ffffff',
//                     color: '#07A698',
//                     padding: '12px',
//                     borderRadius: '5px',
//                     border: '1px solid #07A698',
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     gap: '10px',
//                     fontWeight: '600',
//                     cursor: 'pointer',
//                     transition: 'all 0.3s ease',
//                     ':hover': {
//                       backgroundColor: '#07A698',
//                       color: '#ffffff'
//                     }
//                   }}>
//                     <FaShareAlt /> Share This Course
//                   </button>
//                 </div>
//               </div>
//             </div>
//             {/* ... */}
//           </div>
//         </div>
//       </section>

//       <Footer/>

      
//     </div>
//   );
// };

// export default EdCareReact;






import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaStar, FaUnlock, FaLock, FaShareAlt } from 'react-icons/fa';
import pageHeaderShape1 from '../assets/img/shapes/page-header-shape-1.png';
import pageHeaderShape2 from '../assets/img/shapes/page-header-shape-2.png';
import pageHeaderShape3 from '../assets/img/shapes/page-header-shape-3.png';
import pageHeaderBg from '../assets/img/bg-img/page-header-bg.png';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { getFullDetailsOfCourse } from '../services/operations/courseDetailsAPI';
import { useNavigate } from 'react-router-dom';
import { apiConnector } from '../services/apiConnector';
import Footer from '../components/common/Footer';


const CourseDetails = () => {
  const { courseId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [courseData, setCourseData] = useState(null);

  const navigate = useNavigate();

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiConnector(
        "POST",
        "/api/v1/course/getFullCourseDetails",
        { courseId }
      );

      if (!response.data) {
        throw new Error("No response from server");
      }
      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch course");
      }

      const details = response.data.data?.courseDetails;
      if (!details) {
        throw new Error("Course not found");
      }

      setCourseData(response.data.data);
    } catch (err) {
      console.error("Fetch error:", err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [courseId]);

  // Loading state
  if (loading) {
    return <p>Loading course details...</p>;
  }

  // Error state
  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }

  // No course found
  if (!courseData?.courseDetails) {
    return <p>Course not found.</p>;
  }

  // Destructure course data
  const { courseDetails, completedVideos, totalDuration } = courseData;
  const { 
    courseName, 
    courseDescription, 
    whatYouWillLearn, 
    courseContent,
    instructor,
    thumbnail,
    status,
    category,
    createdAt,
    price,
    discountPrice,
    level,
    ratingAndReviews
  } = courseDetails;

  // Calculate total number of lectures
  const totalLectures = courseContent?.reduce((acc, section) => {
    return acc + (section.subSection?.length || 0);
  }, 0) || 0;

  // Instructor details with fallbacks
  const instructorName = `${instructor?.firstName || ''} ${instructor?.lastName || ''}`.trim() || 'Unknown Instructor';
  const instructorImage = instructor?.image || 'default-instructor.jpg';
  const instructorBio = instructor?.additionalDetails?.about || 'No bio available';

  const toggleAccordion = (sectionId) => {
    setExpandedAccordion(expandedAccordion === sectionId ? null : sectionId);
  };

  return (

    <div >
             <section className="course-details pt-100 pb-120" style={{
      padding: '60px 0',
      backgroundColor: '#ffffff'
    }}>

       <section style={{ 
        position: 'relative', 
        padding: '120px 0', 
        overflow: 'hidden',
        borderBottom: '1px solid #e5e7eb',
       
      }}>
        {/* Background Image */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundImage: `url(${pageHeaderBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          marginTop:'4rem'
        }}></div>
        
        {/* Dark Overlay */}
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundColor: 'black', 
          opacity: 0.4 
        }}></div>
        
        {/* Background Shapes */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <div style={{ 
            position: 'absolute', 
            top: '40px', 
            left: '40px', 
            opacity: 0.1 
          }}>
            <img src={pageHeaderShape1} alt="shape" style={{ width: '80px', height: '80px' }} />
          </div>
          <div style={{ 
            position: 'absolute', 
            top: '80px', 
            right: '80px', 
            opacity: 0.1 
          }}>
            <img src={pageHeaderShape2} alt="shape" style={{ width: '64px', height: '64px' }} />
          </div>
          <div style={{ 
            position: 'absolute', 
            bottom: '40px', 
            left: '25%', 
            opacity: 0.1 
          }}>
            <img src={pageHeaderShape3} alt="shape" style={{ width: '48px', height: '48px' }} />
          </div>
        </div>
        
        {/* Content Container */}
        <div style={{ 
          position: 'relative', 
          maxWidth: '1280px', 
          margin: '0 auto', 
          padding: '0 16px' 
        }}>
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '220px',
            gap: '16px'
          }}>

             {/* Main Title */}
            <h1 style={{ 
              fontSize: '48px', 
              fontWeight: '800', 
              color: 'white', 
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <span style={{ 
                display: 'inline-block',
                width: '4px',
                height: '40px',
                backgroundColor: '#07A698',
                borderRadius: '2px'
              }}></span>
              Course Details
            </h1>
            {/* Breadcrumb Navigation */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              color: 'rgba(255,255,255,0.8)',
              fontSize: '14px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              <Link to="/" style={{ 
                color: 'rgba(255,255,255,0.8)', 
                textDecoration: 'none',
                transition: 'color 0.3s',
                ':hover': {
                  color: 'white'
                }
              }}>
                Home
              </Link>
              <span>/</span>
              <Link to="/catalog" style={{ 
                color: 'rgba(255,255,255,0.8)', 
                textDecoration: 'none',
                transition: 'color 0.3s',
                ':hover': {
                  color: 'white'
                }
              }}>
                Course Details
              </Link>
              
            </div>
            
           
            
            {/* Description */}
            {/* <p style={{ 
              maxWidth: '600px',
              color: 'rgba(255,255,255,0.9)',
              fontSize: '18px',
              lineHeight: '1.6',
              margin: 0
            }}>
              {catalogPageData?.data?.selectedCategory?.description}
            </p> */}
          </div>
        </div>
      </section>
      <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 15px' , marginTop: '145px'}}>
       
    


        <div className="row" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
          {/* Main Content Column */}
          <div className="col-xl-9 col-lg-12" style={{ flex: '0 0 75%', maxWidth: '75%', padding: '0 15px' }}>
            <div className="course-details-content">
              {/* Course Image */}
              <div className="course-details-img" style={{
                marginBottom: "30px",
                borderRadius: "10px",
                overflow: "hidden",
              }}>
                <img
                  src={thumbnail || "default-course.jpg"}
                  alt={courseName || "Course"}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
              
              {/* Course Metadata */}
              <div className="details-inner" style={{ marginBottom: '30px' }}>
                <ul className="details-meta" style={{ display: 'flex', listStyle: 'none', margin: '0 0 15px 0', padding: 0, gap: '10px' }}>
                  {status === 'Published' && (
                    <li style={{
                      backgroundColor: '#07A698',
                      color: '#ffffff',
                      padding: '5px 15px',
                      borderRadius: '20px',
                      fontSize: '14px'
                    }}>
                      Best Seller
                    </li>
                  )}
                  {status === 'Draft' && (
                    <li style={{ backgroundColor: '#FFD700', color: '#000000', padding: '5px 15px', borderRadius: '20px', fontSize: '14px' }}>
                      New
                    </li>
                  )}
                </ul>
                
                <h2 className="title" style={{ fontSize: '36px', fontWeight: '700', marginBottom: '20px', lineHeight: '1.3' }}>
                  {courseName}
                </h2>
                
                <ul className="course-details-list" style={{ display: 'flex', listStyle: 'none', margin: '0 0 30px 0', padding: 0, gap: '20px', flexWrap: 'wrap', alignItems: 'center', fontSize: '14px', color: '#666666' }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <img 
                      src={instructorImage} 
                      alt="instructor" 
                      style={{ width: '30px', height: '30px', borderRadius: '50%' }} 
                    />
                    <span style={{ fontWeight: '600' }}>Instructor:</span> 
                    {instructorName}
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <i className="fa-solid fa-tags"></i>{category?.name || 'General'}
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <i className="fa-light fa-calendar"></i>
                    {new Date(createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </li>
                  <li className="review-wrap" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <li key={i}>
                          <FaStar
                            style={{
                              color: i < Math.floor(ratingAndReviews?.averageRating ?? 0)
                                ? '#FFD700'
                                : '#ccc',
                              fontSize: '14px'
                            }}
                          />
                        </li>
                      ))}
                    </ul>
                    ({ratingAndReviews?.averageRating?.toFixed(2) || '0.00'})
                  </li>
                </ul>
              </div>

              {/* Course Tabs */}
              <div className="course-details-tab" style={{ border: '1px solid #e0e0e0', borderBottom: 'none', overflow: 'hidden' }}>
                <ul className="nav nav-tabs" style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0, backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
                  <li className="nav-item" style={{ flex: 1 }}>
                    <button 
                      onClick={() => setActiveTab('overview')}
                      style={{
                        width: '100%',
                        padding: '15px',
                        border: 'none',
                        backgroundColor: activeTab === 'overview' ? '#ffffff' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        fontWeight: '600',
                        color: activeTab === 'overview' ? '#07A698' : '#666666',
                        borderBottom: activeTab === 'overview' ? '2px solid #07A698' : 'none'
                      }}
                    >
                      <i className="fa-solid fa-bookmark"></i> Overview
                    </button>
                  </li>
                  <li className="nav-item" style={{ flex: 1 }}>
                    <button 
                      onClick={() => setActiveTab('curriculum')}
                      style={{
                        width: '100%',
                        padding: '15px',
                        border: 'none',
                        backgroundColor: activeTab === 'curriculum' ? '#ffffff' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        fontWeight: '600',
                        color: activeTab === 'curriculum' ? '#07A698' : '#666666',
                        borderBottom: activeTab === 'curriculum' ? '2px solid #07A698' : 'none'
                      }}
                    >
                      <i className="fa-solid fa-book"></i> Curriculum
                    </button>
                  </li>
                  <li className="nav-item" style={{ flex: 1 }}>
                    <button 
                      onClick={() => setActiveTab('instructor')}
                      style={{
                        width: '100%',
                        padding: '15px',
                        border: 'none',
                        backgroundColor: activeTab === 'instructor' ? '#ffffff' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        fontWeight: '600',
                        color: activeTab === 'instructor' ? '#07A698' : '#666666',
                        borderBottom: activeTab === 'instructor' ? '2px solid #07A698' : 'none'
                      }}
                    >
                      <i className="fa-solid fa-user"></i> Instructor
                    </button>
                  </li>
                  <li className="nav-item" style={{ flex: 1 }}>
                    <button 
                      onClick={() => setActiveTab('reviews')}
                      style={{
                        width: '100%',
                        padding: '15px',
                        border: 'none',
                        backgroundColor: activeTab === 'reviews' ? '#ffffff' : 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        fontWeight: '600',
                        color: activeTab === 'reviews' ? '#07A698' : '#666666',
                        borderBottom: activeTab === 'reviews' ? '2px solid #07A698' : 'none'
                      }}
                    >
                      <i className="fa-solid fa-star"></i> Reviews
                    </button>
                  </li>
                </ul>
                
                <div className="tab-content" style={{ padding: '30px' }}>
                  {/* Overview Tab */}
                  {activeTab === 'overview' && (
                    <div className="tab-overview">
                      <h3 className="title" style={{ fontSize: '24px', fontWeight: '700', marginBottom: '15px' }}>Description</h3>
                      <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                        {courseDescription}
                      </p>
                      <h3 className="title" style={{ fontSize: '24px', fontWeight: '700', marginBottom: '15px' }}>What Will You Learn?</h3>
                      <p style={{ marginBottom: 0, lineHeight: '1.6' }}>
                        {whatYouWillLearn || 'No learning objectives specified.'}
                      </p>
                    </div>
                  )}

                  {/* Curriculum Tab */}
                  {/* {activeTab === 'curriculum' && (
                    <div className="curriculam-area">
                      <div className="accordion">
                        {courseContent?.map((section) => (
                          <div key={section._id} className="accordion-item" style={{
                            border: '1px solid #e0e0e0',
                            borderRadius: '5px',
                            marginBottom: '15px',
                            overflow: 'hidden'
                          }}>
                            <h2 className="accordion-header">
                              <button 
                                onClick={() => toggleAccordion(section._id)}
                                style={{
                                  width: '100%',
                                  padding: '15px',
                                  border: 'none',
                                  backgroundColor: expandedAccordion === section._id ? '#f8f9fa' : '#ffffff',
                                  color: '#333',
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  fontWeight: '600',
                                  fontSize: '18px'
                                }}
                              >
                                {section.sectionName}
                                <span style={{
                                  transform: expandedAccordion === section._id ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.3s ease',
                                  color: '#07A698',
                                  fontSize: '14px'
                                }}>
                                  ▼
                                </span>
                              </button>
                            </h2>
                            {expandedAccordion === section._id && (
                              <div className="accordion-body" style={{
                                padding: '0 20px 20px',
                                backgroundColor: 'white'
                              }}>
                                <ul className="curri-list" style={{
                                  listStyle: 'none',
                                  margin: 0,
                                  padding: 0
                                }}>
                                  {section.subSection?.map((subSection, subIndex) => (
                                    <li key={subSection._id} style={{
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      padding: '12px 0',
                                      borderBottom: '1px solid #e0e0e0'
                                    }}>
                                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                        {subIndex + 1}. {subSection.title}
                                      </span>
                                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {Math.floor(subSection.timeDuration / 60)}m {subSection.timeDuration % 60}s
                                        {completedVideos?.includes(subSection._id) ? (
                                          <FaUnlock style={{ color: '#07A698' }} />
                                        ) : (
                                          <FaLock style={{ color: '#666666' }} />
                                        )}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )} */}


                  {/* Curriculum Tab */}
{activeTab === 'curriculum' && (
  <div className="curriculam-area">
    <div className="accordion">
      {courseContent?.map((section) => (
        <div key={section._id} className="accordion-item" style={{
          border: '1px solid #e0e0e0',
          borderRadius: '5px',
          marginBottom: '15px',
          overflow: 'hidden'
        }}>
          <h2 className="accordion-header">
            <button 
              onClick={() => toggleAccordion(section._id)}
              style={{
                width: '100%',
                padding: '15px',
                border: 'none',
                backgroundColor: expandedAccordion === section._id ? '#f8f9fa' : '#ffffff',
                color: '#333',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: '600',
                fontSize: '18px'
              }}
            >
              {section.sectionName}
              <span style={{
                transform: expandedAccordion === section._id ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
                color: '#07A698',
                fontSize: '14px'
              }}>
                ▼
              </span>
            </button>
          </h2>
          {expandedAccordion === section._id && (
            <div className="accordion-body" style={{
              padding: '0 20px 20px',
              backgroundColor: 'white'
            }}>
              <ul className="curri-list" style={{
                listStyle: 'none',
                margin: 0,
                padding: 0
              }}>
                {section.subSection?.map((subSection, subIndex) => {
                  // Format the time duration
                  const durationInSeconds = subSection.timeDuration || 0;
                  const minutes = Math.floor(durationInSeconds / 60);
                  const seconds = Math.floor(durationInSeconds % 60);
                  const formattedTime = `${minutes}m ${seconds}s`;
                  
                  return (
                    <li key={subSection._id} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '12px 0',
                      borderBottom: '1px solid #e0e0e0'
                    }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {subIndex + 1}. {subSection.title}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        {formattedTime}
                        {completedVideos?.includes(subSection._id) ? (
                          <FaUnlock style={{ color: '#07A698' }} />
                        ) : (
                          <FaLock style={{ color: '#666666' }} />
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
)}

                  

{activeTab === 'instructor' && (
  <div className="instructor-tab">
    <section style={{ 
      padding: '40px 16px', 
      maxWidth: '1280px', 
      margin: '0 auto' 
    }}>
      <div className="row gy-lg-0 gy-4" style={{ 
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '30px',
        marginTop: '20px'
      }}>
        {/* Assuming instructors is an array of instructor objects */}
        {[courseDetails.instructor].concat(courseDetails.additionalInstructors || []).slice(0, 3).map((instructor, index) => {
          const fullName = `${instructor.firstName} ${instructor.lastName}`;
          const image = instructor.image || '/default-instructor.jpg';
          const bio = instructor.additionalDetails?.about || 'No bio available';
          
          return (
            <div key={index} style={{
              flex: '1',
              minWidth: '300px',
              maxWidth: '380px',
              marginBottom: '30px'
            }}>
              <div style={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                backgroundColor: '#fff',
                borderRadius: '12px',
                padding: '30px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s ease',
                ':hover': {
                  transform: 'translateY(-5px)'
                }
              }}>
                {/* Instructor Image */}
                <div style={{ 
                  width: '180px', 
                  height: '180px', 
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '4px solid #f8f9fa',
                  marginBottom: '20px',
                  position: 'relative'
                }}>
                  <img 
                    src={image}
                    alt={fullName}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      filter: 'grayscale(20%)',
                      transition: 'all 0.3s ease'
                    }}
                    onError={(e) => {
                      e.target.src = '/default-instructor.jpg';
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.filter = 'grayscale(0%)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.filter = 'grayscale(30%)';
                    }}
                  />
                </div>

                {/* Instructor Info */}
                <div style={{ 
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <h3 style={{ 
                    fontSize: '22px',
                    marginBottom: '8px',
                    color: '#222',
                    fontWeight: '600'
                  }}>
                    {fullName}
                  </h3>
                  
                  <span style={{ 
                    color: '#14b8a6',
                    fontSize: '15px',
                    fontWeight: '500',
                    display: 'block',
                    marginBottom: '15px'
                  }}>
                    {instructor.expertise || 'Expert Instructor'}
                  </span>
                  
                  <p style={{ 
                    color: '#666', 
                    fontSize: '15px', 
                    margin: '0 0 20px 0',
                    lineHeight: '1.6'
                  }}>
                    {bio.length > 120 ? `${bio.substring(0, 120)}...` : bio}
                  </p>
                  
                  {/* Social Links */}
                  <div style={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '12px',
                    width: '100%'
                  }}>
                    {['facebook', 'twitter', 'linkedin', 'github'].map((social) => (
                      <a 
                        key={social}
                        href={instructor.socialLinks?.[social] || '#'} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ 
                          width: '36px',
                          height: '36px',
                          backgroundColor: '#f8f9fa',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#14b8a6',
                          textDecoration: 'none',
                          transition: 'all 0.3s',
                          ':hover': {
                            backgroundColor: '#14b8a6',
                            color: 'white',
                            transform: 'translateY(-2px)'
                          }
                        }}
                      >
                        <i className={`fab fa-${social === 'github' ? 'github-alt' : social}`}></i>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  </div>
)}

                  {/* Reviews Tab */}
                  {activeTab === 'reviews' && (
                    <div className="reviewr-wrap">
                      <div className="review-list">
                        {ratingAndReviews?.length > 0 ? (
                          ratingAndReviews.map((review) => (
                            <div key={review._id} className="review-item" style={{
                              display: 'flex',
                              gap: '20px',
                              marginBottom: '30px',
                              paddingBottom: '30px',
                              borderBottom: '1px solid #e0e0e0'
                            }}>
                              <div className="review-thumb">
                                <img 
                                  src={review.user?.image || 'default-user.jpg'} 
                                  alt="reviewer" 
                                  style={{
                                    width: '70px',
                                    height: '70px',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                  }} 
                                />
                              </div>
                              <div className="content" style={{ flex: 1 }}>
                                <div className="content-top" style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '10px'
                                }}>
                                  <h4 className="name" style={{
                                    margin: 0,
                                    fontSize: '18px',
                                    fontWeight: '600'
                                  }}>
                                    {review.user?.firstName} {review.user?.lastName} <span style={{
                                      display: 'block',
                                      fontSize: '14px',
                                      color: '#666666',
                                      fontWeight: 'normal'
                                    }}>
                                      {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                  </h4>
                                  <ul className="review" style={{
                                    display: 'flex',
                                    listStyle: 'none',
                                    margin: 0,
                                    padding: 0,
                                    gap: '5px'
                                  }}>
                                    {[...Array(5)].map((_, i) => (
                                      <li key={i}>
                                        <FaStar style={{ color: i < review.rating ? '#FFD700' : '#ccc' }} />
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <p style={{ margin: 0, lineHeight: '1.6' }}>
                                  {review.review}
                                </p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p style={{ textAlign: 'center', color: '#666' }}>
                            No reviews yet. Be the first to review this course!
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-xl-3 col-lg-12" style={{
            flex: '0 0 25%',
            maxWidth: '25%',
            padding: '0 15px'
          }}>


               <div className="course-sidebar price-box" style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              padding: '20px',
              marginBottom: '30px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
              border: '1px solid #e0e0e0'
            }}>
              <h4 className="price" style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#07A698',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                ₹{price}
                {discountPrice && (
                  <span style={{
                    fontSize: '16px',
                    color: '#ffffff',
                    backgroundColor: '#FF6B6B',
                    padding: '3px 10px',
                    borderRadius: '5px'
                  }}>
                    {Math.round(((price - discountPrice) / price) * 100)}% off
                  </span>
                )}
              </h4>
              <a href="/cart" className="ed-primary-btn" style={{
                display: 'block',
                textAlign: 'center',
                backgroundColor: '#07A698',
                color: '#ffffff',
                padding: '12px',
                borderRadius: '5px',
                textDecoration: 'none',
                fontWeight: '600',
                marginBottom: '10px',
                transition: 'all 0.3s ease',
                ':hover': {
                  backgroundColor: '#059a8c'
                }
              }}>Add to Cart</a>
              <a href="/checkout" className="buy-btn custom-buy-btn" style={{
                display: 'block',
                textAlign: 'center',
                backgroundColor: isHovered ? '#07A698' : 'white',
                color: isHovered ? '#ffffff' : '#07A698',
                padding: '12px',
                borderRadius: '5px',
                textDecoration: 'none',
                fontWeight: '600',
                border: '1px solid #07A698',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              >Buy Now</a>
            </div>
            <div className="course-sidebar sticky-widget" style={{
              backgroundColor: '#ffffff',
              borderRadius: '10px',
              padding: '20px',
              boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
              border: '1px solid #e0e0e0'
            }}>
              <h4 className="sidebar-title" style={{
                fontSize: '20px',
                fontWeight: '700',
                marginBottom: '20px',
                paddingBottom: '15px',
                borderBottom: '1px solid #e0e0e0'
              }}>Course Information</h4>
              
              <ul className="course-sidebar-list" style={{
                listStyle: 'none',
                margin: 0,
                padding: 0
              }}>
                <li style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666666' }}>
                    <i className="fa-solid fa-user"></i>Instructor:
                  </span>
                  <span style={{ fontWeight: '600' }}>{instructorName}</span>
                </li>
                <li style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666666' }}>
                    <i className="fa-solid fa-book"></i>Lectures:
                  </span>
                  <span style={{ fontWeight: '600' }}>{totalLectures}</span>
                </li>
                <li style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666666' }}>
                    <i className="fa-solid fa-clock"></i>Duration:
                  </span>
                  <span style={{ fontWeight: '600' }}>{totalDuration || '0h 0m 0s'}</span>
                </li>
                <li style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666666' }}>
                    <i className="fa-solid fa-tag"></i>Course level:
                  </span>
                  <span style={{ fontWeight: '600' }}>{level || 'All Levels'}</span>
                </li>
                <li style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: '1px solid #f0f0f0'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666666' }}>
                    <i className="fa-solid fa-globe"></i>Language:
                  </span>
                  <span style={{ fontWeight: '600' }}>English</span>
                </li>
                <li style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px 0'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666666' }}>
                    <i className="fa-solid fa-puzzle-piece"></i>Category:
                  </span>
                  <span style={{ fontWeight: '600' }}>{category?.name || 'General'}</span>
                </li>
              </ul>
              
              {/* <div className="share-btn" style={{ marginTop: '20px' }}>
                <button className="ed-primary-btn" style={{
                  width: '100%',
                  backgroundColor: '#ffffff',
                  color: '#07A698',
                  padding: '12px',
                  borderRadius: '5px',
                  border: '1px solid #07A698',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  ':hover': {
                    backgroundColor: '#07A698',
                    color: '#ffffff'
                  }
                }}>
                  <FaShareAlt /> Share This Course
                </button>
              </div> */}
            </div>
            
            
            
          </div>
        </div>
      </div>
    </section>

    <Footer/>
    </div>
    
  );
};

export default CourseDetails;