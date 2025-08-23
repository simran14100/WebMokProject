


// import React, { useEffect, useMemo } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useLocation, useNavigate, useParams } from "react-router-dom";

// import VideoDetails from "../components/core/ViewCourse/VideoDetails";
// import VideoDetailsSidebar from "../components/core/ViewCourse/VideoDetailsSidebar";
// import {
//   setCourseSectionData,
//   setEntireCourseData,
//   setTotalNoOfLectures,
//   setCompletedLectures,
// } from "../store/slices/viewCourseSlice";
// import { getFullDetailsOfCourse } from "../services/operations/courseDetailsAPI";

// // Professional color constants
// const ED_TEAL = '#07A698';
// const ED_TEAL_DARK = '#059a8c';
// const ED_TEAL_LIGHT = '#e8f6f5';
// const BORDER = '#e0e0e0';
// const TEXT_DARK = '#191A1F';
// const TEXT_LIGHT = '#6b7280';
// const BG_LIGHT = '#f8fafc';
// const WHITE = '#ffffff';
// const SHADOW_SM = '0 2px 4px rgba(0, 0, 0, 0.06)';
// const SHADOW_MD = '0 4px 12px rgba(0, 0, 0, 0.08)';
// const SHADOW_LG = '0 8px 24px rgba(0, 0, 0, 0.12)';

// const ViewCourse = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { token } = useSelector((state) => state.auth);
//   const { courseId, sectionId, subsectionId } = useParams();

//   const { courseSectionData } = useSelector((state) => state.viewCourse || { courseSectionData: [] });

//   // Helper to compute total lectures
//   const computeTotalLectures = (sections) => {
//     if (!Array.isArray(sections)) return 0;
//     return sections.reduce((acc, sec) => acc + (sec?.subSection?.length || 0), 0);
//   };

//   // Fetch course details and populate viewCourse slice
//   useEffect(() => {
//     (async () => {
//       // Require auth
//       if (!token) {
//         navigate("/login", { replace: true, state: { from: location.pathname } });
//         return;
//       }
//       if (!courseId) return;

//       const res = await getFullDetailsOfCourse(courseId, token);
//       if (!res?.success) return; // Toasts handled inside API util

//       const data = res.data;
//       // Attempt to support multiple possible response shapes
//       const courseDetails = data?.courseDetails || data?.course;
//       const sections = courseDetails?.courseContent || [];
//       const completed = data?.completedVideos || data?.completedLectures || [];

//       dispatch(setCourseSectionData(sections));
//       dispatch(setEntireCourseData(courseDetails || {}));
//       dispatch(setTotalNoOfLectures(computeTotalLectures(sections)));
//       dispatch(setCompletedLectures(completed));

//       // If URL doesn't include a lecture, redirect to the first one (stay under /viewcourse)
//       if (!sectionId || !subsectionId) {
//         const firstSectionId = sections?.[0]?._id;
//         const firstSubSectionId = sections?.[0]?.subSection?.[0]?._id;
//         if (firstSectionId && firstSubSectionId) {
//           navigate(`/viewcourse/${courseId}/${firstSectionId}/${firstSubSectionId}`, { replace: true });
//         }
//       }
//     })();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [courseId, token]);

//   // If state cleared or route malformed, try redirecting to a valid first lecture
//   useEffect(() => {
//     if (!courseSectionData?.length) return;
//     if (!sectionId || !subsectionId) return;

//     const hasSection = courseSectionData.some((s) => s._id === sectionId);
//     const hasSubSection = courseSectionData
//       .find((s) => s._id === sectionId)?.subSection?.some((ss) => ss._id === subsectionId);

//     if (!hasSection || !hasSubSection) {
//       const firstSectionId = courseSectionData?.[0]?._id;
//       const firstSubSectionId = courseSectionData?.[0]?.subSection?.[0]?._id;
//       if (firstSectionId && firstSubSectionId) {
//         navigate(`/viewcourse/${courseId}/${firstSectionId}/${firstSubSectionId}`, { replace: true });
//       }
//     }
//   }, [courseSectionData, sectionId, subsectionId, courseId, navigate]);

