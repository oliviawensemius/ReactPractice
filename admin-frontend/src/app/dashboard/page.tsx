// admin-frontend/src/app/dashboard/page.tsx
'use client';

import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import AdminLayout from '@/components/AdminLayout';
import { useRouter } from 'next/navigation';

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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Course Management Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📚</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Course Management
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Add, Edit, Delete Courses
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/courses" className="font-medium text-emerald-700 hover:text-emerald-900">
                  Manage Courses
                </a>
              </div>
            </div>
          </div>

          {/* Lecturer Management Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">👨‍🏫</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Lecturer Management
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Assign Courses to Lecturers
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/lecturers" className="font-medium text-emerald-700 hover:text-emerald-900">
                  Manage Lecturers
                </a>
              </div>
            </div>
          </div>

          {/* Candidate Management Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">👨‍🎓</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      User Management
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Block/Unblock Candidates
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/candidates" className="font-medium text-emerald-700 hover:text-emerald-900">
                  Manage Candidates
                </a>
              </div>
            </div>
          </div>

          {/* Reports Card */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-2xl">📈</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Reports
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Application Reports
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <a href="/reports" className="font-medium text-emerald-700 hover:text-emerald-900">
                  View Reports
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Admin Dashboard
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Welcome to the TeachTeam Admin Dashboard. Here you can manage courses, 
                assign lecturers, control user access, and generate reports.
              </p>
            </div>
            <div className="mt-3">
              <div className="text-sm">
                <p className="text-gray-600">HD Requirements Implemented:</p>
                <ul className="mt-2 list-disc list-inside text-gray-500">
                  <li>Course Management (Add/Edit/Delete)</li>
                  <li>Lecturer Assignment to Courses</li>
                  <li>Candidate Login Control (Block/Unblock)</li>
                  <li>Application Reports (3 types)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;