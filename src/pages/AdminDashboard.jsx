import React from 'react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <div className="flex-1 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-richblack-25 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-lg text-richblack-100">
            Manage users, courses, and platform settings.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Admission Confirmation Card */}
          <div className="bg-richblack-800 p-6 rounded-lg hover:bg-richblack-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-richblack-25">
                Admission Confirmation
              </h3>
              <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-richblack-100 mb-4">
              Review and manage student admission confirmations after course payments.
            </p>
            <Link
              to="/admin/admission-confirmation"
              className="inline-flex items-center px-4 py-2 bg-yellow-500 text-richblack-900 font-medium rounded-md hover:bg-yellow-400 transition-colors"
            >
              Manage Admissions
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* User Management Card */}
          <div className="bg-richblack-800 p-6 rounded-lg hover:bg-richblack-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-richblack-25">
                User Management
              </h3>
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <p className="text-richblack-100 mb-4">
              Manage users, approve instructors, and control user access.
            </p>
            <button className="inline-flex items-center px-4 py-2 bg-blue-500 text-white font-medium rounded-md hover:bg-blue-600 transition-colors">
              Manage Users
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Course Management Card */}
          <div className="bg-richblack-800 p-6 rounded-lg hover:bg-richblack-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-richblack-25">
                Course Management
              </h3>
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <p className="text-richblack-100 mb-4">
              Review and manage courses, categories, and content.
            </p>
            <button className="inline-flex items-center px-4 py-2 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 transition-colors">
              Manage Courses
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Payment Installments Card */}
          <div className="bg-richblack-800 p-6 rounded-lg hover:bg-richblack-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-richblack-25">
                Payment Installments
              </h3>
              <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <p className="text-richblack-100 mb-4">
              Manage payment installments, send reminders, and track payment schedules.
            </p>
            <Link
              to="/admin/installments"
              className="inline-flex items-center px-4 py-2 bg-orange-500 text-white font-medium rounded-md hover:bg-orange-600 transition-colors"
            >
              Manage Installments
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Analytics Card */}
          <div className="bg-richblack-800 p-6 rounded-lg hover:bg-richblack-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-richblack-25">
                Analytics
              </h3>
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-richblack-100 mb-4">
              View platform statistics, revenue reports, and user analytics.
            </p>
            <button className="inline-flex items-center px-4 py-2 bg-purple-500 text-white font-medium rounded-md hover:bg-purple-600 transition-colors">
              View Analytics
              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 