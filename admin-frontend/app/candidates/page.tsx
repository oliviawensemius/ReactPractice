// admin-frontend/src/app/candidates/page.tsx - Enhanced with course information
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { GET_ALL_CANDIDATES_WITH_COURSES, TOGGLE_CANDIDATE_STATUS, BLOCK_CANDIDATE } from '@/lib/queries';

interface CandidateSelectedCourse {
  courseCode: string;
  courseName: string;
  semester: string;
  year: number;
  role: string;
  ranking?: number;
}

interface CandidateWithCourses {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
    is_blocked: boolean;
    blocked_reason?: string;
    blocked_at?: string;
    created_at: string;
  };
  availability: string;
  skills?: string[];
  created_at: string;
  selectedCourses: CandidateSelectedCourse[];
  totalApplications: number;
  selectedApplicationsCount: number;
}

const EnhancedCandidateManagementPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [expandedCandidate, setExpandedCandidate] = useState<string | null>(null);
  const [blockingCandidate, setBlockingCandidate] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState('');

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const { data, loading, error, refetch } = useQuery(GET_ALL_CANDIDATES_WITH_COURSES);
  
  const [toggleCandidateStatus] = useMutation(TOGGLE_CANDIDATE_STATUS, {
    onCompleted: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Error toggling candidate status:', error);
      alert(`Error: ${error.message}`);
    }
  });

  const [blockCandidate] = useMutation(BLOCK_CANDIDATE, {
    onCompleted: () => {
      refetch();
      setBlockingCandidate(null);
      setBlockReason('');
    },
    onError: (error) => {
      console.error('Error blocking candidate:', error);
      alert(`Error: ${error.message}`);
    }
  });

  const handleToggleStatus = async (candidateId: string, currentBlockedStatus: boolean) => {
    const action = currentBlockedStatus ? 'unblock' : 'block';
    if (window.confirm(`Are you sure you want to ${action} this candidate?`)) {
      try {
        await toggleCandidateStatus({
          variables: { id: candidateId }
        });
      } catch (error) {
        console.error('Error toggling candidate status:', error);
      }
    }
  };

  const handleBlockWithReason = async (candidateId: string, isBlocked: boolean) => {
    if (isBlocked && !blockReason.trim()) {
      alert('Please provide a reason for blocking this candidate.');
      return;
    }

    try {
      await blockCandidate({
        variables: {
          input: {
            candidateId,
            isBlocked,
            reason: isBlocked ? blockReason.trim() : null
          }
        }
      });
    } catch (error) {
      console.error('Error blocking candidate:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (candidate: CandidateWithCourses) => {
    if (candidate.user.is_blocked) return 'bg-red-100 text-red-800';
    if (!candidate.user.is_active) return 'bg-gray-100 text-gray-800';
    return 'bg-green-100 text-green-800';
  };

  const getStatusText = (candidate: CandidateWithCourses) => {
    if (candidate.user.is_blocked) return 'Blocked';
    if (!candidate.user.is_active) return 'Inactive';
    return 'Active';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">Error loading candidates: {error.message}</p>
          <button 
            onClick={() => refetch()} 
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  const candidates: CandidateWithCourses[] = data?.getAllCandidatesWithCourses || [];
  const activeCandidates = candidates.filter(c => !c.user.is_blocked && c.user.is_active);
  const blockedCandidates = candidates.filter(c => c.user.is_blocked);
  const inactiveCandidates = candidates.filter(c => !c.user.is_active && !c.user.is_blocked);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
            <h2 className="text-2xl font-bold text-emerald-800">Enhanced User Management</h2>
            <p className="text-emerald-600 mt-1">Block/unblock candidates and view their course selections</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                <h3 className="text-sm font-medium text-gray-500">Total Candidates</h3>
                <p className="text-2xl font-bold text-emerald-600">{candidates.length}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                <h3 className="text-sm font-medium text-gray-500">Active Candidates</h3>
                <p className="text-2xl font-bold text-green-600">{activeCandidates.length}</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                <h3 className="text-sm font-medium text-gray-500">Blocked Candidates</h3>
                <p className="text-2xl font-bold text-red-600">{blockedCandidates.length}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <h3 className="text-sm font-medium text-gray-500">Inactive Candidates</h3>
                <p className="text-2xl font-bold text-gray-600">{inactiveCandidates.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Blocking Modal */}
        {blockingCandidate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Block Candidate</h3>
              <p className="text-gray-600 mb-4">
                Please provide a reason for blocking this candidate:
              </p>
              <textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows={3}
                placeholder="Enter reason for blocking..."
              />
              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => {
                    setBlockingCandidate(null);
                    setBlockReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleBlockWithReason(blockingCandidate, true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Block Candidate
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Candidates List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
            <h3 className="text-lg font-semibold text-emerald-800">
              All Candidates ({candidates.length})
            </h3>
            <p className="text-sm text-emerald-600 mt-1">
              Click on a candidate to view their selected courses
            </p>
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
                    Applications
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Selected Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Availability
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
                  <React.Fragment key={candidate.id}>
                    <tr 
                      className={`hover:bg-gray-50 cursor-pointer ${expandedCandidate === candidate.id ? 'bg-emerald-25' : ''}`}
                      onClick={() => setExpandedCandidate(expandedCandidate === candidate.id ? null : candidate.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <span className="text-emerald-600 font-medium text-sm">
                                {candidate.user.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {candidate.user.name}
                              {expandedCandidate === candidate.id ? (
                                <span className="ml-2 text-emerald-600">▼</span>
                              ) : (
                                <span className="ml-2 text-gray-400">▶</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {candidate.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {candidate.user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {candidate.totalApplications} total
                          </span>
                          <span className="text-xs text-gray-500">
                            {candidate.selectedApplicationsCount} selected
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {candidate.selectedCourses.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {candidate.selectedCourses.slice(0, 2).map((course, idx) => (
                              <span key={idx} className="inline-block px-2 py-1 text-xs bg-emerald-100 text-emerald-700 rounded">
                                {course.courseCode}
                              </span>
                            ))}
                            {candidate.selectedCourses.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{candidate.selectedCourses.length - 2} more
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No selections</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          candidate.availability === 'fulltime' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {candidate.availability === 'fulltime' ? 'Full-time' : 'Part-time'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(candidate)}`}>
                          {getStatusText(candidate)}
                        </span>
                        {candidate.user.is_blocked && candidate.user.blocked_reason && (
                          <div className="text-xs text-red-600 mt-1 max-w-xs truncate" title={candidate.user.blocked_reason}>
                            {candidate.user.blocked_reason}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        {candidate.user.is_blocked ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatus(candidate.id, candidate.user.is_blocked);
                            }}
                            className="text-green-600 hover:text-green-700 font-medium"
                          >
                            Unblock
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setBlockingCandidate(candidate.id);
                            }}
                            className="text-red-600 hover:text-red-700 font-medium"
                          >
                            Block
                          </button>
                        )}
                      </td>
                    </tr>
                    
                    {/* Expanded Row - Course Details */}
                    {expandedCandidate === candidate.id && (
                      <tr>
                        <td colSpan={7} className="px-6 py-4 bg-emerald-50">
                          <div className="space-y-4">
                            <h4 className="font-medium text-emerald-800">Selected Courses & Applications</h4>
                            
                            {candidate.selectedCourses.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {candidate.selectedCourses.map((course, idx) => (
                                  <div key={idx} className="bg-white p-4 rounded-lg border border-emerald-200">
                                    <div className="font-medium text-gray-900">{course.courseCode}</div>
                                    <div className="text-sm text-gray-600">{course.courseName}</div>
                                    <div className="text-sm text-gray-500">{course.semester} {course.year}</div>
                                    <div className="mt-2 flex items-center justify-between">
                                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded">
                                        {course.role === 'lab_assistant' ? 'Lab Assistant' : 'Tutor'}
                                      </span>
                                      {course.ranking && (
                                        <span className="text-xs text-gray-500">
                                          Rank #{course.ranking}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-center py-8">
                                <div className="text-gray-400 mb-2">
                                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                                <p className="text-gray-500">No courses selected yet</p>
                                {candidate.totalApplications > 0 && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Has {candidate.totalApplications} application(s) pending review
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Additional candidate information */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-emerald-200">
                              <div>
                                <h5 className="text-sm font-medium text-gray-700">Skills</h5>
                                {candidate.skills && candidate.skills.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {candidate.skills.map((skill, idx) => (
                                      <span key={idx} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                                        {skill}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-500">No skills listed</p>
                                )}
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-700">Joined</h5>
                                <p className="text-sm text-gray-600">{formatDate(candidate.user.created_at)}</p>
                              </div>
                              <div>
                                <h5 className="text-sm font-medium text-gray-700">Application Summary</h5>
                                <p className="text-sm text-gray-600">
                                  {candidate.selectedApplicationsCount} selected out of {candidate.totalApplications} applications
                                </p>
                              </div>
                            </div>

                            {/* Blocking information if applicable */}
                            {candidate.user.is_blocked && (
                              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                <h5 className="text-sm font-medium text-red-800">Blocking Information</h5>
                                <p className="text-sm text-red-600 mt-1">
                                  <strong>Reason:</strong> {candidate.user.blocked_reason || 'No reason provided'}
                                </p>
                                {candidate.user.blocked_at && (
                                  <p className="text-xs text-red-500 mt-1">
                                    Blocked on: {formatDate(candidate.user.blocked_at)}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
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

        {/* Summary Cards */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
            <h3 className="text-lg font-semibold text-emerald-800">Blocking System Information</h3>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border border-emerald-200 rounded-lg">
                <h4 className="font-medium text-emerald-800 mb-2">How Blocking Works</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Blocked candidates cannot sign in to TeachTeam</li>
                  <li>• Their login attempts are rejected with the blocking reason</li>
                  <li>• Existing sessions are invalidated when blocked</li>
                  <li>• Admins can provide custom blocking reasons</li>
                  <li>• Blocking is reversible (unblock function available)</li>
                </ul>
              </div>
              
              <div className="p-4 border border-emerald-200 rounded-lg">
                <h4 className="font-medium text-emerald-800 mb-2">System Status</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Candidates:</span>
                    <span className="font-medium text-gray-900">{candidates.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Can Login:</span>
                    <span className="font-medium text-green-600">{activeCandidates.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Blocked from Login:</span>
                    <span className="font-medium text-red-600">{blockedCandidates.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">With Course Selections:</span>
                    <span className="font-medium text-emerald-600">
                      {candidates.filter(c => c.selectedApplicationsCount > 0).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default EnhancedCandidateManagementPage;