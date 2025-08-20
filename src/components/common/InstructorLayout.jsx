import React, { useEffect, useState } from 'react';
import Sidebar from './Sidebar';
import { Outlet } from 'react-router-dom';

export default function InstructorLayout() {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 1024);
    check();
    window.addEventListener('resize', check);
    const openHandler = () => setIsSidebarOpen(true);
    const toggleHandler = () => setIsSidebarOpen(prev => !prev);
    window.addEventListener('dashboard:openSidebar', openHandler);
    window.addEventListener('dashboard:toggleSidebar', toggleHandler);
    return () => {
      window.removeEventListener('resize', check);
      window.removeEventListener('dashboard:openSidebar', openHandler);
      window.removeEventListener('dashboard:toggleSidebar', toggleHandler);
    };
  }, []);

  return (
    <div className="bg-white flex">
      <Sidebar isMobile={isMobile} isOpen={isSidebarOpen || !isMobile} onClose={() => setIsSidebarOpen(false)} />
      {/* No floating hamburger: Navbar controls sidebar via events */}
      <div className="flex-1 p-8" style={{ marginLeft: isMobile ? 0 : 220, paddingTop: 120 }}>
        <Outlet />
      </div>
    </div>
  );
}