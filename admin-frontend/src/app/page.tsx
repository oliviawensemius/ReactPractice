// admin-frontend/src/app/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { ADMIN_LOGIN } from '@/lib/queries';
import Button from '@/components/Button';
import Notification from '@/components/Notification';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [adminLogin, { loading: loginLoading }] = useMutation(ADMIN_LOGIN, {
    onCompleted: (data) => {
      console.log('Login mutation completed:', data);
      if (data.adminLogin.success) {
        console.log('Login successful, user data:', data.adminLogin.user);
        login(data.adminLogin.user);
        setNotification({
          type: 'success',
          message: 'Login successful! Redirecting to dashboard...'
        });
        
        // Redirect after a brief delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        console.log('Login failed:', data.adminLogin.message);
        setNotification({
          type: 'error',
          message: data.adminLogin.message || 'Invalid credentials'
        });
      }
    },
    onError: (error) => {
      console.error('Login mutation error:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Login failed. Please check if the admin backend is running.'
      });
    }
  });

  // Redirect if already authenticated (but not during loading)
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      console.log('User already authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);

    if (!username.trim() || !password.trim()) {
      setNotification({
        type: 'error',
        message: 'Please fill in all fields'
      });
      return;
    }

    console.log('Attempting login with:', { username, password });

    try {
      await adminLogin({
        variables: { username, password }
      });
    } catch (err: any) {
      console.error('Login error:', err);
      setNotification({
        type: 'error',
        message: 'Login failed. Please check if the admin backend is running on port 4000.'
      });
    }
  };

  // Show loading if auth is still loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show login form if already authenticated
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header matching main frontend style */}
      <header className="bg-lime-200 py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl font-bold text-emerald-800 mb-4">TeachTeam Admin</h1>
          <p className="text-xl text-emerald-800">
            Administrative Dashboard for Tutor Selection System
          </p>
          <p className="text-sm text-emerald-700 mt-2">
            HD Requirements: Separate Admin Dashboard with GraphQL
          </p>
        </div>
      </header>

      {/* Login Form */}
      <div className="flex items-center justify-center py-12">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-emerald-800 mb-6 text-center">Admin Sign In</h2>

          {notification && (
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter admin username"
                disabled={loginLoading}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="Enter admin password"
                disabled={loginLoading}
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full py-3 text-lg"
              disabled={loginLoading}
            >
              {loginLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials (HD Requirements):</h3>
            <div className="bg-emerald-50 p-3 rounded-md text-sm">
              <p className="text-emerald-800">
                <strong>Username:</strong> <code className="bg-emerald-100 px-1 rounded">admin</code>
              </p>
              <p className="text-emerald-800 mt-1">
                <strong>Password:</strong> <code className="bg-emerald-100 px-1 rounded">admin</code>
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              As specified in Assignment 2 HD requirements
            </p>
          </div>

          {/* Backend Status */}
          <div className="mt-6 p-3 bg-blue-50 rounded-md text-sm">
            <p className="text-blue-800">
              <strong>Backend:</strong> Admin GraphQL backend should be running on port 4000
            </p>
            <p className="text-blue-700 text-xs mt-1">
              If login fails, ensure admin-backend is running: <code>npm run dev</code>
            </p>
          </div>

          {/* Link back to main site */}
          <div className="mt-6 text-center">
            <a 
              href="http://localhost:3000" 
              className="text-emerald-600 hover:text-emerald-700 text-sm"
            >
              ← Back to TeachTeam Main Site
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-lime-200 text-emerald-800 py-4 text-center mt-auto">
        <p>&copy; {new Date().getFullYear()} TeachTeam Admin Dashboard. All rights reserved.</p>
        <p className="text-xs mt-1">Assignment 2 - HD Requirements Implementation</p>
      </footer>
    </div>
  );
};

export default LoginPage;