import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAllInstructors } from '../services/operations/adminApi';
import { motion } from 'framer-motion';
// Import Swiper React components and CSS
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { FaBolt } from 'react-icons/fa';
import Footer from '../components/common/Footer';
// Import images
import aboutImg1 from '../assets/img/images/about-img-1.jpg';
import aboutImg2 from '../assets/img/images/about-img-2.jpg';
import aboutIcon1 from '../assets/img/icon/about-1.png';
import aboutIcon2 from '../assets/img/icon/about-2.png';
import aboutFeatureIcon from '../assets/img/icon/about-feature-1.png';
import featureIcon1 from '../assets/img/icon/feature-1.png';
import featureIcon2 from '../assets/img/icon/feature-2.png';
import featureIcon3 from '../assets/img/icon/feature-3.png';
import teamMen1 from '../assets/img/team/team-men-1.png';
import teamMen2 from '../assets/img/team/team-men-2.png';
import teamMen3 from '../assets/img/team/team-men-3.png';
import teamMen4 from '../assets/img/team/team-men-4.png';
import testiAuthor3 from '../assets/img/images/testi-author-3.png';
import videoImg1 from '../assets/img/images/video-img-1.png';
import videoImg2 from '../assets/img/images/video-img-2.png';
// Import shapes
import pageHeaderShape1 from '../assets/img/shapes/page-header-shape-1.png';
import pageHeaderShape2 from '../assets/img/shapes/page-header-shape-2.png';
import pageHeaderShape3 from '../assets/img/shapes/page-header-shape-3.png';
import teamShape3 from '../assets/img/shapes/team-shape-3.png';
import testiShape3 from '../assets/img/shapes/testi-shape-3.png';
import testiShape4 from '../assets/img/shapes/testi-shape-4.png';
// Import background images
import pageHeaderBg from '../assets/img/bg-img/page-header-bg.png';


const ED_TEAL = '#07A698';
const ED_TEAL_DARK = '#059a8c';

// At the top of your file
const handleVideoClick = (e) => {
    e.preventDefault();
    // Video popup functionality would go here
    console.log('Video popup would open here');
  };

  const handleImageError = (e) => {
    // Fallback to a solid color background if image fails to load
    e.target.style.display = 'none';
    e.target.parentElement.style.background = 'linear-gradient(135deg, #14b8a6, #0d9488)';
  };

  // Responsive grid style for mobile
  const getResponsiveGridStyle = () => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      return { gridTemplateColumns: '1fr' };
    }
    return { gridTemplateColumns: '1fr 1fr' };
  };




