// admin-frontend/src/components/LecturerManagement.tsx
'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { 
  GET_ALL_LECTURERS, 
  GET_ALL_COURSES,
  ASSIGN_LECTURER_TO_COURSES 
} from '@/lib/queries';

interface Lecturer {
  id: string;
  user_id: string;
  department?: string;
  user: {
    id: string;
    name: string;
    email: string;
    is_active: boolean;
  };
  courses: Array<{
    id: string;
    code: string;
    name: string;
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

const LecturerManagement: React.FC = () => {
  const [selectedLecturer, setSelectedLecturer] = useState<string>('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isAssigning, setIsAssigning] = useState(false);

  const { data: lecturersData, loading: lecturersLoading, refetch: refetchLecturers } = useQuery(GET_ALL_LECTURERS);
  const { data: coursesData, loading: coursesLoading } = useQuery(GET_ALL_COURSES);

  const [assignLecturerToCourses, { loading: assigning }] = useMutation(ASSIGN_LECTURER_TO_COURSES, {
    onCompleted: () => {
      refetchLecturers();
      setIsAssigning(false);
      setSelectedLecturer('');
      setSelectedCourses([]);
    }
  });

  const lecturers: Lecturer[] = lecturersData?.getAllLecturers || [];
  const courses: Course[] = coursesData?.getAllCourses?.filter((c: Course) => c.is_active) || [];

  const handleLecturerSelect = (lecturerId: string) => {
    setSelectedLecturer(lecturerId);
    const lecturer = lecturers.find(l => l.id === lecturerId);
    if (lecturer) {
      setSelectedCourses(lecturer.courses.map(c => c.id));
    }
    setIsAssigning(true);
  };

  const handleCourseToggle = (courseId: string) => {
    setSelectedCourses(prev => 
      prev.includes(courseId) 
        ? prev.filter(id => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleAssign = async () => {
    if (!selectedLecturer) return;

    await assignLecturerToCourses({
      variables: {
        input: {
          lecturerId: selectedLecturer,
          courseIds: selectedCourses
        }
      }
    });
  };

  const handleCancel = () => {
    setIsAssigning(false);
    setSelectedLecturer('');
    setSelectedCourses([]);
  };

  if (lecturersLoading || coursesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
          <h2 className="text-2xl font-bold text-emerald-800">Lecturer Course Assignment</h2>
          <p className="text-emerald-600 mt-1">Assign lecturers to courses for the semester</p>
        </div>
      </div>

      {/* Assignment Form */}
      {isAssigning && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100">
            <h3 className="text-lg font-semibold text-emerald-800">
              Assign Courses to {lecturers.find(l => l.id === selectedLecturer)?.user.name}
            </h3>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Select the courses you want to assign to this lecturer:
              </p>
              
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
                      <div className="text-xs text-gray-500">{course.semester} {course.year}</div>
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssign}
                  disabled={assigning}
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
                          {lecturer.user.is_active ? 'Active' : 'Inactive'}
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
                    {lecturer.courses.length > 0 ? (
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LecturerManagement;