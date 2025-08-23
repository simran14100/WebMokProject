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
//     <div className="min-h-[calc(100vh-64px)] bg-white">
//       <div className="mx-auto max-w-7xl px-4 py-6">
//         <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
//           <div className="lg:col-span-2">
//             <VideoDetails />
//           </div>
//           <div className="lg:col-span-1">
//             <VideoDetailsSidebar />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ViewCourse;

import React, { useEffect, useMemo } from "react";
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

// Color constants
const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const ED_TEAL_LIGHT = '#e6f7f5';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';
const TEXT_LIGHT = '#666666';
const BG_LIGHT = '#f8fafc';

const ViewCourse = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
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
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      backgroundColor: BG_LIGHT,
      padding: '16px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: 'white',
          border: `1px solid ${BORDER}`,
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
          <button
            onClick={() => window.history.back()}
            style={{
              appearance: 'none',
              border: `1px solid ${BORDER}`,
              background: '#fff',
              color: TEXT_DARK,
              borderRadius: '10px',
              padding: '8px 12px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              margin: 0,
              fontSize: '1.1rem',
              color: TEXT_DARK,
              fontWeight: 700
            }}>
              Course Player
            </h1>
            <div style={{ color: '#6b7280', fontSize: '0.9rem' }}>Continue your learning journey</div>
          </div>

          <button
            style={{
              appearance: 'none',
              border: 'none',
              background: ED_TEAL,
              color: '#fff',
              borderRadius: '10px',
              padding: '10px 14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 0 rgba(0,0,0,0.06)'
            }}
            onClick={() => navigate(`/course/${courseId}#reviews`)}
          >
            Add Review
          </button>
        </div>

        {/* Main two-column layout */}
        <div
          className="layout"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '16px',
            marginTop: '16px'
          }}
        >
          {/* Sidebar */}
          <aside
            className="sidebar"
            style={{
              backgroundColor: ED_TEAL_DARK,
              borderRadius: '12px',
              border: `1px solid ${BORDER}`,
              overflow: 'hidden',
              maxHeight: 'calc(100vh - 160px)',
              position: 'relative'
            }}
          >
            <div style={{
              padding: '14px 16px',
              background: '#047e73',
              color: '#ffffff',
              fontWeight: 700,
              borderBottom: `1px solid ${BORDER}`
            }}>
              Course Content
            </div>
            <div style={{
              height: '100%',
              overflowY: 'auto',
              background: ED_TEAL_DARK
            }}>
              <VideoDetailsSidebar />
            </div>
          </aside>

          {/* Video / Main content */}
          <main style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: `1px solid ${BORDER}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}>
            <VideoDetails />
          </main>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 1024px) {
          .layout {
            grid-template-columns: 320px 1fr !important;
          }
        }

        @media (max-width: 1023px) {
          .sidebar {
            max-height: 360px !important;
          }
        }

        /* Custom scrollbar for sidebar */
        .sidebar div::-webkit-scrollbar {
          width: 8px;
        }
        .sidebar div::-webkit-scrollbar-track {
          background: ${ED_TEAL_LIGHT};
        }
        .sidebar div::-webkit-scrollbar-thumb {
          background: ${ED_TEAL};
          border-radius: 8px;
        }
        .sidebar div::-webkit-scrollbar-thumb:hover {
          background: ${ED_TEAL_DARK};
        }
      `}</style>
    </div>
  );
};

export default ViewCourse;