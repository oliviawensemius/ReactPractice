// admin-frontend/src/components/AdminLayout.tsx
'use client';

import React, { ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header using TeachTeam styling */}
      <header className="bg-emerald-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">TeachTeam Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-emerald-200">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="bg-emerald-700 hover:bg-emerald-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 p-6 bg-gray-50">
          {children}
        </main>
      </div>

      {/* Footer using shared component */}
      <Footer webName="TeachTeam Admin" />
    </div>
  );
};

export default AdminLayout;