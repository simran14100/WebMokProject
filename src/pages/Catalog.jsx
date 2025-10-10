import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Footer from "../components/common/Footer";
import CourseCard from "../components/core/Catalog/Course_Card";
import CourseSlider from "../components/core/Catalog/Course_Slider";
import { apiConnector } from "../services/apiConnector";
import { subCategory } from "../services/apis";
import { getCatalogPageData } from "../services/operations/courseDetailsAPI";
import pageHeaderShape1 from '../assets/img/shapes/page-header-shape-1.png';
import pageHeaderShape2 from '../assets/img/shapes/page-header-shape-2.png';
import pageHeaderShape3 from '../assets/img/shapes/page-header-shape-3.png';
import { getAllCourses, fetchCourseCategories } from '../services/operations/courseDetailsAPI';
import { Link } from "react-router-dom";
import pageHeaderBg from '../assets/img/bg-img/page-header-bg.png';
import { motion } from 'framer-motion';

// import Error from "../components/common/Error";

function Catalog() {
  const { loading } = useSelector((state) => state.profile);
  const { catalogName } = useParams();
  const [active, setActive] = useState(1);
  const [catalogPageData, setCatalogPageData] = useState(null);
  const [categoryId, setCategoryId] = useState("");
  const [topClassCourses, setTopClassCourses] = useState([]);
  const [isLoadingTopClass, setIsLoadingTopClass] = useState(true);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [trendingCourses, setTrendingCourses] = useState([]);

  const ED_TEAL = '#07A698';
  const ED_TEAL_DARK = '#059a8c';
   
  // Fetch all courses and filter them for different sections
  useEffect(() => {
    const fetchAllCourses = async () => {
      try {
        console.log("Fetching all courses...");
        const allCoursesData = await getAllCourses();
        console.log("All courses fetched:", allCoursesData);
        
        if (allCoursesData && Array.isArray(allCoursesData)) {
          // Filter for trending courses (most selling - based on studentsEnrolled)
          const trendingData = allCoursesData
            .sort((a, b) => (b.studentsEnrolled?.length || 0) - (a.studentsEnrolled?.length || 0))
            .slice(0, 4);
          setTrendingCourses(trendingData);
          
          // Filter for top class courses (based on rating, allow some overlap if needed)
          const topClassData = allCoursesData
            .sort((a, b) => {
              const ratingA = a.ratingAndReviews?.length > 0 
                ? a.ratingAndReviews.reduce((sum, review) => sum + review.rating, 0) / a.ratingAndReviews.length 
                : 0;
              const ratingB = b.ratingAndReviews?.length > 0 
                ? b.ratingAndReviews.reduce((sum, review) => sum + review.rating, 0) / b.ratingAndReviews.length 
                : 0;
              return ratingB - ratingA;
            })
            .slice(0, 3);
          setTopClassCourses(topClassData);
        } else {
          setTrendingCourses([]);
          setTopClassCourses([]);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        setTrendingCourses([]);
        setTopClassCourses([]);
      } finally {
        setIsLoadingTrending(false);
        setIsLoadingTopClass(false);
      }
    };
  
    fetchAllCourses();
  }, []);
  
  // Helper function to format duration
  const formatDuration = (seconds) => {
    if (!seconds) return "0 Hours";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}.${Math.round(minutes / 60 * 10)} Hours`;
    }
    return `${minutes} Minutes`;
  };
  
  // Fetch all SubCategories and resolve subCategoryId from URL param
  useEffect(() => {
    (async () => {
      try {
        const res = await apiConnector("GET", subCategory.SHOW_ALL_SUBCATEGORIES_API);
        console.log("Fetched subcategories:", res?.data?.data);
        const slugify = str => str.split(" ").join("-").toLowerCase();
        const subcat = res?.data?.data?.find(
          (sc) => slugify(sc.name) === slugify(catalogName) || sc._id === catalogName
        );
        console.log("Matched subcategory:", subcat);
        if (subcat?._id) {
          setCategoryId(subcat._id);
          return;
        }

        // Fallback: URL may be a parent category slug/ID. Resolve to first subcategory of that category.
        console.log("No direct subcategory match. Trying parent category fallback for:", catalogName);
        const categories = await fetchCourseCategories();
        const matchedCategory = categories?.find(
          (c) => slugify(c.name) === slugify(catalogName) || c._id === catalogName
        );
        if (matchedCategory?._id) {
          try {
            const subsRes = await apiConnector(
              "GET",
              `${subCategory.GET_SUBCATEGORIES_BY_PARENT_API}/${matchedCategory._id}`
            );
            const subs = subsRes?.data?.data || subsRes?.data || [];
            console.log("Fetched subcategories for category:", matchedCategory._id, subs);
            if (Array.isArray(subs) && subs.length > 0) {
              setCategoryId(subs[0]?._id || "");
              return;
            }
          } catch (e) {
            console.log("Failed to fetch subcategories for category fallback", e);
          }
        }
        // If still nothing, clear id to avoid erroneous fetch loop
        setCategoryId("");
      } catch (error) {
        console.log("Could not fetch SubCategories.", error);
      }
    })();
  }, [catalogName]);

  const getCourseThumbnail = (course) => {
    if (course.thumbnail) {
      return course.thumbnail;
    }
    // Fallback to default course images based on index
    const defaultImages = [
      "/assets/img/service/course-img-4.png",
      "/assets/img/service/course-img-5.png",
      "/assets/img/service/course-img-6.png",
      "/assets/img/service/course-img-7.png"
    ];
    return defaultImages[Math.floor(Math.random() * defaultImages.length)];
  };
  // Fetch Catalog Page Data (by subCategoryId)
  useEffect(() => {
    if (categoryId) {
      console.log("Fetching catalog page data for subCategoryId:", categoryId);
      (async () => {
        try {
          const res = await getCatalogPageData(categoryId);
          console.log("Catalog page API response:", res);
          setCatalogPageData(res);
        } catch (error) {
          console.log(error);
        }
      })();
    } else {
      console.log("No subCategoryId found, skipping catalog page data fetch.");
    }
  }, [categoryId]);

  console.log("catalogPageData before render:", catalogPageData);

  if (loading || !catalogPageData) {
    return (
      <div className="grid min-h-[calc(100vh-3.5rem)] place-items-center bg-white">
        <div className="spinner"></div>
      </div>
    );
  }
  // Handle API errors and no courses found cases
  if (!loading && (!catalogPageData?.success || !catalogPageData?.data?.selectedCategory?.courses?.length)) {
    const errorTitle = catalogPageData?.success ? 'No Courses Available' : 'Unable to Load Courses';
    const errorMessage = catalogPageData?.message || 'We couldn\'t find any courses matching your selection.';
    const isNoCoursesError = catalogPageData?.message?.includes('No courses found');
    
    return (
      <div className="min-h-[calc(100vh-3.5rem)] bg-gradient-to-b from-gray-50 to-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-8 md:p-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-5">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{errorTitle}</h2>
              <p className="text-gray-600 mb-8 max-w-lg mx-auto">
                {errorMessage} {isNoCoursesError && 'Please check back later or explore other categories.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/courses"
                  className="px-6 py-3 bg-edu-teal hover:bg-edu-teal-dark text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                >
                  Browse All Courses
                </Link>
                <Link
                  to="/"
                  className="px-6 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                >
                  Back to Home
                </Link>
              </div>
              
              {/* Debug Information - Only shown in development */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-10 border-t border-gray-100 pt-6">
                  <button 
                    onClick={() => document.getElementById('debug-details').classList.toggle('hidden')}
                    className="text-sm text-gray-500 hover:text-gray-700 flex items-center justify-center mx-auto mb-3"
                  >
                    <span>Technical Details</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div id="debug-details" className="hidden bg-gray-50 p-4 rounded-lg text-left text-xs text-gray-500 overflow-x-auto">
                    <pre className="whitespace-pre-wrap break-words font-mono">
                      {JSON.stringify({
                        status: catalogPageData?.success ? 'success' : 'error',
                        categoryId,
                        categoryFound: !!catalogPageData?.data?.selectedCategory,
                        coursesAvailable: catalogPageData?.data?.selectedCategory?.courses?.length || 0,
                        timestamp: new Date().toISOString(),
                        ...(catalogPageData?.message && { message: catalogPageData.message })
                      }, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
              
              <Link
                to="/courses"
                className="px-6 py-3 bg-edu-teal text-white rounded-md hover:bg-edu-teal-dark transition-colors duration-200"
              >
                Browse All Courses
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper to get at least 2 courses from a main array, then fill from others if needed
  function getAtLeastTwoCourses(main, ...others) {
    if (main.length >= 2) return main.slice(0, 2);
    const combined = [...main, ...others.flat()];
    // Remove duplicates by _id
    const unique = [];
    const seen = new Set();
    for (const c of combined) {
      if (c && c._id && !seen.has(c._id)) {
        unique.push(c);
        seen.add(c._id);
      }
      if (unique.length === 2) break;
    }
    return unique;
  }

  // Prepare all available courses
  const allCourses = [
    ...(catalogPageData?.data?.selectedCategory?.courses || []),
    ...(catalogPageData?.data?.differentCategory?.courses || []),
    ...(catalogPageData?.data?.mostSellingCourses || []),
  ];

  // For 'Courses to get you started' -> strictly selected subcategory courses
  const startedCourses = (
    catalogPageData?.data?.selectedCategory?.courses || []
  );

  // For 'Top courses in ...' -> strictly different category courses
  const topCourses = (
    catalogPageData?.data?.differentCategory?.courses || []
  );

  return (
    <>    

     <section style={{ 
                position: 'relative', 
                padding: '100px 0 60px', 
                overflow: 'hidden',
                backgroundImage: `url(${pageHeaderBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                marginTop: '8rem'
              }}>
                {/* Background Overlay */}
                <div style={{ 
                  position: 'absolute', 
                  inset: 0, 
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  backdropFilter: 'blur(1px)'
                }}></div>
                
                {/* Decorative Elements */}
                <div style={{ position: 'absolute', inset: 0 }}>
                  {/* Orange Triangle */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '50px', 
                    left: '80px',
                    width: '0',
                    height: '0',
                    borderLeft: '20px solid transparent',
                    borderRight: '20px solid transparent',
                    borderBottom: '35px solid #f59e0b',
                    transform: 'rotate(35deg)',
                    opacity: 0.9,
                    zIndex: 3
                  }}></div>
                  
                  {/* Dashed Circle */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '20px', 
                    left: '20px',
                    width: '100px',
                    height: '100px',
                    border: '2px dashed #9ca3af',
                    borderRadius: '50%',
                    opacity: 0.6,
                    zIndex: 10
                  }}></div>
                  
                  {/* Green Circles Pattern on Right */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '30px', 
                    right: '150px',
                    width: '60px',
                    height: '60px',
                    background: `linear-gradient(135deg, ${ED_TEAL}, ${ED_TEAL_DARK})`,
                    borderRadius: '50%',
                    opacity: 0.8,
                    zIndex: 3
                  }}></div>
                  
                  <div style={{ 
                    position: 'absolute', 
                    top: '100px', 
                    right: '80px',
                    width: '90px',
                    height: '90px',
                    background: `linear-gradient(135deg, ${ED_TEAL}, ${ED_TEAL_DARK})`,
                    borderRadius: '50%',
                    opacity: 0.5,
                    zIndex: 2
                  }}></div>
                  
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '20px', 
                    right: '200px',
                    width: '40px',
                    height: '40px',
                    background: ED_TEAL,
                    borderRadius: '50%',
                    opacity: 0.7,
                    zIndex: 3
                  }}></div>
                  
                  {/* Diagonal Stripes Pattern on Far Right */}
                  <div style={{ 
                    position: 'absolute', 
                    top: '0', 
                    right: '0',
                    width: '150px',
                    height: '100%',
                    background: `repeating-linear-gradient(
                      45deg,
                      transparent,
                      transparent 6px,
                      ${ED_TEAL} 6px,
                      ${ED_TEAL} 9px
                    )`,
                    opacity: 0.15,
                    zIndex: 1
                  }}></div>
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
      {/* Breadcrumb Navigation */}
     <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  color: '#6b7280',
                  fontSize: '16px',
                  fontWeight: '500'
                }}>
                  <span style={{ 
                    color: '#6b7280', 
                    textDecoration: 'none',
                    textTransform: 'uppercase',
                    transition: 'color 0.3s',
                    cursor: 'pointer'
                  }}>
                    Home
                  </span>
                  <span style={{
                    color: ED_TEAL,
                  
                    fontWeight: '600'
                  }}>/</span>
                  <span style={{ 
                    // color: ED_TEAL,
                      color: '#6b7280', 
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}>
                    CATALOG
                  </span>  
                  <span style={{
                    color: ED_TEAL,
                    fontWeight: '600'
                  }}>/</span>
               <span   style={{ 
                    color: ED_TEAL,
                    fontWeight: '600',
                    textTransform: 'uppercase',
                  }}
               > {catalogPageData?.data?.selectedCategory?.name}</span>

                </div>
      
      {/* Main Title */}
      <h1 style={{ 
                  fontSize: '48px', 
                  fontWeight: '800', 
                  color: '#1f2937', 
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
                 {catalogPageData?.data?.selectedCategory?.name}
                  
                </h1>
      
      {/* Description */}
      <p style={{ 
        maxWidth: '600px',
        color: 'rgba(255,255,255,0.9)',
        fontSize: '18px',
        lineHeight: '1.6',
        margin: 0,
        color: ED_TEAL,
         fontWeight: '600'
      }}>
        {catalogPageData?.data?.selectedCategory?.description}
      </p>
    </div>
  </div>
                {/* Bottom subtle border */}
                <div style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  height: '1px',
                  background: 'linear-gradient(to right, transparent, #e5e7eb, transparent)'
                }}></div>
              </section>
      {/* Hero Section */}
      <div className="bg-white  border-gray-200  ">
           {/* Page Header */}




    {/* Top Class Courses Section */}
      <motion.section 
        className="course-section pt-120 pb-120"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        style={{ backgroundColor: '#f8f9fa' }}
      >
        <div className="container">
          <motion.div 
            className="section-heading text-center mb-60"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h4 style={{ 
              color: '#000000', 
              textTransform: 'none', 
              fontWeight: 'normal',
              backgroundColor: '#ffffff',
              padding: '6px 14px',
              borderRadius: '30px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
              border: '1px solid #c0c0c0',
              marginBottom: '10px'
            }}>
              <span style={{
                backgroundColor: '#07A698',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                marginRight:'2px'
              }}>
                <i className="fa-sharp fa-solid fa-bolt" style={{ color: '#ffffff', fontSize: '16px' , marginRight:'-2px' }}></i>
              </span>
              Top Class Courses
            </h4>
                        <h2 style={{ 
              color: '#191A1F', 
              fontSize: '48px', 
              fontWeight: '700', 
              marginBottom: '20px',
              lineHeight: '1.2'
            }}>
              Explore  Featured Courses
            </h2>
            
          </motion.div>

          <div className="row gy-4">
            {(catalogPageData?.data?.selectedCategory?.courses || []).length > 0 ? (
              (catalogPageData.data.selectedCategory.courses).map((course, index) => (
                <div key={course._id || index} className="col-xl-4 col-lg-6 col-md-6">
                  <motion.div 
                    className="course-item course-item-2"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    style={{
                      padding: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #E8ECF0',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
                      transition: 'all 0.3s ease',
                      height: '100%'
                    }}
                  >
                    {/* Course Thumbnail */}
                    <div className="course-thumb-wrap" style={{ padding: '20px', height: '300px', width: '100%' }}>
                      <div className="course-thumb" style={{ height: '100%', width: '100%', borderRadius: '12px 12px 12px 12px' }}>
                        <img 
                          src={getCourseThumbnail(course)} 
                          alt={course.courseName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px 12px 0 0' }}
                        />
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="course-content-wrap" style={{ padding: '20px', flex: 1  , marginTop:'2px'}}>
                      <div className="course-content">
                        {/* Free Badge */}
                        <span className="offer" style={{ 
                          backgroundColor: '#07A698', 
                          color: '#ffffff',
                          padding: '4px 12px',
                          borderRadius: '15px',
                          fontSize: '12px',
                          fontWeight: '600',
                          display: 'inline-block',
                          marginBottom: '10px'
                        }}>
                          {course.price === 0 ? 'Free' : `₹${course.price}`}
                        </span>
                        
                        <h3 className="title" style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#191A1F',
                          marginBottom: '10px',
                          lineHeight: '1.3'
                        }}>
                          <Link to={`/course/${course._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                            {course.courseName}
                          </Link>
                        </h3>
                        
                        <ul className="course-list" style={{ 
                          listStyle: 'none', 
                          padding: 0, 
                          margin: '0 0 15px 0',
                          display: 'flex',
                          gap: '15px'
                        }}>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666', fontSize: '14px' }}>
                            <i className="fa-light fa-file" style={{ color: '#07A698' }}></i>
                            Lesson {course.courseContent?.length || 0}
                          </li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666', fontSize: '14px' }}>
                            <i className="fa-light fa-user" style={{ color: '#07A698' }}></i>
                            Students {course.studentsEnrolled?.length || 0}
                          </li>
                          <li style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#666', fontSize: '14px' }}>
                            <i className="fa-light fa-eye" style={{ color: '#07A698' }}></i>
                            View: 12K
                          </li>
                        </ul>
                        
                        <div className="course-author-box" style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          gap: '10px' 
                        }}>
                          <div className="course-author" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="author-img">
                              <img src="/assets/img/images/course-author-1.png" alt="course" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                            </div>
                            <div className="author-info">
                              <h4 className="name" style={{ 
                                fontSize: '14px', 
                                fontWeight: '600', 
                                color: '#191A1F', 
                                margin: '0 0 2px 0' 
                              }}>
                                {course.instructor?.firstName} {course.instructor?.lastName || "Instructor"}
                              </h4>
                              <span style={{ fontSize: '12px', color: '#666' }}>Instructor</span>
                            </div>
                          </div>
                          <ul className="course-review" style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '2px', 
                            margin: 0, 
                            padding: 0, 
                            listStyle: 'none' 
                          }}>
                            <li><i className="fa-sharp fa-solid fa-star" style={{ color: '#FFD700' }}></i></li>
                            <li><i className="fa-sharp fa-solid fa-star" style={{ color: '#FFD700' }}></i></li>
                            <li><i className="fa-sharp fa-solid fa-star" style={{ color: '#FFD700' }}></i></li>
                            <li><i className="fa-sharp fa-solid fa-star" style={{ color: '#FFD700' }}></i></li>
                            <li><i className="fa-sharp fa-solid fa-star" style={{ color: '#FFD700' }}></i></li>
                            <li className="point" style={{ marginLeft: '5px', color: '#666', fontSize: '14px' }}>(4.7)</li>
                          </ul>
                        </div>
                      </div>
                                            <div className="bottom-content" style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0 20px 15px 20px',
                        marginTop: 'auto'
                      }}>
                        <span className="price" style={{ 
                          color: '#191A1F',
                          fontSize: '20px',
                          fontWeight: '700'
                        }}>
                          ₹{course.price || 'Free'}
                        </span>
                        <Link to={`/course/${course._id}`} className="course-btn" style={{
                          color: '#191A1F',
                          fontSize: '16px',
                          fontWeight: '600',
                          padding: '5px 20px',
                          border: '1px solid #E0E5EB',
                          borderRadius: '100px',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.border = '1px solid #07A698';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.border = '1px solid #E0E5EB';
                        }}>
                          View Details
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <div style={{ color: '#666', fontSize: '18px', padding: '40px 0' }}>
                  No courses available
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.section>

      






      </div>
     

     

     
      

      <Footer />
    </>
  );
}

export default Catalog;