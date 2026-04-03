import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const MainLayout = () => {
  const location = useLocation();
  const isTransparentNavbar = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col font-body bg-white selection:bg-slate-900 selection:text-white">
      {/* Dynamic Navbar */}
      <Navbar />
      
      {/* Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
