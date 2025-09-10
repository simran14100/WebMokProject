import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/common/DashboardLayout';

const UniversityStudentDashboard = () => {
  const location = useLocation();
  const isBasePath = location.pathname === '/EnrolledStudents' || location.pathname === '/EnrolledStudents/';
  
  // If not the base path, render the nested route
  if (!isBasePath) {
    return <Outlet />;
  }
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">University Student Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">Welcome to your university student dashboard. Please select an option from the sidebar.</p>
      </div>
    </div>
  );
};

// Wrapper component that includes the DashboardLayout
const UniversityStudentDashboardWithLayout = () => (
  <DashboardLayout variant="university">
    <UniversityStudentDashboard />
  </DashboardLayout>
);

export { UniversityStudentDashboard };
export default UniversityStudentDashboardWithLayout;
