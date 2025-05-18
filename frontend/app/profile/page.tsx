// app/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Notification from '@/components/ui/Notification';
import { authService } from '@/services/auth.service';

const ProfilePage = () => {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    // Check if user is logged in
    if (!authService.isLoggedIn()) {
      router.push('/signin');
      return;
    }

    // Fetch profile data
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await authService.getProfile();

        if (response.success && response.user) {
          setProfile(response.user);
        } else {
          setError(response.message);
          // If not authenticated, redirect to login
          if (response.message === 'Not authenticated') {
            router.push('/signin');
          }
        }
      } catch (err) {
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      // Call logout API
      await authService.logout();

      // Redirect to home
      router.push('/');
    } catch (error) {
      console.error('Error during logout:', error);

      // Even if API call fails, ensure user is logged out on client side
      localStorage.removeItem('user');
      localStorage.removeItem('currentUserEmail');
      window.dispatchEvent(new Event('storage'));

      // Redirect to home
      router.push('/');
    }
  };


  // Format date for display
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <div className="text-center p-4">
            <h3 className="text-lg text-red-500 font-semibold">{error}</h3>
            <button
              onClick={() => router.push('/signin')}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
            >
              Return to Sign In
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-emerald-800 mb-6">Your Profile</h1>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {profile && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 bg-emerald-50 border-b border-emerald-100">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="h-16 w-16 rounded-full bg-emerald-600 flex items-center justify-center text-white text-xl">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-emerald-800">{profile.name}</h2>
                <p className="text-emerald-600 capitalize">{profile.role}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-lg text-gray-900">{profile.email}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">User ID</h3>
                  <p className="mt-1 text-lg text-gray-900">{profile.id}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Member Since</h3>
                  <p className="mt-1 text-lg text-gray-900">{formatDate(profile.createdAt)}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Account Type</h3>
                  <p className="mt-1 text-lg text-gray-900 capitalize">{profile.role}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

      )}
    </div>
  );
};

export default ProfilePage;