// admin-frontend/src/components/AdminDashboard.tsx
'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import { 
  GET_ALL_COURSES, 
  GET_ALL_LECTURERS, 
  GET_ALL_CANDIDATES,
  GET_COURSE_APPLICATION_REPORTS,
  GET_CANDIDATES_WITH_MULTIPLE_COURSES,
  GET_UNSELECTED_CANDIDATES
} from '@/lib/queries';
import CourseManagement from './CourseManagement';
import LecturerManagement from './LecturerManagement';
import UserManagement from './UserManagement';
import Reports from './Reports';

type ActiveTab = 'overview' | 'courses' | 'lecturers' | 'users' | 'reports';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');

  // Fetch all data for overview
  const { data: coursesData, loading: coursesLoading } = useQuery(GET_ALL_COURSES);
  const { data: lecturersData, loading: lecturersLoading } = useQuery(GET_ALL_LECTURERS);
  const { data: candidatesData, loading: candidatesLoading } = useQuery(GET_ALL_CANDIDATES);
  const { data: reportsData, loading: reportsLoading } = useQuery(GET_COURSE_APPLICATION_REPORTS);

  const courses = coursesData?.getAllCourses || [];
  const lecturers = lecturersData?.getAllLecturers || [];
  const candidates = candidatesData?.getAllCandidates || [];
  const reports = reportsData?.getCourseApplicationReports || [];

  const activeCourses = courses.filter((c: any) => c.is_active);
  const activeCandidates = candidates.filter((c: any) => c.user.is_active);
  const totalApplications = reports.reduce((sum: number, report: any) => 
    sum + report.selectedCandidates.length, 0
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'courses':
        return <CourseManagement />;
      case 'lecturers':
        return <LecturerManagement />;
      case 'users':
        return <UserManagement />;
      case 'reports':
        return <Reports />;
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-emerald-100 rounded-md flex items-center justify-center">
                <span className="text-emerald-600 font-bold">📚</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Courses</p>
              <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
              <p className="text-xs text-gray-500">{activeCourses.length} active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                <span className="text-blue-600 font-bold">👨‍🏫</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Lecturers</p>
              <p className="text-2xl font-semibold text-gray-900">{lecturers.length}</p>
              <p className="text-xs text-gray-500">Teaching staff</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <span className="text-green-600 font-bold">👨‍🎓</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Candidates</p>
              <p className="text-2xl font-semibold text-gray-900">{candidates.length}</p>
              <p className="text-xs text-gray-500">{activeCandidates.length} active</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <span className="text-purple-600 font-bold">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Selections</p>
              <p className="text-2xl font-semibold text-gray-900">{totalApplications}</p>
              <p className="text-xs text-gray-500">Total selected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
          <h3 className="text-lg font-semibold text-emerald-800">Quick Actions</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveTab('courses')}
              className="p-4 border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">📚</div>
              <h4 className="font-medium text-emerald-800">Manage Courses</h4>
              <p className="text-sm text-gray-600">Add, edit, or delete courses</p>
            </button>
            
            <button
              onClick={() => setActiveTab('lecturers')}
              className="p-4 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">👨‍🏫</div>
              <h4 className="font-medium text-blue-800">Assign Lecturers</h4>
              <p className="text-sm text-gray-600">Manage course assignments</p>
            </button>
            
            <button
              onClick={() => setActiveTab('users')}
              className="p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">🔒</div>
              <h4 className="font-medium text-red-800">Block/Unblock Users</h4>
              <p className="text-sm text-gray-600">Control candidate access</p>
            </button>
            
            <button
              onClick={() => setActiveTab('reports')}
              className="p-4 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left"
            >
              <div className="text-2xl mb-2">📊</div>
              <h4 className="font-medium text-purple-800">View Reports</h4>
              <p className="text-sm text-gray-600">Generate system reports</p>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
          <h3 className="text-lg font-semibold text-emerald-800">System Status</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-green-800">Database Connection</span>
              </div>
              <span className="text-green-600 font-medium">Active</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                <span className="text-green-800">GraphQL API</span>
              </div>
              <span className="text-green-600 font-medium">Running</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="text-blue-800">Admin Authentication</span>
              </div>
              <span className="text-blue-600 font-medium">Enabled</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (coursesLoading || lecturersLoading || candidatesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-800">TeachTeam Admin Dashboard</h2>
          <p className="text-emerald-600 mt-1">Manage the tutor selection system</p>
        </div>
        
        {/* Navigation Tabs */}
        <div className="px-6 py-4">
          <div className="flex space-x-1">
            {[
              { id: 'overview', label: 'Overview', icon: '📊' },
              { id: 'courses', label: 'Courses', icon: '📚' },
              { id: 'lecturers', label: 'Lecturers', icon: '👨‍🏫' },
              { id: 'users', label: 'Users', icon: '👥' },
              { id: 'reports', label: 'Reports', icon: '📈' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
};

export default AdminDashboard;