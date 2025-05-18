// src/components/lecturer/ApplicantStatistics.tsx
import React, { useEffect, useState } from 'react';
import { Tutor } from '@/lib/types';
import { getApplicantStatistics } from '@/lib/applicantList';

interface ApplicantStatisticsProps {
  applicants: Tutor[];
}

interface StatisticsResult {
  mostSelected: { email: string; name: string; count: number } | null;
  leastSelected: { email: string; name: string; count: number } | null;
  unselectedApplicants: Array<{ email: string; name: string }>;
}

const ApplicantStatistics: React.FC<ApplicantStatisticsProps> = () => {
  const [stats, setStats] = useState<StatisticsResult>({
    mostSelected: null,
    leastSelected: null,
    unselectedApplicants: []
  });

  // Update statistics
  useEffect(() => {
    const currentStats = getApplicantStatistics();
    setStats(currentStats);
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-emerald-800 mb-6">Applicant Statistics</h2>

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
                {stats.unselectedApplicants.map((applicant, index) => (
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