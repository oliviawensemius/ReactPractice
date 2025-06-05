// src/components/MainLayout.tsx

'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import Header from './Header';
import Navigation from './Navbar';
import Footer from './Footer';
import { authService } from '@/services/auth.service';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children
}) => {
  // State for auth
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [username, setUsername] = useState('');
  
  // Check authentication on mount and after navigation
  useEffect(() => {
    const checkAuth = () => {
      const user = authService.getCurrentUser();
      setIsAuthenticated(!!user);
      if (user) {
        setUserRole(user.role.toLowerCase());
        setUsername(user.name);
      } else {
        setUserRole('');
        setUsername('');
      }
    };
    
    // Check auth on mount
    checkAuth();
    
    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      checkAuth();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation bar with auth state */}
      <Navigation 
        isAuthenticated={isAuthenticated} 
        userRole={userRole as 'candidate' | 'lecturer' | 'admin'}
        username={username} 
      />
      
      {/* Page header */}
      <Header
        title="TeachTeam"
        userRole={userRole as 'candidate' | 'lecturer'}
        username={username}
      />
      
      {/* Main content area */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;