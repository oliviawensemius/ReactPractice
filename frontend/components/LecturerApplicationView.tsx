// frontend/components/LecturerApplicationView.tsx - Enhanced with real-time updates
'use client';

import React from 'react';
import { useCandidateAvailability } from './CandidateUnavailableListener';

interface Application {
  id: string;
  candidate: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  status: string;
  course: {
    code: string;
    name: string;
  };
  sessionType: string;
}

interface LecturerApplicationViewProps {
  applications: Application[];
}

export const LecturerApplicationView: React.FC<LecturerApplicationViewProps> = ({
  applications,
}) => {
  const { isCandidateUnavailable, getUnavailableInfo } = useCandidateAvailability();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Applications</h2>
        <div className="text-sm text-gray-600">
          Real-time updates via GraphQL subscriptions
        </div>
      </div>
      
      {applications.map((application) => {
        const isUnavailable = isCandidateUnavailable(application.candidate.id);
        const unavailableInfo = getUnavailableInfo(application.candidate.id);
        
        return (
          <div
            key={application.id}
            className={`p-4 border rounded-lg transition-all duration-300 ${
              isUnavailable 
                ? 'candidate-unavailable border-red-300 bg-red-50 opacity-70' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {/* HD FEATURE: Real-time Unavailable Warning */}
            {isUnavailable && unavailableInfo && (
              <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-md">
                <div className="flex items-center">
                  <span className="text-xs bg-red-600 text-white px-2 py-1 rounded font-semibold mr-2">
                    HD FEATURE - REAL-TIME UPDATE
                  </span>
                  <span className="text-red-800 font-semibold">⚠️ Candidate Unavailable</span>
                </div>
                <p className="text-red-700 text-sm mt-1">
                  <strong>Reason:</strong> {unavailableInfo.reason}
                </p>
                <p className="text-red-600 text-xs mt-1">
                  Notified: {new Date(unavailableInfo.timestamp).toLocaleString()} 
                  • Via GraphQL Subscription
                </p>
              </div>
            )}

            {/* Application Details */}
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className={`font-medium ${
                  isUnavailable ? 'text-gray-500 line-through' : 'text-gray-900'
                }`}>
                  {application.candidate.user.name}
                </h3>
                <p className={`text-sm ${
                  isUnavailable ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {application.candidate.user.email}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className={`text-sm ${
                    isUnavailable ? 'text-gray-400' : 'text-gray-700'
                  }`}>
                    {application.course.code} - {application.sessionType}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    application.status === 'Selected' ? 'bg-green-100 text-green-800' :
                    application.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {application.status}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                {!isUnavailable && application.status === 'Pending' && (
                  <>
                    <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                      Accept
                    </button>
                    <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700">
                      Reject
                    </button>
                  </>
                )}
                {isUnavailable && (
                  <div className="text-red-600 text-sm font-medium">
                    No longer available
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};