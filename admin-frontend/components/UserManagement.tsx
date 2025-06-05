// admin-frontend/src/components/UserManagement.tsx
'use client';

import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ALL_CANDIDATES, TOGGLE_CANDIDATE_STATUS } from '@/lib/queries';

interface Candidate {
  id: string;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

const UserManagement: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_ALL_CANDIDATES);
  
  const [toggleCandidateStatus] = useMutation(TOGGLE_CANDIDATE_STATUS, {
    onCompleted: () => {
      refetch();
    }
  });

  const handleToggleStatus = async (candidateId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'block' : 'unblock';
    if (window.confirm(`Are you sure you want to ${action} this candidate?`)) {
      await toggleCandidateStatus({
        variables: { id: candidateId }
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-600">Error loading candidates: {error.message}</p>
      </div>
    );
  }

  const candidates: Candidate[] = data?.getAllCandidates || [];
  const activeCandidates = candidates.filter(c => c.is_active);
  const blockedCandidates = candidates.filter(c => !c.is_active);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-800">User Management</h2>
          <p className="text-emerald-600 mt-1">Block or unblock candidate login access</p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
              <h3 className="text-sm font-medium text-gray-500">Total Candidates</h3>
              <p className="text-2xl font-bold text-red-600">{blockedCandidates.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
          <h3 className="text-lg font-semibold text-emerald-800">
            All Candidates ({candidates.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Candidate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {candidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <span className="text-emerald-600 font-medium text-sm">
                            {candidate.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {candidate.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {candidate.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {candidate.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(candidate.created_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      candidate.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {candidate.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <button
                      onClick={() => handleToggleStatus(candidate.id, candidate.is_active)}
                      className={`font-medium ${
                        candidate.is_active
                          ? 'text-red-600 hover:text-red-700'
                          : 'text-green-600 hover:text-green-700'
                      }`}
                    >
                      {candidate.is_active ? 'Block' : 'Unblock'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {candidates.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No candidates found</h3>
              <p className="text-gray-500">No candidates are currently registered in the system.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
          <h3 className="text-lg font-semibold text-emerald-800">Quick Actions</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-emerald-200 rounded-lg">
              <h4 className="font-medium text-emerald-800 mb-2">Block Management</h4>
              <p className="text-sm text-gray-600 mb-3">
                Blocked candidates cannot sign in to the TeachTeam system.
              </p>
              <div className="text-sm">
                <span className="text-gray-500">Currently blocked: </span>
                <span className="font-medium text-red-600">{blockedCandidates.length} candidates</span>
              </div>
            </div>
            
            <div className="p-4 border border-emerald-200 rounded-lg">
              <h4 className="font-medium text-emerald-800 mb-2">Active Users</h4>
              <p className="text-sm text-gray-600 mb-3">
                Active candidates can sign in and submit applications.
              </p>
              <div className="text-sm">
                <span className="text-gray-500">Currently active: </span>
                <span className="font-medium text-green-600">{activeCandidates.length} candidates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;