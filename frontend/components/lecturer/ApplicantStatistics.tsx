// src/components/lecturer/ApplicantStatistics.tsx
import React, { useEffect, useState } from 'react';
import { lecturerService } from '@/services/lecturer.service';
import Notification from '@/components/ui/Notification';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  LabelList,
  Cell, 
} from 'recharts';

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
    rejectedCount: 0,
  });
  const [barData, setBarData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Load statistics
  const loadStatistics = async () => {
    try {
      setIsLoading(true);
      const stats = await lecturerService.getApplicantStatistics();
      setStats(stats);

      // Load bar data for most to least selected applicants
      const allStats = await lecturerService.getAllApplicationStatistics();
      setBarData(allStats);
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

  // load stats on component mount + when forceRefresh changes
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

  // prepare data for the bar chart
  const chartData = barData.map((item) => ({
    name: item.candidateName,
    selectedCount: item.selectedCount,
    isSelected: item.isSelected,
    barColor: item.isSelected ? "#059669" : "#a21caf", // emerald or purple (unselected)
  }));

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

      {/* bar grapgh in order of most --> least selected candidates*/}
      <div className="w-full max-w-3xl mx-auto my-8">
        <ResponsiveContainer width="100%" height={Math.max(60 + chartData.length * 40, 200)}>
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 20, right: 40, left: 40, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="name"
              width={150}
              tick={{ fontSize: 14 }}
            />
            <Tooltip
              formatter={(value: any, name: any, props: any) =>
                [`${value} time${value !== 1 ? 's' : ''} selected`, 'Selected']
              }
            />
            <Legend
              payload={[
                { value: 'Selected', type: 'square', color: '#059669' },
                { value: 'Unselected', type: 'square', color: '#a21caf' },
              ]}
            />
            <Bar
              dataKey="selectedCount"
              isAnimationActive
              label={{ position: 'right', fill: '#374151', fontWeight: 600 }}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.barColor} />
              ))}
              <LabelList dataKey="selectedCount" position="right" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* SUMMARY STATS (originally used alone in A1) */}
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
        {/* MOST Selected Applicant */}
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

        {/* LEAST Selected Applicant */}
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

        {/* UNSELECTED Applicants */}
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