//   return (
//     <>
//       <div style={{
//         minHeight: 'calc(100vh - 64px)',
//         backgroundColor: BG_LIGHT,
//         padding: '20px',
//         fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
//       }}>
//         <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
//           {/* Enhanced Top Navigation Bar */}
//           <div style={{
//             display: 'flex',
//             alignItems: 'center',
//             justifyContent: 'space-between',
//             backgroundColor: WHITE,
//             border: `1px solid ${BORDER}`,
//             borderRadius: '16px',
//             padding: '16px 24px',
//             boxShadow: SHADOW_MD,
//             marginBottom: '20px',
//             backdropFilter: 'blur(10px)',
//             position: 'sticky',
//             top: '20px',
//             zIndex: 10
//           }}>
//             <button
//               onClick={() => window.history.back()}
//               style={{
//                 appearance: 'none',
//                 border: `2px solid ${BORDER}`,
//                 background: WHITE,
//                 color: TEXT_DARK,
//                 borderRadius: '12px',
//                 padding: '10px 16px',
//                 fontWeight: 600,
//                 cursor: 'pointer',
//                 fontSize: '14px',
//                 transition: 'all 0.2s ease',
//                 display: 'flex',
//                 alignItems: 'center',
//                 gap: '6px',
//                 lineHeight: 1
//               }}
//               onMouseOver={(e) => {
//                 e.target.style.backgroundColor = BG_LIGHT;
//                 e.target.style.borderColor = ED_TEAL;
//                 e.target.style.transform = 'translateY(-1px)';
//                 e.target.style.boxShadow = SHADOW_SM;
//               }}
//               onMouseOut={(e) => {
//                 e.target.style.backgroundColor = WHITE;
//                 e.target.style.borderColor = BORDER;
//                 e.target.style.transform = 'translateY(0)';
//                 e.target.style.boxShadow = 'none';
//               }}
//             >
//               <span style={{ fontSize: '16px' }}>←</span>
//               Back to Courses
//             </button>

//             <div style={{ textAlign: 'center', flex: 1 }}>
//               <h1 style={{
//                 margin: '0 0 4px 0',
//                 fontSize: '1.25rem',
//                 color: TEXT_DARK,
//                 fontWeight: 700,
//                 letterSpacing: '-0.025em'
//               }}>
//                 Course Player
//               </h1>
//               <div style={{ 
//                 color: TEXT_LIGHT, 
//                 fontSize: '0.875rem',
//                 fontWeight: 500
//               }}>
//                 Continue your learning journey
//               </div>
//             </div>

//             <button
//               style={{
//                 appearance: 'none',
//                 border: 'none',
//                 background: `linear-gradient(135deg, ${ED_TEAL} 0%, ${ED_TEAL_DARK} 100%)`,
//                 color: WHITE,
//                 borderRadius: '12px',
//                 padding: '12px 20px',
//                 fontWeight: 600,
//                 cursor: 'pointer',
//                 boxShadow: SHADOW_SM,
//                 fontSize: '14px',
//                 transition: 'all 0.2s ease',
//                 lineHeight: 1
//               }}
//               onClick={() => navigate(`/course/${courseId}#reviews`)}
//               onMouseOver={(e) => {
//                 e.target.style.transform = 'translateY(-2px)';
//                 e.target.style.boxShadow = SHADOW_MD;
//               }}
//               onMouseOut={(e) => {
//                 e.target.style.transform = 'translateY(0)';
//                 e.target.style.boxShadow = SHADOW_SM;
//               }}
//             >
//               Add Review
//             </button>
//           </div>

//           {/* Enhanced Main Layout */}
//           <div
//             className="course-layout"
//             style={{
//               display: 'grid',
//               gridTemplateColumns: '1fr',
//               gap: '20px',
//               alignItems: 'start'
//             }}
//           >
//             {/* Enhanced Sidebar */}
//             <aside
//               className="course-sidebar"
//               style={{
//                 backgroundColor: WHITE,
//                 borderRadius: '16px',
//                 border: `1px solid ${BORDER}`,
//                 overflow: 'hidden',
//                 boxShadow: SHADOW_MD,
//                 maxHeight: 'calc(100vh - 200px)',
//                 position: 'sticky',
//                 top: '120px'
//               }}
//             >
//               <div style={{
//                 padding: '20px 24px',
//                 background: `linear-gradient(135deg, ${ED_TEAL} 0%, ${ED_TEAL_DARK} 100%)`,
//                 color: WHITE,
//                 fontWeight: 700,
//                 fontSize: '1rem',
//                 letterSpacing: '-0.025em',
//                 borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'space-between'
//               }}>
//                 <span>Course Content</span>
//                 <div style={{
//                   backgroundColor: 'rgba(255, 255, 255, 0.2)',
//                   borderRadius: '20px',
//                   padding: '4px 12px',
//                   fontSize: '0.75rem',
//                   fontWeight: 600
//                 }}>
//                   {courseSectionData?.length || 0} Sections
//                 </div>
//               </div>
              
