import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllCourses, fetchCourseCategories } from '../services/operations/courseDetailsAPI';
import { getAllInstructors } from '../services/operations/adminApi';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const Home = () => {
  const [trendingCourses, setTrendingCourses] = useState([]);
  const [topClassCourses, setTopClassCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [isLoadingTrending, setIsLoadingTrending] = useState(true);
  const [isLoadingTopClass, setIsLoadingTopClass] = useState(true);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingInstructors, setIsLoadingInstructors] = useState(true);
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

  // Fetch instructors on component mount
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        console.log("Fetching instructors...");
        const instructorsData = await getAllInstructors();
        console.log("Instructors fetched:", instructorsData);
        setInstructors(instructorsData || []);
      } catch (error) {
        console.error("Error fetching instructors:", error);
        setInstructors([]);
      } finally {
        setIsLoadingInstructors(false);
      }
    };

    fetchInstructors();
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
                  <form action="#" style={{ position: 'relative', display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <Link to="/catalog/all">
                      <motion.button 
                        className="ed-primary-btn"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                      >
                        Search Now <i className="fa-solid fa-arrow-right"></i>
                      </motion.button>
                    </Link>
                    <div style={{ position: 'relative', flex: '1' }}>
                      <input 
                        type="text" 
                        id="text" 
                        name="text" 
                        className="form-control" 
                        placeholder="What do you want to learn today?"
                        style={{ paddingLeft: '50px' }}
                      />
                      <div className="icon" style={{ 
                        position: 'absolute', 
                        top: '50%', 
                        left: '25px', 
                        transform: 'translateY(-50%)', 
                        fontSize: '14px', 
                        color: '#162726',
                        pointerEvents: 'none'
                      }}>
                        <i className="fa-solid fa-magnifying-glass"></i>
                      </div>
                    </div>
                  </form>
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
                        <ul className="course-list" style={{ 
                          display: 'flex', 
                          flexWrap: 'nowrap', 
                          gap: '10px', 
                          alignItems: 'center',
                          margin: '4px 0',
                          padding: 0,
                          listStyle: 'none',
                          width: '100%',
                          overflow: 'hidden'
                        }}>
                          <li style={{ 
                            whiteSpace: 'nowrap',
                            fontSize: '14px',
                            color: '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            minWidth: 'fit-content'
                          }}><i className="fa-light fa-file"></i><span style={{ whiteSpace: 'nowrap' }}>Lesson {course.courseContent?.length || 0}</span></li>
                          <li style={{ 
                            whiteSpace: 'nowrap',
                            fontSize: '14px',
                            color: '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            minWidth: 'fit-content'
                          }}><i className="fa-light fa-user"></i><span style={{ whiteSpace: 'nowrap' }}>Students {course.studentsEnrolled?.length || 0}</span></li>
                          <li style={{ 
                            whiteSpace: 'nowrap',
                            fontSize: '14px',
                            color: '#666',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                            minWidth: 'fit-content'
                          }}><i className="fa-light fa-eye"></i><span style={{ whiteSpace: 'nowrap' }}>View: 12K</span></li>
                        </ul>
                        <div className="course-author-box" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' , marginTop:'12px' }}>
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

      {/* 50% Offer Section - UI Template Design */}
      <motion.section 
        className="offer-section overflow-hidden"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        style={{
          background: 'linear-gradient(135deg, #1A2226 0%, #2C3E50 50%, #34495E 100%)',
          position: 'relative',
          padding: '50px 0',
          overflow: 'hidden'
        }}
      >
        {/* Background Grid Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          pointerEvents: 'none',
          zIndex: 1
        }}></div>
        
        {/* Teal Dot */}
        <div style={{
          position: 'absolute',
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '8px',
          height: '8px',
          backgroundColor: '#07A698',
          borderRadius: '50%',
          zIndex: 2
        }}></div>
        
        {/* Large Teal Circle - Bottom Right */}
        <div style={{
          position: 'absolute',
          bottom: '-20%',
          right: '-10%',
          width: '400px',
          height: '400px',
          backgroundColor: '#07A698',
          borderRadius: '50%',
          opacity: '0.3',
          zIndex: 1
        }}></div>
        
        <div className="container" style={{ position: 'relative', zIndex: 3 }}>
          <div className="row align-items-center">
            <div className="col-lg-7 col-md-6 col-sm-12">
              <motion.div 
                className="offer-content"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <motion.h2 
                  className="offer-title"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  viewport={{ once: true }}
                  style={{
                    fontSize: '48px',
                    fontWeight: '700',
                    color: '#ffffff',
                    lineHeight: '1.2',
                    marginBottom: '20px'
                  }}
                >
                  50% Offer For Very First <br />
                  50 Student's & Mentors
                </motion.h2>
                
                <motion.p 
                  className="offer-description"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  viewport={{ once: true }}
                  style={{
                    fontSize: '18px',
                    color: '#ffffff',
                    lineHeight: '1.6',
                    marginBottom: '40px',
                    opacity: '0.9'
                  }}
                >
                  The ability to learn at my own pace was a game-changer for me. The flexible schedule allowed me <br/> to balance my studies with work and personal life, making it possible to complete the <br/> course without feeling overwhelmed.
                </motion.p>
                
                <motion.div 
                  className="offer-buttons"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  viewport={{ once: true }}
                  style={{
                    display: 'flex',
                    gap: '20px',
                    flexWrap: 'wrap'
                  }}
                >
                  <Link to="/catalog/all">
                    <motion.button 
                      className="ed-primary-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        backgroundColor: '#07A698',
                        color: '#ffffff',
                        padding: '15px 30px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        textDecoration: 'none'
                      }}
                    >
                      Become A Student <i className="fa-solid fa-arrow-right"></i>
                    </motion.button>
                  </Link>
                  
                  <Link to="/instructor">
                    <motion.button 
                      className="ed-secondary-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#ffffff',
                        padding: '8px 18px',
                        borderRadius: '8px',
                        border: '2px solid #ffffff',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        textDecoration: 'none'
                      }}
                    >
                      Become A Teacher <i className="fa-solid fa-arrow-right"></i>
                    </motion.button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
            
            <div className="col-lg-5 col-md-6 col-sm-12">
              <motion.div 
                className="offer-image"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                viewport={{ once: true }}
                                  style={{
                    textAlign: 'center',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '300px'
                  }}
              >
                <div style={{
                  width: '250px',
                  height: '250px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px dashed rgba(255, 255, 255, 0.3)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: '180px',
                    height: '180px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <i className="fa-solid fa-user-graduate" style={{
                      fontSize: '60px',
                      color: 'rgba(255, 255, 255, 0.4)'
                    }}></i>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      

      {/* FAQ Section - Powerful Dashboard */}
      <section 
        className="faq-section pt-120 pb-120 overflow-hidden"
        style={{ backgroundColor: '#ffffff', minHeight: '600px' }}
      >
        <div className="container">
          <div className="row align-items-center" style={{ display: 'flex', flexWrap: 'wrap', margin: '0 -15px' }}>
            <div className="col-lg-6 col-md-12" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0 15px' }}>
              <div className="faq-img-wrap-2">
                <div className="faq-img-1">
                  <img src="/assets/img/images/faq-img-2.png" alt="faq" />
                </div>
                <div className="faq-img-2">
                  <img src="/assets/img/images/faq-img-3.png" alt="faq" />
                </div>
                <div className="faq-img-3">
                  <img src="/assets/img/images/faq-img-4.png" alt="faq" />
                </div>
                <div className="faq-text-box">
                  <h4 className="student">Instructor</h4>
                  <div className="faq-thumb-list-wrap">
                    <ul className="faq-thumb-list">
                      <li><img src="/assets/img/images/faq-thumb-1.png" alt="faq" /></li>
                      <li><img src="/assets/img/images/faq-thumb-2.png" alt="faq" /></li>
                      <li><img src="/assets/img/images/faq-thumb-3.png" alt="faq" /></li>
                      <li><img src="/assets/img/images/faq-thumb-4.png" alt="faq" /></li>
                      <li className="number">25+</li>
                    </ul>
                    <p><span>200+</span> <br />Instuctor</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-6 col-md-12" style={{ flex: '0 0 50%', maxWidth: '50%', padding: '0 15px' }}>
              <div className="faq-content" style={{ padding: '30px' }}>
                <div className="section-heading mb-30">
                  <h4 style={{ 
                    color: '#000000', 
                    backgroundColor: '#f8f9fa',
                    padding: '8px 16px',
                    borderRadius: '30px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '25px',
                    fontSize: '16px',
                    fontWeight: '500',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}>
                    <span style={{
                      backgroundColor: '#07A698',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <i className="fa-sharp fa-solid fa-bolt" style={{ color: '#ffffff', fontSize: '14px' }}></i>
                    </span>
                    Our Course Categories
                  </h4>
                  <h2 style={{ 
                    color: '#191A1F', 
                    fontSize: '36px', 
                    fontWeight: '700', 
                    marginBottom: '35px',
                    lineHeight: '1.3'
                  }}>
                    Powerful Dashboard And High Performance Framework
                  </h2>
                </div>
                
                <div className="faq-accordion">
                  <div className="accordion" id="accordionExample">
                    <div className="accordion-item" style={{ 
                      border: '1px solid #E8ECF0', 
                      borderRadius: '10px', 
                      marginBottom: '15px', 
                      overflow: 'hidden' 
                    }}>
                      <h2 className="accordion-header" id="headingOne">
                        <button className="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="true" aria-controls="collapseOne" style={{
                          backgroundColor: '#ffffff',
                          border: 'none',
                          padding: '20px',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#191A1F',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px'
                        }}>
                          <span style={{
                            backgroundColor: '#07A698',
                            color: '#ffffff',
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>01</span>
                          What courses do you offer?
                        </button>
                      </h2>
                      <div id="collapseOne" className="accordion-collapse collapse show" aria-labelledby="headingOne" data-bs-parent="#accordionExample">
                        <div className="accordion-body" style={{
                          padding: '20px',
                          backgroundColor: '#f8f9fa',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          color: '#666'
                        }}>
                          We offer a wide range of courses in various subjects, including science, technology, engineering, mathematics, humanities, and social sciences. Our courses are designed for different education levels, from primary school to university.
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item" style={{ 
                      border: '1px solid #E8ECF0', 
                      borderRadius: '10px', 
                      marginBottom: '15px', 
                      overflow: 'hidden' 
                    }}>
                      <h2 className="accordion-header" id="headingTwo">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo" style={{
                          backgroundColor: '#ffffff',
                          border: 'none',
                          padding: '20px',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#191A1F',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px'
                        }}>
                          <span style={{
                            backgroundColor: '#07A698',
                            color: '#ffffff',
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>02</span>
                          How Can Teachers Effectively Manage a Diverse Classroom?
                        </button>
                      </h2>
                      <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#accordionExample">
                        <div className="accordion-body" style={{
                          padding: '20px',
                          backgroundColor: '#f8f9fa',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          color: '#666'
                        }}>
                          We offer a wide range of courses in various subjects, including science, technology, engineering, mathematics, humanities, and social sciences. Our courses are designed for different education levels, from primary school to university.
                        </div>
                      </div>
                    </div>

                    <div className="accordion-item" style={{ 
                      border: '1px solid #E8ECF0', 
                      borderRadius: '10px', 
                      marginBottom: '15px', 
                      overflow: 'hidden' 
                    }}>
                      <h2 className="accordion-header" id="headingThree">
                        <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree" aria-expanded="false" aria-controls="collapseThree" style={{
                          backgroundColor: '#ffffff',
                          border: 'none',
                          padding: '20px',
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#191A1F',
                          cursor: 'pointer',
                          width: '100%',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '15px'
                        }}>
                          <span style={{
                            backgroundColor: '#07A698',
                            color: '#ffffff',
                            width: '30px',
                            height: '30px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            fontWeight: '600'
                          }}>03</span>
                          How Is Special Education Delivered in Inclusive Classrooms?
                        </button>
                      </h2>
                      <div id="collapseThree" className="accordion-collapse collapse" aria-labelledby="headingThree" data-bs-parent="#accordionExample">
                        <div className="accordion-body" style={{
                          padding: '20px',
                          backgroundColor: '#f8f9fa',
                          fontSize: '14px',
                          lineHeight: '1.6',
                          color: '#666'
                        }}>
                          We offer a wide range of courses in various subjects, including science, technology, engineering, mathematics, humanities, and social sciences. Our courses are designed for different education levels, from primary school to university.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Instructor Section */}
      <section className="team-section pb-120" style={{ backgroundColor: '#ffffff' }}>
        <div className="container">
          <div className="team-top heading-space">
            <div className="section-heading mb-0">
              <h4 className="sub-heading wow fade-in-bottom" style={{ 
                color: '#000000', 
                backgroundColor: '#f8f9fa',
                padding: '8px 16px',
                borderRadius: '30px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '25px',
                fontSize: '16px',
                fontWeight: '500',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}>
                <span style={{
                  backgroundColor: '#07A698',
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <i className="fa-sharp fa-solid fa-bolt" style={{ color: '#ffffff', fontSize: '14px' }}></i>
                </span>
                Our Instructors
              </h4>
              <h2 className="section-title wow fade-in-bottom" style={{ 
                color: '#191A1F', 
                fontSize: '36px', 
                fontWeight: '700', 
                marginBottom: '35px',
                lineHeight: '1.3'
              }}>
                Meet Our Expert Instructors
              </h2>
            </div>
            <div className="team-top-btn">
              <Link to="/contact" className="ed-primary-btn" style={{
                backgroundColor: '#07A698',
                color: '#ffffff',
                padding: '12px 30px',
                borderRadius: '30px',
                textDecoration: 'none',
                display: 'inline-block',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}>
                Contact Us
              </Link>
            </div>
          </div>
        </div>
        <div className="team-container">
          <div className="row gy-xl-0 gy-4 justify-content-center">
            {isLoadingInstructors ? (
              <div className="col-12 text-center">
                <div style={{ padding: '50px', fontSize: '18px', color: '#666' }}>Loading instructors...</div>
              </div>
            ) : instructors.length > 0 ? (
              instructors.slice(0, 4).map((instructor, index) => (
                <div key={instructor._id || index} className="col-xl-3 col-lg-4 col-md-6">
                  <div className="team-item-2 wow fade-in-bottom" data-wow-delay={`${(index + 1) * 200}ms`}>
                    <div className="team-thumb">
                      <img 
                        src={`${instructor.image || `/assets/img/team/team-${5 + index}.png`}?t=${Date.now()}`} 
                        alt={instructor.firstName + ' ' + instructor.lastName}
                      />
                      <div className="team-content">
                        <div className="instructor-info">
                          <h3 className="title">
                            <Link to={`/instructor/${instructor._id}`} style={{ color: '#ffffff', textDecoration: 'none' }}>
                              {instructor.firstName}
                            </Link>
                          </h3>
                          <span>Instructor</span>
                        </div>
                        <div className="team-social">
                          <div className="expand">
                            <i className="fa-solid fa-share-nodes"></i>
                          </div>
                          <ul className="social-list">
                            <li><a href="#" className="facebook"><i className="fab fa-facebook-f"></i></a></li>
                            <li><a href="#" className="google"><i className="fab fa-twitter"></i></a></li>
                            <li><a href="#" className="twitter"><i className="fab fa-behance"></i></a></li>
                            <li><a href="#" className="pinterest"><i className="fab fa-pinterest-p"></i></a></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <div style={{ padding: '50px', fontSize: '18px', color: '#666' }}>No instructors available at the moment.</div>
              </div>
            )}
          </div>
        </div>
      </section>

    

<section
  className="testimonial-section pt-120 pb-120"
  style={{
    backgroundColor: '#07A698',
    position: 'relative',
    overflow: 'hidden',
  }}
>
  <div
    className="shapes"
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'none',
    }}
  >
    <div
      className="shape-1"
      style={{ position: 'absolute', top: '10%', left: '5%' }}
    >
      <img
        src="/assets/img/shapes/testi-shape-1.png"
        alt="testi"
        style={{ opacity: 0.1 }}
      />
    </div>
    <div
      className="shape-2"
      style={{ position: 'absolute', bottom: '10%', right: '5%' }}
    >
      <img
        src="/assets/img/shapes/testi-shape-2.png"
        alt="testi"
        style={{ opacity: 0.1 }}
      />
    </div>
  </div>
  <div className="container">
    <div className="section-heading white-content text-center">
      <h4
        className="sub-heading"
        style={{
          color: '#ffffff',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: '8px 16px',
          borderRadius: '30px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '25px',
          fontSize: '16px',
          fontWeight: '500',
          backdropFilter: 'blur(10px)',
        }}
      >
        <span
          style={{
            backgroundColor: '#ffffff',
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <i
            className="fa-sharp fa-solid fa-bolt"
            style={{ color: '#07A698', fontSize: '14px' }}
          ></i>
        </span>
        Our Testimonials
      </h4>
      <h2
        className="section-title"
        style={{
          color: '#ffffff',
          fontSize: '36px',
          fontWeight: '700',
          marginBottom: '50px',
          lineHeight: '1.3',
        }}
      >
        What Students Think and Say About EdCare
      </h2>
    </div>

    {/* FIXED Carousel Loop Style */}
    <style>{`
      .testimonial-track {
        display: flex;
        width: fit-content;
        animation: marquee 40s linear infinite;
      }
      @keyframes marquee {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .swiper-slide {
        flex: 0 0 auto;
        width: 300px;
        margin: 0 15px;
      }
    `}</style>

    <div style={{ overflow: 'hidden', width: '100%' }}>
      <div className="testimonial-track">
        {[...Array(2)].flatMap(() => [
          {
            name: 'Markus Adina',
            role: 'Writer',
            text:
              "I've been thoroughly impressed with how engaging and interactive the courses are on this platform. The use of multimedia, quizzes, and live sessions makes learning enjoyable and keeps me motivated.",
            img: '/assets/img/images/testi-author-1.png',
          },
          {
            name: 'Sarah Johnson',
            role: 'Student',
            text:
              'The instructors here are incredibly supportive and knowledgeable. They always respond quickly to questions and provide detailed explanations that make complex topics easy to understand.',
            img: '/assets/img/images/testi-author-2.png',
          },
          {
            name: 'David Chen',
            role: 'Developer',
            text:
              'The personalized learning approach has been amazing. The platform adapts to my learning style and pace, making it much easier to grasp difficult concepts and stay motivated.',
            img: '/assets/img/images/testi-author-4.png',
          },
          {
            name: 'Emily Rodriguez',
            role: 'Designer',
            text:
              'The course quality is outstanding. Each lesson is well-structured, comprehensive, and practical. I\'ve learned so much and can immediately apply the knowledge in real-world projects.',
            img: '/assets/img/images/testi-author-3.png',
          },
        ]).map((testimonial, index) => (
          <div key={index} className="swiper-slide">
            <div
              className="testi-item"
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '15px',
                padding: '30px',
                textAlign: 'center',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                width: '300px',
                height: '450px', // Fixed height for all cards
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <h3
                className="title"
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: '#191A1F',
                  marginBottom: '20px',
                }}
              >
                {testimonial.name === 'David Chen'
                  ? 'Personalized Learning Path'
                  : testimonial.name === 'Sarah Johnson'
                  ? 'Exceptional Instructor Support'
                  : testimonial.name === 'Emily Rodriguez'
                  ? 'Excellent Course Quality'
                  : 'Interactive Learning Experience'}
              </h3>
              <p
                style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  color: '#666',
                  marginBottom: '25px',
                }}
              >
                "{testimonial.text}"
              </p>
              <div className="testi-author">
                <div className="author-img" style={{ marginBottom: '15px' }}>
                  <img
                    src={testimonial.img}
                    alt="testi"
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                </div>
                <h4
                  className="name"
                  style={{
                    fontSize: '18px',
                    fontWeight: '600',
                    color: '#191A1F',
                    marginBottom: '5px',
                  }}
                >
                  {testimonial.name}{' '}
                  <span
                    style={{
                      fontSize: '14px',
                      color: '#07A698',
                      fontWeight: '500',
                    }}
                  >
                    {testimonial.role}
                  </span>
                </h4>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
</section>

      {/* News & Blog Section */}
      <section className="blog-section pt-120 pb-120">
        <div className="container">
          <div className="section-heading text-center">
            <h4 className="sub-heading wow fade-in-bottom" data-wow-delay="200ms">
              <span className="heading-icon">
                <i className="fa-sharp fa-solid fa-bolt"></i>
              </span>
              News & Blogs
            </h4>
            <h2 className="section-title wow fade-in-bottom" data-wow-delay="400ms">
              Latest News Updates
            </h2>
          </div>
          <div className="row gy-lg-0 gy-4 justify-content-center post-card-2-wrap">
            <div className="col-lg-12 col-md-6">
              <div className="post-card-2 wow fade-in-bottom" data-wow-delay="200ms">
                <div className="post-thumb">
                  <img src="/assets/img/blog/post-4.png" alt="post" />
                </div>
                <div className="post-content-wrap">
                  <div className="post-content">
                    <ul className="post-meta">
                      <li>
                        <i className="fa-sharp fa-regular fa-clock"></i>August 15, 2025
                      </li>
                      <li>
                        <i className="fa-sharp fa-regular fa-folder"></i>Marketing
                      </li>
                    </ul>
                    <h3 className="title">
                      <a href="/blog-details" style={{
                        color: '#191A1F',
                        textDecoration: 'none',
                        fontSize: '24px',
                        fontWeight: '600',
                        lineHeight: '1.3',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#07A698';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#191A1F';
                      }}>
                        Repurpose mission critical action life items rather total
                      </a>
                    </h3>
                    <p>
                      we understand the importance of preparing students for the real world curriculum is <br /> designed strong emphasis on practical skills and real-world applications. By integrating <br /> project-based learning, internships, and industry partnerships,
                    </p>
                    <a href="/blog-details" style={{
                      backgroundColor: '#ffffff',
                      color: '#07A698',
                      fontSize: '15px',
                      fontWeight: '600',
                      padding: '14px 32px',
                      borderRadius: '50px',
                      textDecoration: 'none',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      position: 'relative',
                      overflow: 'hidden',
                      zIndex: 1,
                      border: '2px solid #f0f0f0',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#07A698';
                      e.target.style.color = '#ffffff';
                      e.target.style.transform = 'translateY(-3px) scale(1.02)';
                      e.target.style.boxShadow = '0 8px 25px rgba(7, 166, 152, 0.25)';
                      e.target.style.borderColor = '#07A698';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.color = '#07A698';
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                      e.target.style.borderColor = '#f0f0f0';
                    }}>
                      Read More <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px', transition: 'transform 0.3s ease' }}></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-12 col-md-6">
              <div className="post-card-2 wow fade-in-bottom" data-wow-delay="400ms">
                <div className="post-thumb">
                  <img src="/assets/img/blog/post-5.png" alt="post" />
                </div>
                <div className="post-content-wrap">
                  <div className="post-content">
                    <ul className="post-meta">
                      <li>
                        <i className="fa-sharp fa-regular fa-clock"></i>August 15, 2025
                      </li>
                      <li>
                        <i className="fa-sharp fa-regular fa-folder"></i>Marketing
                      </li>
                    </ul>
                    <h3 className="title">
                      <a href="/blog-details" style={{
                        color: '#191A1F',
                        textDecoration: 'none',
                        fontSize: '24px',
                        fontWeight: '600',
                        lineHeight: '1.3',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#07A698';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#191A1F';
                      }}>
                        Transforming Traditional Classrooms for 21st-Century Learners
                      </a>
                    </h3>
                    <p>
                      we understand the importance of preparing students for the real world curriculum is <br /> designed strong emphasis on practical skills and real-world applications. By integrating <br /> project-based learning, internships, and industry partnerships,
                    </p>
                    <a href="/blog-details" style={{
                      backgroundColor: '#ffffff',
                      color: '#07A698',
                      fontSize: '15px',
                      fontWeight: '600',
                      padding: '14px 32px',
                      borderRadius: '50px',
                      textDecoration: 'none',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      position: 'relative',
                      overflow: 'hidden',
                      zIndex: 1,
                      border: '2px solid #f0f0f0',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#07A698';
                      e.target.style.color = '#ffffff';
                      e.target.style.transform = 'translateY(-3px) scale(1.02)';
                      e.target.style.boxShadow = '0 8px 25px rgba(7, 166, 152, 0.25)';
                      e.target.style.borderColor = '#07A698';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.color = '#07A698';
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                      e.target.style.borderColor = '#f0f0f0';
                    }}>
                      Read More <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px', transition: 'transform 0.3s ease' }}></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-12 col-md-6">
              <div className="post-card-2 wow fade-in-bottom" data-wow-delay="500ms">
                <div className="post-thumb">
                  <img src="/assets/img/blog/post-6.png" alt="post" />
                </div>
                <div className="post-content-wrap">
                  <div className="post-content">
                    <ul className="post-meta">
                      <li>
                        <i className="fa-sharp fa-regular fa-clock"></i>August 15, 2025
                      </li>
                      <li>
                        <i className="fa-sharp fa-regular fa-folder"></i>Marketing
                      </li>
                    </ul>
                    <h3 className="title">
                      <a href="/blog-details" style={{
                        color: '#191A1F',
                        textDecoration: 'none',
                        fontSize: '24px',
                        fontWeight: '600',
                        lineHeight: '1.3',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.color = '#07A698';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.color = '#191A1F';
                      }}>
                        The Role of Social-Emotional Learning in Building Resilient
                      </a>
                    </h3>
                    <p>
                      we understand the importance of preparing students for the real world curriculum is <br /> designed strong emphasis on practical skills and real-world applications. By integrating <br /> project-based learning, internships, and industry partnerships,
                    </p>
                    <a href="/blog-details" style={{
                      backgroundColor: '#ffffff',
                      color: '#07A698',
                      fontSize: '15px',
                      fontWeight: '600',
                      padding: '14px 32px',
                      borderRadius: '50px',
                      textDecoration: 'none',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      position: 'relative',
                      overflow: 'hidden',
                      zIndex: 1,
                      border: '2px solid #f0f0f0',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                      letterSpacing: '0.3px',
                      textTransform: 'uppercase',
                      fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#07A698';
                      e.target.style.color = '#ffffff';
                      e.target.style.transform = 'translateY(-3px) scale(1.02)';
                      e.target.style.boxShadow = '0 8px 25px rgba(7, 166, 152, 0.25)';
                      e.target.style.borderColor = '#07A698';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = '#ffffff';
                      e.target.style.color = '#07A698';
                      e.target.style.transform = 'translateY(0) scale(1)';
                      e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.08)';
                      e.target.style.borderColor = '#f0f0f0';
                    }}>
                      Read More <i className="fa-solid fa-arrow-right" style={{ fontSize: '12px', transition: 'transform 0.3s ease' }}></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



    </div>
  );
};

export default Home; 