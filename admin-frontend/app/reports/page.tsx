// admin-frontend/app/reports/page.tsx
'use client';

import React, { useState } from 'react';
import { useQuery } from '@apollo/client';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  GET_COURSE_APPLICATION_REPORTS, 
  GET_CANDIDATES_WITH_MULTIPLE_COURSES, 
  GET_UNSELECTED_CANDIDATES 
} from '@/lib/queries';

type ReportType = 'courseReports' | 'multipleCourses' | 'unselected';

interface CourseReport {
  courseCode: string;
  courseName: string;
  selectedCandidates: Array<{
    candidateName: string;
    candidateEmail: string;
    sessionType: string;
    ranking?: number;
  }>;
}

interface MultipleCourseCandidate {
  id: string;
  candidateName: string;
  candidateEmail: string;
  courseCount: number;
  courses: string[];
}

interface UnselectedCandidate {
  id: string;
  candidateName: string;
  candidateEmail: string;
  applicationCount: number;
  appliedCourses: string[];
}

const ReportsPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [activeReport, setActiveReport] = useState<ReportType>('courseReports');

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const { data: courseReportsData, loading: courseReportsLoading, error: courseReportsError } = useQuery(GET_COURSE_APPLICATION_REPORTS);
  const { data: multipleCoursesData, loading: multipleCoursesLoading, error: multipleCoursesError } = useQuery(GET_CANDIDATES_WITH_MULTIPLE_COURSES);
  const { data: unselectedData, loading: unselectedLoading, error: unselectedError } = useQuery(GET_UNSELECTED_CANDIDATES);

  const courseReports: CourseReport[] = courseReportsData?.getCourseApplicationReports || [];
  const multipleCoursesCandidates: MultipleCourseCandidate[] = multipleCoursesData?.getCandidatesWithMultipleCourses || [];
  const unselectedCandidates: UnselectedCandidate[] = unselectedData?.getUnselectedCandidates || [];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const renderError = (error: any, reportName: string) => (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <p className="text-red-600">Error loading {reportName}: {error?.message || 'Unknown error'}</p>
    </div>
  );

  const renderCourseReports = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
          <h3 className="text-lg font-semibold text-emerald-800">
            Selected Candidates by Course ({courseReports.length} courses)
          </h3>
          <p className="text-emerald-600 text-sm mt-1">
            List of candidates chosen for each course
          </p>
        </div>
        
        <div className="p-6">
          {courseReportsLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : courseReportsError ? (
            renderError(courseReportsError, 'course reports')
          ) : courseReports.length > 0 ? (
            <div className="space-y-6">
              {courseReports.map((report, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    {report.courseCode} - {report.courseName}
                  </h4>
                  
                  {report.selectedCandidates.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Candidate</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Email</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Role</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-500">Ranking</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {/* Create a copy of the array before sorting to avoid read-only error */}
                          {[...report.selectedCandidates]
                            .sort((a, b) => (a.ranking || 999) - (b.ranking || 999))
                            .map((candidate, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-2 font-medium text-gray-900">
                                {candidate.candidateName}
                              </td>
                              <td className="px-4 py-2 text-gray-600">
                                {candidate.candidateEmail}
                              </td>
                              <td className="px-4 py-2">
                                <span className="inline-flex px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                                  {candidate.sessionType === 'lab_assistant' ? 'Lab Assistant' : 'Tutor'}
                                </span>
                              </td>
                              <td className="px-4 py-2 text-gray-600">
                                {candidate.ranking ? `#${candidate.ranking}` : 'Not ranked'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      No candidates selected for this course yet
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No course reports available
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMultipleCourses = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-amber-50 border-b border-amber-100">
        <h3 className="text-lg font-semibold text-amber-800">
          Candidates with 3+ Course Selections ({multipleCoursesCandidates.length} candidates)
        </h3>
        <p className="text-amber-600 text-sm mt-1">
          Candidates chosen for more than 3 courses
        </p>
      </div>
      
      <div className="p-6">
        {multipleCoursesLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        ) : multipleCoursesError ? (
          renderError(multipleCoursesError, 'multiple courses report')
        ) : multipleCoursesCandidates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Candidate</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Email</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Course Count</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Courses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* FIXED: Create a copy of the array before sorting */}
                {[...multipleCoursesCandidates]
                  .sort((a, b) => b.courseCount - a.courseCount)
                  .map((candidate, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {candidate.candidateName}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {candidate.candidateEmail}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                        {candidate.courseCount} courses
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {candidate.courses.map((course, courseIdx) => (
                          <span key={courseIdx} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {course}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            No candidates selected for multiple courses
          </div>
        )}
      </div>
    </div>
  );

  const renderUnselectedCandidates = () => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-4 bg-red-50 border-b border-red-100">
        <h3 className="text-lg font-semibold text-red-800">
          Unselected Candidates ({unselectedCandidates.length} candidates)
        </h3>
        <p className="text-red-600 text-sm mt-1">
          Candidates who have not been chosen for any courses
        </p>
      </div>
      
      <div className="p-6">
        {unselectedLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-500"></div>
          </div>
        ) : unselectedError ? (
          renderError(unselectedError, 'unselected candidates report')
        ) : unselectedCandidates.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Candidate</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Email</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Applications</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-500">Applied Courses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {/* FIXED: Create a copy of the array before sorting */}
                {[...unselectedCandidates]
                  .sort((a, b) => b.applicationCount - a.applicationCount)
                  .map((candidate, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium text-gray-900">
                      {candidate.candidateName}
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      {candidate.candidateEmail}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                        {candidate.applicationCount} applications
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {candidate.appliedCourses.map((course, courseIdx) => (
                          <span key={courseIdx} className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                            {course}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            All candidates have been selected for at least one course
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Reports</h1>
          <p className="text-gray-600">
            Generate and view reports on candidate selections and course assignments
          </p>
        </div>

        {/* Report Navigation */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveReport('courseReports')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeReport === 'courseReports'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Course Reports
              </button>
              <button
                onClick={() => setActiveReport('multipleCourses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeReport === 'multipleCourses'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Multiple Courses
              </button>
              <button
                onClick={() => setActiveReport('unselected')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeReport === 'unselected'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Unselected Candidates
              </button>
            </nav>
          </div>

          {/* Report Content */}
          <div className="p-6">
            {activeReport === 'courseReports' && renderCourseReports()}
            {activeReport === 'multipleCourses' && renderMultipleCourses()}
            {activeReport === 'unselected' && renderUnselectedCandidates()}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;