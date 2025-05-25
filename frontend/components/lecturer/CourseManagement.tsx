// frontend/components/lecturer/CourseManagement.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  year: number;
}

const CourseManagement: React.FC = () => {
  const [myCourses, setMyCourses] = useState<Course[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (currentUser) {
      loadCourses();
    }
  }, [currentUser]);

  const loadCourses = async () => {
    try {
      setIsLoading(true);
      
      // Get lecturer's current courses
      const lecturerResponse = await fetch(`${API_BASE_URL}/lecturer-courses/my-courses`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (lecturerResponse.ok) {
        const lecturerData = await lecturerResponse.json();
        if (lecturerData.success) {
          setMyCourses(lecturerData.courses || []);
        }
      } else {
        console.error('Failed to fetch lecturer courses:', lecturerResponse.status);
        setMessage({ type: 'error', text: 'Failed to load your courses' });
      }

      // Get all available courses
      const allCoursesResponse = await fetch(`${API_BASE_URL}/courses`, {
        method: 'GET',
        credentials: 'include'
      });
      
      if (allCoursesResponse.ok) {
        const allCoursesData = await allCoursesResponse.json();
        if (allCoursesData.success && allCoursesData.courses) {
          setAvailableCourses(allCoursesData.courses);
        }
      } else {
        console.error('Failed to fetch all courses:', allCoursesResponse.status);
        setMessage({ type: 'error', text: 'Failed to load available courses' });
      }
      
    } catch (error) {
      console.error('Error loading courses:', error);
      setMessage({ type: 'error', text: 'Failed to load courses' });
    } finally {
      setIsLoading(false);
    }
  };

  const addCourse = async () => {
    if (!selectedCourse || !currentUser) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/lecturer-courses/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          course_id: selectedCourse
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectedCourse('');
        await loadCourses();
        setMessage({ type: 'success', text: 'Course added successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add course' });
      }
    } catch (error) {
      console.error('Error adding course:', error);
      setMessage({ type: 'error', text: 'Failed to add course' });
    } finally {
      setIsLoading(false);
    }
  };

  const removeCourse = async (courseId: string) => {
    if (!currentUser) return;

    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/lecturer-courses/remove`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          course_id: courseId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await loadCourses();
        setMessage({ type: 'success', text: 'Course removed successfully!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to remove course' });
      }
    } catch (error) {
      console.error('Error removing course:', error);
      setMessage({ type: 'error', text: 'Failed to remove course' });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter out courses that lecturer already teaches
  const coursesToAdd = availableCourses.filter(
    course => !myCourses.some(myCourse => myCourse.id === course.id)
  );

  // Clear message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {message && (
        <div className={`p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message.text}
        </div>
      )}

      {/* Current Courses */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-emerald-800 mb-4">Currently Teaching</h3>
        
        {myCourses.length > 0 ? (
          <div className="space-y-3">
            {myCourses.map((course) => (
              <div key={course.id} className="flex justify-between items-center p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                <div>
                  <h4 className="font-semibold text-emerald-900">{course.code}</h4>
                  <p className="text-emerald-700">{course.name}</p>
                  <p className="text-sm text-emerald-600">{course.semester} {course.year}</p>
                </div>
                <button
                  onClick={() => removeCourse(course.id)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No courses assigned yet.</p>
            <p className="text-sm text-gray-400 mt-1">Add courses below to start receiving applications.</p>
          </div>
        )}
      </div>

      {/* Add New Course */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold text-emerald-800 mb-4">Add a Course</h3>
        
        {coursesToAdd.length > 0 ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="course-select" className="block text-sm font-medium text-gray-700 mb-2">
                Select a course to teach:
              </label>
              <select
                id="course-select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500"
                disabled={isLoading}
              >
                <option value="">Choose a course...</option>
                {coursesToAdd.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name} ({course.semester} {course.year})
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={addCourse}
              disabled={!selectedCourse || isLoading}
              className="w-full py-3 px-4 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? 'Adding Course...' : 'Add Course'}
            </button>
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-500">All available courses have been assigned.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;