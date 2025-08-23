// import React from "react";
// import { useSelector } from "react-redux";
// import { useNavigate, useParams } from "react-router-dom";

// const VideoDetailsSidebar = () => {
//   const navigate = useNavigate();
//   const { courseId, sectionId, subsectionId } = useParams();
//   const { courseSectionData, completedLectures } = useSelector(
//     (state) => state.viewCourse
//   );

//   const isActive = (sid, ssid) => sid === sectionId && ssid === subsectionId;
//   const isCompleted = (ssid) => completedLectures?.includes(ssid);

//   return (
//     <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
//       <div className="px-4 py-3 border-b text-gray-900 font-semibold">
//         Course Content
//       </div>
//       <div className="max-h-[70vh] overflow-y-auto p-2">
//         {courseSectionData?.map((section, sIdx) => (
//           <div key={section._id} className="mb-2">
//             <div className="px-3 py-2 text-sm font-medium text-gray-700">
//               Section {sIdx + 1}: {section.sectionName}
//             </div>
//             <div className="flex flex-col gap-1">
//               {section.subSection?.map((ss, idx) => (
//                 <button
//                   key={ss._id}
//                   className={`text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
//                     isActive(section._id, ss._id)
//                       ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
//                       : "hover:bg-gray-50 text-gray-700"
//                   }`}
//                   onClick={() => navigate(`/viewcourse/${courseId}/${section._id}/${ss._id}`)}
//                 >
//                   <span className="w-5 text-center text-xs text-gray-500">
//                     {idx + 1}.
//                   </span>
//                   <span className="flex-1 truncate">{ss.title}</span>
//                   {isCompleted(ss._id) && (
//                     <span className="text-emerald-600 text-xs font-semibold">Completed</span>
//                   )}
//                 </button>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default VideoDetailsSidebar;

import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

// Professional color constants matching ViewCourse
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
const SUCCESS_GREEN = '#10b981';
const SUCCESS_LIGHT = '#d1fae5';

const VideoDetailsSidebar = () => {
  const navigate = useNavigate();
  const { courseId, sectionId, subsectionId } = useParams();
  const { courseSectionData, completedLectures } = useSelector(
    (state) => state.viewCourse
  );

  const isActive = (sid, ssid) => sid === sectionId && ssid === subsectionId;
  const isCompleted = (ssid) => completedLectures?.includes(ssid);

  return (
    <>
      <div style={{
        width: '100%',
        backgroundColor: WHITE,
        borderRadius: '0',
        border: 'none',
        overflow: 'hidden',
        height: '100%'
      }}>
        {/* Course Content Body */}
        <div style={{
          maxHeight: 'calc(100vh - 280px)',
          overflowY: 'auto',
          padding: '0'
        }}>
          {courseSectionData?.map((section, sIdx) => (
            <div key={section._id} style={{ marginBottom: '0' }}>
              {/* Section Header */}
              <div style={{
                padding: '16px 24px',
                backgroundColor: BG_LIGHT,
                borderBottom: `1px solid ${BORDER}`,
                position: 'sticky',
                top: 0,
                zIndex: 5
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: TEXT_DARK,
                  letterSpacing: '-0.025em',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <span>Section {sIdx + 1}: {section.sectionName}</span>
                  <div style={{
                    backgroundColor: ED_TEAL_LIGHT,
                    color: ED_TEAL_DARK,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {section.subSection?.length || 0} lectures
                  </div>
                </div>
              </div>

              {/* Subsection List */}
              <div style={{ padding: '8px 0' }}>
                {section.subSection?.map((ss, idx) => {
                  const active = isActive(section._id, ss._id);
                  const completed = isCompleted(ss._id);
                  
                  return (
                    <button
                      key={ss._id}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '12px 24px',
                        border: 'none',
                        backgroundColor: active ? ED_TEAL_LIGHT : 'transparent',
                        color: active ? ED_TEAL_DARK : TEXT_DARK,
                        fontSize: '0.875rem',
                        fontWeight: active ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        borderLeft: active ? `4px solid ${ED_TEAL}` : '4px solid transparent',
                        position: 'relative'
                      }}
                      onClick={() => navigate(`/viewcourse/${courseId}/${section._id}/${ss._id}`)}
                      onMouseOver={(e) => {
                        if (!active) {
                          e.target.style.backgroundColor = BG_LIGHT;
                          e.target.style.borderLeftColor = ED_TEAL_LIGHT;
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!active) {
                          e.target.style.backgroundColor = 'transparent';
                          e.target.style.borderLeftColor = 'transparent';
                        }
                      }}
                    >
                      {/* Lecture Number */}
                      <span style={{
                        minWidth: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: completed ? SUCCESS_GREEN : (active ? ED_TEAL : BORDER),
                        color: completed || active ? WHITE : TEXT_LIGHT,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {completed ? '✓' : idx + 1}
                      </span>

                      {/* Lecture Title */}
                      <span style={{
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        lineHeight: '1.4'
                      }}>
                        {ss.title}
                      </span>

                      {/* Status Indicators */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {completed && (
                          <div style={{
                            backgroundColor: SUCCESS_LIGHT,
                            color: SUCCESS_GREEN,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.6875rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Done
                          </div>
                        )}
                        {active && (
                          <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: ED_TEAL,
                            animation: 'pulse 2s infinite'
                          }} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Styles */}
      <style jsx>{`
        /* Custom scrollbar */
        div::-webkit-scrollbar {
          width: 6px;
        }
        
        div::-webkit-scrollbar-track {
          background: ${BG_LIGHT};
        }
        
        div::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, ${ED_TEAL} 0%, ${ED_TEAL_DARK} 100%);
          border-radius: 3px;
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: ${ED_TEAL_DARK};
        }

        /* Pulse animation for active indicator */
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Smooth transitions */
        button {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        /* Focus styles for accessibility */
        button:focus {
          outline: 2px solid ${ED_TEAL} !important;
          outline-offset: -2px !important;
        }

        /* Mobile responsiveness */
        @media (max-width: 768px) {
          button {
            padding: 10px 16px !important;
            font-size: 0.8125rem !important;
          }
        }
      `}</style>
    </>
  );
};

export default VideoDetailsSidebar;
