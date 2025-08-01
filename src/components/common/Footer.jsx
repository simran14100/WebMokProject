import React, { useState } from 'react'
import { Link, useLocation } from "react-router-dom";
import { toast } from 'react-hot-toast';

// Icons
import { 
  FaFacebook, 
  FaBehance, 
  FaInstagram, 
  FaPinterest, 
  FaYoutube,
  FaPhone,
  FaEnvelope,
  FaCalendar,
  FaArrowRight,
  FaArrowUp
} from "react-icons/fa";

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
    <footer className="text-white" style={{ backgroundColor: '#152828' }}>
      {/* Content */}
      <div className="relative z-10">
        {/* Newsletter Section */}
        <div className="pt-24 pb-16">
          <div className={`mx-auto px-4 ${isAdminOrInstructorLayout ? 'ml-[220px] max-w-7xl' : 'max-w-7xl'}`}>
            <div className="flex items-center justify-between gap-8 p-24 rounded-lg" style={{ 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: '#162A29'
            }}>
              <div className="flex-1">
                <h2 className="text-2xl lg:text-3xl font-bold text-white" style={{ fontFamily: 'Outfit, serif' }}>
                  Subscribe Our Newsletter For <br />Latest Updates
                </h2>
              </div>
              <div className="flex gap-3 flex-1 max-w-md">
                <div className="relative flex-1">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Enter Your E-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-4 border rounded-lg text-white placeholder-gray-300 focus:outline-none"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff'
                    }}
                  />
                </div>
                <button
                  type="submit"
                  onClick={handleSubscribe}
                  className="font-semibold px-8 py-4 rounded-lg transition-colors duration-200 whitespace-nowrap text-white"
                  style={{ backgroundColor: '#00D4AA' }} // Bright teal green
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#00C19A'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#00D4AA'}
                >
                  Subscribe Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="pb-16">
          <div className={`mx-auto px-4 ${isAdminOrInstructorLayout ? 'ml-[220px] max-w-7xl' : 'max-w-7xl'}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              
              {/* GET IN TOUCH! */}
              <div>
                <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit, serif' }}>Get in touch!</h3>
                <p className="mb-8 leading-relaxed text-gray-300">
                  Fusce varius, dolor tempor interdum tristiquei bibendum.
                </p>
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-white">
                    <FaPhone style={{ color: '#00D4AA' }} />
                    <a href="tel:7021231478" className="hover:text-gray-300 transition-colors">
                      (702) 123-1478
                    </a>
                  </div>
                  <div className="flex items-center gap-3 text-white">
                    <FaEnvelope style={{ color: '#00D4AA' }} />
                    <a href="mailto:info@webmok.com" className="hover:text-gray-300 transition-colors">
                      info@webmok.com
                    </a>
                  </div>
                </div>
                <ul className="flex gap-4">
                  <li>
                    <a href="#" className="transition-colors duration-200 hover:text-gray-300 text-white">
                      <FaFacebook size={18} />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="transition-colors duration-200 hover:text-gray-300 text-white">
                      <FaInstagram size={18} />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="transition-colors duration-200 hover:text-gray-300 text-white">
                      <FaBehance size={18} />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="transition-colors duration-200 hover:text-gray-300 text-white">
                      <FaPinterest size={18} />
                    </a>
                  </li>
                  <li>
                    <a href="#" className="transition-colors duration-200 hover:text-gray-300 text-white">
                      <FaYoutube size={18} />
                    </a>
                  </li>
                </ul>
              </div>

              {/* COMPANY INFO */}
              <div>
                <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit, serif' }}>Company Info</h3>
                <ul className="space-y-3">
                  {[
                    "About Us",
                    "Resource Center", 
                    "Careers",
                    "Instructor",
                    "Become A Teacher"
                  ].map((item, index) => (
                    <li key={index}>
                      <Link
                        to={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                        className="flex items-center gap-2 transition-colors duration-200 hover:text-gray-300"
                        style={{ color: '#ffffff' }}
                      >
                        <FaArrowRight size={12} style={{ color: '#ffffff' }} />
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* USEFUL LINKS */}
              <div>
                <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit, serif' }}>Useful Links</h3>
                <ul className="space-y-3">
                  {[
                    "All Courses",
                    "Digital Marketing",
                    "Design & Branding", 
                    "Storytelling & Voice Over",
                    "News & Blogs"
                  ].map((item, index) => (
                    <li key={index}>
                      <Link
                        to={`/${item.toLowerCase().replace(/\s+/g, '-')}`}
                        className="flex items-center gap-2 transition-colors duration-200 hover:text-gray-300"
                        style={{ color: '#ffffff' }}
                      >
                        <FaArrowRight size={12} style={{ color: '#ffffff' }} />
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* RECENT POST */}
              <div>
                <h3 className="text-xl font-bold text-white mb-6" style={{ fontFamily: 'Outfit, serif' }}>Recent Post</h3>
                <div className="space-y-6">
                  <div className="flex gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=80&h=80&fit=crop&crop=face"
                      alt="Students with laptop"
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium text-sm mb-2">
                        <a href="#" className="hover:text-white transition-colors text-white">
                          Where Dreams Find a Home
                        </a>
                      </h4>
                      <div className="flex items-center gap-2 text-xs" style={{ color: '#6C706F' }}>
                        <FaCalendar style={{ color: '#00D4AA' }} />
                        <span>20 April, 2025</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face"
                      alt="Student reading"
                      className="w-20 h-20 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium text-sm mb-2">
                        <a href="#" className="hover:text-white transition-colors text-white">
                          Where Dreams Find a Home
                        </a>
                      </h4>
                      <div className="flex items-center gap-2 text-xs" style={{ color: '#6C706F' }}>
                        <FaCalendar style={{ color: '#00D4AA' }} />
                        <span>20 April, 2025</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t py-6" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}> {/* --ed-color-border-1 */}
          <div className={`mx-auto px-4 ${isAdminOrInstructorLayout ? 'ml-[220px] max-w-7xl' : 'max-w-7xl'}`}>
            <div className="text-center">
              <p style={{ color: '#6C706F' }}>Copyright © 2025 WebMok. All Rights Reserved.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110 z-50"
        style={{ backgroundColor: '#00D4AA' }}
        onMouseEnter={(e) => e.target.style.backgroundColor = '#00C19A'}
        onMouseLeave={(e) => e.target.style.backgroundColor = '#00D4AA'}
        title="Scroll to top"
      >
        <FaArrowUp size={20} />
      </button>
    </footer>
  );
};

export default Footer;
