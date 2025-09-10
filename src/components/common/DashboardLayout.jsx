import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, variant = 'default' }) => {
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
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8f9fa',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <Sidebar variant={variant} isMobile={isMobile} isOpen={isSidebarOpen || !isMobile} onClose={() => setIsSidebarOpen(false)} />

      {/* No floating hamburger: Navbar controls sidebar via events */}
      
      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: isMobile ? 0 : 60, // Sidebar width on desktop
        marginTop: '120px', // Height of navbar + top bar
        minHeight: 'calc(100vh - 120px)',
        padding: '2rem',
        overflowY: 'auto',
        background: '#f8f9fa',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        width: '100%',
        maxWidth: '1200px',
        margin: '120px auto 0',
        paddingLeft: isMobile ? '1rem' : 'calc(60px + 2rem)'
      }}>
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default DashboardLayout;