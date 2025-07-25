import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function InstructorLayout() {
  return (
    <div className="min-h-screen bg-white flex">
      <Sidebar />
      <div className="flex-1 ml-[220px] p-8">
        <Outlet />
      </div>
    </div>
  );
} 