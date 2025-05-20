// app/(dashboard)/lecturer/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { lecturerService, ApplicantDisplayData } from '@/services/lecturer.service';
import ApplicantList from '@/components/lecturer/ApplicantList';
import ApplicantDetails from '@/components/lecturer/ApplicantDetails';
import SelectedCandidates from '@/components/lecturer/SelectedCandidates';
import SearchBar, { SearchCriteria } from '@/components/lecturer/SearchBar';
import ApplicantStatistics from '@/components/lecturer/ApplicantStatistics';
import Notification from '@/components/ui/Notification';

export default function LecturerDashboard() {
  // Router for navigation
  const router = useRouter();
  
  // User state
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Filtering state
  const [selectedCourse, setSelectedCourse] = useState<string>('All');
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria>({
    courseName: '',
    tutorName: '',
    availability: '',
    skillSet: ''
  });
  
  // Selected applicant state
  const [selectedApplicant, setSelectedApplicant] = useState<ApplicantDisplayData | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  
  // Notification state
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Initialize user and check authentication
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        
        // Get user from localStorage
        const user = authService.getCurrentUser();
        if (!user) {
          router.push('/signin');
          return;
        }
        
        // Check if user is a lecturer
        if (user.role !== 'lecturer') {
          setNotification({
            type: 'error',
            message: 'You must be a lecturer to access this page'
          });
          
          // Redirect to appropriate page based on role
          setTimeout(() => {
            if (user.role === 'candidate') {
              router.push('/tutor');
            } else {
              router.push('/');
            }
          }, 2000);
          return;
        }
        
        // Set current user
        setCurrentUser(user);
      } catch (error: any) {
        console.error("Error checking authentication:", error);
        setNotification({
          type: 'error',
          message: error.message || 'Authentication error. Please sign in again.'
        });
        
        // Redirect to sign in
        setTimeout(() => {
          router.push('/signin');
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);

  // Refresh data
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Handle search
  const handleSearch = (criteria: SearchCriteria) => {
    setSearchCriteria(criteria);
  };

  // Handle reset search
  const handleResetSearch = () => {
    setSearchCriteria({
      courseName: '',
      tutorName: '',
      availability: '',
      skillSet: ''
    });
  };

  // Update applicant
  const handleUpdateApplicant = (updatedApplicant: ApplicantDisplayData | null) => {
    setSelectedApplicant(updatedApplicant);
    
    // If status is changed, trigger a refresh
    if (updatedApplicant && selectedApplicant && updatedApplicant.status !== selectedApplicant.status) {
      setTimeout(refreshData, 500);
    }
  };

  // If still loading or not authenticated
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If not a lecturer
  if (!currentUser || currentUser.role !== 'lecturer') {
    return (
      <div className="container mx-auto p-4 max-w-md">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-emerald-800 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You must be a lecturer to access this page.
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Return Home
            </button>
            <button 
              onClick={() => router.push('/signin')}
              className="px-4 py-2 border border-emerald-600 text-emerald-600 rounded-md hover:bg-emerald-50"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <h1 className="text-3xl font-bold text-emerald-800 mb-6">Lecturer Dashboard</h1>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

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
          {/* Applicants List */}
          <div className="mb-8 bg-white p-4 rounded-lg shadow">
            <ApplicantList
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
              onUpdate={handleUpdateApplicant}
            />
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="my-8">
        <ApplicantStatistics forceRefresh={refreshTrigger} />
      </div>
    </div>
  );
}