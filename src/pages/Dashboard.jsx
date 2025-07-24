import React from 'react';
import Sidebar from '../components/common/Sidebar';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-white" style={{ marginLeft: 220 }}>
      <Sidebar />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard; 