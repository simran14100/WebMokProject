// import React, { useEffect, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useParams, useLocation } from "react-router-dom";

// import "video-react/dist/video-react.css";
// import { BigPlayButton, Player } from "video-react";

// import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI";
// import { updateCompletedLectures } from "../../../store/slices/viewCourseSlice";
// import IconBtn from "../../common/IconBtn";
// import ScreenshotProtection from "../../common/ScreenshotProtection";
// import ReviewModal from "./ReviewModal";

// const VideoDetails = () => {
//   const { courseId, sectionId, subsectionId } = useParams();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const playerRef = useRef(null);
//   const dispatch = useDispatch();
//   const { token } = useSelector((state) => state.auth);
//   const { courseSectionData, courseEntireData, completedLectures } =
//     useSelector((state) => state.viewCourse);

//   const [videoData, setVideoData] = useState([]);
//   const [previewSource, setPreviewSource] = useState("");
//   const [videoEnded, setVideoEnded] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [isReviewOpen, setIsReviewOpen] = useState(false);

//   useEffect(() => {
//     (async () => {
//       if (!courseSectionData.length) return;
//       if (!courseId && !sectionId && !subsectionId) {
//         navigate(`/dashboard/enrolled-courses`);
//       } else {
//         const filteredData = courseSectionData.filter(
//           (course) => course._id === sectionId
//         );
//         const filteredVideoData = filteredData?.[0]?.subSection?.filter(
//           (data) => data._id === subsectionId
//         );
//         setVideoData(filteredVideoData?.[0]);
//         setPreviewSource(courseEntireData?.thumbnail || "");
//         setVideoEnded(false);
//       }
//     })();
//   }, [courseSectionData, courseEntireData, location.pathname]);

//   // check if the lecture is the first video of the course
//   const isFirstVideo = () => {
//     if (!Array.isArray(courseSectionData) || courseSectionData.length === 0) {
//       return true;
//     }
//     const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId);
//     if (currentSectionIndx === -1) return true;
//     const currentSubSectionIndx = courseSectionData[currentSectionIndx]?.subSection?.findIndex((data) => data._id === subsectionId) ?? -1;
//     if (currentSubSectionIndx === -1) return true;
//     return currentSectionIndx === 0 && currentSubSectionIndx === 0;
//   };

//   // whether a valid next target exists (used to render Next button safely)
//   const canGoNext = () => {
//     if (!Array.isArray(courseSectionData) || courseSectionData.length === 0) return false;
//     const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId);
//     if (currentSectionIndx === -1) return false;
//     const noOfSubsections = courseSectionData[currentSectionIndx]?.subSection?.length || 0;
//     const currentSubSectionIndx = courseSectionData[currentSectionIndx]?.subSection?.findIndex((data) => data._id === subsectionId) ?? -1;
//     if (currentSubSectionIndx === -1) return false;
//     if (currentSubSectionIndx < noOfSubsections - 1) return true;
//     if (currentSectionIndx < courseSectionData.length - 1) {
//       const nextSection = courseSectionData[currentSectionIndx + 1];
//       return Boolean(nextSection?.subSection?.[0]?._id);
//     }
//     return false;
//   };

//   // go to the next video
//   const goToNextVideo = () => {
//     try {
//       if (!Array.isArray(courseSectionData) || courseSectionData.length === 0) {
//         return;
//       }
//       const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId);
//       if (currentSectionIndx === -1) return;
//       const noOfSubsections = courseSectionData[currentSectionIndx]?.subSection?.length || 0;
//       const currentSubSectionIndx = courseSectionData[currentSectionIndx]?.subSection?.findIndex((data) => data._id === subsectionId) ?? -1;
//       if (currentSubSectionIndx === -1) return;

//       // Next within same section
//       if (currentSubSectionIndx < noOfSubsections - 1) {
//         const nextSubSectionId = courseSectionData[currentSectionIndx]?.subSection?.[currentSubSectionIndx + 1]?._id;
//         if (nextSubSectionId) navigate(`/viewcourse/${courseId}/${sectionId}/${nextSubSectionId}`);
//         return;
//       }

