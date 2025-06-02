// admin-frontend/src/app/candidates/page.tsx
'use client';

import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { GET_ALL_CANDIDATES, BLOCK_CANDIDATE, UNBLOCK_CANDIDATE } from '@/lib/queries';

interface Candidate {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
    created_at: string;
  };
  availability: string;
  skills?: string[];
  created_at: string;
}

const CandidateManagementPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const { data, loading, error, refetch } = useQuery(GET_ALL_CANDIDATES);
  
  const [blockCandidate] = useMutation(BLOCK_CANDIDATE, {
    onCompleted: () => {
      refetch();
    }
  });

  const [unblockCandidate] = useMutation(UNBLOCK_CANDIDATE, {
    onCompleted: () => {
      refetch();
    }
  });

  const handleToggleStatus = async (candidateId: string, currentStatus: boolean) => {
    const action = currentStatus ? 'block' : 'unblock';
    if (window.confirm(`Are you sure you want to ${action} this candidate?`)) {
      try {
        if (currentStatus) {
          await blockCandidate({
            variables: { candidateId }
          });
        } else {
          await unblockCandidate({
            variables: { candidateId }
          });
        }
      } catch (error) {
        console.error('Error toggling candidate status:', error);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
        </div>
      </AdminLayout>
    );
  }

  const candidates: Candidate[] = data?.getAllCandidates || [];
  const activeCandidates = candidates.filter(c => c.user.is_active);
  const blockedCandidates = candidates.filter(c => !c.user.is_active);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
            <h2 className="text-2xl font-bold text-emerald-800">User Management</h2>
            <p className="text-emerald-600 mt-1">Block or unblock candidate login access</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-emerald-50