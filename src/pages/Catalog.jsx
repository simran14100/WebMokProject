import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import Footer from "../components/common/Footer";
import CourseCard from "../components/core/Catalog/Course_Card";
import CourseSlider from "../components/core/Catalog/Course_Slider";
import { apiConnector } from "../services/apiConnector";
import { categories } from "../services/apis";
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
   
  // Fetch All Categories and get categoryId
  useEffect(() => {
    (async () => {
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API);
        console.log("Fetched categories:", res?.data?.data);
        const slugify = str => str.split(" ").join("-").toLowerCase();
        const category = res?.data?.data?.find(
          (ct) => slugify(ct.name) === slugify(catalogName) || ct._id === catalogName
        );
        console.log("Matched category:", category);
        setCategoryId(category?._id || "");
      } catch (error) {
        console.log("Could not fetch Categories.", error);
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
  // Fetch Catalog Page Data
  useEffect(() => {
    if (categoryId) {
      console.log("Fetching catalog page data for categoryId:", categoryId);
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
      console.log("No categoryId found, skipping catalog page data fetch.");
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
  if (!loading && !catalogPageData.success) {
    return <div className="text-center text-red-500 py-10 bg-white">An error occurred while loading the catalog page.</div>;
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

  // For 'Courses to get you started'
  const startedCourses = getAtLeastTwoCourses(
    catalogPageData?.data?.selectedCategory?.courses || [],
    allCourses
  );

  // For 'Top courses in ...'
  const topCourses = getAtLeastTwoCourses(
    catalogPageData?.data?.differentCategory?.courses || [],
    allCourses
  );

  return (
    <>    
      {/* Hero Section */}
      <div className="bg-white  border-gray-200  ">
           {/* Page Header */}
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
          Catalog
        </Link>
        <span>/</span>
        <span style={{ 
          color: 'white',
          fontWeight: '600'
        }}>
          {catalogPageData?.data?.selectedCategory?.name}
        </span>
      </div>
      
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
        {catalogPageData?.data?.selectedCategory?.name}
      </h1>
      
      {/* Description */}
      <p style={{ 
        maxWidth: '600px',
        color: 'rgba(255,255,255,0.9)',
        fontSize: '18px',
        lineHeight: '1.6',
        margin: 0
      }}>
        {catalogPageData?.data?.selectedCategory?.description}
      </p>
    </div>
  </div>
</section>

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
            {isLoadingTopClass ? (
              <div className="col-12 text-center">
                <div style={{ color: '#666', fontSize: '18px', padding: '40px 0' }}>
                  Loading top class courses...
                </div>
              </div>
            ) : topClassCourses.length > 0 ? (
              topClassCourses.map((course, index) => (
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
             {catalogPageData?.data?.mostSellingCourses?.slice(0, 5).length ? (
        catalogPageData.data.mostSellingCourses.slice(0, 6).map((course, index) => (
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