//       // Move to first subsection of next section, if exists
//       if (currentSectionIndx < courseSectionData.length - 1) {
//         const nextSection = courseSectionData[currentSectionIndx + 1];
//         const nextSectionId = nextSection?._id;
//         const nextSubSectionId = nextSection?.subSection?.[0]?._id;
//         if (nextSectionId && nextSubSectionId) {
//           navigate(`/viewcourse/${courseId}/${nextSectionId}/${nextSubSectionId}`);
//         }
//       }
//     } catch (e) {
//       console.error("goToNextVideo failed", e);
//     }
//   };

//   // check if the lecture is the last video of the course
//   const isLastVideo = () => {
//     if (!Array.isArray(courseSectionData) || courseSectionData.length === 0) {
//       return true;
//     }
//     const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId);
//     if (currentSectionIndx === -1) return true;
//     const noOfSubsections = courseSectionData[currentSectionIndx]?.subSection?.length || 0;
//     const currentSubSectionIndx = courseSectionData[currentSectionIndx]?.subSection?.findIndex((data) => data._id === subsectionId) ?? -1;
//     if (currentSubSectionIndx === -1) return true;
//     // If there is a next subsection within the same section, not last
//     if (currentSubSectionIndx < noOfSubsections - 1) return false;
//     // If there is a next section, check if it has at least one subsection
//     if (currentSectionIndx < courseSectionData.length - 1) {
//       const nextSection = courseSectionData[currentSectionIndx + 1];
//       const hasNextTarget = (nextSection?.subSection?.length || 0) > 0;
//       return !hasNextTarget;
//     }
//     // Otherwise, this is the last
//     return true;
//   };

//   // go to the previous video
//   const goToPrevVideo = () => {
//     if (!Array.isArray(courseSectionData) || courseSectionData.length === 0) {
//       return;
//     }
//     const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId);
//     if (currentSectionIndx === -1) return;
//     const currentSubSectionIndx = courseSectionData[currentSectionIndx]?.subSection?.findIndex((data) => data._id === subsectionId) ?? -1;
//     if (currentSubSectionIndx === -1) return;

//     // Previous within same section
//     if (currentSubSectionIndx > 0) {
//       const prevSubSectionId = courseSectionData[currentSectionIndx].subSection[currentSubSectionIndx - 1]?._id;
//       if (prevSubSectionId) navigate(`/viewcourse/${courseId}/${sectionId}/${prevSubSectionId}`);
//       return;
//     }

//     // Move to last subsection of previous section, if exists
//     if (currentSectionIndx > 0) {
//       const prevSection = courseSectionData[currentSectionIndx - 1];
//       const prevSectionId = prevSection?._id;
//       const prevSubSectionLen = prevSection?.subSection?.length || 0;
//       const prevSubSectionId = prevSection?.subSection?.[prevSubSectionLen - 1]?._id;
//       if (prevSectionId && prevSubSectionId) {
//         navigate(`/viewcourse/${courseId}/${prevSectionId}/${prevSubSectionId}`);
//       }
//     }
//   };

//   const handleLectureCompletion = async () => {
//     setLoading(true);
//     const res = await markLectureAsComplete(
//       { courseId: courseId, subsectionId: subsectionId },
//       token
//     );
//     if (res) {
//       dispatch(updateCompletedLectures(subsectionId));
//     }
//     setLoading(false);
//   };

//   return (
//     <div className="flex flex-col gap-5 text-white">
//       <ScreenshotProtection enabled={true}>
//         {!videoData ? (
//           <img
//             src={previewSource}
//             alt="Preview"
//             className="h-full w-full rounded-md object-cover"
//           />
//         ) : (
//           <Player
//             ref={playerRef}
//             aspectRatio="16:9"
//             playsInline
//             onEnded={() => setVideoEnded(true)}
//             src={videoData?.videoUrl}
//           >
//             <BigPlayButton position="center" />
//             {/* Render When Video Ends */}
//             {videoEnded && (
//               <div
//                 style={{
//                   backgroundImage:
//                     "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
//                 }}
//                 className="full absolute inset-0 z-[100] grid h-full place-content-center font-inter"
//               >
//                 {!completedLectures.includes(subsectionId) && (
//                   <IconBtn
//                     disabled={loading}
//                     onclick={() => handleLectureCompletion()}
//                     text={!loading ? "Mark As Completed" : "Loading..."}
//                     customClasses="text-xl max-w-max px-4 mx-auto"
//                   />
//                 )}
//                 <IconBtn
//                   disabled={loading}
//                   onclick={() => setIsReviewOpen(true)}
//                   text="Add Review"
//                   customClasses="text-xl max-w-max px-4 mx-auto mt-2"
//                 />
//                 <IconBtn
//                   disabled={loading}
//                   onclick={() => {
//                     if (playerRef?.current) {
//                       // set the current time of the video to 0
//                       playerRef?.current?.seek(0);
//                       setVideoEnded(false);
//                     }
//                   }}
//                   text="Rewatch"
//                   customClasses="text-xl max-w-max px-4 mx-auto mt-2"
//                 />
//                 <div className="mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl">
//                   {!isFirstVideo() && (
//                     <button
//                       disabled={loading}
//                       onClick={goToPrevVideo}
//                       className="blackButton"
//                     >
//                       Prev
//                     </button>
//                   )}
//                   {canGoNext() && (
//                     <button
//                       disabled={loading}
//                       onClick={goToNextVideo}
//                       className="blackButton"
//                     >
//                       Next
//                     </button>
//                   )}
//                 </div>
//               </div>
//             )}
//           </Player>
//         )}
//       </ScreenshotProtection>

//       <div className="mt-4 flex items-start justify-between gap-3">
//         <h1 className="text-3xl font-semibold">{videoData?.title}</h1>
//         <button
//           onClick={() => setIsReviewOpen(true)}
//           className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
//         >
//           Add Review
//         </button>
//       </div>
//       <p className="pt-2 pb-6">{videoData?.description}</p>

//       <ReviewModal
//         isOpen={isReviewOpen}
//         onClose={() => setIsReviewOpen(false)}
//         courseId={courseId}
//         onSubmitted={() => setIsReviewOpen(false)}
//       />
//     </div>
//   );
// };

// export default VideoDetails;
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams, useLocation } from "react-router-dom";

import "video-react/dist/video-react.css";
import { BigPlayButton, Player } from "video-react";

import { markLectureAsComplete } from "../../../services/operations/courseDetailsAPI";
import { updateCompletedLectures } from "../../../store/slices/viewCourseSlice";
import IconBtn from "../../common/IconBtn";
import ScreenshotProtection from "../../common/ScreenshotProtection";
import ReviewModal from "./ReviewModal";

// Color constants
const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';
const WHITE = '#FFFFFF';
const BORDER = '#e0e0e0';
const TEXT_DARK = '#191A1F';
const SHADOW_MD = '0 4px 6px rgba(0, 0, 0, 0.1)';

