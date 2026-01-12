import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const DashboardLayout = ({ children, currentView, onNavigate }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="layout-wrapper">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={closeSidebar} 
        currentView={currentView}
        onNavigate={onNavigate}
      />
      
      {/* Overlay for mobile */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} 
        onClick={closeSidebar}
      />

      <div className="main-content">
        <Header onToggleSidebar={toggleSidebar} />
        <main style={{ 
          flex: 1, 
          paddingTop: 'var(--spacing-lg)'
        }}>
          <div className="content-container" style={{ padding: '0 var(--spacing-lg)' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
