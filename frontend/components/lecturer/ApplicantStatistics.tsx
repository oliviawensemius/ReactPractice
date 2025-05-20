// src/components/lecturer/ApplicantStatistics.tsx
import React, { useEffect, useState } from 'react';
import { lecturerService } from '@/services/lecturer.service';
import Notification from '@/components/ui/Notification';

interface ApplicantStatisticsProps {
  forceRefresh?: number; // to force refresh when selection changes
}

const ApplicantStatistics: React.FC<ApplicantStatisticsProps> = ({ forceRefresh = 0 }) => {
  const [stats, setStats] = useState<any>({
    mostSelected: null,
    leastSelected: null,
    unselectedApplicants: [],
    totalApplicants: 0,
    selectedCount: 0,
    pendingCount: 0,
    rejectedCount: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Load statistics
  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const stats = await lecturerService.getApplicantStatistics();
      setStats(stats);
    } catch (error: any) {
      console.error("Error loading statistics:", error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to load applicant statistics'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load statistics on component mount and when forceRefresh changes
  useEffect(() => {
    loadStatistics();
  }, [forceRefresh]);

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        <span className="ml-2 text-gray-600">Loading statistics...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-emerald-800 mb-6">Applicant Statistics</h2>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
          <h3 className="text-sm font-medium text-gray-500">Total Applicants</h3>
          <p className="text-2xl font-bold text-emerald-800">{stats.totalApplicants || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
          <h3 className="text-sm font-medium text-gray-500">Selected</h3>
          <p className="text-2xl font-bold text-green-600">{stats.selectedCount || 0}</p>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
          <h3 className="text-sm font-medium text-gray-500">Pending</h3>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount || 0}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-100">
          <h3 className="text-sm font-medium text-gray-500">Rejected</h3>
          <p className="text-2xl font-bold text-red-600">{stats.rejectedCount || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Most Selected Applicant */}
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-800 mb-2">Most Selected Applicant</h3>
          {stats.mostSelected ? (
            <div>
              <p className="text-xl font-bold">{stats.mostSelected.name}</p>
              <p className="text-green-600">
                Selected {stats.mostSelected.count} time{stats.mostSelected.count !== 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No applicants have been selected yet</p>
          )}
        </div>

        {/* Least Selected Applicant */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">Least Selected Applicant</h3>
          {stats.leastSelected ? (
            <div>
              <p className="text-xl font-bold">{stats.leastSelected.name}</p>
              <p className="text-yellow-600">
                Selected {stats.leastSelected.count} time{stats.leastSelected.count !== 1 ? 's' : ''}
              </p>
            </div>
          ) : (
            <p className="text-gray-500 italic">No applicants have been selected yet</p>
          )}
        </div>

        {/* Unselected Applicants */}
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h3 className="text-lg font-semibold text-red-800 mb-2">Unselected Applicants</h3>
          {stats.unselectedApplicants && stats.unselectedApplicants.length > 0 ? (
            <div>
              <p className="font-bold mb-2">{stats.unselectedApplicants.length} applicant(s)</p>
              <ul className="list-disc pl-5 text-red-700 max-h-32 overflow-y-auto">
                {stats.unselectedApplicants.map((applicant: any, index: number) => (
                  <li key={index}>{applicant.name}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-gray-500 italic">All applicants have been reviewed</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicantStatistics;