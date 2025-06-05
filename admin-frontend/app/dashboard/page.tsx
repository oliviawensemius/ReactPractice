// admin-frontend/src/app/dashboard/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';

const DashboardPage: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect if not loading and definitely not authenticated
    if (!isLoading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login');
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading if still checking authentication
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

  // Show message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You must be logged in as an admin to access this page.</p>
          <Button
            href="/"
            variant="secondary"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  const dashboardCards = [
    {
      title: 'Course Management',
      description: 'Add, edit, and manage courses available in the system',
      href: '/courses',
      icon: '📚',
      stats: 'Manage all course offerings'
    },
    {
      title: 'Lecturer Management',
      description: 'Assign lecturers to courses and manage teaching assignments',
      href: '/lecturers',
      icon: '👨‍🏫',
      stats: 'Coordinate teaching staff'
    },
    {
      title: 'User Management',
      description: 'Block or unblock candidate access to the system',
      href: '/candidates',
      icon: '👨‍🎓',
      stats: 'Control user access'
    },
    {
      title: 'Reports & Analytics',
      description: 'Generate comprehensive application and selection reports',
      href: '/reports',
      icon: '📈',
      stats: 'View system insights'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-lime-200 py-12 px-6 rounded-lg">
          <div className="max-w-4xl">
            <h1 className="text-4xl font-bold text-emerald-800 mb-4">Welcome, {user?.name}!</h1>
            <p className="text-xl text-emerald-800">
              Admin Dashboard for TeachTeam Tutor Selection System
            </p>
            <p className="text-emerald-700 mt-2">
              Assignment 2 - HD Requirements: Separate Admin Dashboard with GraphQL Integration
            </p>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {dashboardCards.map((card, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{card.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-emerald-800 mb-2">{card.title}</h3>
                  <p className="text-gray-600 mb-4">{card.description}</p>
                  <p className="text-sm text-emerald-600 mb-4">{card.stats}</p>
                  <Button
                    href={card.href}
                    variant="secondary"
                    className="w-full"
                  >
                    Manage {card.title.split(' ')[0]}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;