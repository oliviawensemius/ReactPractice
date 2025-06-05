// admin-frontend/src/components/Navbar.tsx

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from './Button';

interface NavigationProps {
  isAuthenticated?: boolean;
  userRole?: 'candidate' | 'lecturer' | 'admin';
  username?: string;
}

const Navigation: React.FC<NavigationProps> = ({
  isAuthenticated: initialIsAuthenticated = false,
  userRole: initialUserRole = 'admin',
  username: initialUsername = ''
}) => {
  const router = useRouter();

  // Local state to track auth status
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuthenticated);
  const [userRole, setUserRole] = useState(initialUserRole);
  const [username, setUsername] = useState(initialUsername);

  // Check authentication status on mount and when localStorage changes
  useEffect(() => {
    const checkAuth = () => {
      if (typeof window !== 'undefined') {
        const adminUser = localStorage.getItem('adminUser');
        if (adminUser) {
          try {
            const user = JSON.parse(adminUser);
            setIsAuthenticated(true);
            setUsername(user.name);
            setUserRole('admin');
          } catch (error) {
            setIsAuthenticated(false);
            setUsername('');
            setUserRole('admin');
          }
        } else {
          setIsAuthenticated(false);
          setUsername('');
          setUserRole('admin');
        }
      }
    };

    // Initial check
    checkAuth();

    // Listen for storage changes (login/logout)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Handle sign out action
  const handleSignOut = async () => {
    try {
      // Clear local state
      setIsAuthenticated(false);
      setUsername('');
      setUserRole('admin');

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminUser');
        
        // Trigger storage event to update components
        window.dispatchEvent(new Event('storage'));
      }

      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error during sign out:', error);
      
      // Redirect anyway
      router.push('/');
    }
  };

  return (
    <nav className="bg-emerald-800 text-white py-3">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link href="/dashboard" className="text-xl font-bold text-white">
            TeachTeam Admin
          </Link>

          {/* Menu Items */}
          <div className="flex space-x-6 items-center">
            {isAuthenticated ? (
              // Authenticated admin navigation
              <>
                <Link href="/dashboard" className="text-white hover:text-emerald-200 transition-colors">
                  Dashboard
                </Link>
                <Link href="/courses" className="text-white hover:text-emerald-200 transition-colors">
                  Courses
                </Link>
                <Link href="/lecturers" className="text-white hover:text-emerald-200 transition-colors">
                  Lecturers
                </Link>
                <Link href="/candidates" className="text-white hover:text-emerald-200 transition-colors">
                  Users
                </Link>
                <Link href="/reports" className="text-white hover:text-emerald-200 transition-colors">
                  Reports
                </Link>

                {/* Welcome message and sign out */}
                <div className="ml-4 flex items-center space-x-4">
                  <span className="bg-emerald-700 px-3 py-1 rounded text-sm">
                    {username}
                  </span>

                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                    size="sm"
                  >
                    Sign out
                  </Button>
                </div>
              </>
            ) : (
              // Non-authenticated navigation
              <div className="flex space-x-2 ml-4">
                <Button
                  href="/"
                  variant="outline"
                  size="sm"
                >
                  Sign in
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;