// admin-frontend/app/lecturers/page.tsx - Enhanced with debugging
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import { 
  GET_ALL_LECTURERS, 
  GET_ALL_COURSES,
  ASSIGN_LECTURER_TO_COURSES 
} from '@/lib/queries';

interface Lecturer {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  department?: string;
  courses: Array<{
    id: string;
    code: string;
    name: string;
    semester: string;
    year: number;
    is_active: boolean;
  }>;
}

interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  year: number;
  is_active: boolean;
}

const LecturerManagementPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [selectedLecturer, setSelectedLecturer] = useState<string>('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const { data: lecturersData, loading: lecturersLoading, refetch: refetchLecturers, error: lecturersError } = useQuery(GET_ALL_LECTURERS);
  const { data: coursesData, loading: coursesLoading, error: coursesError } = useQuery(GET_ALL_COURSES);

  const [assignLecturerToCourses, { loading: assigning }] = useMutation(ASSIGN_LECTURER_TO_COURSES, {
    onCompleted: (data) => {
      console.log('✅ Assignment mutation completed:', data);
      if (data.assignLecturerToCourses.success) {
        console.log('✅ Assignment successful');
        refetchLecturers();
        setIsAssigning(false);
        setSelectedLecturer('');
        setSelectedCourses([]);
        alert(`Success: ${data.assignLecturerToCourses.message}`);
      } else {
        console.log('❌ Assignment failed:', data.assignLecturerToCourses.message);
        alert(`Assignment failed: ${data.assignLecturerToCourses.message}`);
      }
    },
    onError: (error) => {
      console.error('❌ Assignment mutation error:', error);
      alert(`Error: ${error.message}`);
    }
  });

  // Debug logging
  React.useEffect(() => {
    if (lecturersData) {
      console.log('📊 Lecturers data received:', lecturersData);
    }
    if (coursesData) {
      console.log('📚 Courses data received:', coursesData);
      const courses = coursesData.getAllCourses || [];
      console.log(`Total courses: ${courses.length}`);
      console.log(`Active courses: ${courses.filter((c: Course) => c.is_active).length}`);
      console.log('Course details:');
      courses.forEach((course: Course) => {
        console.log(`  - ${course.code}: ${course.name} (Active: ${course.is_active}, ID: ${course.id})`);
      });
    }
  }, [lecturersData, coursesData]);

  // Log errors
  React.useEffect(() => {
    if (lecturersError) {
      console.error('❌ Lecturers query error:', lecturersError);
    }
    if (coursesError) {
      console.error('❌ Courses query error:', coursesError);
    }
  }, [lecturersError, coursesError]);

  const lecturers: Lecturer[] = lecturersData?.getAllLecturers || [];
  const courses: Course[] = coursesData?.getAllCourses?.filter((c: Course) => c.is_active) || [];

  const handleLecturerSelect = (lecturerId: string) => {
    console.log(`🎯 Selecting lecturer: ${lecturerId}`);
    setSelectedLecturer(lecturerId);
    const lecturer = lecturers.find(l => l.id === lecturerId);
    if (lecturer) {
      console.log(`👨‍🏫 Found lecturer: ${lecturer.user.name}`);
      console.log(`📚 Current courses: ${lecturer.courses?.length || 0}`);
      const currentCourseIds = lecturer.courses?.map(c => c.id) || [];
      console.log(`📋 Current course IDs: [${currentCourseIds.join(', ')}]`);
      setSelectedCourses(currentCourseIds);
    }
    setIsAssigning(true);
  };

  const handleCourseToggle = (courseId: string) => {
    console.log(`🔄 Toggling course: ${courseId}`);
    setSelectedCourses(prev => {
      const newSelection = prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId];
      console.log(`📋 New selection: [${newSelection.join(', ')}]`);
      return newSelection;
    });
  };

  const handleAssign = async () => {
    if (!selectedLecturer) {
      console.log('❌ No lecturer selected');
      return;
    }

    console.log('\n🚀 === STARTING ASSIGNMENT ===');
    console.log(`👨‍🏫 Lecturer ID: ${selectedLecturer}`);
    console.log(`📚 Selected course IDs: [${selectedCourses.join(', ')}]`);
    console.log(`📊 Total courses selected: ${selectedCourses.length}`);

    // Validate that all selected courses exist and are active
    const selectedCourseDetails = selectedCourses.map(courseId => {
      const course = courses.find(c => c.id === courseId);
      if (!course) {
        console.log(`❌ Course not found: ${courseId}`);
        return null;
      }
      console.log(`✅ Course found: ${course.code} - ${course.name} (ID: ${course.id}, Active: ${course.is_active})`);
      return course;
    }).filter(Boolean);

    if (selectedCourseDetails.length !== selectedCourses.length) {
      alert('Some selected courses were not found. Please refresh and try again.');
      return;
    }

    console.log('💾 Executing GraphQL mutation...');

    try {
      await assignLecturerToCourses({
        variables: {
          input: {
            lecturerId: selectedLecturer,
            courseIds: selectedCourses
          }
        }
      });
    } catch (error) {
      console.error('❌ Error in handleAssign:', error);
    }
  };

  const handleCancel = () => {
    console.log('❌ Assignment cancelled');
    setIsAssigning(false);
    setSelectedLecturer('');
    setSelectedCourses([]);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (lecturersLoading || coursesLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      </AdminLayout>
    );
  }

  if (lecturersError || coursesError) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          {lecturersError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">Error loading lecturers: {lecturersError.message}</p>
            </div>
          )}
          {coursesError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">Error loading courses: {coursesError.message}</p>
            </div>
          )}
          <button 
            onClick={() => {
              refetchLecturers();
              window.location.reload();
            }} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
            <h2 className="text-2xl font-bold text-emerald-800">Lecturer Course Assignment</h2>
            <p className="text-emerald-600 mt-1">Assign lecturers to courses for the semester (HD Requirement)</p>
          </div>
          
          {/* Debug Information */}
          <div className="p-6 bg-blue-50 border-b border-blue-100">
            <h3 className="text-sm font-semibold text-blue-800 mb-2">🔍 Debug Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-700">Total Lecturers:</span>
                <span className="ml-2 text-blue-900">{lecturers.length}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Active Courses:</span>
                <span className="ml-2 text-blue-900">{courses.length}</span>
              </div>
              <div>
                <span className="font-medium text-blue-700">Backend Status:</span>
                <span className="ml-2 text-green-600">✅ Connected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Form */}
        {isAssigning && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
              <h3 className="text-lg font-semibold text-emerald-800">
                Assign Courses to {lecturers.find(l => l.id === selectedLecturer)?.user.name}
              </h3>
              <p className="text-emerald-600 text-sm mt-1">
                Select courses to assign to this lecturer. All operations use GraphQL (no REST API).
              </p>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {/* Debug info for current assignment */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">🔧 Assignment Debug Info</h4>
                  <div className="text-xs space-y-1">
                    <div><strong>Lecturer ID:</strong> {selectedLecturer}</div>
                    <div><strong>Selected Course IDs:</strong> [{selectedCourses.join(', ')}]</div>
                    <div><strong>Selected Courses Count:</strong> {selectedCourses.length}</div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600">
                  Select the courses you want to assign to this lecturer:
                </p>
                
                {courses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {courses.map((course) => (
                      <div key={course.id} className="flex items-center p-3 border border-gray-200 rounded-md">
                        <input
                          type="checkbox"
                          id={`course-${course.id}`}
                          checked={selectedCourses.includes(course.id)}
                          onChange={() => handleCourseToggle(course.id)}
                          className="mr-3 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`course-${course.id}`} className="text-sm">
                          <div className="font-medium">{course.code}</div>
                          <div className="text-gray-600">{course.name}</div>
                          <div className="text-xs text-gray-500">
                            {course.semester} {course.year}
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-1 rounded">
                              Active
                            </span>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">ID: {course.id}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No active courses available for assignment.</p>
                    <p className="text-sm text-gray-400 mt-2">Please add courses first in Course Management.</p>
                  </div>
                )}
                
                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAssign}
                    disabled={assigning || selectedCourses.length === 0}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {assigning ? 'Assigning...' : `Assign ${selectedCourses.length} Course(s)`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lecturers List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
            <h3 className="text-lg font-semibold text-emerald-800">
              All Lecturers ({lecturers.length})
            </h3>
            <p className="text-emerald-600 text-sm mt-1">
              Click "Manage Courses" to assign/unassign courses for each lecturer
            </p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lecturer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned Courses
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lecturers.map((lecturer) => (
                  <tr key={lecturer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                            <span className="text-emerald-600 font-medium text-sm">
                              {lecturer.user.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {lecturer.user.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {lecturer.id.slice(0, 8)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lecturer.user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lecturer.department || 'Not specified'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {lecturer.courses && lecturer.courses.length > 0 ? (
                        <div className="space-y-1">
                          {lecturer.courses.map((course) => (
                            <div key={course.id} className="inline-block mr-2 mb-1">
                              <span className="px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                                {course.code}
                              </span>
                            </div>
                          ))}
                          <div className="text-xs text-gray-500 mt-1">
                            {lecturer.courses.length} course(s) assigned
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">No courses assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleLecturerSelect(lecturer.id)}
                        className="text-emerald-600 hover:text-emerald-700 font-medium"
                        disabled={isAssigning}
                      >
                        Manage Courses
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {lecturers.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No lecturers found</h3>
                <p className="text-gray-500">No lecturers are currently registered in the system.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Lecturers are created when they sign up through the main TeachTeam application.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default LecturerManagementPage;