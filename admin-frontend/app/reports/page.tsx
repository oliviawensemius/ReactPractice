// admin-frontend/src/app/reports/page.tsx
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
                          {report.selectedCandidates
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
                    <p className="text-gray-500 italic">No candidates selected for this course yet.</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No course reports available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderMultipleCourses = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
          <h3 className="text-lg font-semibold text-emerald-800">
            Candidates Selected for Multiple Courses ({multipleCoursesCandidates.length})
          </h3>
          <p className="text-emerald-600 text-sm mt-1">
            Candidates chosen for more than 3 courses
          </p>
        </div>
        
        <div className="p-6">
          {multipleCoursesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : multipleCoursesError ? (
            renderError(multipleCoursesError, 'multiple courses report')
          ) : multipleCoursesCandidates.length > 0 ? (
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
                      Course Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Courses
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {multipleCoursesCandidates
                    .sort((a, b) => b.courseCount - a.courseCount)
                    .map((candidate, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <span className="text-emerald-600 font-medium text-sm">
                                {candidate.candidateName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {candidate.candidateName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {candidate.candidateEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800">
                          {candidate.courseCount} courses
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex flex-wrap gap-1">
                          {candidate.courses.map((course, idx) => (
                            <span key={idx} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
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
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No candidates with multiple courses</h4>
              <p className="text-gray-500">No candidates have been selected for more than 3 courses.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderUnselected = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
          <h3 className="text-lg font-semibold text-emerald-800">
            Unselected Candidates ({unselectedCandidates.length})
          </h3>
          <p className="text-emerald-600 text-sm mt-1">
            Candidates who have not been chosen for any courses
          </p>
        </div>
        
        <div className="p-6">
          {unselectedLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : unselectedError ? (
            renderError(unselectedError, 'unselected candidates report')
          ) : unselectedCandidates.length > 0 ? (
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
                      Applied Courses
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {unselectedCandidates
                    .sort((a, b) => b.applicationCount - a.applicationCount)
                    .map((candidate, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-red-600 font-medium text-sm">
                                {candidate.candidateName.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {candidate.candidateName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {candidate.candidateEmail}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                          {candidate.applicationCount} applications
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="flex flex-wrap gap-1">
                          {candidate.appliedCourses.map((course, idx) => (
                            <span key={idx} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
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
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">All candidates have been selected</h4>
              <p className="text-gray-500">Great! All candidates who applied have been selected for at least one course.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
            <h2 className="text-2xl font-bold text-emerald-800">Reports</h2>
            <p className="text-emerald-600 mt-1">Generate and view application reports</p>
          </div>
          
          {/* Report Type Navigation */}
          <div className="px-6 py-4">
            <div className="flex space-x-4 flex-wrap">
              <button
                onClick={() => setActiveReport('courseReports')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeReport === 'courseReports'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                📚 Course Selection Reports
              </button>
              <button
                onClick={() => setActiveReport('multipleCourses')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeReport === 'multipleCourses'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🎯 Multiple Course Candidates
              </button>
              <button
                onClick={() => setActiveReport('unselected')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  activeReport === 'unselected'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                ❌ Unselected Candidates
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        {activeReport === 'courseReports' && renderCourseReports()}
        {activeReport === 'multipleCourses' && renderMultipleCourses()}
        {activeReport === 'unselected' && renderUnselected()}
      </div>
    </AdminLayout>
  );
};

export default ReportsPage;