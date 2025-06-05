// admin-frontend/src/app/page.tsx
'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { ADMIN_LOGIN } from '@/lib/queries';
import Button from '@/components/Button';
import Notification from '@/components/Notification';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  const [adminLogin, { loading }] = useMutation(ADMIN_LOGIN);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotification(null);

    if (!username.trim() || !password.trim()) {
      setNotification({
        type: 'error',
        message: 'Please fill in all fields'
      });
      return;
    }

    try {
      const { data } = await adminLogin({
        variables: { username, password }
      });

      if (data.adminLogin.success) {
        login(data.adminLogin.user);
        setNotification({
          type: 'success',
          message: 'Login successful! Redirecting...'
        });
        
        setTimeout(() => {
          router.push('/dashboard');
        }, 1000);
      } else {
        setNotification({
          type: 'error',
          message: data.adminLogin.message || 'Invalid credentials'
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Login failed. Please try again.'
      });
    }
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
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
              />
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full py-3 text-lg"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
            <div className="bg-emerald-50 p-3 rounded-md text-sm">
              <p className="text-emerald-800">
                <strong>Username:</strong> <code className="bg-emerald-100 px-1 rounded">admin</code>
              </p>
              <p className="text-emerald-800 mt-1">
                <strong>Password:</strong> <code className="bg-emerald-100 px-1 rounded">admin</code>
              </p>
            </div>
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
      </footer>
    </div>
  );
};

export default LoginPage;