//               <div 
//                 className="sidebar-content"
//                 style={{
//                   height: 'calc(100% - 69px)',
//                   overflowY: 'auto',
//                   backgroundColor: WHITE
//                 }}
//               >
//                 <VideoDetailsSidebar />
//               </div>
//             </aside>

//             {/* Enhanced Video Content */}
//             <main style={{
//               backgroundColor: WHITE,
//               borderRadius: '16px',
//               border: `1px solid ${BORDER}`,
//               boxShadow: SHADOW_MD,
//               overflow: 'hidden',
//               minHeight: '600px'
//             }}>
//               <VideoDetails />
//             </main>
//           </div>
//         </div>
//       </div>

//       {/* Enhanced Global Styles */}
//       <style jsx>{`
//         @media (min-width: 1024px) {
//           .course-layout {
//             grid-template-columns: 360px 1fr !important;
//             gap: 24px !important;
//           }
//         }

//         @media (max-width: 1023px) {
//           .course-sidebar {
//             max-height: 400px !important;
//             position: relative !important;
//             top: auto !important;
//           }
          
//           .course-layout {
//             gap: 16px !important;
//           }
//         }

//         @media (max-width: 768px) {
//           .course-layout {
//             gap: 12px !important;
//           }
          
//           .course-sidebar {
//             max-height: 300px !important;
//           }
//         }

//         /* Enhanced Custom Scrollbar */
//         .sidebar-content::-webkit-scrollbar {
//           width: 6px;
//         }
        
//         .sidebar-content::-webkit-scrollbar-track {
//           background: ${BG_LIGHT};
//           border-radius: 3px;
//         }
        
//         .sidebar-content::-webkit-scrollbar-thumb {
//           background: linear-gradient(135deg, ${ED_TEAL} 0%, ${ED_TEAL_DARK} 100%);
//           border-radius: 3px;
//           transition: all 0.2s ease;
//         }
        
//         .sidebar-content::-webkit-scrollbar-thumb:hover {
//           background: ${ED_TEAL_DARK};
//           width: 8px;
//         }

//         /* Smooth scrolling for better UX */
//         .sidebar-content {
//           scroll-behavior: smooth;
//         }

//         /* Enhanced focus styles for accessibility */
//         button:focus {
//           outline: 2px solid ${ED_TEAL} !important;
//           outline-offset: 2px !important;
//         }

