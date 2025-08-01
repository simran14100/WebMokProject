import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ScreenshotProtection from '../components/common/ScreenshotProtection';
import CourseVideoPlayer from '../components/core/CourseViewer/CourseVideoPlayer';
import { apiConnector } from '../services/apiConnector';
import { course as courseApi } from '../services/apis';
import { toast } from 'react-hot-toast';

const CourseViewer = () => {
  const { courseId, sectionId, subsectionId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  
  const [course, setCourse] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [currentSubsection, setCurrentSubsection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourseDetails();
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const response = await apiConnector(
        'POST',
        courseApi.GET_FULL_COURSE_DETAILS_AUTHENTICATED,
        { courseId },
        { Authorization: `Bearer ${token}` }
      );

      if (response.data?.success) {
        const courseData = response.data.data.courseDetails;
        setCourse(courseData);
        
        // Find current section and subsection
        if (sectionId && subsectionId) {
          const section = courseData.courseContent?.find(s => s._id === sectionId);
          const subsection = section?.subSection?.find(ss => ss._id === subsectionId);
          
          setCurrentSection(section);
          setCurrentSubsection(subsection);
        }
      } else {
        setError('Failed to load course details');
      }
    } catch (err) {
      console.error('Error fetching course:', err);
      setError('Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  const handleVideoComplete = async () => {
    try {
      // Mark video as completed
      const response = await apiConnector(
        'POST',
        courseApi.LECTURE_COMPLETION_API,
        {
          courseId,
          subsectionId: currentSubsection._id
        },
        { Authorization: `Bearer ${token}` }
      );

      if (response.data?.success) {
        toast.success('Video marked as completed!');
      }
    } catch (err) {
      console.error('Error marking video complete:', err);
    }
  };

  const handleVideoProgress = (currentTime, duration) => {
    // Track progress if needed
    console.log(`Progress: ${currentTime}/${duration}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-600 mb-4">Course not found</h2>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <ScreenshotProtection enabled={true}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.courseName}</h1>
                <p className="text-gray-600 mt-1">Course Tutorial</p>
              </div>
              <button 
                onClick={() => navigate(-1)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
              >
                Back to Course
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2">
              {currentSubsection ? (
                <CourseVideoPlayer
                  courseId={courseId}
                  subsectionId={currentSubsection._id}
                  title={currentSubsection.title}
                  description={currentSubsection.description}
                  onComplete={handleVideoComplete}
                  onProgress={handleVideoProgress}
                  enableProtection={true}
                />
              ) : (
                <div className="bg-white rounded-lg p-8 text-center">
                  <p className="text-gray-600">Select a video to start learning</p>
                </div>
              )}
            </div>

            {/* Course Content Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Content</h3>
                
                {course.courseContent?.map((section, sectionIndex) => (
                  <div key={section._id} className="mb-4">
                    <h4 className="font-medium text-gray-800 mb-2">
                      Section {sectionIndex + 1}: {section.sectionName}
                    </h4>
                    
                    <div className="space-y-1">
                      {section.subSection?.map((subsection, subsectionIndex) => (
                        <button
                          key={subsection._id}
                          onClick={() => {
                            setCurrentSection(section);
                            setCurrentSubsection(subsection);
                            navigate(`/course/${courseId}/${section._id}/${subsection._id}`);
                          }}
                          className={`w-full text-left p-2 rounded text-sm transition-colors ${
                            currentSubsection?._id === subsection._id
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center">
                            <span className="mr-2">
                              {subsectionIndex + 1}.
                            </span>
                            <span className="truncate">{subsection.title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </ScreenshotProtection>
  );
};

export default CourseViewer;