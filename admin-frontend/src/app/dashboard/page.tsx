// admin-frontend/src/app/dashboard/page.tsx
'use client';

import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import Button from '@/components/Button';

const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
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
            <h1 className="text-4xl font-bold text-emerald-800 mb-4">Admin Dashboard</h1>
            <p className="text-xl text-emerald-800">
              Manage the TeachTeam tutor selection system for the School of Computer Science
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

        {/* Quick Info Card */}
        <Card title="System Overview">
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
                Admin dashboard with GraphQL, course management, and reporting
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">🔒</div>
              <h4 className="font-semibold text-gray-800 mb-2">Secure Authentication</h4>
              <p className="text-sm text-gray-600">
                Session-based auth with role-based access control
              </p>
            </div>
          </div>
        </Card>

        {/* Features Summary */}
        <Card title="Available Features">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-emerald-800 mb-2">Course Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Add/Edit/Delete courses</li>
                <li>• Activate/Deactivate course offerings</li>
                <li>• View lecturer assignments</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-emerald-800 mb-2">Lecturer Management</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Assign lecturers to multiple courses</li>
                <li>• View current teaching loads</li>
                <li>• Manage course assignments</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-emerald-800 mb-2">User Control</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Block/Unblock candidate access</li>
                <li>• View user registration dates</li>
                <li>• Monitor user activity status</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-emerald-800 mb-2">Reporting</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Course selection reports</li>
                <li>• Multi-course candidate analysis</li>
                <li>• Unselected candidate tracking</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;