// Custom CSS for Swiper to match template
const swiperStyles = `
  .testi-carousel-2.swiper {
    max-width: 560px !important;
    width: 100% !important;
    overflow: hidden !important;
  }
  
  .testi-carousel-wrap-2 {
    max-width: 720px !important;
    width: 100% !important;
    margin: 0 auto !important;
    position: relative !important;
  }
  
  .testi-carousel-wrap-2 .swiper-arrow {
    position: absolute !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    right: -20px !important;
    z-index: 10 !important;
  }
  
  .testi-carousel-wrap-2 .swiper-arrow .swiper-nav {
    color: white !important;
    height: 60px !important;
    width: 60px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    border: 1px solid white !important;
    border-radius: 50% !important;
    cursor: pointer !important;
    transition: all 0.3s ease !important;
    background-color: transparent !important;
    margin-bottom: 10px !important;
  }
  
  .testi-carousel-wrap-2 .swiper-arrow .swiper-nav:hover {
    background-color: rgba(255, 255, 255, 0.1) !important;
  }
  
  .testi-item-3 {
    background-color: white !important;
    max-width: 520px !important;
    width: 100% !important;
    margin: 0 auto !important;
    padding: 24px !important;
    border-radius: 20px !important;
    position: relative !important;
    z-index: 1 !important;
  }
  
  .testi-item-3:before {
    background-color: rgba(255, 255, 255, 0.1) !important;
    content: "" !important;
    height: 80% !important;
    width: 50px !important;
    position: absolute !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    right: -20px !important;
    z-index: -1 !important;
    border-radius: 20px !important;
  }
  
  .testi-item-3 .title {
    margin-bottom: 15px !important;
    font-size: 24px !important;
    font-weight: bold !important;
    color: #162726 !important;
  }
  
  .testi-item-3 p {
    margin-bottom: 20px !important;
    color: #6C706F !important;
    line-height: 1.6 !important;
  }
  
  .testi-item-3 .testi-author {
    display: grid !important;
    align-items: center !important;
    grid-template-columns: 50px 1fr !important;
  }
  
  .testi-item-3 .testi-author .testi-author-img {
    height: 50px !important;
    width: 50px !important;
    border-radius: 50% !important;
    overflow: hidden !important;
  }
  
  .testi-item-3 .testi-author .testi-author-img img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover !important;
  }
  
  .testi-item-3 .testi-author .name {
    font-size: 18px !important;
    font-weight: bold !important;
    color: #162726 !important;
    margin: 0 !important;
  }
  
  .testi-item-3 .testi-author .name span {
    font-size: 14px !important;
    color: #6C706F !important;
    font-weight: normal !important;
    display: block !important;
  }
  
  @media only screen and (max-width: 767px) {
    .testi-carousel-wrap-2 .swiper-arrow {
      display: none !important;
    }
    
    .testi-item-3 {
      padding: 30px 20px !important;
    }
  }
`;



  
const About = () => {
  const [instructors, setInstructors] = useState([]);
  const [isLoadingInstructors, setIsLoadingInstructors] = useState(true);

  const [currentIndex, setCurrentIndex] = useState(0);

  const testimonials = [
    {
      name: 'Markus Adina',
      role: 'Writer',
      title: 'Interactive Learning Experience',
      text: "I've been thoroughly impressed with how engaging and interactive the courses are on this platform. The use of multimedia, quizzes, and live sessions makes learning enjoyable and keeps me motivated.",
      img: '/assets/img/images/testi-author-1.png'
    },
    {
      name: 'Sarah Johnson',
      role: 'Student',
      title: 'Exceptional Instructor Support',
      text: 'The instructors here are incredibly supportive and knowledgeable. They always respond quickly to questions and provide detailed explanations that make complex topics easy to understand.',
      img: '/assets/img/images/testi-author-2.png'
    },
    {
      name: 'David Chen',
      role: 'Developer',
      title: 'Personalized Learning Path',
      text: 'The personalized learning approach has been amazing. The platform adapts to my learning style and pace, making it much easier to grasp difficult concepts and stay motivated.',
      img: '/assets/img/images/testi-author-4.png'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Designer',
      title: 'Excellent Course Quality',
      text: 'The course quality is outstanding. Each lesson is well-structured, comprehensive, and practical. I\'ve learned so much and can immediately apply the knowledge in real-world projects.',
      img: '/assets/img/images/testi-author-3.png'
    }
  ];

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
    );
  };

  const goToTestimonial = (index) => {
    setCurrentIndex(index);
  };

 

  // Fetch instructors on component mount
  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        console.log("Fetching instructors for About page...");
        const instructorsData = await getAllInstructors();
        console.log("Instructors fetched for About page:", instructorsData);
        console.log("Instructor images:", instructorsData?.map(i => ({ name: i.firstName + ' ' + i.lastName, image: i.image })));
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

  return (
         <div style={{ flex: 1, backgroundColor: 'white', marginTop: '145px' }}>
      {/* Inject custom CSS for Swiper */}
      <style dangerouslySetInnerHTML={{ __html: swiperStyles }} />
      
     
      {/* Page Header */}
                 <section style={{ 
      position: 'relative', 
      padding: '160px 0 110px', 
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
        padding: '0 16px',
        zIndex: 2
      }}>
        <div style={{ 
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          minHeight: '120px',
          gap: '12px'
        }}>
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
            About Us
            <span style={{ 
              display: 'inline-block',
              width: '12px',
              height: '12px',
              backgroundColor: ED_TEAL,
              borderRadius: '50%',
              marginLeft: '8px'
            }}></span>
          </h1>
          
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
              color: ED_TEAL,
              fontWeight: '600'
            }}>
              About
            </span>
          </div>
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

      {/* About Section */}
      <section style={{ 
        padding: '128px 16px', 
        maxWidth: '1280px', 
        margin: '0 auto' 
      }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '80px', 
          alignItems: 'center' 
        }}>
                                {/* Images - Exact Template Structure */}
           <div style={{ 
             maxWidth: '582px', 
             width: '100%', 
             height: '500px', 
             position: 'relative' 
           }}>
             {/* Main Image (about-img-1) */}
             <div style={{ 
               position: 'absolute', 
               top: 0, 
               left: 0, 
               maxWidth: '294px', 
               width: '100%', 
               height: '371px', 
               padding: '5px', 
               border: '2px solid #DDE1E7', 
               borderRadius: '0 60px 0 60px' 
             }}>
               <img 
                 src={aboutImg1} 
                 alt="About WebMok" 
                 style={{ 
                   width: '100%', 
                   height: '100%', 
                   objectFit: 'cover', 
                   borderRadius: '0 60px 0 60px' 
                 }}
               />
               {/* Video Button */}
               <div style={{ 
                 position: 'absolute', 
                 top: '50%', 
                 left: '50%', 
                 transform: 'translate(-50%, -50%)' 
               }}>
                 <a href="#" style={{ 
                   backgroundColor: 'white', 
                   color: '#14b8a6', 
                   display: 'flex', 
                   alignItems: 'center', 
                   justifyContent: 'center', 
                   fontSize: '25px', 
                   height: '80px', 
                   width: '80px', 
                   borderRadius: '50%',
                   textDecoration: 'none'
                 }}>
                   <i className="fa-sharp fa-solid fa-play" style={{ marginTop: '10px', lineHeight: 1 }}></i>
                 </a>
               </div>
             </div>
             
             {/* Second Image (about-img-2) */}
             <div style={{ 
               position: 'absolute', 
               bottom: 0, 
               right: 0, 
               maxWidth: '260px', 
               width: '100%', 
               height: '352px' 
             }}>
               <img 
                 src={aboutImg2} 
                 alt="About WebMok" 
                 style={{ 
                   width: '100%', 
                   height: '100%', 
                   objectFit: 'cover', 
                   borderRadius: '60px 0 60px 0' 
                 }}
               />
             </div>
             
             {/* Contact Card (about-contact) */}
             <div style={{ 
               backgroundColor: '#14b8a6', 
               position: 'absolute', 
               bottom: 0, 
               left: 0, 
               display: 'grid', 
               gridTemplateColumns: '50px 1fr', 
               alignItems: 'center', 
               gap: '15px', 
               maxWidth: '294px', 
               width: '100%', 
               padding: '30px', 
               borderRadius: '0 60px 0 60px' 
             }}>
               <div style={{ 
                 backgroundColor: 'white', 
                 fontSize: '20px', 
                 height: '50px', 
                 width: '50px', 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center', 
                 borderRadius: '50%', 
                 color: '#14b8a6' 
               }}>
                 <i className="fa-sharp fa-regular fa-phone-volume" style={{ transform: 'rotate(-45deg)' }}></i>
               </div>
               <div>
                 <span style={{ 
                   color: 'white', 
                   fontSize: '14px', 
                   fontWeight: '500', 
                   textTransform: 'uppercase', 
                   display: 'block' 
                 }}>Online Support</span>
                 <a href="tel:+2581523659" style={{ 
                   color: 'white', 
                   fontSize: '24px', 
                   fontWeight: '600', 
                   lineHeight: 1,
                   textDecoration: 'none'
                 }}>+258 152 3659</a>
          </div>
        </div>
      </div>

                     {/* Content */}
            <div>
             <div style={{ marginBottom: '40px' }}>
               <h4 className="sub-heading" style={{
                 backgroundColor: 'white',
                 fontFamily: 'Poppins, sans-serif',
                 color: '#333',
                 fontSize: '16px',
                 fontWeight: '400',
                 display: 'inline-flex',
                 alignItems: 'center',
                 columnGap: '10px',
                 marginBottom: '20px',
                 position: 'relative',
                 border: '1px solid #E0E5EB',
                 padding: '5px 15px 5px 5px',
                 borderRadius: '100px'
               }}>
                 <span className="heading-icon" style={{
                   backgroundColor: 'rgba(20, 184, 166, 0.15)',
                   color: '#14b8a6',
                   fontSize: '14px',
                   height: '28px',
                   width: '28px',
                   borderRadius: '50%',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center'
                 }}>
                   <i className="fa-sharp fa-solid fa-bolt"></i>
                 </span>
                 Get More About Us
               </h4>
               <h2 style={{ 
                 fontSize: '36px', 
                 fontWeight: 'bold', 
                 color: '#222', 
                 marginBottom: '20px', 
                 lineHeight: 1.2 
               }}>
                 Over 10 Years in Distant<br />
                 Learning for Skill Development
              </h2>
               <p style={{ 
                 fontSize: '16px', 
                 color: '#666', 
                 lineHeight: 1.6, 
                 marginBottom: '30px',
                 marginTop: '15px'
               }}>
                 Compellingly procrastinate equity invested markets with efficient<br />
                 process improvements. Actualize mission-critical partnerships<br />
                 with integrated portals. Authoritatively optimize low-risk high-yield<br />
                 metrics and plug-and-play potentialities.
               </p>
            </div>

            {/* Counter Items */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '32px', 
              marginBottom: '40px' 
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px' 
              }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  backgroundColor: '#e6fcf5', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <img src={aboutIcon1} alt="Students" style={{ width: '40px', height: '40px' }} />
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '36px', 
                    fontWeight: 'bold', 
                    color: '#14b8a6', 
                    marginBottom: '8px',
                    margin: 0
                  }}>9.5k+</h3>
                  <p style={{ 
                    color: '#666', 
                    fontSize: '14px', 
                    lineHeight: 1.5,
                    margin: 0
                  }}>Total active students taking gifted courses</p>
              </div>
            </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '20px' 
              }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  backgroundColor: '#e6fcf5', 
                  borderRadius: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <img src={aboutIcon2} alt="Courses" style={{ width: '40px', height: '40px' }} />
                </div>
                <div>
                  <h3 style={{ 
                    fontSize: '36px', 
                    fontWeight: 'bold', 
                    color: '#14b8a6', 
                    marginBottom: '8px',
                    margin: 0
                  }}>6.7k+</h3>
                  <p style={{ 
                    color: '#666', 
                    fontSize: '14px', 
                    lineHeight: 1.5,
                    margin: 0
                  }}>Total courses completed successfully</p>
          </div>
        </div>
      </div>

            <div style={{ marginTop: '40px' }}>
              <Link 
                to="/contact" 
                style={{ 
                  backgroundColor: '#14b8a6',
                  fontFamily: 'Poppins, sans-serif',
                  color: 'white',
                  display: 'inline-flex',
                  alignItems: 'center',
                  fontSize: '16px',
                  fontWeight: '700',
                  lineHeight: 1,
                  padding: '17px 40px',
                  borderRadius: '100px',
                  transition: 'all 0.3s ease-in-out',
                  overflow: 'hidden',
                  textTransform: 'capitalize',
                  position: 'relative',
                  zIndex: 1,
                  textDecoration: 'none',
                  border: 'none',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 10px 25px rgba(20, 184, 166, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = 'none';
                }}
              >
                Start Free Trial
                <i className="fas fa-arrow-right" style={{ marginLeft: '10px', fontSize: '13px', marginTop: '2px' }}></i>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ 
        padding: '128px 16px', 
        backgroundColor: '#F2F4F7' 
      }}>
        <div style={{ 
          maxWidth: '1280px', 
          margin: '0 auto' 
        }}>
          <div style={{ textAlign: 'center', marginBottom: '80px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              marginBottom: '24px' 
            }}>
              <h4 className="sub-heading" style={{
                backgroundColor: 'white',
                fontFamily: 'Poppins, sans-serif',
                color: '#333',
                fontSize: '16px',
                fontWeight: '400',
                display: 'inline-flex',
                alignItems: 'center',
                columnGap: '10px',
                marginBottom: '0',
                position: 'relative',
                border: '1px solid #E0E5EB',
                padding: '5px 15px 5px 5px',
                borderRadius: '100px'
              }}>
                <span className="heading-icon" style={{
                  backgroundColor: 'rgba(20, 184, 166, 0.15)',
                  color: '#14b8a6',
                  fontSize: '14px',
                  height: '28px',
                  width: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fa-sharp fa-solid fa-bolt"></i>
                </span>
              Our Features
              </h4>
            </div>
            <h2 style={{ 
              fontSize: '40px', 
              fontWeight: 'bold', 
              color: '#222', 
              marginBottom: '32px' 
            }}>
              Online Education That Improves You
            </h2>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
            gap: '40px' 
          }}>
            {/* Feature Card 1 */}
            <div 
              className="about-feature-card" 
              style={{ 
                position: 'relative', 
                paddingTop: '60px' 
              }}
              onMouseEnter={(e) => {
                const icon = e.currentTarget.querySelector('.icon');
                const img = e.currentTarget.querySelector('.icon img');
                if (icon) icon.style.backgroundColor = '#14b8a6';
                if (img) img.style.filter = 'brightness(0) invert(1)';
              }}
              onMouseLeave={(e) => {
                const icon = e.currentTarget.querySelector('.icon');
                const img = e.currentTarget.querySelector('.icon img');
                if (icon) icon.style.backgroundColor = 'white';
                if (img) img.style.filter = 'none';
              }}
            >
              <div className="icon" style={{ 
                backgroundColor: 'white', 
                height: '120px', 
                width: '120px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                position: 'absolute', 
                top: 0, 
                left: '50%', 
                transform: 'translateX(-50%)', 
                border: '1px solid #E1E9F0', 
                boxShadow: '0px 18px 38px rgba(47, 74, 101, 0.11)', 
                borderRadius: '50%', 
                transition: 'all 0.3s ease-in-out' 
              }}>
                <img src={featureIcon1} alt="Interactive Learning" style={{ transition: 'all 0.3s ease-in-out' }} />
              </div>
              <div className="content" style={{ 
                backgroundColor: 'white', 
                padding: '0 20px 30px 20px', 
                paddingTop: '100px', 
                textAlign: 'center', 
                border: '1px solid #E1E9F0', 
                borderRadius: '15px' 
              }}>
                <h3 className="title" style={{ 
                  fontSize: '22px', 
                  fontWeight: 'bold', 
                  color: '#222', 
                  marginBottom: '15px' 
                }}>Interactive Learning Tools</h3>
                <p style={{ 
                  color: '#666', 
                  lineHeight: 1.6, 
                  fontSize: '16px',
                  marginBottom: 0
                }}>
                  Incorporating features like quizzes,<br />
                  simulations, and multimedia content that<br />
                  actively engage students.
              </p>
            </div>
            </div>

            {/* Feature Card 2 */}
            <div 
              className="about-feature-card" 
              style={{ 
                position: 'relative', 
                paddingTop: '60px' 
              }}
              onMouseEnter={(e) => {
                const icon = e.currentTarget.querySelector('.icon');
                const img = e.currentTarget.querySelector('.icon img');
                if (icon) icon.style.backgroundColor = '#14b8a6';
                if (img) img.style.filter = 'brightness(0) invert(1)';
              }}
              onMouseLeave={(e) => {
                const icon = e.currentTarget.querySelector('.icon');
                const img = e.currentTarget.querySelector('.icon img');
                if (icon) icon.style.backgroundColor = 'white';
                if (img) img.style.filter = 'none';
              }}
            >
              <div className="icon" style={{ 
                backgroundColor: 'white', 
                height: '120px', 
                width: '120px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                position: 'absolute', 
                top: 0, 
                left: '50%', 
                transform: 'translateX(-50%)', 
                border: '1px solid #E1E9F0', 
                boxShadow: '0px 18px 38px rgba(47, 74, 101, 0.11)', 
                borderRadius: '50%', 
                transition: 'all 0.3s ease-in-out' 
              }}>
                <img src={featureIcon2} alt="Flexible Access" style={{ transition: 'all 0.3s ease-in-out' }} />
              </div>
              <div className="content" style={{ 
                backgroundColor: 'white', 
                padding: '0 20px 30px 20px', 
                paddingTop: '100px', 
                textAlign: 'center', 
                border: '1px solid #E1E9F0', 
                borderRadius: '15px' 
              }}>
                <h3 className="title" style={{ 
                  fontSize: '22px', 
                  fontWeight: 'bold', 
                  color: '#222', 
                  marginBottom: '15px' 
                }}>Easy Flexible Access</h3>
                <p style={{ 
                  color: '#666', 
                  lineHeight: 1.6, 
                  fontSize: '16px',
                  marginBottom: 0
                }}>
                  Incorporating features like quizzes,<br />
                  simulations, and multimedia content that<br />
                  actively engage students.
              </p>
            </div>
            </div>

            {/* Feature Card 3 */}
            <div 
              className="about-feature-card" 
              style={{ 
                position: 'relative', 
                paddingTop: '60px' 
              }}
              onMouseEnter={(e) => {
                const icon = e.currentTarget.querySelector('.icon');
                const img = e.currentTarget.querySelector('.icon img');
                if (icon) icon.style.backgroundColor = '#14b8a6';
                if (img) img.style.filter = 'brightness(0) invert(1)';
              }}
              onMouseLeave={(e) => {
                const icon = e.currentTarget.querySelector('.icon');
                const img = e.currentTarget.querySelector('.icon img');
                if (icon) icon.style.backgroundColor = 'white';
                if (img) img.style.filter = 'none';
              }}
            >
              <div className="icon" style={{ 
                backgroundColor: 'white', 
                height: '120px', 
                width: '120px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                position: 'absolute', 
                top: 0, 
                left: '50%', 
                transform: 'translateX(-50%)', 
                border: '1px solid #E1E9F0', 
                boxShadow: '0px 18px 38px rgba(47, 74, 101, 0.11)', 
                borderRadius: '50%', 
                transition: 'all 0.3s ease-in-out' 
              }}>
                <img src={featureIcon3} alt="Personalized Learning" style={{ transition: 'all 0.3s ease-in-out' }} />
              </div>
              <div className="content" style={{ 
                backgroundColor: 'white', 
                padding: '0 20px 30px 20px', 
                paddingTop: '100px', 
                textAlign: 'center', 
                border: '1px solid #E1E9F0', 
                borderRadius: '15px' 
              }}>
                <h3 className="title" style={{ 
                  fontSize: '22px', 
                  fontWeight: 'bold', 
                  color: '#222', 
                  marginBottom: '15px' 
                }}>Personalized Learning Paths</h3>
                <p style={{ 
                  color: '#666', 
                  lineHeight: 1.6, 
                  fontSize: '16px',
                  marginBottom: 0
                }}>
                  Incorporating features like quizzes,<br />
                  simulations, and multimedia content that<br />
                  actively engage students.
              </p>
            </div>
          </div>
        </div>
      </div>
      </section>

      {/* Counter Section */}
      <section style={{ 
        padding: '128px 16px', 
        background: 'linear-gradient(to right, #14b8a6, #0d9488)', 
        color: 'white', 
        position: 'relative', 
        overflow: 'hidden' 
      }}>
        <div style={{ 
          position: 'absolute', 
          inset: 0, 
          backgroundColor: 'black', 
          opacity: 0.1 
        }}></div>
        <div style={{ 
          position: 'relative', 
          maxWidth: '1280px', 
          margin: '0 auto' 
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '48px', 
            textAlign: 'center' 
          }}>
            <div>
              <h3 style={{ 
                fontSize: '52px', 
                fontWeight: 'bold', 
                marginBottom: '16px',
                margin: 0,
                color: 'white'
              }}>3,192+</h3>
              <p style={{ 
                fontSize: '20px', 
                fontWeight: '500',
                margin: 0,
                color: 'white'
              }}>Successfully Trained</p>
            </div>
            <div>
              <h3 style={{ 
                fontSize: '52px', 
                fontWeight: 'bold', 
                marginBottom: '16px',
                margin: 0,
                color: 'white'
              }}>15,485+</h3>
              <p style={{ 
                fontSize: '20px', 
                fontWeight: '500',
                margin: 0,
                color: 'white'
              }}>Classes Completed</p>
            </div>
            <div>
              <h3 style={{ 
                fontSize: '52px', 
                fontWeight: 'bold', 
                marginBottom: '16px',
                margin: 0,
                color: 'white'
              }}>97.55%</h3>
              <p style={{ 
                fontSize: '20px', 
                fontWeight: '500',
                margin: 0,
                color: 'white'
              }}>Satisfaction Rate</p>
            </div>
            <div>
              <h3 style={{ 
                fontSize: '52px', 
                fontWeight: 'bold', 
                marginBottom: '16px',
                margin: 0,
                color: 'white'
              }}>500+</h3>
              <p style={{ 
                fontSize: '20px', 
                fontWeight: '500',
                margin: 0,
                color: 'white'
              }}>Expert Instructors</p>
          </div>
        </div>
      </div>
      </section>

      {/* Team Section */}
      <section style={{ 
        padding: '128px 16px', 
        maxWidth: '1280px', 
        margin: '0 auto' 
      }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            marginBottom: '24px' 
          }}>
            <h4 className="sub-heading" style={{
              backgroundColor: 'white',
              fontFamily: 'Poppins, sans-serif',
              color: '#333',
              fontSize: '16px',
              fontWeight: '400',
              display: 'inline-flex',
              alignItems: 'center',
              columnGap: '10px',
              marginBottom: '0',
              position: 'relative',
              border: '1px solid #E0E5EB',
              padding: '5px 15px 5px 5px',
              borderRadius: '100px'
            }}>
              <span className="heading-icon" style={{
                backgroundColor: 'rgba(20, 184, 166, 0.15)',
                color: '#14b8a6',
                fontSize: '14px',
                height: '28px',
                width: '28px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="fa-sharp fa-solid fa-bolt"></i>
              </span>
              Our Instructors
            </h4>
          </div>
          <h2 style={{ 
            fontSize: '48px', 
            fontWeight: 'bold', 
            color: '#222', 
            marginBottom: '32px' 
          }}>
            Meet Our Expert Instructors
            </h2>
          </div>

                 <div className="row gy-lg-0 gy-4" style={{ marginTop: '40px' }}>
           {isLoadingInstructors ? (
             <div className="col-12 text-center">
               <div style={{ padding: '60px 0' }}>
                 <i className="fa-solid fa-spinner fa-spin" style={{ 
                   fontSize: '32px', 
                   color: '#14b8a6', 
                   marginBottom: '16px',
                   display: 'block'
                 }}></i>
                 <p style={{ color: '#666', fontSize: '18px' }}>Loading our expert instructors...</p>
               </div>
             </div>
           ) : instructors.length > 0 ? (
             instructors.slice(0, 4).map((instructor, index) => (
                               <div key={instructor._id || index} className="col-lg-3 col-md-6" style={{ marginBottom: '30px' }}>
                  <motion.div 
                    className="team-item-3 team-item-5 wow fade-in-bottom"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    data-wow-delay={`${(index + 1) * 200}ms`}
                    style={{ 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center'
                    }}
                  >
                                       <div className="team-thumb" style={{ 
                      flex: '1',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '20px 0',
                      position: 'relative',
                      width: '100%',
                      textAlign: 'center'
                    }}>
                      <div className="shape" style={{ 
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        zIndex: 1
                      }}>
                        <img src={teamShape3} alt="team" />
                      </div>
                                             <div className="team-men" style={{ 
                         width: '200px', 
                         height: '200px', 
                         position: 'relative',
                         borderRadius: '50%',
                         overflow: 'hidden',
                         border: '4px solid #f8f9fa',
                         zIndex: 2,
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         margin: '0 auto',
                         left: '35%',
                         transform: 'translateX(-50%)'
                       }}>
                                               <img 
                          src={instructor.image || `/assets/img/team/team-${index + 1}.png`}
                          alt={`${instructor.firstName} ${instructor.lastName}`}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover',
                            borderRadius: '50%',
                            filter: 'grayscale(100%)',
                            display: 'block',
                            transition: 'filter 0.3s ease-in-out'
                          }}
                          onError={(e) => {
                            console.log('Image failed to load:', e.target.src);
                            e.target.src = `/assets/img/team/team-${index + 1}.png`;
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', instructor.image);
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.filter = 'grayscale(0%)';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.filter = 'grayscale(100%)';
                          }}
                        />
                     </div>
                   </div>
                                       <div className="team-content" style={{ 
                      padding: '25px 0',
                      textAlign: 'center',
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center'
                    }}>
                     <h3 className="title" style={{ 
                       fontSize: '20px',
                       marginBottom: '8px'
                     }}>
                       <Link to={`/instructor/${instructor._id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                         {instructor.firstName} {instructor.lastName}
                       </Link>
                     </h3>
                     <span style={{ 
                       color: '#14b8a6',
                       fontSize: '14px',
                       fontWeight: '500',
                       display: 'block',
                       marginBottom: '8px'
                     }}>Expert Instructor</span>
                     {instructor.email && (
                       <p style={{ 
                         color: '#666', 
                         fontSize: '12px', 
                         margin: '0 0 15px 0',
                         opacity: 0.8
                       }}>{instructor.email}</p>
                     )}
                     <ul className="social-list" style={{ 
                       display: 'flex',
                       justifyContent: 'center',
                       gap: '10px',
                       margin: 0,
                       padding: 0,
                       listStyle: 'none'
                     }}>
                       <li><a href="#" style={{ 
                         width: '35px',
                         height: '35px',
                         backgroundColor: '#f8f9fa',
                         borderRadius: '50%',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: '#14b8a6',
                         textDecoration: 'none',
                         transition: 'all 0.3s'
                       }}><i className="fab fa-facebook-f"></i></a></li>
                       <li><a href="#" style={{ 
                         width: '35px',
                         height: '35px',
                         backgroundColor: '#f8f9fa',
                         borderRadius: '50%',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: '#14b8a6',
                         textDecoration: 'none',
                         transition: 'all 0.3s'
                       }}><i className="fab fa-instagram"></i></a></li>
                       <li><a href="#" style={{ 
                         width: '35px',
                         height: '35px',
                         backgroundColor: '#f8f9fa',
                         borderRadius: '50%',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: '#14b8a6',
                         textDecoration: 'none',
                         transition: 'all 0.3s'
                       }}><i className="fab fa-linkedin-in"></i></a></li>
                       <li><a href="#" style={{ 
                         width: '35px',
                         height: '35px',
                         backgroundColor: '#f8f9fa',
                         borderRadius: '50%',
                         display: 'flex',
                         alignItems: 'center',
                         justifyContent: 'center',
                         color: '#14b8a6',
                         textDecoration: 'none',
                         transition: 'all 0.3s'
                       }}><i className="fab fa-twitter"></i></a></li>
                     </ul>
                   </div>
                 </motion.div>
               </div>
             ))
           ) : (
             <div className="col-12 text-center">
               <div style={{ padding: '60px 0' }}>
                 <i className="fa-solid fa-user-graduate" style={{ 
                   fontSize: '48px', 
                   color: '#ccc', 
                   marginBottom: '16px',
                   display: 'block'
                 }}></i>
                 <h3 style={{ color: '#999', marginBottom: '8px' }}>No Instructors Available</h3>
                 <p style={{ color: '#999' }}>Our expert instructors will be available soon!</p>
               </div>
             </div>
           )}
         </div>
      </section>
{/* Testimonials Section */}
   
  <section
      style={{
        backgroundColor: '#0A8278',
        position: 'relative',
        overflow: 'hidden',
        padding: '50px 0',
        maxHeight:'500px'
        
      }}
    >
      {/* Background shapes */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
      }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%' }}>
          <img
            src="/assets/img/shapes/testi-shape-1.png"
            alt="testi"
            style={{ opacity: 0.1 }}
          />
        </div>
        <div style={{ position: 'absolute', bottom: '10%', right: '5%' }}>
          <img
            src="/assets/img/shapes/testi-shape-2.png"
            alt="testi"
            style={{ opacity: 0.1 }}
          />
        </div>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '60px' // Increased gap between left and right sections
      }}>
        {/* Left Content - Now takes more width */}
        <div style={{ 
          flex: 1.2, // Increased flex value for more width
          marginTop: '-50px',
          color: '#fff',
          maxWidth: '600px',
          gap:'30px' // Added max-width for better control
        }}>
          <h4 className="sub-heading" style={{
            backgroundColor: 'white',
            fontFamily: 'Poppins, sans-serif',
            color: '#333',
            fontSize: '16px',
            fontWeight: '400',
            display: 'inline-flex',
            alignItems: 'center',
            columnGap: '10px',
            marginBottom: '0',
            position: 'relative',
            border: '1px solid #E0E5EB',
            padding: '5px 15px 5px 5px',
            borderRadius: '100px'
          }}>
            <span className="heading-icon" style={{
              backgroundColor: 'rgba(20, 184, 166, 0.15)',
              color: '#14b8a6',
              fontSize: '14px',
              height: '28px',
              width: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            
            }}>
              <i className="fa-sharp fa-solid fa-bolt"></i>
            </span>
            Our Features
          </h4>

          <h2 style={{
            color: '#ffffff',
            fontSize: '36px',
            fontWeight: '700',
            marginBottom: '20px',
            marginTop:'30px',
            lineHeight: '1.3'
          }}>
            What Students Think and Say About EdCare
          </h2>

          <p style={{
            color: 'rgba(255, 255, 255, 0.8)',
            fontSize: '18px',
            lineHeight: '1.6',
            marginBottom: '30px',
            maxWidth: '500px' // Constrained paragraph width
          }}>
            Empowering businesses with cutting-edge technology, reliable support, and seamless integration.
          </p>

          
        </div>

       

        {/* Right Content - Now with polished circular buttons */}
<div style={{ 
  flex: 1,
  marginTop: '70px',
  position: 'relative',
  minHeight: '400px',
  maxWidth: '600px'
}}>
  <div style={{
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  }}>
    {/* Testimonial Cards Container */}
    <div style={{
      display: 'flex',
      width: '100%',
      height: '100%',
      transform: `translateX(-${currentIndex * 100}%)`,
      transition: 'transform 0.5s ease'
    }}>
      {testimonials.map((testimonial, index) => (
        <div 
          key={index}
          style={{
            flex: '0 0 100%',
            padding: '0 15px',
            boxSizing: 'border-box'
          }}
        >
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
            height: '100%',
            maxWidth: '400px',
            margin: '0 auto',
            position: 'relative' // Added for button positioning
          }}>
            {/* Content remains the same */}
            <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#191A1F', marginBottom: '15px' }}>
              {testimonial.title}
            </h3>
            <p style={{ fontSize: '15px', lineHeight: '1.6', color: '#666', marginBottom: '20px', fontStyle: 'italic' }}>
              "{testimonial.text}"
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img 
                src={testimonial.img} 
                alt={testimonial.name} 
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }} 
              />
              <div>
                <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#191A1F', marginBottom: '5px' }}>
                  {testimonial.name}
                </h4>
                <p style={{ fontSize: '13px', color: '#07A698', fontWeight: '500', margin: 0 }}>
                  {testimonial.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
    
    {/* Enhanced Navigation Arrows */}
    <button 
      onClick={prevTestimonial}
      style={{
        position: 'absolute',
        left: '-1px', // Position outside the card
        top: '50%',
        transform: 'translateY(-50%)',
        width: '44px', // Slightly larger for better touch
        height: '44px',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        border: '2px solid #07A698', // Added border
        color: '#07A698',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 10,
        transition: 'all 0.3s ease',
        fontSize: '18px', // Larger arrow
        fontWeight: 'bold'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#07A698';
        e.currentTarget.style.color = '#ffffff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#ffffff';
        e.currentTarget.style.color = '#07A698';
      }}
    >
      &lt;
    </button>
    
    <button 
      onClick={nextTestimonial}
      style={{
        position: 'absolute',
        right: '-1px', // Position outside the card
        top: '50%',
        transform: 'translateY(-50%)',
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        backgroundColor: '#ffffff',
        border: '2px solid #07A698',
        color: '#07A698',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: 10,
        transition: 'all 0.3s ease',
        fontSize: '18px',
        fontWeight: 'bold'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#07A698';
        e.currentTarget.style.color = '#ffffff';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#ffffff';
        e.currentTarget.style.color = '#07A698';
      }}
    >
      &gt;
    </button>
  </div>
  
  {/* Navigation Dots - Enhanced */}
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginTop: '30px'
  }}>
    {testimonials.map((_, index) => (
      <button 
        key={index}
        onClick={() => goToTestimonial(index)}
        style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          border: 'none',
          backgroundColor: index === currentIndex ? '#07A698' : 'rgba(7, 166, 152, 0.3)',
          cursor: 'pointer',
          padding: '0',
          transition: 'all 0.3s ease',
          transform: index === currentIndex ? 'scale(1.2)' : 'scale(1)'
        }}
      />
    ))}
  </div>  
</div>
      </div>
    </section>






       

<section className="video-feature-section" style={{ 
      width: '100%',
      padding: '120px 0',
      backgroundColor: '#fafbfc'
    }}>
      {/* Professional container with consistent max-width */}
      <div className="container" style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        padding: '0 24px' // Consistent horizontal padding
      }}>
        
        {/* Section Header */}
        <div className="section-heading" style={{ 
          textAlign: 'center',
          marginBottom: '80px' 
        }}>
          <h4 className="sub-heading" style={{
            backgroundColor: 'white',
            fontFamily: 'Poppins, sans-serif',
            color: '#333',
            fontSize: '16px',
            fontWeight: '400',
            display: 'inline-flex',
            alignItems: 'center',
            columnGap: '10px',
            marginBottom: '0',
            position: 'relative',
            border: '1px solid #E0E5EB',
            padding: '5px 15px 5px 5px',
            borderRadius: '100px'
          }}>
            <span className="heading-icon" style={{
              backgroundColor: 'rgba(20, 184, 166, 0.15)',
              color: '#14b8a6',
              fontSize: '14px',
              height: '28px',
              width: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <i className="fa-sharp fa-solid fa-bolt"></i>
            </span>
            Our Features
          </h4>
          
          
          <h2 className="section-title" style={{ 
            fontSize: '42px',
            fontWeight: '700',
            color: '#222',
            marginBottom: '20px',
            lineHeight: '1.2',
            fontFamily: 'Poppins, sans-serif',
            '@media (max-width: 1200px)': {
              fontSize: '42px'
            },
            '@media (max-width: 992px)': {
              fontSize: '36px'
            },
            '@media (max-width: 767px)': {
              fontSize: '28px'
            }
          }}>
            Founded by Industry Leaders With<br />Large Scale Business
          </h2>
        </div>

        {/* Video Cards Grid - Side by Side */}
        <div className="video-grid" style={{ 
          display: 'flex',
          gap: '48px',
          alignItems: 'stretch', // This ensures equal heights
          flexWrap: 'wrap'
        }}>
          
          {/* First Video Card */}
          <div className="video-card" style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '32px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            flex: '1',
            minWidth: '300px',
            display: 'flex',
            flexDirection: 'column' // Stack content vertically
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
            e.currentTarget.style.borderColor = '#14b8a6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}>
            
            <div className="video-thumbnail" style={{
              position: 'relative',
              width: '100%',
              height: '240px',
              marginBottom: '24px',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)' // Fallback background
            }}>
              <img 
                src={videoImg1} 
                alt="Career Opportunities" 
                onError={handleImageError}
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              
              <div className="video-overlay" style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(20, 184, 166, 0.05))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <button 
                  onClick={handleVideoClick}
                  style={{
                    backgroundColor: 'white',
                    color: '#14b8a6',
                    height: '72px',
                    width: '72px',
                    fontSize: '20px',
                    borderRadius: '50%',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 25px rgb(0 0 0 / 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#14b8a6';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.color = '#14b8a6';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  ▶
                </button>
              </div>
            </div>
            
            <div className="video-content" style={{ flex: '1' }}>
              <h3 style={{ 
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827', 
                marginBottom: '16px',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                Career Opportunities in WebMok
              </h3>
              <p style={{ 
                color: '#6b7280', 
                lineHeight: '1.7', 
                fontSize: '16px',
                margin: '0',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                Discover endless career possibilities with our industry-aligned courses and expert-led training programs designed for the modern workforce.
              </p>
            </div>
          </div>

          {/* Second Video Card */}
          <div className="video-card" style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '32px',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            cursor: 'pointer',
            flex: '1',
            minWidth: '300px',
            display: 'flex',
            flexDirection: 'column' // Stack content vertically
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)';
            e.currentTarget.style.borderColor = '#14b8a6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 2px 0 rgb(0 0 0 / 0.05)';
            e.currentTarget.style.borderColor = '#e5e7eb';
          }}>
            
            <div className="video-thumbnail" style={{
              position: 'relative',
              width: '100%',
              height: '240px',
              marginBottom: '24px',
              borderRadius: '12px',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)' // Fallback background
            }}>
              <img 
                src={videoImg2} 
                alt="Become A Partner" 
                onError={handleImageError}
                style={{ 
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              
              <div className="video-overlay" style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(20, 184, 166, 0.05))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <button 
                  onClick={handleVideoClick}
                  style={{
                    backgroundColor: 'white',
                    color: '#14b8a6',
                    height: '72px',
                    width: '72px',
                    fontSize: '20px',
                    borderRadius: '50%',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 10px 25px rgb(0 0 0 / 0.1)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#14b8a6';
                    e.target.style.color = 'white';
                    e.target.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.color = '#14b8a6';
                    e.target.style.transform = 'scale(1)';
                  }}
                >
                  ▶
                </button>
              </div>
            </div>
            
            <div className="video-content" style={{ flex: '1' }}>
              <h3 style={{ 
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827', 
                marginBottom: '16px',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                Become A Partner Of WebMok
              </h3>
              <p style={{ 
                color: '#6b7280', 
                lineHeight: '1.7', 
                fontSize: '16px',
                margin: '0',
                fontFamily: 'system-ui, -apple-system, sans-serif'
              }}>
                Join our network of educators and institutions to create impactful learning experiences and expand your reach in the education sector.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
    <Footer/>
    </div>
  );
};



export default About; 