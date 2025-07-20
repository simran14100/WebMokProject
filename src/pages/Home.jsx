import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="flex-1 bg-gradient-to-br from-richblack-900 via-richblack-800 to-richblack-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-25/10 to-yellow-100/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-richblack-25 mb-6 leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-yellow-25 to-yellow-100 bg-clip-text text-transparent">
                StudyNotion
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-richblack-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Your gateway to quality education with a comprehensive 5-role system designed for students, instructors, and administrators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/signup">
                <button className="px-8 py-4 bg-gradient-to-r from-yellow-25 to-yellow-100 text-richblack-900 font-bold rounded-lg hover:from-yellow-100 hover:to-yellow-25 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                  Get Started
                </button>
              </Link>
              <Link to="/about">
                <button className="px-8 py-4 border-2 border-yellow-25 text-yellow-25 font-bold rounded-lg hover:bg-yellow-25 hover:text-richblack-900 transition-all duration-300 transform hover:scale-105">
                  Learn More
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-richblack-25 mb-4">
              Designed for Everyone
            </h2>
            <p className="text-xl text-richblack-100 max-w-2xl mx-auto">
              Our platform caters to different user roles with specialized features and dashboards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Students Card */}
            <div className="group bg-richblack-800 p-8 rounded-2xl border border-richblack-700 hover:border-yellow-25/50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className="text-2xl font-bold text-richblack-25 mb-4">For Students</h3>
                <p className="text-richblack-100 mb-6 leading-relaxed">
                  Access quality courses, track your progress, and pay enrollment fees to unlock premium content.
                </p>
                <ul className="text-left text-richblack-100 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-25">✓</span>
                    <span>Course enrollment system</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-25">✓</span>
                    <span>Progress tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-25">✓</span>
                    <span>Payment integration</span>
                  </li>
                </ul>
                <Link to="/signup">
                  <button className="w-full bg-gradient-to-r from-blue-400 to-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-500 hover:to-blue-700 transition-all duration-300">
                    Join as Student
                  </button>
                </Link>
              </div>
            </div>

            {/* Instructors Card */}
            <div className="group bg-richblack-800 p-8 rounded-2xl border border-richblack-700 hover:border-yellow-25/50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">👨‍🏫</span>
                </div>
                <h3 className="text-2xl font-bold text-richblack-25 mb-4">For Instructors</h3>
                <p className="text-richblack-100 mb-6 leading-relaxed">
                  Create and manage your courses, get approved by admins, and reach students worldwide.
                </p>
                <ul className="text-left text-richblack-100 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-25">✓</span>
                    <span>Course creation tools</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-25">✓</span>
                    <span>Approval workflow</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-25">✓</span>
                    <span>Student management</span>
                  </li>
                </ul>
                <Link to="/signup">
                  <button className="w-full bg-gradient-to-r from-green-400 to-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-green-500 hover:to-green-700 transition-all duration-300">
                    Become Instructor
                  </button>
                </Link>
              </div>
            </div>

            {/* Admins Card */}
            <div className="group bg-richblack-800 p-8 rounded-2xl border border-richblack-700 hover:border-yellow-25/50 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl">⚙️</span>
                </div>
                <h3 className="text-2xl font-bold text-richblack-25 mb-4">For Admins</h3>
                <p className="text-richblack-100 mb-6 leading-relaxed">
                  Manage the platform, approve instructors, and oversee user management with powerful tools.
                </p>
                <ul className="text-left text-richblack-100 space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-25">✓</span>
                    <span>User management</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-25">✓</span>
                    <span>Instructor approval</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-yellow-25">✓</span>
                    <span>Platform analytics</span>
                  </li>
                </ul>
                <Link to="/signup">
                  <button className="w-full bg-gradient-to-r from-purple-400 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-500 hover:to-purple-700 transition-all duration-300">
                    Admin Access
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-richblack-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-yellow-25 mb-2 group-hover:scale-110 transition-transform duration-300">
                5
              </div>
              <div className="text-richblack-100 font-medium">User Roles</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-yellow-25 mb-2 group-hover:scale-110 transition-transform duration-300">
                ₹1000
              </div>
              <div className="text-richblack-100 font-medium">Enrollment Fee</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-yellow-25 mb-2 group-hover:scale-110 transition-transform duration-300">
                24/7
              </div>
              <div className="text-richblack-100 font-medium">Support</div>
            </div>
            <div className="group">
              <div className="text-3xl md:text-4xl font-bold text-yellow-25 mb-2 group-hover:scale-110 transition-transform duration-300">
                100%
              </div>
              <div className="text-richblack-100 font-medium">Secure</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 