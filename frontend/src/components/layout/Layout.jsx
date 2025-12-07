import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout = ({ showSidebar = false }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState('home');

  const handleMenuToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleMenuSelect = (menuId) => {
    setActiveMenu(menuId);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={handleMenuToggle} />
      
      <div className="flex">
        {showSidebar && (
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activeMenu={activeMenu}
            onMenuSelect={handleMenuSelect}
          />
        )}
        
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
