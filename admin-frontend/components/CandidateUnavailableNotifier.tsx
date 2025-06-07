// admin-frontend/components/CandidateUnavailableNotifier.tsx - New component for admin dashboard
'use client';

import React, { useState } from 'react';
import { useMutation } from '@apollo/client';
import { MARK_CANDIDATE_UNAVAILABLE } from '../lib/queries';

interface CandidateUnavailableNotifierProps {
  candidate: {
    id: string;
    user: {
      name: string;
      email: string;
    };
  };
  onNotificationSent?: () => void;
}

export const CandidateUnavailableNotifier: React.FC<CandidateUnavailableNotifierProps> = ({
  candidate,
  onNotificationSent,
}) => {
  const [reason, setReason] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [markUnavailable, { loading, error }] = useMutation(MARK_CANDIDATE_UNAVAILABLE, {
    onCompleted: (data) => {
      if (data.markCandidateUnavailable.success) {
        const response = data.markCandidateUnavailable;
        alert(`✅ ${response.message}\n\nAffected courses (${response.affectedCourses.length}):\n${response.affectedCourses.join('\n')}`);
        setIsModalOpen(false);
        setReason('');
        onNotificationSent?.();
      }
    },
    onError: (error) => {
      alert(`❌ Error: ${error.message}`);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      alert('Please provide a reason for marking the candidate as unavailable.');
      return;
    }

    const confirmed = confirm(
      `⚠️ ASSIGNMENT 2 HD FEATURE - GraphQL Subscriptions\n\n` +
      `This will:\n` +
      `• Mark ${candidate.user.name} as unavailable\n` +
      `• Block candidate from logging in\n` +
      `• Reject all pending applications\n` +
      `• Send REAL-TIME notifications to lecturers via GraphQL subscriptions\n` +
      `• Show greyed out candidate in main TT website\n\n` +
      `This demonstrates the HD requirement for real-time features.\n\n` +
      `Continue?`
    );

    if (confirmed) {
      await markUnavailable({
        variables: {
          input: {
            candidateId: candidate.id,
            reason: reason.trim(),
          },
        },
      });
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700 transition-colors"
        title="HD Feature: Mark candidate unavailable and send real-time notifications"
      >
         Mark Unavailable
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Candidate Unavailability
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
             

              {/* Candidate Info */}
              <div className="mb-4 p-3 bg-blue-50 rounded-md">
                <p className="font-medium text-blue-900">{candidate.user.name}</p>
                <p className="text-sm text-blue-700">{candidate.user.email}</p>
              </div>

              {/* Reason Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for unavailability *
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  rows={3}
                  placeholder="e.g., Personal emergency, Health issues, Academic commitments..."
                  required
                />
              </div>

              {/* Error Display */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">Error: {error.message}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setReason('');
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors disabled:opacity-50"
                  disabled={loading || !reason.trim()}
                >
                  {'Sending Real-time Notifications...' }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};