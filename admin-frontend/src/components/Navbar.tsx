// components/layout/Navbar.tsx

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { authService } from '@/services/auth.service';

interface NavigationProps {
  isAuthenticated?: boolean;
  userRole?: 'candidate' | 'lecturer' | 'admin';
  username?: string;
}

const Navigation: React.FC<NavigationProps> = ({
  isAuthenticated: initialIsAuthenticated = false,
  userRole: initialUserRole = 'candidate',
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
      const user = authService.getCurrentUser();
      setIsAuthenticated(!!user);
      if (user) {
        setUsername(user.name);
        setUserRole(user.role.toLowerCase() as 'candidate' | 'lecturer' | 'admin');
      } else {
        setUsername('');
        setUserRole('candidate');
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
      // Call the logout API
      await authService.logout();

      // Clear local state
      setIsAuthenticated(false);
      setUsername('');
      setUserRole('candidate');

      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error during sign out:', error);

      // Even if API call fails, ensure user is logged out on client side
      localStorage.removeItem('user');
      localStorage.removeItem('currentUserEmail');

      // Trigger storage event to update components
      window.dispatchEvent(new Event('storage'));

      // Redirect to home page
      router.push('/');
    }
  };

  return (
    <nav className="bg-emerald-800 text-white py-3">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand */}
          <Link href="/" className="text-xl font-bold text-white">
            TeachTeam
          </Link>

          {/* Menu Items */}
          <div className="flex space-x-6 items-center">
            <Link href="/" className="text-white hover:text-emerald-200 transition-colors">
              Home
            </Link>

            {isAuthenticated ? (
              // Authenticated user navigation
              <>
                {userRole === 'candidate' && (
                  <>
                    <Link href="/tutor" className="text-white hover:text-emerald-200 transition-colors">
                      Apply
                    </Link>
                    <Link href="/applications" className="text-white hover:text-emerald-200 transition-colors">
                      My Applications
                    </Link>
                  </>
                )}

                {userRole === 'lecturer' && (
                  <>
                    <Link href="/lecturer" className="text-white hover:text-emerald-200 transition-colors">
                      Review Applicants
                    </Link>
                    <Link href="/courses" className="text-white hover:text-emerald-200 transition-colors">
                      Manage Courses
                    </Link>
                  </>
                )}

                {/* Profile link */}
                <Link href="/profile" className="text-white hover:text-emerald-200 transition-colors">
                  Profile
                </Link>

                {/* Welcome message and sign out */}
                <div className="ml-4 flex items-center space-x-4">
                  <span className="bg-emerald-700 px-3 py-1 rounded text-sm">
                    Welcome {username}
                  </span>

                  <Button
                    variant="outline"
                    onClick={handleSignOut}
                  >
                    Sign out
                  </Button>
                </div>
              </>
            ) : (
              // Non-authenticated navigation
              <div className="flex space-x-2 ml-4">
                <Button
                  href="/signin"
                  variant="outline"
                >
                  Sign in
                </Button>

                <Button
                  href="/signup"
                  variant="primary"
                >
                  Sign up
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