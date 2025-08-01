import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { fetchCourseDetails, getFullDetailsOfCourse } from '../services/operations/courseDetailsAPI';
import { buyCourse } from '../services/operations/coursePaymentApi';
import { VscStarFull, VscStarEmpty, VscPerson, VscCalendar, VscBook } from 'react-icons/vsc';
import { toast } from 'react-hot-toast';

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const { user } = useSelector((state) => state.profile);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [paymentVerificationFailed, setPaymentVerificationFailed] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        console.log('Fetching course with ID:', courseId);
        
        // Try to get full course details first (requires authentication)
        let result;
        if (token) {
          try {
            result = await getFullDetailsOfCourse(courseId, token);
            console.log('Full course details result:', result);
          } catch (error) {
            console.log('Full course details failed, trying basic details:', error);
            result = await fetchCourseDetails(courseId);
          }
        } else {
          // If no token, use basic course details
          result = await fetchCourseDetails(courseId);
        }
        
        console.log('Course fetch result:', result);
        if (result?.courseDetails) {
          // API returned data directly without success wrapper
          setCourse(result);
        } else if (result?.success) {
          // API returned data with success wrapper
          setCourse(result.data);
        } else {
          console.error('Failed to fetch course:', result);
          toast.error(result?.message || 'Failed to fetch course details');
        }
      } catch (error) {
        console.error('Error fetching course:', error);
        toast.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourse();
    }
  }, [courseId, token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const { courseDetails, totalDuration } = course;
  const instructor = courseDetails.instructor;
  const category = courseDetails.category;

  // Calculate total lectures
  const totalLectures = courseDetails.courseContent?.reduce((total, section) => {
    return total + (section.subSection?.length || 0);
  }, 0) || 0;

  // Calculate average rating
  const averageRating = courseDetails.ratingAndReviews?.length > 0 
    ? courseDetails.ratingAndReviews.reduce((sum, review) => sum + review.rating, 0) / courseDetails.ratingAndReviews.length 
    : 0;

  // Enhanced enrollment check - also check if user has this course in their enrolled courses
  const isUserEnrolled = enrollmentStatus || 
    courseDetails.studentsEnrolled?.some(student => student._id === user?._id) || 
    user?.courses?.includes(courseId) || 
    false;

  // Debug enrollment status
  console.log('Enrollment Debug:', {
    enrollmentStatus,
    userEnrolledCourses: user?.courses,
    courseId,
    studentsEnrolled: courseDetails.studentsEnrolled,
    isUserInStudentsEnrolled: courseDetails.studentsEnrolled?.some(student => student._id === user?._id),
    isUserEnrolledInCourse: user?.courses?.includes(courseId),
    finalIsEnrolled: isUserEnrolled
  });

  // Handle course purchase
  const handleBuyCourse = async () => {
    if (!token) {
      toast.error('Please login to purchase this course');
      navigate('/login');
      return;
    }

    if (user?.accountType !== 'Student') {
      toast.error('Only students can purchase courses');
      return;
    }

    if (!user?.enrollmentFeePaid) {
      toast.error('Please complete enrollment fee payment before purchasing courses');
      navigate('/enrollment-payment');
      return;
    }

    if (isUserEnrolled) {

        // Navigate to active courses page instead of course viewer
      navigate('/dashboard/active-courses');
      return;
    }

    try {
      await buyCourse(
        token, 
        user, 
        courseId, 
        courseDetails.courseName, 
        courseDetails.price, 
        navigate,
        (paymentData) => {
          // Callback when payment verification fails
          setPaymentVerificationFailed(true);
          console.log('Payment verification failed, payment data:', paymentData);
        }
      );
    } catch (error) {
      console.error('Error purchasing course:', error);
      
      // Check if the error is about student already being enrolled
      if (error.message && error.message.includes('Student is already Enrolled')) {
        toast.info('You are already enrolled in this course!');
        // Update the enrollment status and navigate to active courses
        setEnrollmentStatus(true);
        navigate('/dashboard/active-courses');
        return;
      }
      
      toast.error('Failed to process payment');
    }
  };

  // Handle manual payment verification
  const handleManualVerification = () => {
    toast.info('Please contact support with your payment details for manual verification.');
    // You could also open a modal or navigate to a support page
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        i <= rating ? (
          <VscStarFull key={i} className="text-yellow-400 w-5 h-5" />
        ) : (
          <VscStarEmpty key={i} className="text-gray-300 w-5 h-5" />
        )
      );
    }
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumbs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <button 
                  onClick={() => navigate('/')}
                  className="text-gray-500 hover:text-gray-700 text-sm font-medium"
                >
                  Courses
                </button>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-500 text-sm font-medium">{category?.name || 'Category'}</span>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <span className="text-gray-400 mx-2">/</span>
                  <span className="text-gray-900 text-sm font-medium truncate max-w-xs">
                    {courseDetails.courseName}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Category Tag */}
            <div className="mb-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {category?.name || 'Web Design'}
              </span>
            </div>

            {/* Course Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              {courseDetails.courseName}
            </h1>

            {/* Course Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Teacher */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <VscPerson className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Teacher</p>
                  <p className="text-sm text-gray-600">
                    {instructor?.firstName} {instructor?.lastName}
                  </p>
                </div>
              </div>

              {/* Category */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <VscBook className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Category</p>
                  <p className="text-sm text-gray-600">{category?.name || 'Web Design'}</p>
                </div>
              </div>

              {/* Last Updated */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <VscCalendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Updated</p>
                  <p className="text-sm text-gray-600">
                    {new Date(courseDetails.updatedAt || courseDetails.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <VscStarFull className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Rating</p>
                  <div className="flex items-center space-x-1">
                    {renderStars(averageRating)}
                    <span className="text-sm text-gray-600 ml-1">
                      {averageRating.toFixed(1)}/5
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('info')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'info'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Course Info
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'reviews'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Reviews
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="mb-8">
              {activeTab === 'info' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">About Course</h3>
                  <p className="text-gray-700 leading-relaxed">
                    {courseDetails.courseDescription || 'No description available for this course.'}
                  </p>
                  
                  {courseDetails.whatYouWillLearn && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">What You Will Learn</h4>
                      <p className="text-gray-700">{courseDetails.whatYouWillLearn}</p>
                    </div>
                  )}

                  {courseDetails.instructions && courseDetails.instructions.length > 0 && (
                    <div className="mt-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h4>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {courseDetails.instructions.map((instruction, index) => (
                          <li key={index}>{instruction}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Student Reviews</h3>
                  {courseDetails.ratingAndReviews && courseDetails.ratingAndReviews.length > 0 ? (
                    <div className="space-y-4">
                      {courseDetails.ratingAndReviews.map((review, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">
                                  {review.user?.firstName?.[0] || 'U'}
                                </span>
                              </div>
                              <span className="font-medium text-gray-900">
                                {review.user?.firstName} {review.user?.lastName}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                          <p className="text-gray-700">{review.review}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No reviews yet. Be the first to review this course!</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Purchase Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden sticky top-8">
              {/* Course Thumbnail */}
              <div className="relative">
                <img
                  src={courseDetails.thumbnail || 'https://via.placeholder.com/400x250?text=Course+Image'}
                  alt={courseDetails.courseName}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              </div>

              {/* Purchase Content */}
              <div className="p-6">
                {/* Course Price */}
                <div className="mb-4">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    ₹{courseDetails.price || 0}
                  </div>
                  <div className="text-sm text-gray-600">
                    {isUserEnrolled ? 'Already purchased' : 'One-time payment'}
                  </div>
                </div>

                {/* Buy Course Button */}
                <button
                  onClick={handleBuyCourse}
                  className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors duration-200 mb-6 ${
                    isUserEnrolled 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {isUserEnrolled 
                    ? 'Go to Course' 
                    : `Buy This Course - ₹${courseDetails.price || 0}`
                  }
                </button>

                {/* Manual Verification Button (shown when payment verification fails) */}
                {paymentVerificationFailed && (
                  <button
                    onClick={handleManualVerification}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 mb-4 text-sm"
                  >
                    Payment Verification Failed - Contact Support
                  </button>
                )}

                {/* Course Includes */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">This course includes:</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                        <VscBook className="w-4 h-4 text-green-600" />
                      </div>
                      <span className="text-gray-700">Lectures</span>
                      <span className="ml-auto font-medium text-gray-900">{totalLectures}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <VscPerson className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-gray-700">Skill Level</span>
                      <span className="ml-auto font-medium text-gray-900">Beginner</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center">
                        <VscStarFull className="w-4 h-4 text-yellow-600" />
                      </div>
                      <span className="text-gray-700">Certificate</span>
                      <span className="ml-auto font-medium text-gray-900">Yes</span>
                    </div>
                    {totalDuration && (
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                          <VscCalendar className="w-4 h-4 text-purple-600" />
                        </div>
                        <span className="text-gray-700">Duration</span>
                        <span className="ml-auto font-medium text-gray-900">{totalDuration}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-gray-500">🔒 Your payment is secured by Razorpay</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails; 