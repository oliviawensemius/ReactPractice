// app/profile/page.tsx - Simplified version that works with backend authentication

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Notification from '@/components/ui/Notification';
import { authService } from '@/services/auth.service';

const ProfilePage = () => {
  const router = useRouter();
  interface ProfileData {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
  }

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Check if user is logged in (from localStorage)
        const currentUser = authService.getCurrentUser();
        console.log('Profile Page - Current user from localStorage:', currentUser);

        if (!currentUser) {
          console.log('Profile Page - No user found, redirecting to signin');
          router.push('/signin');
          return;
        }

        // Try to get fresh profile from backend, but use localStorage as fallback
        try {
          console.log('Profile Page - Attempting to get fresh profile from backend');
          const response = await authService.getProfile();

          if (response.success && response.user) {
            console.log('Profile Page - Got fresh profile from backend:', response.user);
            setProfile({
              ...response.user,
              created_at: response.user.created_at  || new Date().toISOString()
            });
          } else {
            console.log('Profile Page - Backend profile failed, using localStorage:', currentUser);
            // Use localStorage data as fallback
            setProfile(currentUser);
          }
        } catch {
          console.log('Profile Page - Backend not available, using localStorage:', currentUser);
          // Backend not available, use localStorage data
          setProfile(currentUser);
        }

      } catch (err: any) {
        console.error('Profile Page - Error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      console.log('Profile Page - Logging out...');
      await authService.logout();
      router.push('/');
    } catch (error) {
      console.error('Profile Page - Logout error:', error);

      // Force logout by clearing localStorage
      localStorage.removeItem('user');
      localStorage.removeItem('currentUserEmail');
      localStorage.removeItem('isAuthenticated');
      window.dispatchEvent(new Event('storage'));

      router.push('/');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'Recently joined';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Recently joined';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <div className="text-center p-6">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg text-red-600 font-semibold mb-2">Unable to Load Profile</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/signin')}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Sign In Again
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <div className="text-center p-6">
            <h3 className="text-lg font-semibold mb-2">No Profile Found</h3>
            <p className="text-gray-600 mb-4">Please sign in to view your profile.</p>
            <button
              onClick={() => router.push('/signin')}
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              Sign In
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-emerald-800 mb-6">Your Profile</h1>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Profile Header */}
        <div className="p-6 bg-emerald-50 border-b border-emerald-100">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-emerald-800">{profile.name || 'User'}</h2>
              <p className="text-emerald-600 capitalize">{profile.role || 'Member'}</p>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                <p className="mt-1 text-lg text-gray-900">{profile.email || 'Not available'}</p>
              </div>

              {profile.id && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">User ID</h3>
                  <p className="mt-1 text-sm text-gray-600 font-mono">{profile.id}</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                <p className="mt-1 text-lg text-gray-900">{formatDate(profile.created_at)}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
                <p className="mt-1 text-lg text-gray-900 capitalize">{profile.role || 'Member'}</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              {profile.role === 'candidate' && (
                <>
                  <button
                    onClick={() => router.push('/tutor')}
                    className="inline-flex items-center px-4 py-2 border border-emerald-600 rounded-md shadow-sm text-sm font-medium text-emerald-600 bg-white hover:bg-emerald-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Apply for Positions
                  </button>
                  <button
                    onClick={() => router.push('/applications')}
                    className="inline-flex items-center px-4 py-2 border border-emerald-600 rounded-md shadow-sm text-sm font-medium text-emerald-600 bg-white hover:bg-emerald-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    View Applications
                  </button>
                </>
              )}

              {profile.role === 'lecturer' && (
                <>
                  <button
                    onClick={() => router.push('/lecturer')}
                    className="inline-flex items-center px-4 py-2 border border-emerald-600 rounded-md shadow-sm text-sm font-medium text-emerald-600 bg-white hover:bg-emerald-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Review Applications
                  </button>
                  <button
                    onClick={() => router.push('/courses')}
                    className="inline-flex items-center px-4 py-2 border border-emerald-600 rounded-md shadow-sm text-sm font-medium text-emerald-600 bg-white hover:bg-emerald-50"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Manage Courses
                  </button>
                </>
              )}

              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>

          {/* Account Status */}
          <div className="mt-6 p-4 bg-emerald-50 rounded-md">
            <h4 className="text-sm font-medium text-emerald-800 mb-2">Account Status</h4>
            <p className="text-sm text-emerald-700">
              ✅ Your account is active and all features are available.
              {profile.role === 'candidate' && ' You can apply for tutor and lab assistant positions.'}
              {profile.role === 'lecturer' && ' You can review applications and manage your courses.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;