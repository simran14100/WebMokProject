import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#f8f9fa',
      display: 'flex'
    }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div style={{
        flex: 1,
        marginLeft: '220px', // Width of sidebar
        marginTop: '80px', // Height of navbar
        minHeight: 'calc(100vh - 80px)',
        padding: '2rem',
        overflowY: 'auto',
        background: '#f8f9fa'
      }}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout; 