//         /* Loading animation for better perceived performance */
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(20px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .course-layout > * {
//           animation: fadeIn 0.5s ease-out;
//         }

//         .course-sidebar {
//           animation-delay: 0.1s;
//         }

//         /* Enhanced hover effects */
//         .course-sidebar:hover {
//           box-shadow: ${SHADOW_LG};
//           transition: box-shadow 0.3s ease;
//         }

//         main:hover {
//           box-shadow: ${SHADOW_LG};
//           transition: box-shadow 0.3s ease;
//         }

//         /* Professional typography improvements */
//         * {
//           -webkit-font-smoothing: antialiased;
//           -moz-osx-font-smoothing: grayscale;
//         }
//       `}</style>
//     </>
//   );
// };

// export default ViewCourse;


import React, { useEffect, useMemo } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import VideoDetails from "../components/core/ViewCourse/VideoDetails";
import VideoDetailsSidebar from "../components/core/ViewCourse/VideoDetailsSidebar";
import {
  setCourseSectionData,
  setEntireCourseData,
  setTotalNoOfLectures,
  setCompletedLectures,
} from "../store/slices/viewCourseSlice";
import { getFullDetailsOfCourse } from "../services/operations/courseDetailsAPI";
import ReviewModal from "../components/core/ViewCourse/ReviewModal";

// Professional color constants
const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const ED_TEAL_LIGHT = '#e8f6f5';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';
const TEXT_LIGHT = '#6b7280';
const BG_LIGHT = '#f8fafc';
const WHITE = '#ffffff';
const SHADOW_SM = '0 2px 4px rgba(0, 0, 0, 0.06)';
const SHADOW_MD = '0 4px 12px rgba(0, 0, 0, 0.08)';
const SHADOW_LG = '0 8px 24px rgba(0, 0, 0, 0.12)';

const ViewCourse = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
   const [videoData, setVideoData] = useState([]);
  const { token } = useSelector((state) => state.auth);
  const { courseId, sectionId, subsectionId } = useParams();

  const { courseSectionData } = useSelector((state) => state.viewCourse || { courseSectionData: [] });

  // Helper to compute total lectures
  const computeTotalLectures = (sections) => {
    if (!Array.isArray(sections)) return 0;
    return sections.reduce((acc, sec) => acc + (sec?.subSection?.length || 0), 0);
  };

  // Fetch course details and populate viewCourse slice
  useEffect(() => {
    (async () => {
      // Require auth
      if (!token) {
        navigate("/login", { replace: true, state: { from: location.pathname } });
        return;
      }
      if (!courseId) return;

      const res = await getFullDetailsOfCourse(courseId, token);
      if (!res?.success) return; // Toasts handled inside API util

      const data = res.data;
      // Attempt to support multiple possible response shapes
      const courseDetails = data?.courseDetails || data?.course;
      const sections = courseDetails?.courseContent || [];
      const completed = data?.completedVideos || data?.completedLectures || [];

      dispatch(setCourseSectionData(sections));
      dispatch(setEntireCourseData(courseDetails || {}));
      dispatch(setTotalNoOfLectures(computeTotalLectures(sections)));
      dispatch(setCompletedLectures(completed));

      // If URL doesn't include a lecture, redirect to the first one (stay under /viewcourse)
      if (!sectionId || !subsectionId) {
        const firstSectionId = sections?.[0]?._id;
        const firstSubSectionId = sections?.[0]?.subSection?.[0]?._id;
        if (firstSectionId && firstSubSectionId) {
          navigate(`/viewcourse/${courseId}/${firstSectionId}/${firstSubSectionId}`, { replace: true });
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, token]);

  // If state cleared or route malformed, try redirecting to a valid first lecture
  useEffect(() => {
    if (!courseSectionData?.length) return;
    if (!sectionId || !subsectionId) return;

    const hasSection = courseSectionData.some((s) => s._id === sectionId);
    const hasSubSection = courseSectionData
      .find((s) => s._id === sectionId)?.subSection?.some((ss) => ss._id === subsectionId);

    if (!hasSection || !hasSubSection) {
      const firstSectionId = courseSectionData?.[0]?._id;
      const firstSubSectionId = courseSectionData?.[0]?.subSection?.[0]?._id;
      if (firstSectionId && firstSubSectionId) {
        navigate(`/viewcourse/${courseId}/${firstSectionId}/${firstSubSectionId}`, { replace: true });
      }
    }
  }, [courseSectionData, sectionId, subsectionId, courseId, navigate]);

  return (
    <>
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        backgroundColor: BG_LIGHT,
        padding: '20px',
        marginTop:"10rem",
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
          {/* Enhanced Top Navigation Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: WHITE,
            border: `1px solid ${BORDER}`,
            borderRadius: '16px',
            padding: '16px 24px',
            boxShadow: SHADOW_MD,
            marginBottom: '20px',
            backdropFilter: 'blur(10px)',
            position: 'sticky',
            top: '20px',
            zIndex: 10
          }}>
            <button
              onClick={() => window.history.back()}
              style={{
                appearance: 'none',
                border: `2px solid ${BORDER}`,
                background: WHITE,
                color: TEXT_DARK,
                borderRadius: '12px',
                padding: '10px 16px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                lineHeight: 1
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = BG_LIGHT;
                e.target.style.borderColor = ED_TEAL;
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = SHADOW_SM;
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = WHITE;
                e.target.style.borderColor = BORDER;
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              <span style={{ fontSize: '16px' }}>←</span>
              Back to Courses
            </button>

            <div style={{ textAlign: 'center', flex: 1 }}>
              <h1 style={{
                margin: '0 0 4px 0',
                fontSize: '1.25rem',
                color: TEXT_DARK,
                fontWeight: 700,
                letterSpacing: '-0.025em'
              }}>
                Course Player
              </h1>
              <div style={{ 
                color: TEXT_LIGHT, 
                fontSize: '0.875rem',
                fontWeight: 500
              }}>
                Continue your learning journey
              </div>
            </div>

            {/* <div className="mt-4 flex items-start justify-between gap-3">
        
        <button
          onClick={() => setIsReviewOpen(true)}
          style={{
            backgroundColor: ED_TEAL,
            border: `1px solid ${ED_TEAL_DARK}`,
            color: WHITE,
            padding: '10px 20px',
            borderRadius: '6px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = ED_TEAL_DARK}
          onMouseOut={(e) => e.target.style.backgroundColor = ED_TEAL}
        >
          Add Review
        </button>
      </div>
      <ReviewModal
              isOpen={isReviewOpen}
              onClose={() => setIsReviewOpen(false)}
              courseId={courseId}
              onSubmitted={() => setIsReviewOpen(false)}
            /> */}
          </div>

          {/* Enhanced Main Layout */}
          <div
            className="course-layout"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '20px',
              alignItems: 'start'
            }}
          >
            {/* Enhanced Sidebar */}
            <aside
              className="course-sidebar"
              style={{
                backgroundColor: WHITE,
                borderRadius: '16px',
                border: `1px solid ${BORDER}`,
                overflow: 'hidden',
                boxShadow: SHADOW_MD,
                maxHeight: 'calc(100vh - 200px)',
                position: 'sticky',
                top: '120px'
              }}
            >
              <div style={{
                padding: '20px 24px',
                background: `linear-gradient(135deg, ${ED_TEAL} 0%, ${ED_TEAL_DARK} 100%)`,
                color: WHITE,
                fontWeight: 700,
                fontSize: '1rem',
                letterSpacing: '-0.025em',
                borderBottom: `1px solid rgba(255, 255, 255, 0.1)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>Course Content</span>
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {courseSectionData?.length || 0} Sections
                </div>
              </div>
              
              <div 
                className="sidebar-content"
                style={{
                  height: 'calc(100% - 69px)',
                  overflowY: 'auto',
                  backgroundColor: WHITE
                }}
              >
                <VideoDetailsSidebar />
              </div>
            </aside>

            {/* Enhanced Video Content */}
            <main style={{
              backgroundColor: WHITE,
              borderRadius: '16px',
              border: `1px solid ${BORDER}`,
              boxShadow: SHADOW_MD,
              overflow: 'hidden',
              minHeight: '600px'
            }}>
              <VideoDetails />
            </main>
          </div>
        </div>
      </div>

      {/* Enhanced Global Styles */}
      <style jsx>{`
        @media (min-width: 1024px) {
          .course-layout {
            grid-template-columns: 360px 1fr !important;
            gap: 24px !important;
          }
        }

        @media (max-width: 1023px) {
          .course-sidebar {
            max-height: 400px !important;
            position: relative !important;
            top: auto !important;
          }
          
          .course-layout {
            gap: 16px !important;
          }
        }

        @media (max-width: 768px) {
          .course-layout {
            gap: 12px !important;
          }
          
          .course-sidebar {
            max-height: 300px !important;
          }
        }

        /* Enhanced Custom Scrollbar */
        .sidebar-content::-webkit-scrollbar {
          width: 6px;
        }
        
        .sidebar-content::-webkit-scrollbar-track {
          background: ${BG_LIGHT};
          border-radius: 3px;
        }
        
        .sidebar-content::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, ${ED_TEAL} 0%, ${ED_TEAL_DARK} 100%);
          border-radius: 3px;
          transition: all 0.2s ease;
        }
        
        .sidebar-content::-webkit-scrollbar-thumb:hover {
          background: ${ED_TEAL_DARK};
          width: 8px;
        }

        /* Smooth scrolling for better UX */
        .sidebar-content {
          scroll-behavior: smooth;
        }

        /* Enhanced focus styles for accessibility */
        button:focus {
          outline: 2px solid ${ED_TEAL} !important;
          outline-offset: 2px !important;
        }

        /* Loading animation for better perceived performance */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .course-layout > * {
          animation: fadeIn 0.5s ease-out;
        }

        .course-sidebar {
          animation-delay: 0.1s;
        }

        /* Enhanced hover effects */
        .course-sidebar:hover {
          box-shadow: ${SHADOW_LG};
          transition: box-shadow 0.3s ease;
        }

        main:hover {
          box-shadow: ${SHADOW_LG};
          transition: box-shadow 0.3s ease;
        }

        /* Professional typography improvements */
        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
      `}</style>
    </>
  );
};

export default ViewCourse;