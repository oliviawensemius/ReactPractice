'use client';

import React, { useEffect, useState } from 'react';
import { ApplicantDisplay } from '@/lib/types';
import ApplicantList from '@/components/lecturer/ApplicantList';
import ApplicantDetails from '@/components/lecturer/ApplicantDetails';
import SelectedCandidates from '@/components/lecturer/SelectedCandidates';
import SearchBar, { SearchCriteria } from '@/components/lecturer/SearchBar';
import ApplicantStatistics from '@/components/lecturer/ApplicantStatistics';
import { authService } from '@/services/auth.service';
import { courseService } from '@/services/course.service';
import { getApplicationsByCourse, getAllApplications } from '@/services/application.service';
interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  year: number;
}

interface Application {
  id: string;
  status: string;
  ranking?: number;
  comments?: string[];
  candidate: {
    id: string;
    name: string;
    email: string;
    skills?: string[];
    availability?: string;
    academicCredentials?: any[];
    previousRoles?: any[];
  };
  course: {
    id: string;
    code: string;
    name: string;
  };
}

export default function LecturerDashboard() {
  // User and course state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [lecturerCourses, setLecturerCourses] = useState<Course[]>([]);
  const [allApplications, setAllApplications] = useState<Application[]>([]);

  // Filters state
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    courseName: '',
    tutorName: '',
    availability: '',
    skillSet: ''
  });

  // Selected applicant state
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantDisplay | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Initialize user and fetch data
  useEffect(() => {
    const initializeDashboard = async () => {
      const user = authService.getCurrentUser();
      if (!user) {
        return;
      }
      
      setCurrentUser(user);

      try {
        // Get lecturer's courses
        const courses = await courseService.getCoursesForLecturer(user.id);
        setLecturerCourses(courses);

        // Get all applications for the lecturer's courses
        const allApps: Application[] = [];
        for (const course of courses) {
          const courseApps = await getApplicationsByCourse(course.id);
          allApps.push(...courseApps);
        }
        setAllApplications(allApps);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    initializeDashboard();
  }, [refreshTrigger]);

  // Convert applications to ApplicantDisplay format
  const convertToApplicantDisplay = (applications: Application[]): ApplicantDisplay[] => {
    return applications.map(app => ({
      id: app.id,
      tutorName: app.candidate.name,
      tutorEmail: app.candidate.email,
      courseId: app.course.id,
      courseCode: app.course.code,
      courseName: app.course.name,
      role: 'tutor', // You might want to add this to your Application entity
      skills: app.candidate.skills || [],
      previousRoles: app.candidate.previousRoles || [],
      academicCredentials: app.candidate.academicCredentials || [],
      availability: app.candidate.availability as 'fulltime' | 'parttime' || 'parttime',
      status: app.status as 'Pending' | 'Selected' | 'Rejected',
      comments: app.comments || [],
      ranking: app.ranking
    }));
  };

  // Filter applications based on search criteria and selected course
  const getFilteredApplications = (): ApplicantDisplay[] => {
    let filteredApps = allApplications;

    // Filter by course
    if (selectedCourse !== 'All') {
      filteredApps = filteredApps.filter(app => app.course.id === selectedCourse);
    }

    // Convert to ApplicantDisplay format
    let applicantDisplays = convertToApplicantDisplay(filteredApps);

    // Apply search filters
    if (searchCriteria.tutorName) {
      applicantDisplays = applicantDisplays.filter(app =>
        app.tutorName.toLowerCase().includes(searchCriteria.tutorName.toLowerCase())
      );
    }

    if (searchCriteria.availability) {
      applicantDisplays = applicantDisplays.filter(app =>
        app.availability === searchCriteria.availability
      );
    }

    if (searchCriteria.skillSet) {
      applicantDisplays = applicantDisplays.filter(app =>
        app.skills.some(skill =>
          skill.toLowerCase().includes(searchCriteria.skillSet.toLowerCase())
        )
      );
    }

    return applicantDisplays;
  };

  const handleSearch = (criteria: SearchCriteria) => {
    setSearchCriteria(criteria);
  };

  const handleResetSearch = () => {
    setSearchCriteria({
      courseName: '',
      tutorName: '',
      availability: '',
      skillSet: ''
    });
  };

  // Function to refresh data
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-emerald-800 mb-4">Loading Dashboard...</h2>
          <p className="text-gray-600">
            Please sign in to access the lecturer dashboard.
          </p>
          <div className="mt-6 flex justify-center">
            <a
              href="/signin"
              className="px-4 py-2 bg-emerald-700 text-white rounded hover:bg-emerald-800 transition-colors"
            >
              Go to Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }

  const filteredApplications = getFilteredApplications();

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold text-emerald-800 mb-6">Lecturer Dashboard</h1>

      {/* Search Controls */}
      <div className="mb-6">
        <SearchBar
          onSearch={handleSearch}
          onReset={handleResetSearch}
          showCourseSearch={false}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column */}
        <div className="w-full lg:w-1/2">
          {/* Course Selection */}
          <div className="mb-4">
            <label htmlFor="courseFilter" className="block font-semibold">Filter by Course:</label>
            <select
              id="courseFilter"
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="All">All Courses</option>
              {lecturerCourses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Applicants List */}
          <div className="mb-8 bg-white p-4 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Applicants</h2>
            <div className="w-full overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 bg-white shadow-lg">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 px-4 py-2">Course Code</th>
                    <th className="border border-gray-300 px-4 py-2">Course Name</th>
                    <th className="border border-gray-300 px-4 py-2">Applicant Name</th>
                    <th className="border border-gray-300 px-4 py-2">Availability</th>
                    <th className="border border-gray-300 px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.length > 0 ? (
                    filteredApplications.map((applicant) => (
                      <tr
                        key={applicant.id}
                        className={`
                          border border-gray-300 cursor-pointer hover:bg-gray-100
                          ${applicant.status === 'Selected' ? 'bg-green-50' : ''}
                          ${applicant.status === 'Rejected' ? 'bg-red-50' : ''}
                        `}
                        onClick={() => setSelectedApplicant(applicant)}
                      >
                        <td className="border border-gray-300 px-4 py-2">{applicant.courseCode}</td>
                        <td className="border border-gray-300 px-4 py-2">{applicant.courseName}</td>
                        <td className="border border-gray-300 px-4 py-2">{applicant.tutorName}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {applicant.availability === 'fulltime' ? 'Full-time' : 'Part-time'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className={`
                            px-2 py-1 rounded-full text-xs font-medium
                            ${applicant.status === 'Selected' ? 'bg-green-200 text-green-800' : ''}
                            ${applicant.status === 'Rejected' ? 'bg-red-200 text-red-800' : ''}
                            ${applicant.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                          `}>
                            {applicant.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={5}
                        className="border border-gray-300 px-4 py-2 text-center text-gray-500 italic"
                      >
                        No applicants available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Selected Candidates */}
          <div className="bg-white p-4 rounded-lg shadow">
            <SelectedCandidates
              onSelectApplicant={setSelectedApplicant}
              onRankingUpdated={refreshData}
              forceRefresh={refreshTrigger}
            />
          </div>
        </div>

        {/* Right Column - Applicant Details */}
        <div className="w-full lg:w-1/2 sticky top-4 self-start">
          <div className="bg-white p-4 rounded-lg shadow">
            <ApplicantDetails
              selectedApplicant={selectedApplicant}
              onUpdate={(updatedApplicant) => {
                setSelectedApplicant(updatedApplicant);
                if (updatedApplicant?.status !== selectedApplicant?.status) {
                  setTimeout(refreshData, 500);
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="mb-8">
        <ApplicantStatistics applicants={[]} />
      </div>
    </div>
  );
};