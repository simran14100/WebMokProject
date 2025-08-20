import React from 'react';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="bg-white">
      <div className="flex-1" style={{ paddingTop: 120 }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Dashboard;