// frontend/components/tutor/MyApplications.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { getApplicationsByCandidate } from '@/services/application.service';

interface Application {
  id: string;
  status: string;
  ranking?: number;
  comments?: string[];
  createdAt: string;
  course: {
    id: string;
    code: string;
    name: string;
  };
  sessionTypes: Array<{
    id: string;
    name: string;
  }>;
}

const MyApplications: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      loadApplications();
    }
  }, [loadApplications]);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const apps = await getApplicationsByCandidate(currentUser!.id);
      setApplications(apps);
    } catch (error) {
      console.error('Error loading applications:', error);
      setError('Failed to load applications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Selected': return 'bg-green-100 text-green-800 border-green-200';
      case 'Rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Selected': return '✓';
      case 'Rejected': return '✗';
      default: return '⏳';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadApplications}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Total Applications</h3>
          <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Selected</h3>
          <p className="text-2xl font-bold text-green-600">
            {applications.filter(app => app.status === 'Selected').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {applications.filter(app => app.status === 'Pending').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
          <p className="text-2xl font-bold text-red-600">
            {applications.filter(app => app.status === 'Rejected').length}
          </p>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <div className="max-w-md mx-auto">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
            <p className="text-gray-500 mb-4">You haven&apos;t submitted any applications yet.</p>
            <a 
              href="/tutor"
              className="inline-block px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Apply for Courses
            </a>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Applications List */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Applications</h2>
            {applications.map(app => (
              <div 
                key={app.id}
                className={`p-4 rounded-lg shadow cursor-pointer transition-all border ${
                  selectedApp?.id === app.id 
                    ? 'bg-emerald-50 border-emerald-200 ring-2 ring-emerald-200' 
                    : 'bg-white hover:shadow-md'
                }`}
                onClick={() => setSelectedApp(app)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{app.course.code}</h3>
                    <p className="text-gray-600">{app.course.name}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                    {getStatusIcon(app.status)} {app.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                  <span>Applied: {formatDate(app.createdAt || new Date().toISOString())}</span>
                  {app.ranking && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">
                      Rank #{app.ranking}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Application Details */}
          <div className="lg:sticky lg:top-4 h-fit">
            <div className="bg-white p-6 rounded-lg shadow-md">
              {selectedApp ? (
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">Application Details</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Course</h4>
                      <p className="text-lg">{selectedApp.course.code} - {selectedApp.course.name}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">Status</h4>
                      <span className={`px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(selectedApp.status)}`}>
                        {getStatusIcon(selectedApp.status)} {selectedApp.status}
                      </span>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-700 mb-1">Application Date</h4>
                      <p>{formatDate(selectedApp.createdAt || new Date().toISOString())}</p>
                    </div>
                    
                    {selectedApp.ranking && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Current Ranking</h4>
                        <p className="text-lg font-semibold text-blue-600">#{selectedApp.ranking}</p>
                      </div>
                    )}
                    
                    {selectedApp.comments && selectedApp.comments.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Lecturer Comments</h4>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <ul className="space-y-2">
                            {selectedApp.comments.map((comment, index) => (
                              <li key={index} className="text-gray-700 border-l-3 border-emerald-300 pl-3">
                                {comment}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <p className="text-gray-500">Click on an application to view details</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyApplications;