import React, { useState } from 'react'
import { Link, useLocation } from "react-router-dom";
import { toast } from 'react-hot-toast';

const Footer = () => {
  const [email, setEmail] = useState('');
  const location = useLocation();

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    toast.success('Thank you for subscribing to our newsletter!');
    setEmail('');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Check if we're in admin or instructor layout (has sidebar)
  const isAdminOrInstructorLayout = location.pathname.startsWith('/admin') || location.pathname.startsWith('/instructor');
  
  // Check if we're on any dashboard page (student, staff, super admin, instructor, admin)
  const isDashboardPage = location.pathname.includes('dashboard');

  // Don't render footer on dashboard pages
  if (isDashboardPage) {
    return null;
  }

  return (
    <footer className="footer-section pt-120" style={{ backgroundColor: '#152828' }} data-background="/assets/img/bg-img/footer-bg.png">
      <div className="footer-top-wrap">
        <div className="container">
          <div className="footer-top text-center">
            <h2 className="title">Subscribe Our Newsletter For <br />Latest Updates</h2>
            <div className="footer-form-wrap">
              <form onSubmit={handleSubscribe} className="footer-form">
                <div className="form-item">
                  <input 
                    type="text" 
                    id="email-2" 
                    name="email" 
                    className="form-control" 
                    placeholder="Enter Your E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <button type="submit" className="ed-primary-btn">sign up</button>
              </form>
            </div>
          </div>
          <div className="row footer-wrap">
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h3 className="widget-header">Get in touch!</h3>
                <p className="mb-30">Fusce varius, dolor tempor interdum tristiquei bibendum.</p>
                <div className="footer-contact">
                  <span className="number">
                    <i className="fa-regular fa-phone"></i>
                    <a href="tel:702123-1478">(702) 123-1478</a>
                  </span>
                  <a href="mailto:info@company.com" className="mail">info@company.com</a>
                </div>
                <ul className="footer-social">
                  <li><a href="#"><i className="fab fa-facebook-f"></i></a></li>
                  <li><a href="#"><i className="fab fa-instagram"></i></a></li>
                  <li><a href="#"><i className="fab fa-behance"></i></a></li>
                  <li><a href="#"><i className="fab fa-youtube"></i></a></li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget widget-2">
                <h3 className="widget-header">Company Info</h3>
                <ul className="footer-list">
                  <li><Link to="/about">About Us</Link></li>
                  <li><Link to="/service">Resource Center</Link></li>
                  <li><Link to="/team">Careers</Link></li>
                  <li><Link to="/contact">Instructor</Link></li>
                  <li><Link to="/contact">Become A Teacher</Link></li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget widget-2">
                <h3 className="widget-header">Useful Links</h3>
                <ul className="footer-list">
                  <li><Link to="/catalog">All Courses</Link></li>
                  <li><Link to="/catalog">Digital Marketing</Link></li>
                  <li><Link to="/catalog">Design & Branding</Link></li>
                  <li><Link to="/catalog">Storytelling & Voice Over</Link></li>
                  <li><Link to="/blog">News & Blogs</Link></li>
                </ul>
              </div>
            </div>
            <div className="col-lg-3 col-md-6">
              <div className="footer-widget">
                <h3 className="widget-header">Recent Post</h3>
                <div className="sidebar-post mb-20">
                  <img src="/assets/img/images/footer-post-1.png" alt="post" />
                  <div className="post-content">
                    <h3 className="title"><Link to="/blog-details">Where Dreams Find a Home</Link></h3>
                    <ul className="post-meta">
                      <li><i className="fa-light fa-calendar"></i>20 April, 2025</li>
                    </ul>
                  </div>
                </div>
                <div className="sidebar-post">
                  <img src="/assets/img/images/footer-post-2.png" alt="post" />
                  <div className="post-content">
                    <h3 className="title"><Link to="/blog-details">Where Dreams Find a Home</Link></h3>
                    <ul className="post-meta">
                      <li><i className="fa-light fa-calendar"></i>20 April, 2025</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="copyright-area" style={{ marginTop: '100px' }}>
        <div className="container">
          <div className="copyright-content">
            <p>Copyright © 2025 EdCare. All Rights Reserved.</p>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <div id="scrollup">
        <button id="scroll-top" className="scroll-to-top" onClick={scrollToTop}>
          <i className="fa-regular fa-arrow-up-long"></i>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
