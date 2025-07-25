import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="flex-1 bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#f9fefb]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-[#222] mb-6 leading-tight">
              About{' '}
              <span className="text-[#009e5c]">WebMok</span>
            </h1>
            <p className="text-xl md:text-2xl text-[#222] mb-12 max-w-4xl mx-auto leading-relaxed">
              A comprehensive EdTech platform designed to revolutionize online education through a sophisticated 5-role system.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-[#009e5c] mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-[#222] mb-6 leading-relaxed">
                To democratize education by providing a platform where students can access quality courses, 
                instructors can share their expertise, and administrators can ensure the highest standards 
                of educational content.
              </p>
              <p className="text-lg text-[#222] mb-8 leading-relaxed">
                We believe in the power of technology to transform learning experiences and make education 
                accessible to everyone, regardless of their location or background.
              </p>
              <Link to="/contact">
                <button className="px-8 py-4 bg-[#009e5c] text-white font-bold rounded-lg hover:bg-[#007a44] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  Get in Touch
                </button>
              </Link>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-[#009e5c] shadow-2xl">
              <div className="text-center">
                <div className="w-20 h-20 bg-[#e6fcf5] rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-2xl font-bold text-[#009e5c] mb-4">Vision</h3>
                <p className="text-[#222] leading-relaxed">
                  To become the leading platform for online education, fostering a community of learners, 
                  educators, and administrators who work together to create the future of education.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-[#f9fefb]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#009e5c] mb-4">
              Our Features
            </h2>
            <p className="text-xl text-[#222] max-w-2xl mx-auto">
              Discover what makes WebMok the perfect platform for your educational journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group bg-white p-6 rounded-xl border border-[#009e5c] hover:border-[#007a44] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl">
              <div className="w-12 h-12 bg-[#e6fcf5] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-[#009e5c] mb-3">Student Enrollment</h3>
              <p className="text-[#222] leading-relaxed">
                Seamless enrollment process with integrated payment system using Razorpay for secure transactions.
              </p>
            </div>

            <div className="group bg-white p-6 rounded-xl border border-[#009e5c] hover:border-[#007a44] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl">
              <div className="w-12 h-12 bg-[#e6fcf5] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl">✅</span>
              </div>
              <h3 className="text-xl font-bold text-[#009e5c] mb-3">Instructor Approval</h3>
              <p className="text-[#222] leading-relaxed">
                Rigorous approval workflow ensures only qualified instructors can create and publish courses.
              </p>
            </div>

            <div className="group bg-white p-6 rounded-xl border border-[#009e5c] hover:border-[#007a44] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl">
              <div className="w-12 h-12 bg-[#e6fcf5] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-[#009e5c] mb-3">Admin Dashboard</h3>
              <p className="text-[#222] leading-relaxed">
                Comprehensive admin tools for user management, course oversight, and platform analytics.
              </p>
            </div>

            <div className="group bg-white p-6 rounded-xl border border-[#009e5c] hover:border-[#007a44] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl">
              <div className="w-12 h-12 bg-[#e6fcf5] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl">🔐</span>
              </div>
              <h3 className="text-xl font-bold text-[#009e5c] mb-3">Role-Based Access</h3>
              <p className="text-[#222] leading-relaxed">
                Sophisticated 5-role system with Student, Instructor, Admin, Super Admin, and Staff roles.
              </p>
            </div>

            <div className="group bg-white p-6 rounded-xl border border-[#009e5c] hover:border-[#007a44] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl">
              <div className="w-12 h-12 bg-[#e6fcf5] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl">📈</span>
              </div>
              <h3 className="text-xl font-bold text-[#009e5c] mb-3">Progress Tracking</h3>
              <p className="text-[#222] leading-relaxed">
                Advanced progress tracking and analytics to monitor student learning outcomes and course performance.
              </p>
            </div>

            <div className="group bg-white p-6 rounded-xl border border-[#009e5c] hover:border-[#007a44] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl">
              <div className="w-12 h-12 bg-[#e6fcf5] rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-xl">📧</span>
              </div>
              <h3 className="text-xl font-bold text-[#009e5c] mb-3">Email Notifications</h3>
              <p className="text-[#222] leading-relaxed">
                Automated email notifications for OTP, password reset, enrollment payments, and important updates.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#009e5c] mb-4">
              Our Technology Stack
            </h2>
            <p className="text-xl text-[#222] max-w-2xl mx-auto">
              Built with modern technologies to ensure scalability, security, and performance.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 bg-[#e6fcf5] rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-[#009e5c]">R</span>
              </div>
              <h3 className="text-lg font-semibold text-[#009e5c] mb-2">React.js</h3>
              <p className="text-sm text-[#222]">Frontend Framework</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-[#e6fcf5] rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-[#009e5c]">N</span>
              </div>
              <h3 className="text-lg font-semibold text-[#009e5c] mb-2">Node.js</h3>
              <p className="text-sm text-[#222]">Backend Runtime</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-[#e6fcf5] rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-[#009e5c]">M</span>
              </div>
              <h3 className="text-lg font-semibold text-[#009e5c] mb-2">MongoDB</h3>
              <p className="text-sm text-[#222]">Database</p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 bg-[#e6fcf5] rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                <span className="text-2xl font-bold text-[#009e5c]">T</span>
              </div>
              <h3 className="text-lg font-semibold text-[#009e5c] mb-2">Tailwind CSS</h3>
              <p className="text-sm text-[#222]">Styling Framework</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About; 