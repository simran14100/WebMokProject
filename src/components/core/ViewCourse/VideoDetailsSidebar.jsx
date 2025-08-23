import React from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

const VideoDetailsSidebar = () => {
  const navigate = useNavigate();
  const { courseId, sectionId, subsectionId } = useParams();
  const { courseSectionData, completedLectures } = useSelector(
    (state) => state.viewCourse
  );

  const isActive = (sid, ssid) => sid === sectionId && ssid === subsectionId;
  const isCompleted = (ssid) => completedLectures?.includes(ssid);

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b text-gray-900 font-semibold">
        Course Content
      </div>
      <div className="max-h-[70vh] overflow-y-auto p-2">
        {courseSectionData?.map((section, sIdx) => (
          <div key={section._id} className="mb-2">
            <div className="px-3 py-2 text-sm font-medium text-gray-700">
              Section {sIdx + 1}: {section.sectionName}
            </div>
            <div className="flex flex-col gap-1">
              {section.subSection?.map((ss, idx) => (
                <button
                  key={ss._id}
                  className={`text-left px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                    isActive(section._id, ss._id)
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                  onClick={() => navigate(`/viewcourse/${courseId}/${section._id}/${ss._id}`)}
                >
                  <span className="w-5 text-center text-xs text-gray-500">
                    {idx + 1}.
                  </span>
                  <span className="flex-1 truncate">{ss.title}</span>
                  {isCompleted(ss._id) && (
                    <span className="text-emerald-600 text-xs font-semibold">Completed</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoDetailsSidebar;
