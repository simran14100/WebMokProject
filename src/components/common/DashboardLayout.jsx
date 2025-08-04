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
        marginLeft: '15px', // Width of sidebar
        marginTop: '120px', // Height of navbar + top bar
        minHeight: 'calc(100vh - 120px)',
        padding: '2rem',
        overflowY: 'auto',
        background: '#f8f9fa',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout; 