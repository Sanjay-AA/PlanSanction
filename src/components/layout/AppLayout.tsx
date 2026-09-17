import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { DemoUserSwitcher } from '../common/DemoUserSwitcher';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* 1-Click Role Switcher Demo Toolbar */}
      <DemoUserSwitcher />
      {/* Official Government Navbar */}
      <Navbar />
      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        <Outlet />
      </main>
      {/* Government Footer */}
      <Footer />
    </div>
  );
};
