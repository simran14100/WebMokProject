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



import React from 'react';
import { FaPhone, FaMapMarkerAlt, FaClock, FaUser, FaShoppingCart, FaHeart, FaBars, FaTimes, FaStar, FaLock, FaUnlock, FaShareAlt, FaEnvelope, FaFacebookF, FaInstagram, FaBehance, FaPinterest, FaYoutube } from 'react-icons/fa';
import pageHeaderShape1 from '../assets/img/shapes/page-header-shape-1.png';
import pageHeaderShape2 from '../assets/img/shapes/page-header-shape-2.png';
import pageHeaderShape3 from '../assets/img/shapes/page-header-shape-3.png';
import pageHeaderBg from '../assets/img/bg-img/page-header-bg.png';
import { Link } from 'react-router-dom';

const EdCareReact = () => {
  return (
    <div className="edcare-react">
     

      <section style={{ 
        position: 'relative', 
        padding: '120px 0', 
        overflow: 'hidden',
        borderBottom: '1px solid #e5e7eb',
        marginTop:'4rem'
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

      {/* Course Details Section */}
      <section className="course-details pt-120 pb-120" style={{
        padding: '120px 0',
        backgroundColor: '#ffffff'
      }}>
        <div className="container" style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 15px'
        }}>
          <div className="row" style={{
            display: 'flex',
            flexWrap: 'wrap',
            margin: '0 -15px'
          }}>
            <div className="col-xl-9 col-lg-12" style={{
              flex: '0 0 75%',
              maxWidth: '75%',
              padding: '0 15px'
            }}>
              <div className="course-details-content">
                <div className="course-details-img" style={{
                  marginBottom: '30px',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <img src="assets/img/service/course-details-img.png" alt="course" style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block'
                  }} />
                </div>
                
                <div className="details-inner" style={{
                  marginBottom: '30px'
                }}>
                  <ul className="details-meta" style={{
                    display: 'flex',
                    listStyle: 'none',
                    margin: '0 0 15px 0',
                    padding: 0,
                    gap: '10px'
                  }}>
                    <li style={{
                      backgroundColor: '#07A698',
                      color: '#ffffff',
                      padding: '5px 15px',
                      borderRadius: '20px',
                      fontSize: '14px'
                    }}>Best Seller</li>
                    <li style={{
                      backgroundColor: '#FFD700',
                      color: '#000000',
                      padding: '5px 15px',
                      borderRadius: '20px',
                      fontSize: '14px'
                    }}>Latest</li>
                  </ul>
                  
                  <h2 className="title" style={{
                    fontSize: '36px',
                    fontWeight: '700',
                    marginBottom: '20px',
                    lineHeight: '1.3'
                  }}>User Experience Design Essentials - Adobe XD UI UX Design Course For Limited Time</h2>
                  
                  <ul className="course-details-list" style={{
                    display: 'flex',
                    listStyle: 'none',
                    margin: '0 0 30px 0',
                    padding: 0,
                    gap: '20px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    fontSize: '14px',
                    color: '#666666'
                  }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <img src="assets/img/service/course-details-author.png" alt="author" style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%'
                      }} />
                      <span style={{ fontWeight: '600' }}>Instructor:</span> Kevin Perry
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <i className="fa-solid fa-tags"></i>Web Development
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <i className="fa-light fa-calendar"></i>04 April, 2022
                    </li>
                    <li className="review-wrap" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <ul style={{
                        display: 'flex',
                        listStyle: 'none',
                        margin: 0,
                        padding: 0,
                        gap: '2px'
                      }}>
                        {[...Array(5)].map((_, i) => (
                          <li key={i}><FaStar style={{ color: '#FFD700', fontSize: '14px' }} /></li>
                        ))}
                      </ul>
                      (4.88)
                    </li>
                  </ul>
                </div>
                
                {/* Course Tabs */}
                <div className="course-details-tab" style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <ul className="nav nav-tabs" style={{
                    display: 'flex',
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    <li className="nav-item" style={{ flex: 1 }}>
                      <button className="nav-link active" style={{
                        width: '100%',
                        padding: '15px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        fontWeight: '600',
                        color: '#07A698',
                        borderBottom: '2px solid #07A698'
                      }}>
                        <i className="fa-sharp fa-regular fa-bookmark"></i>Overview
                      </button>
                    </li>
                    <li className="nav-item" style={{ flex: 1 }}>
                      <button className="nav-link" style={{
                        width: '100%',
                        padding: '15px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        fontWeight: '600',
                        color: '#666666'
                      }}>
                        <i className="fa-regular fa-book"></i>Curriculum
                      </button>
                    </li>
                    <li className="nav-item" style={{ flex: 1 }}>
                      <button className="nav-link" style={{
                        width: '100%',
                        padding: '15px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        fontWeight: '600',
                        color: '#666666'
                      }}>
                        <i className="fa-regular fa-user"></i>Instructor
                      </button>
                    </li>
                    <li className="nav-item" style={{ flex: 1 }}>
                      <button className="nav-link" style={{
                        width: '100%',
                        padding: '15px',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '5px',
                        fontWeight: '600',
                        color: '#666666'
                      }}>
                        <i className="fa-regular fa-star"></i>Reviews
                      </button>
                    </li>
                  </ul>
                  
                  <div className="tab-content" style={{ padding: '30px' }}>
                    <div className="tab-pane fade show active">
                      <div className="tab-overview">
                        <h3 className="title" style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          marginBottom: '15px'
                        }}>Description</h3>
                        <p style={{ marginBottom: '20px', lineHeight: '1.6' }}>
                          Rapidiously develop parallel e-markets via worldwide paradigms. Quickly synergize cutting-edge scenarios and professional results. Assertively deliver cross-media results before client-centric results. Uniquely initiate intuitive communities through process-centric internal or "organic" sources. Energistically reinvent distinctive value via parallel services.
                        </p>
                        <p style={{ marginBottom: '30px', lineHeight: '1.6' }}>
                          Professionally expedite synergistic technology without out-of-the-box human capital. Enthusiastically coordinate state of the art leadership after professional manufactured products. Distinctively enhance future-proof e-services whereas functionalized partnerships. Quickly streamline focused paradigms via orthogonal "outside the box" thinking. Rapidiously administrate 2.0 total linkage for cross-platform channels.
                        </p>
                        <h3 className="title" style={{
                          fontSize: '24px',
                          fontWeight: '700',
                          marginBottom: '15px'
                        }}>What Will You Learn?</h3>
                        <p style={{ marginBottom: 0, lineHeight: '1.6' }}>
                          Quickly synergize cutting-edge scenarios and professional results. Assertively deliver cross-media results before client-centric results. Uniquely initiate intuitive communities through process-centric internal or "organic" sources. Energistically reinvent distinctive value via parallel services extensive paradigms cross-unit manufactured products.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
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
                  $90.00 <span style={{
                    fontSize: '16px',
                    color: '#ffffff',
                    backgroundColor: '#FF6B6B',
                    padding: '3px 10px',
                    borderRadius: '5px'
                  }}>25% off</span>
                </h4>
                <a href="cart.html" className="ed-primary-btn" style={{
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
                <a href="cart.html" className="ed-primary-btn buy-btn" style={{
                  display: 'block',
                  textAlign: 'center',
                  backgroundColor: '#ffffff',
                  color: '#07A698',
                  padding: '12px',
                  borderRadius: '5px',
                  textDecoration: 'none',
                  fontWeight: '600',
                  border: '1px solid #07A698',
                  transition: 'all 0.3s ease',
                  ':hover': {
                    backgroundColor: '#07A698',
                    color: '#ffffff'
                  }
                }}>Buy Now</a>
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
                      <i className="fa-regular fa-house-chimney"></i>Instructor:
                    </span>
                    <span style={{ fontWeight: '600' }}>Kevin Perry</span>
                  </li>
                  <li style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666666' }}>
                      <i className="fa-regular fa-book"></i>Lessons:
                    </span>
                    <span style={{ fontWeight: '600' }}>8</span>
                  </li>
                  <li style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666666' }}>
                      <i className="fa-regular fa-clock"></i>Duration:
                    </span>
                    <span style={{ fontWeight: '600' }}>15h 30m 36s</span>
                  </li>
                  <li style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666666' }}>
                      <i className="fa-regular fa-tag"></i>Course level:
                    </span>
                    <span style={{ fontWeight: '600' }}>Beginners</span>
                  </li>
                  <li style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: '1px solid #f0f0f0'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666666' }}>
                      <i className="fa-regular fa-globe"></i>Language:
                    </span>
                    <span style={{ fontWeight: '600' }}>English</span>
                  </li>
                  <li style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '10px 0'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#666666' }}>
                      <i className="fa-regular fa-puzzle-piece"></i>Quizzes:
                    </span>
                    <span style={{ fontWeight: '600' }}>04</span>
                  </li>
                </ul>
                
                <div className="share-btn" style={{ marginTop: '20px' }}>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="footer-section pt-120" style={{
        padding: '120px 0 0',
        backgroundColor: '#191A1F',
        color: '#ffffff',
        position: 'relative',
        backgroundImage: 'url(assets/img/bg-img/footer-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}>
        <div className="footer-top-wrap" style={{
          paddingBottom: '80px'
        }}>
          <div className="container" style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 15px'
          }}>
            <div className="footer-top text-center" style={{
              marginBottom: '80px'
            }}>
              <h2 className="title" style={{
                fontSize: '36px',
                fontWeight: '700',
                marginBottom: '20px',
                lineHeight: '1.3'
              }}>Subscribe Our Newsletter For <br />Latest Updates</h2>
              
              <div className="footer-form-wrap" style={{
                maxWidth: '600px',
                margin: '0 auto'
              }}>
                <form className="footer-form" style={{
                  display: 'flex',
                  gap: '10px'
                }}>
                  <div className="form-item" style={{
                    flex: 1,
                    position: 'relative'
                  }}>
                    <input type="text" id="email-2" name="email" className="form-control" placeholder="Enter Your E-mail" style={{
                      width: '100%',
                      padding: '15px 20px',
                      borderRadius: '5px',
                      border: 'none',
                      outline: 'none'
                    }} />
                    <div className="icon" style={{
                      position: 'absolute',
                      right: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#666666'
                    }}>
                      <FaEnvelope />
                    </div>
                  </div>
                  <button className="ed-primary-btn" style={{
                    backgroundColor: '#07A698',
                    color: '#ffffff',
                    padding: '0 30px',
                    borderRadius: '5px',
                    border: 'none',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    ':hover': {
                      backgroundColor: '#059a8c'
                    }
                  }}>Subscribe Now</button>
                </form>
              </div>
            </div>
            
            <div className="row footer-wrap" style={{
              display: 'flex',
              flexWrap: 'wrap',
              margin: 0
            }}>
              <div className="col-lg-3 col-md-6" style={{
                flex: '0 0 25%',
                maxWidth: '25%',
                padding: '0 15px'
              }}>
                <div className="footer-widget">
                  <h3 className="widget-header" style={{
                    fontSize: '20px',
                    fontWeight: '700',
                    marginBottom: '25px',
                    position: 'relative',
                    paddingBottom: '15px'
                  }}>
                    Get in touch!
                    <span style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      width: '50px',
                      height: '2px',
                      backgroundColor: '#07A698'
                    }}></span>
                  </h3>
                  
                  <p style={{
                    marginBottom: '30px',
                    lineHeight: '1.6'
                  }}>Fusce varius, dolor tempor interdum tristiquei bibendum.</p>
                  
                  <div className="footer-contact" style={{
                    marginBottom: '30px'
                  }}>
                    <span className="number" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '10px'
                    }}>
                      <FaPhone />
                      <a href="tel:702123-1478" style={{
                        color: '#ffffff',
                        textDecoration: 'none'
                      }}>(702) 123-1478</a>
                    </span>
                    <a href="mailto:info@company.com" className="mail" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: '#ffffff',
                      textDecoration: 'none'
                    }}>
                      <FaEnvelope /> info@company.com
                    </a>
                  </div>
                  
                  <ul className="footer-social" style={{
                    display: 'flex',
                    listStyle: 'none',
                    margin: 0,
                    padding: 0,
                    gap: '15px'
                  }}>
                    <li><a href="#" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '35px',
                      height: '35px',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      color: '#ffffff',
                      transition: 'all 0.3s ease',
                      ':hover': {
                        backgroundColor: '#07A698'
                      }
                    }}><FaFacebookF /></a></li>
                    <li><a href="#" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '35px',
                      height: '35px',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      color: '#ffffff',
                      transition: 'all 0.3s ease',
                      ':hover': {
                        backgroundColor: '#07A698'
                      }
                    }}><FaInstagram /></a></li>
                    <li><a href="#" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '35px',
                      height: '35px',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      color: '#ffffff',
                      transition: 'all 0.3s ease',
                      ':hover': {
                        backgroundColor: '#07A698'
                      }
                    }}><FaBehance /></a></li>
                    <li><a href="#" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '35px',
                      height: '35px',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      color: '#ffffff',
                      transition: 'all 0.3s ease',
                      ':hover': {
                        backgroundColor: '#07A698'
                      }
                    }}><FaPinterest /></a></li>
                    <li><a href="#" style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '35px',
                      height: '35px',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '50%',
                      color: '#ffffff',
                      transition: 'all 0.3s ease',
                      ':hover': {
                        backgroundColor: '#07A698'
                      }
                    }}><FaYoutube /></a></li>
                  </ul>
                </div>
              </div>
              
              {/* Other footer columns would go here */}
              {/* ... */}
              
            </div>
          </div>
        </div>
        
        <div className="copyright-area" style={{
          backgroundColor: '#000000',
          padding: '20px 0'
        }}>
          <div className="container" style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 15px'
          }}>
            <div className="copyright-content" style={{
              textAlign: 'center',
              color: '#ffffff',
              fontSize: '14px'
            }}>
              <p>Copyright © 2025 EdCare. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EdCareReact;