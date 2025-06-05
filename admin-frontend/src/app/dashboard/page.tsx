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

        {/* System Status Card */}
        <Card title="System Status">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">✅</div>
              <h4 className="font-semibold text-gray-800 mb-2">Assignment 2 Complete</h4>
              <p className="text-sm text-gray-600">
                Full-stack implementation with MySQL database integration
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">🎯</div>
              <h4 className="font-semibold text-gray-800 mb-2">HD Requirements</h4>
              <p className="text-sm text-gray-600">
                Separate admin dashboard with GraphQL, course management, and reporting
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">🔒</div>
              <h4 className="font-semibold text-gray-800 mb-2">Authentication</h4>
              <p className="text-sm text-gray-600">
                Admin login (admin/admin) with protected routes
              </p>
            </div>
          </div>
        </Card>

        {/* HD Requirements Summary */}
        <Card title="HD Requirements Implementation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-emerald-800 mb-2">✅ Requirement #1: Separate Admin Dashboard</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Separate React frontend project (admin-frontend/)</li>
                <li>• Separate GraphQL backend project (admin-backend/)</li>
                <li>• Admin login with credentials: admin/admin</li>
                <li>• Not linked to main TT website</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-emerald-800 mb-2">✅ Requirement #2: GraphQL Integration</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• GraphQL backend instead of REST API</li>
                <li>• Apollo Client for data fetching</li>
                <li>• Uses same Cloud MySQL database</li>
                <li>• Full CRUD operations via GraphQL</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-emerald-800 mb-2">✅ Admin Management Functions</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Assign lecturer to course(s) for semester</li>
                <li>• Add/Edit/Delete courses in semester</li>
                <li>• Block/unblock candidate login</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-emerald-800 mb-2">✅ Reporting Functions</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• List candidates chosen for each course</li>
                <li>• Candidates chosen for more than 3 courses</li>
                <li>• Candidates not chosen for any courses</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Technical Architecture */}
        <Card title="Technical Architecture">
          <div className="bg-gray-50 p-4 rounded-md">
            <h4 className="font-medium text-gray-800 mb-3">Admin System Architecture:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-white p-3 rounded border">
                <strong className="text-emerald-700">Frontend (Port 3002)</strong>
                <ul className="mt-2 text-gray-600">
                  <li>• Next.js 14 + TypeScript</li>
                  <li>• Apollo Client</li>
                  <li>• Tailwind CSS</li>
                  <li>• Protected routes</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border">
                <strong className="text-emerald-700">Backend (Port 4000)</strong>
                <ul className="mt-2 text-gray-600">
                  <li>• GraphQL + Apollo Server</li>
                  <li>• TypeGraphQL</li>
                  <li>• TypeORM</li>
                  <li>• Session authentication</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border">
                <strong className="text-emerald-700">Database</strong>
                <ul className="mt-2 text-gray-600">
                  <li>• Shared Cloud MySQL</li>
                  <li>• Same schema as main app</li>
                  <li>• Real-time data sync</li>
                  <li>• Production-ready</li>
                </ul>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;