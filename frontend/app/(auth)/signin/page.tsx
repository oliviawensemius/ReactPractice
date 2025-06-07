// app/(auth)/signin/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Notification from '@/components/ui/Notification';
import { authService } from '@/services/auth.service';
import { validateEmail, validatePassword } from '@/lib/validation';
import Welcome from '@/components/layout/Welcome';

const Signin = () => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeUsername, setWelcomeUsername] = useState('');

  const router = useRouter();

  // Check if already logged in
  useEffect(() => {
    if (authService.isLoggedIn()) {
      const user = authService.getCurrentUser();
      if (user) {
        if (user.role === 'candidate') {
          router.push('/tutor');
        } else if (user.role === 'lecturer') {
          router.push('/lecturer');
        }
      }
    }
  }, [router]);

  // Validate form
  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Validate email
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      newErrors.email = emailValidation.message || 'Email is invalid';
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      newErrors.password = passwordValidation.message || 'Password is invalid';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle welcome overlay timeout
  const handleWelcomeTimeout = () => {
    setShowWelcome(false);

    // Get current user and redirect based on role
    const user = authService.getCurrentUser();
    if (user) {
      if (user.role === 'candidate') {
        router.push('/tutor');
      } else if (user.role === 'lecturer') {
        router.push('/lecturer');
      } else {
        router.push('/');
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      const response = await authService.signin(email, password);

      if (response.success && response.user) {
        // Show the welcome overlay instead of notification
        setWelcomeUsername(response.user.name);
        setShowWelcome(true);
      } else {
        setNotification({
          type: 'error',
          message: response.message || 'Invalid email or password'
        });
      }
    } catch {
      setNotification({
        type: 'error',
        message: 'An error occurred. Please try again.'
      });
    }
  };

  return (
    <>
      {/* Welcome Overlay */}
      {showWelcome && (
        <Welcome
          username={welcomeUsername}
          onTimeout={handleWelcomeTimeout}
          timeout={30000} // 30 seconds
        />
      )}

      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50 py-12">
        <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200">
          <h1 className="text-2xl font-bold text-emerald-800 mb-6 text-center">Sign In</h1>

          {notification && (
            <Notification
              type={notification.type}
              message={notification.message}
              onClose={() => setNotification(null)}
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            </div>

            <Button
              type="submit"
              variant="secondary"
              className="w-full py-3 text-lg"
            >
              Sign In
            </Button>

            <div className="text-center text-sm">
              <p className="text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </form>

          {/* Testing credentials helper */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h2 className="text-sm font-medium text-gray-700 mb-2">Demo Accounts:</h2>
            <div className="text-xs text-gray-600 space-y-1">
              <p><strong>Candidate:</strong> candidate@example.com / Password123</p>
              <p><strong>Lecturer:</strong> lecturer@example.com / Password123</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signin;