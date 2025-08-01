import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCourses, fetchCourseCategories } from '../services/operations/courseDetailsAPI';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Home = () => {
  const [trendingCourses, setTrendingCourses] = useState([]);
  const [topClassCourses, setTopClassCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [isLoadingTopClass, setIsLoadingTopClass] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  });

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
            .slice(0, 6);
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

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log("Fetching categories for course categories section...");
        const categoriesData = await fetchCourseCategories();
        console.log("Categories fetched for course categories section:", categoriesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
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

  // Helper function to get course thumbnail
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

  // Helper function to get category icon based on category name
  const getCategoryIcon = (categoryName) => {
    const name = categoryName.toLowerCase();
    
    if (name.includes('python')) {
      return <i className="fab fa-python" style={{ fontSize: '30px', color: '#07A698' }}></i>;
    } else if (name.includes('web') || name.includes('dev')) {
      return <i className="fas fa-code" style={{ fontSize: '30px', color: '#07A698' }}></i>;
    } else if (name.includes('ai') || name.includes('ml')) {
      return <i className="fas fa-brain" style={{ fontSize: '30px', color: '#07A698' }}></i>;
    } else if (name.includes('cyber') || name.includes('security')) {
      return <i className="fas fa-shield-alt" style={{ fontSize: '30px', color: '#07A698' }}></i>;
    } else if (name.includes('digital') || name.includes('marketing')) {
      return <i className="fas fa-bullhorn" style={{ fontSize: '30px', color: '#07A698' }}></i>;
    } else if (name.includes('java')) {
      return <i className="fab fa-java" style={{ fontSize: '30px', color: '#07A698' }}></i>;
    } else if (name.includes('javascript') || name.includes('js')) {
      return <i className="fab fa-js-square" style={{ fontSize: '30px', color: '#07A698' }}></i>;
    } else if (name.includes('react')) {
      return <i className="fab fa-react" style={{ fontSize: '30px', color: '#07A698' }}></i>;
    } else if (name.includes('node')) {
      return <i className="fab fa-node-js" style={{ fontSize: '30px', color: '#07A698' }}></i>;
    } else if (name.includes('database') || name.includes('sql')) {
      return <i className="fas fa-database" style={{ fontSize: '30px', color: '#07A698' }}></i>;
    } else if (name.includes('mobile') || name.includes('app')) {
      return <i className="fas fa-mobile-alt" style={{ fontSize: '30px', color: '#07A698' }}></i>;
    } else if (name.includes('design') || name.includes('ui') || name.includes('ux')) {
      return <i className="fas fa-palette" style={{ fontSize: '30px', color: '#07A698' }}></i>;
    } else if (name.includes('data') || name.includes('analytics')) {
      return <i className="fas fa-chart-bar" style={{ fontSize: '30px', color: '#07A698' }}></i>;
    } else if (name.includes('cloud') || name.includes('aws') || name.includes('azure')) {
      return <i className="fas fa-cloud" style={{ fontSize: '30px', color: '#07A698' }}></i>;
    } else if (name.includes('devops') || name.includes('docker')) {
      return <i className="fab fa-docker" style={{ fontSize: '30px', color: '#07A698' }}></i>;
    } else {
      // Default icon for other categories
      return <i className="fa-solid fa-graduation-cap" style={{ fontSize: '30px', color: '#07A698' }}></i>;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section - Exact EdCare Template */}
      <motion.section 
        className="hero-section-2 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        style={{
          background: 'linear-gradient(180deg, rgba(7, 166, 152, 0.15) 0%, rgba(255, 255, 255, 1) 100%)',
          position: 'relative'
        }}
      >
        {/* Background Elements */}
        <div className="hero-bg-wrap">
          <div className="hero-bg">
            <img src="/assets/img/bg-img/hero-bg.png" alt="hero" />
          </div>
          <div className="hero-bg-shape">
            <img src="/assets/img/shapes/hero-bg-shape.png" alt="hero" />
          </div>
          
          {/* Floating FAQ Text Box */}
          <motion.div 
            className="faq-text-box"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h4 className="student">Instructor</h4>
            <div className="faq-thumb-list-wrap">
              <ul className="faq-thumb-list">
                <li><img src="/assets/img/images/faq-thumb-1.png" alt="faq" /></li>
                <li><img src="/assets/img/images/faq-thumb-2.png" alt="faq" /></li>
                <li><img src="/assets/img/images/faq-thumb-3.png" alt="faq" /></li>
                <li><img src="/assets/img/images/faq-thumb-4.png" alt="faq" /></li>
                <li><img src="/assets/img/images/faq-thumb-5.png" alt="faq" /></li>
                <li className="number">+</li>
              </ul>
              <p><span>200+</span> <br />Instuctor</p>
            </div>
          </motion.div>
          
          {/* Floating Hero Text Box */}
          <motion.div 
            className="hero-text-box"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{
              position: 'absolute',
              right: '74%',
              zIndex: 10
            }}
          > 
            <div className="icon"><i className="fa-solid fa-user"></i></div>
            <div className="content">
              <h5 className="text-title">150K</h5>
              <span>Assisted Students</span>
            </div>
          </motion.div>
        </div>
        
        {/* Background Shapes */}
        <div className="shapes" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1
        }}>
          {/* Abstract curved lines - Sound wave patterns */}
          <div style={{
            position: 'absolute',
            top: '15%',
            left: '8%',
            width: '120px',
            height: '40px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50px',
            transform: 'rotate(-15deg)'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '25%',
            left: '15%',
            width: '80px',
            height: '25px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '50px',
            transform: 'rotate(10deg)'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '35%',
            left: '12%',
            width: '100px',
            height: '30px',
            border: '1px solid rgba(255, 255, 255, 0.13)',
            borderRadius: '50px',
            transform: 'rotate(-8deg)'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '45%',
            left: '10%',
            width: '90px',
            height: '35px',
            border: '1px solid rgba(255, 255, 255, 0.11)',
            borderRadius: '50px',
            transform: 'rotate(5deg)'
          }}></div>
          
          {/* Network connection lines */}
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '25%',
            width: '60px',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.14)',
            transform: 'rotate(25deg)'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '30%',
            left: '20%',
            width: '45px',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            transform: 'rotate(-20deg)'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '40%',
            left: '18%',
            width: '70px',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.13)',
            transform: 'rotate(12deg)'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '22%',
            width: '55px',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.11)',
            transform: 'rotate(-15deg)'
          }}></div>
          
          {/* Subtle curved shapes */}
          <div style={{
            position: 'absolute',
            bottom: '15%',
            left: '8%',
            width: '200px',
            height: '200px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            transform: 'translate(-30%, 30%)'
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '25%',
            left: '20%',
            width: '150px',
            height: '150px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            transform: 'translate(-20%, 20%)'
          }}></div>
          
          {/* Subtle patterns under the heading area */}
          <div style={{
            position: 'absolute',
            top: '30%',
            left: '10%',
            width: '15px',
            height: '15px',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '35%',
            left: '25%',
            width: '12px',
            height: '12px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '28%',
            left: '40%',
            width: '18px',
            height: '18px',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '50%'
          }}></div>
          
          {/* Small subtle dots */}
          <div style={{
            position: 'absolute',
            top: '45%',
            left: '15%',
            width: '3px',
            height: '3px',
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '30%',
            width: '2px',
            height: '2px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '48%',
            left: '45%',
            width: '4px',
            height: '4px',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            borderRadius: '50%'
          }}></div>
          
          {/* Thin subtle lines */}
          <div style={{
            position: 'absolute',
            top: '60%',
            left: '8%',
            width: '25px',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            transform: 'rotate(10deg)'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '65%',
            left: '25%',
            width: '20px',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            transform: 'rotate(-5deg)'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '62%',
            left: '38%',
            width: '22px',
            height: '1px',
            backgroundColor: 'rgba(255, 255, 255, 0.4)',
            transform: 'rotate(8deg)'
          }}></div>
          
          {/* Right side subtle shapes */}
          <div style={{
            position: 'absolute',
            top: '20%',
            right: '25%',
            width: '30px',
            height: '30px',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%'
          }}></div>
          <div style={{
            position: 'absolute',
            top: '40%',
            right: '15%',
            width: '15px',
            height: '15px',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '50%'
          }}></div>
        </div>
        
        {/* Main Content */}
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-7 col-md-12">
              <motion.div 
                className="hero-content-2"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="section-heading mb-20">
                <motion.h4 
                    className="sub-heading text-black"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                  >
                    <span className="heading-icon">
                      <i className="fa-sharp fa-solid fa-bolt"></i>
                    </span>
                    Welcome to WebMok Education
                  </motion.h4>



                  <motion.h2 
                    className="section-title"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                  >
                    Start learning from the <br />
                    world's <span>best sites</span>
                  </motion.h2>
                </div>
                
                <motion.p 
                  className="desc"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus <br/> nec ullamcorper mattis
                </motion.p>
                
                {/* Hero Form - Exact Template Structure */}
                <motion.div 
                  className="hero-form"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                >
                  <form action="#">
                    <input 
                      type="text" 
                      id="text" 
                      name="text" 
                      className="form-control" 
                      placeholder="What do you want to learn today?"
                    />
                  </form>
                  <Link to="/catalog/all">
                    <motion.button 
                      className="ed-primary-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Search Now <i className="fa-regular fa-arrow-right"></i>
                    </motion.button>
                  </Link>
                  <div className="icon">
                    <i className="fa-regular fa-magnifying-glass"></i>
                  </div>
                </motion.div>
                
                {/* About Counter Items */}
                <motion.div 
                  className="about-counter-items mb-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                >
                  <div className="about-counter-item">
                    <div className="icon">
                      <img src="/assets/img/icon/about-1.png" alt="about" />
                    </div>
                    <div className="content">
                      <h3 className="title">
                        <motion.span 
                          className="odometer"
                          initial={{ opacity: 0 }}
                          animate={inView ? { opacity: 1 } : { opacity: 0 }}
                          transition={{ duration: 1, delay: 0.5 }}
                        >
                          9.5K+
                        </motion.span>
                      </h3>
                      <p>Total active students taking <br />gifted courses</p>
                    </div>
                  </div>
                  <div className="about-counter-item">
                    <div className="icon">
                      <img src="/assets/img/icon/about-2.png" alt="about" />
                    </div>
                    <div className="content">
                      <h3 className="title">
                        <motion.span 
                          className="odometer"
                          initial={{ opacity: 0 }}
                          animate={inView ? { opacity: 1 } : { opacity: 0 }}
                          transition={{ duration: 1, delay: 0.7 }}
                        >
                          15.5K+
                        </motion.span>
                      </h3>
                      <p>Total active students taking <br />gifted courses</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Course Section - Dynamic from Backend */}
      <motion.section 
        className="course-section bg-grey pt-120 pb-120"
        ref={ref}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="shapes">
          <motion.div 
            className="shape shape-1"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          >
            <img src="/assets/img/shapes/feature-shape-3.png" alt="shape" />
          </motion.div>
          <motion.div 
            className="shape shape-2"
            animate={{ rotate: -360 }}
            transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          >
            <img src="/assets/img/shapes/feature-shape-4.png" alt="shape" />
          </motion.div>
        </div>
        
        <div className="container">
          <div className="course-top heading-space align-items-end">
            <div className="section-heading mb-0">
              <motion.h4 
                className="sub-heading"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ color: '#000000', textTransform: 'none', fontWeight: 'normal' }}
              >
                <span className="heading-icon">
                  <i className="fa-sharp fa-solid fa-bolt"></i>
                </span>
                Trending Courses
              </motion.h4>
              <motion.h2 
                className="section-title"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Featured Courses
              </motion.h2>
            </div>
            <motion.div 
              className="course-top-right"
              initial={{ opacity: 0, x: 20 }}
              animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Link to="/catalog/all" className="ed-primary-btn">
                Browse All Courses <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </motion.div>
          </div>
          
          <div className="row gy-4">
            {isLoadingTrending ? (
              <div className="col-12 text-center">
                <div style={{ color: '#666', fontSize: '18px', padding: '40px 0' }}>
                  Loading trending courses...
                </div>
                      </div>
                         ) : trendingCourses.length > 0 ? (
                // Display actual courses - Exact EdCare Template Structure with Horizontal Layout
                trendingCourses.map((course, index) => (
                <div key={course._id} className="col-xl-6 col-lg-12">
                  <motion.div 
                    className="course-item course-item-2"
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                    transition={{ duration: 0.6, delay: 0.3 + (index * 0.1) }}
                    whileHover={{ y: -5 }}
                    style={{
                      padding: 0,
                      display: 'grid',
                      alignItems: 'center',
                      gridTemplateColumns: '236px 1fr',
                      overflow: 'hidden'
                    }}
                  >
                    <div className="course-thumb-wrap" style={{ padding: 0, height: '100%' }}>
                      <div className="course-thumb" style={{ height: '100%', borderRadius: 0 }}>
                        <img 
                          src={getCourseThumbnail(course)} 
                          alt={course.courseName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </div>
                    <div className="course-content-wrap">
                      <div className="course-content">
                        <span className="offer">{course.level || "All Levels"}</span>
                        <h3 className="title">
                          <Link to={`/courses/${course._id}`}>
                            {course.courseName}
                          </Link>
                        </h3>
                        <ul className="course-list">
                          <li><i className="fa-light fa-file"></i>Lesson {course.courseContent?.length || 0}</li>
                          <li><i className="fa-light fa-user"></i>Students {course.studentsEnrolled?.length || 0}</li>
                          <li><i className="fa-light fa-eye"></i>View: 12K</li>
                        </ul>
                        <div className="course-author-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                          <div className="course-author" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="author-img">
                              <img src="/assets/img/images/course-author-1.png" alt="course" />
                            </div>
                            <div className="author-info">
                              <h4 className="name">{course.instructor?.firstName} {course.instructor?.lastName || "Instructor"}</h4>
                              <span>Instructor</span>
                            </div>
                          </div>
                          <ul className="course-review" style={{ display: 'flex', alignItems: 'center', gap: '2px', margin: 0, padding: 0, listStyle: 'none' }}>
                            <li><i className="fa-sharp fa-solid fa-star" style={{ color: '#FFD700' }}></i></li>
                            <li><i className="fa-sharp fa-solid fa-star" style={{ color: '#FFD700' }}></i></li>
                            <li><i className="fa-sharp fa-solid fa-star" style={{ color: '#FFD700' }}></i></li>
                            <li><i className="fa-sharp fa-solid fa-star" style={{ color: '#FFD700' }}></i></li>
                            <li><i className="fa-sharp fa-solid fa-star" style={{ color: '#FFD700' }}></i></li>
                            <li className="point" style={{ marginLeft: '5px', color: '#666' }}>(4.7)</li>
                          </ul>
                        </div>
                      </div>
                      <div className="bottom-content">
                        <span className="price">₹{course.price || "Free"}</span>
                        <Link to={`/courses/${course._id}`} className="course-btn">View Details</Link>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ))
            ) : (
              // No courses state
              <div className="col-12 text-center">
                <motion.div 
                  className="no-courses"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <i className="fa-regular fa-book-open text-4xl text-gray-400 mb-4"></i>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Courses Available</h3>
                  <p className="text-gray-500">Check back soon for new courses!</p>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </motion.section>



      {/* Our Course Categories Section - Improved CSS */}
      <div style={{ 
        backgroundColor: '#191A1F', 
        padding: '120px 0', 
        minHeight: '400px'
      }}>
        <div style={{ 
          maxWidth: '1680px', 
          margin: '0 auto', 
          width: '100%', 
          padding: '0 20px'
        }}>
          <div className="container">
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-end', 
              marginBottom: '60px'
            }}>
              <div>
                {/* <h4 style={{ 
                  color: '#07A698', 
                  fontSize: '18px', 
                  fontWeight: '600', 
                  marginBottom: '10px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <span style={{ marginRight: '10px' }}>
                    <i className="fa-sharp fa-solid fa-bolt"></i>
                  </span>
                  Our Course Categories
                </h4> */}
                <motion.h4 
                className="sub-heading"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                style={{ 
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
                  border: '1px solid #c0c0c0'
                }}
              >
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
                  <i className="fa-sharp fa-solid fa-bolt" style={{ color: '#ffffff', fontSize: '16px'}}></i>
                </span>
                Our Course Categories
              </motion.h4>
                <h2 style={{ 
                  color: '#ffffff', 
                  fontSize: '48px', 
                  fontWeight: '700', 
                  marginBottom: '20px',
                  lineHeight: '1.2'
                }}>
                  Featured Courses
                </h2>
              </div>
              <motion.div 
                className="course-top-right"
                initial={{ opacity: 0, x: 20 }}
                animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <Link to="/catalog" className="ed-primary-btn">
                  Browse All Courses <i className="fa-solid fa-arrow-right"></i>
                </Link>
              </motion.div>
            </div>
            
            <div className="row gy-xl-0 gy-4 justify-content-center">
              {isLoadingCategories ? (
                <div className="col-12 text-center">
                  <div style={{ color: '#ffffff', fontSize: '18px', padding: '40px 0' }}>
                    Loading categories...
                  </div>
                </div>
              ) : categories.length > 0 ? (
                categories.map((category, index) => (
                <div key={index} className="col-xl-2 col-lg-3 col-md-4">
                  <div style={{ 
                    backgroundColor: '#1F2026', 
                    padding: '30px 20px', 
                    border: '1px solid #24252B', 
                    borderRadius: '12px', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    transition: 'all 0.3s ease-in-out',
                    cursor: 'pointer'
                  }}>
                    <div style={{ 
                      backgroundColor: '#191A1F', 
                      height: '91px', 
                      width: '91px', 
                      margin: '0 auto', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      borderRadius: '50%', 
                      border: '1px solid #2E2F36', 
                      marginBottom: '25px',
                      transition: 'all 0.3s ease'
                    }}>
                      {getCategoryIcon(category.name)}
                    </div>
                    <h3 style={{ 
                      fontSize: '20px', 
                      color: '#ffffff', 
                      margin: '0 0 25px 0', 
                      textAlign: 'center', 
                      lineHeight: '1.3', 
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}>
                      {category.name}
                    </h3>
                    <Link to={`/catalog/${category._id}`} style={{ 
                      color: '#07A698', 
                      height: '50px', 
                      width: '50px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      border: '2px solid #07A698', 
                      borderRadius: '50%', 
                      margin: '0 auto', 
                      textDecoration: 'none',
                      transition: 'all 0.3s ease',
                      fontSize: '18px',
                      backgroundColor: 'transparent',
                      hover: {
                        backgroundColor: '#07A698',
                        color: '#ffffff',
                        transform: 'scale(1.1)'
                      }
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#07A698';
                      e.target.style.color = '#ffffff';
                      e.target.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#07A698';
                      e.target.style.transform = 'scale(1)';
                    }}
                    >
                      <i className="fa-solid fa-arrow-right"></i>
                    </Link>
                  </div>
                </div>
              ))
              ) : (
                <div className="col-12 text-center">
                  <div style={{ color: '#ffffff', fontSize: '18px', padding: '40px 0' }}>
                    No categories available
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* ./ feature-section */}

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
                <div key={course._id || index} className="col-xl-6 col-lg-12">
                  <motion.div 
                    className="course-item course-item-2"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ y: -5 }}
                    style={{
                      padding: 0,
                      display: 'grid',
                      alignItems: 'center',
                      gridTemplateColumns: '236px 1fr',
                      overflow: 'hidden',
                      backgroundColor: '#ffffff',
                      borderRadius: '12px',
                      boxShadow: '0 5px 20px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.3s ease',
                      height: '100%'
                    }}
                  >
                    {/* Course Thumbnail */}
                    <div className="course-thumb-wrap" style={{ padding: 0, height: '100%' }}>
                      <div className="course-thumb" style={{ height: '100%', borderRadius: 0 }}>
                        <img 
                          src={getCourseThumbnail(course)} 
                          alt={course.courseName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    </div>

                    {/* Course Content */}
                    <div className="course-content-wrap">
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
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        marginTop: '15px'
                      }}>
                        <span className="price" style={{ 
                          fontSize: '20px', 
                          fontWeight: '700', 
                          color: '#07A698' 
                        }}>
                          ₹{course.price || 'Free'}
                        </span>
                        <Link to={`/course/${course._id}`} className="course-btn" style={{
                          backgroundColor: '#07A698',
                          color: '#ffffff',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
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

          {/* View All Courses Button */}
          <motion.div 
            className="text-center mt-60"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Link 
              to="/catalog/all" 
              className="ed-primary-btn"
              style={{
                backgroundColor: '#07A698',
                color: '#ffffff',
                padding: '15px 40px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              View All Courses <i className="fa-solid fa-arrow-right"></i>
                </Link>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default Home; 