// app/(auth)/signup/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Notification from '@/components/ui/Notification';
import { authService } from '@/services/auth.service';
import { validateEmail, validatePassword, validateName, validateRole } from '@/lib/validation';

const roleOptions = [
  { value: 'candidate', label: 'Candidate (Tutor/Lab Assistant)' },
  { value: 'lecturer', label: 'Lecturer' }
];

const Signup = () => {
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('candidate');
  
  // Validation state
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  
  const router = useRouter();

  // Validate form
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate name
    const nameValidation = validateName(name);
    if (!nameValidation.valid) {
      newErrors.name = nameValidation.message || 'Name is invalid';
    }
    
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
    
    // Validate password confirmation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Validate role
    const roleValidation = validateRole(role);
    if (!roleValidation.valid) {
      newErrors.role = roleValidation.message || 'Role is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
      // Call signup API
      const response = await authService.signup(name, email, password, role);
      
      if (response.success) {
        setNotification({
          type: 'success',
          message: 'Registration successful! Redirecting to login...'
        });
        
        // Redirect to login page after a delay
        setTimeout(() => {
          router.push('/signin');
        }, 2000);
      } else {
        setNotification({
          type: 'error',
          message: response.message || 'Registration failed'
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'An unexpected error occurred'
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-gray-50 py-12">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg border border-gray-200">
        <h1 className="text-2xl font-bold text-emerald-800 mb-6 text-center">Create an Account</h1>
        
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your full name"
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          
          {/* Email field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="you@example.com"
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          
          {/* Password field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Create a strong password"
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 8 characters long and include uppercase, lowercase, and numbers
            </p>
          </div>
          
          {/* Confirm Password field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>
          
          {/* Role selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type
            </label>
            <div className="space-y-2">
              {roleOptions.map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value={option.value}
                    checked={role === option.value}
                    onChange={(e) => setRole(e.target.value)}
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                  />
                  <span className="ml-2 text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}
          </div>
          
          {/* Submit button */}
          <Button
            type="submit"
            variant="secondary"
            className="w-full py-3 text-lg"
          >
            Create Account
          </Button>
          
          {/* Sign in link */}
          <div className="text-center text-sm">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link href="/signin" className="text-emerald-600 hover:text-emerald-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;