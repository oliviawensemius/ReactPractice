// admin-frontend/src/components/AuthProvider.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      // Check for existing session on load
      const savedUser = localStorage.getItem('adminUser');
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          console.log('Found saved admin user:', parsedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing saved admin user:', error);
          localStorage.removeItem('adminUser');
        }
      } else {
        console.log('No saved admin user found');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    console.log('Admin login:', userData);
    setUser(userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('adminUser', JSON.stringify(userData));
    }
  };

  const logout = () => {
    console.log('Admin logout');
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminUser');
    }
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading,
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};