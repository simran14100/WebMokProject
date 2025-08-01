import React from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="bg-white flex">
      <Sidebar />
      <div className="flex-1 ml-[220px] p-8">
        <Outlet />
      </div>
    </div>
  );
} 