const VideoDetails = () => {
  const { courseId, sectionId, subsectionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const playerRef = useRef(null);
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { courseSectionData, courseEntireData, completedLectures } =
    useSelector((state) => state.viewCourse);

  const [videoData, setVideoData] = useState([]);
  const [previewSource, setPreviewSource] = useState("");
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  useEffect(() => {
    (async () => {
      if (!courseSectionData.length) return;
      if (!courseId && !sectionId && !subsectionId) {
        navigate(`/dashboard/enrolled-courses`);
      } else {
        const filteredData = courseSectionData.filter(
          (course) => course._id === sectionId
        );
        const filteredVideoData = filteredData?.[0]?.subSection?.filter(
          (data) => data._id === subsectionId
        );
        setVideoData(filteredVideoData?.[0]);
        setPreviewSource(courseEntireData?.thumbnail || "");
        setVideoEnded(false);
      }
    })();
  }, [courseSectionData, courseEntireData, location.pathname]);

  // check if the lecture is the first video of the course
  const isFirstVideo = () => {
    if (!Array.isArray(courseSectionData) || courseSectionData.length === 0) {
      return true;
    }
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId);
    if (currentSectionIndx === -1) return true;
    const currentSubSectionIndx = courseSectionData[currentSectionIndx]?.subSection?.findIndex((data) => data._id === subsectionId) ?? -1;
    if (currentSubSectionIndx === -1) return true;
    return currentSectionIndx === 0 && currentSubSectionIndx === 0;
  };

  // whether a valid next target exists (used to render Next button safely)
  const canGoNext = () => {
    if (!Array.isArray(courseSectionData) || courseSectionData.length === 0) return false;
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId);
    if (currentSectionIndx === -1) return false;
    const noOfSubsections = courseSectionData[currentSectionIndx]?.subSection?.length || 0;
    const currentSubSectionIndx = courseSectionData[currentSectionIndx]?.subSection?.findIndex((data) => data._id === subsectionId) ?? -1;
    if (currentSubSectionIndx === -1) return false;
    if (currentSubSectionIndx < noOfSubsections - 1) return true;
    if (currentSectionIndx < courseSectionData.length - 1) {
      const nextSection = courseSectionData[currentSectionIndx + 1];
      return Boolean(nextSection?.subSection?.[0]?._id);
    }
    return false;
  };

  // go to the next video
  const goToNextVideo = () => {
    try {
      if (!Array.isArray(courseSectionData) || courseSectionData.length === 0) {
        return;
      }
      const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId);
      if (currentSectionIndx === -1) return;
      const noOfSubsections = courseSectionData[currentSectionIndx]?.subSection?.length || 0;
      const currentSubSectionIndx = courseSectionData[currentSectionIndx]?.subSection?.findIndex((data) => data._id === subsectionId) ?? -1;
      if (currentSubSectionIndx === -1) return;

      // Next within same section
      if (currentSubSectionIndx < noOfSubsections - 1) {
        const nextSubSectionId = courseSectionData[currentSectionIndx]?.subSection?.[currentSubSectionIndx + 1]?._id;
        if (nextSubSectionId) navigate(`/viewcourse/${courseId}/${sectionId}/${nextSubSectionId}`);
        return;
      }

      // Move to first subsection of next section, if exists
      if (currentSectionIndx < courseSectionData.length - 1) {
        const nextSection = courseSectionData[currentSectionIndx + 1];
        const nextSectionId = nextSection?._id;
        const nextSubSectionId = nextSection?.subSection?.[0]?._id;
        if (nextSectionId && nextSubSectionId) {
          navigate(`/viewcourse/${courseId}/${nextSectionId}/${nextSubSectionId}`);
        }
      }
    } catch (e) {
      console.error("goToNextVideo failed", e);
    }
  };

  // check if the lecture is the last video of the course
  const isLastVideo = () => {
    if (!Array.isArray(courseSectionData) || courseSectionData.length === 0) {
      return true;
    }
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId);
    if (currentSectionIndx === -1) return true;
    const noOfSubsections = courseSectionData[currentSectionIndx]?.subSection?.length || 0;
    const currentSubSectionIndx = courseSectionData[currentSectionIndx]?.subSection?.findIndex((data) => data._id === subsectionId) ?? -1;
    if (currentSubSectionIndx === -1) return true;
    // If there is a next subsection within the same section, not last
    if (currentSubSectionIndx < noOfSubsections - 1) return false;
    // If there is a next section, check if it has at least one subsection
    if (currentSectionIndx < courseSectionData.length - 1) {
      const nextSection = courseSectionData[currentSectionIndx + 1];
      const hasNextTarget = (nextSection?.subSection?.length || 0) > 0;
      return !hasNextTarget;
    }
    // Otherwise, this is the last
    return true;
  };

  // go to the previous video
  const goToPrevVideo = () => {
    if (!Array.isArray(courseSectionData) || courseSectionData.length === 0) {
      return;
    }
    const currentSectionIndx = courseSectionData.findIndex((data) => data._id === sectionId);
    if (currentSectionIndx === -1) return;
    const currentSubSectionIndx = courseSectionData[currentSectionIndx]?.subSection?.findIndex((data) => data._id === subsectionId) ?? -1;
    if (currentSubSectionIndx === -1) return;

    // Previous within same section
    if (currentSubSectionIndx > 0) {
      const prevSubSectionId = courseSectionData[currentSectionIndx].subSection[currentSubSectionIndx - 1]?._id;
      if (prevSubSectionId) navigate(`/viewcourse/${courseId}/${sectionId}/${prevSubSectionId}`);
      return;
    }

    // Move to last subsection of previous section, if exists
    if (currentSectionIndx > 0) {
      const prevSection = courseSectionData[currentSectionIndx - 1];
      const prevSectionId = prevSection?._id;
      const prevSubSectionLen = prevSection?.subSection?.length || 0;
      const prevSubSectionId = prevSection?.subSection?.[prevSubSectionLen - 1]?._id;
      if (prevSectionId && prevSubSectionId) {
        navigate(`/viewcourse/${courseId}/${prevSectionId}/${prevSubSectionId}`);
      }
    }
  };

  const handleLectureCompletion = async () => {
    setLoading(true);
    const res = await markLectureAsComplete(
      { courseId: courseId, subsectionId: subsectionId },
      token
    );
    if (res) {
      dispatch(updateCompletedLectures(subsectionId));
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-5 text-white" style={{ color: TEXT_DARK }}>
      <ScreenshotProtection enabled={true}>
        {!videoData ? (
          <img
            src={previewSource}
            alt="Preview"
            className="h-full w-full rounded-md object-cover"
            style={{ border: `1px solid ${BORDER}` }}
          />
        ) : (
          <Player
            ref={playerRef}
            aspectRatio="16:9"
            playsInline
            onEnded={() => setVideoEnded(true)}
            src={videoData?.videoUrl}
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              border: `1px solid ${BORDER}`,
            }}
          >
            <BigPlayButton position="center" />
            {/* Render When Video Ends */}
            {videoEnded && (
  <div
    style={{
      position: "absolute",
      inset: "0",
      zIndex: 100,
      display: "grid",
      height: "100%",
      placeContent: "center",
      fontFamily: "Inter, sans-serif",
      backgroundImage:
        "linear-gradient(to top, rgb(0,0,0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1))",
    }}
  >
    <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
      {!completedLectures.includes(subsectionId) && (
        <IconBtn
          disabled={loading}
          onclick={() => handleLectureCompletion()}
          text={!loading ? "Mark As Completed" : "Loading..."}
          style={{
            backgroundColor: '#07A698', // steel blue
            border: "1px solid #315f7d",
            color: "#fff",
            fontSize: "16px",
            padding: "10px 20px",
            borderRadius: "6px",
            fontWeight: "500",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        />
      )}

      <IconBtn
        disabled={loading}
        onclick={() => {
          if (playerRef?.current) {
            playerRef?.current?.seek(0);
            setVideoEnded(false);
          }
        }}
        text="Rewatch"
        style={{
          backgroundColor: '#07A698',
          border: "1px solid #315f7d",
          color: "#fff",
          fontSize: "16px",
          padding: "10px 20px",
          borderRadius: "6px",
          fontWeight: "500",
          cursor: loading ? "not-allowed" : "pointer",
          opacity: loading ? 0.7 : 1,
        }}
      />

      <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
        {!isFirstVideo() && (
          <button
            disabled={loading}
            onClick={goToPrevVideo}
            style={{
              backgroundColor: '#07A698',
              border: "1px solid #315f7d",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "6px",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            Prev
          </button>
        )}

        {canGoNext() && (
          <button
            disabled={loading}
            onClick={goToNextVideo}
            style={{
              backgroundColor: '#07A698',
              border: "1px solid #315f7d",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "6px",
              fontWeight: "500",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            Next
          </button>
        )}
      </div>
    </div>
  </div>
)}


          </Player>
        )}
      </ScreenshotProtection>

      <div className="mt-4 flex items-start justify-between gap-3">
        <h1 className="text-3xl font-semibold" style={{ color: TEXT_DARK }}>{videoData?.title}</h1>
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
      <p className="pt-2 pb-6" style={{ color: TEXT_DARK, opacity: 0.8, lineHeight: '1.6' }}>{videoData?.description}</p>

      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        courseId={courseId}
        onSubmitted={() => setIsReviewOpen(false)}
      />
    </div>
  );
};

// Wrapper component with improved styling
const VideoDetailsContainer = () => {
  return (
    <main style={{
      backgroundColor: WHITE,
      borderRadius: '16px',
      border: `1px solid ${BORDER}`,
      boxShadow: SHADOW_MD,
      overflow: 'hidden',
      minHeight: '600px',
      padding: '24px'
    }}>
      <VideoDetails />
    </main>
  );
};

export default VideoDetailsContainer;


