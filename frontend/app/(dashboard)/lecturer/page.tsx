'use client';

import React, { useEffect, useState } from 'react';
import { getCourses } from '@/lib/storage';
import { Tutor, ApplicantDisplay, UserRole } from '@/lib/types';
import ApplicantList from '@/components/lecturer/ApplicantList';
import ApplicantDetails from '@/components/lecturer/ApplicantDetails';
import SelectedCandidates from '@/components/lecturer/SelectedCandidates';
import SearchBar, { SearchCriteria } from '@/components/lecturer/SearchBar';
import ApplicantStatistics from '@/components/lecturer/ApplicantStatistics';
import { getAllCoursesWithApplications, getApplicantsForCourse } from '@/lib/applicantList';
import { initializeUsers } from '@/lib/data';

export default function LecturerDashboard() {
  // User and course state
  const [email, setEmail] = useState<string | null>(null);
  const [courses, setCourses] = useState<string[]>([]);
  const [availableCourses, setAvailableCourses] = useState<string[]>([]);

  // Filters state
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    courseName: '', // Keeping this field for compatibility, but we won't use it
    tutorName: '',
    availability: '',
    skillSet: ''
  });

  // Selected applicant state
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantDisplay | null>(null);

  // Get all applicants (used for statistics)
  const [allApplicants, setAllApplicants] = useState<Tutor[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Initialize dummy data and get signed-in email & courses
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize dummy users for testing
      initializeUsers();

      // Get all courses with applications
      const coursesWithApps = getAllCoursesWithApplications();
      setAvailableCourses(coursesWithApps);

      const signedInEmail = localStorage.getItem('currentUserEmail');
      if (signedInEmail) {
        setEmail(signedInEmail);
        const userCourses = getCourses(signedInEmail);
        setCourses(userCourses || []);

        const allCoursesToCheck = [...new Set([...coursesWithApps, ...(userCourses || [])])];

        if (allCoursesToCheck.length) {
          const tutorData: Tutor[] = [];
          allCoursesToCheck.forEach((course: string) => {
            const applicants = getApplicantsForCourse(course);
            applicants.forEach(app => {
              if (!tutorData.some(t => t.email === app.tutorEmail)) {
                tutorData.push({
                  name: app.tutorName,
                  email: app.tutorEmail,
                  role: UserRole.Tutor,
                  password: '',
                  applications: []
                });
              }
            });
          });
          setAllApplicants(tutorData);
        }
      }
    }
  }, [refreshTrigger]);

  const handleSearch = (criteria: SearchCriteria) => {
    // Ignore courseName field
    setSearchCriteria({
      courseName: '', // Clear this field since we're not using it
      tutorName: criteria.tutorName,
      availability: criteria.availability,
      skillSet: criteria.skillSet
    });
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

  // Update when applicant status changes
  useEffect(() => {
    // If a selection was made, refresh the data
    if (selectedApplicant?.status === 'Selected') {
      refreshData();
    }
  }, [selectedApplicant?.status]);

  if (!email) {
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
          {/* Applicants List - Simplified without sorting */}
          <div className="mb-8 bg-white p-4 rounded-lg shadow">
            <ApplicantList
              courses={[...new Set([...courses, ...availableCourses])]}
              selectedCourse={selectedCourse}
              setSelectedCourse={setSelectedCourse}
              searchCriteria={searchCriteria}
              onSelectApplicant={setSelectedApplicant}
            />
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

                // If selection status changed, refresh data after a brief delay
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
        <ApplicantStatistics applicants={allApplicants} />
      </div>
    </div>
  );
};