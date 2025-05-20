// app/(dashboard)/tutor/page.tsx - Fixed version with proper validation
'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Notification from '@/components/ui/Notification';
import AvailabilitySelection from '@/components/tutor/AvailabilitySelection';
import SkillsList from '@/components/tutor/SkillsList';
import PreviousRoles from '@/components/tutor/PreviousRoles';
import AcademicCredentials from '@/components/tutor/AcademicCredentials';
import { PreviousRole, AcademicCredential } from '@/lib/types';
import { createApplication } from '@/services/application.service';
import { courseService } from '@/services/course.service';
import { authService } from '@/services/auth.service';

interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  year: number;
}

interface CourseSelection {
  courseId: string;
  sessionType: 'tutor' | 'lab_assistant';
}

// Enhanced validation functions
const validateApplicationData = (data: any): string[] => {
  const errors: string[] = [];
  
  if (!data.candidate_id) {
    errors.push('User authentication required');
  }
  
  if (!data.course_id) {
    errors.push('Course selection required');
  }
  
  if (!data.session_type || !['tutor', 'lab_assistant'].includes(data.session_type)) {
    errors.push('Valid session type required');
  }
  
  if (!data.skills || !Array.isArray(data.skills) || data.skills.length === 0) {
    errors.push('At least one skill is required');
  }
  
  if (!data.availability || !['fulltime', 'parttime'].includes(data.availability)) {
    errors.push('Availability selection required');
  }
  
  // Validate academic credentials
  if (data.academic_credentials && Array.isArray(data.academic_credentials)) {
    data.academic_credentials.forEach((cred: any, index: number) => {
      if (!cred.degree || !cred.institution) {
        errors.push(`Academic credential ${index + 1}: Degree and institution required`);
      }
      if (!cred.year || cred.year < 1950 || cred.year > new Date().getFullYear()) {
        errors.push(`Academic credential ${index + 1}: Valid year required`);
      }
      if (cred.gpa !== undefined && (cred.gpa < 0 || cred.gpa > 4)) {
        errors.push(`Academic credential ${index + 1}: GPA must be between 0-4`);
      }
    });
  }
  
  // Validate previous roles
  if (data.previous_roles && Array.isArray(data.previous_roles)) {
    data.previous_roles.forEach((role: any, index: number) => {
      if (!role.position || !role.organisation || !role.startDate) {
        errors.push(`Previous role ${index + 1}: Position, organisation, and start date required`);
      }
      if (role.endDate && new Date(role.endDate) < new Date(role.startDate)) {
        errors.push(`Previous role ${index + 1}: End date cannot be before start date`);
      }
    });
  }
  
  return errors;
};

export default function TutorDashboard() {
  // State for available courses
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Selected courses and roles
  const [selectedCourses, setSelectedCourses] = useState<CourseSelection[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedSessionType, setSelectedSessionType] = useState<'tutor' | 'lab_assistant'>('tutor');

  // User details
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Application details
  const [skills, setSkills] = useState<string[]>([]);
  const [previousRoles, setPreviousRoles] = useState<PreviousRole[]>([]);
  const [academicCredentials, setAcademicCredentials] = useState<AcademicCredential[]>([]);
  const [availability, setAvailability] = useState<'fulltime' | 'parttime'>('parttime');
  
  // UI state
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Get current user and courses on component mount
  useEffect(() => {
    const initializePage = async () => {
      const user = authService.getCurrentUser();
      if (!user) {
        setNotification({
          type: 'error',
          message: 'You must be logged in to access this page'
        });
        return;
      }
      
      setCurrentUser(user);

      // Fetch courses from backend
      try {
        const coursesData = await courseService.getAllCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setNotification({
          type: 'error',
          message: 'Error loading courses. Please refresh the page.'
        });
      }
    };

    initializePage();
  }, []);

  // Course selection functions
  const handleAddCourse = () => {
    // Clear previous errors
    setFormErrors([]);
    
    // Validation
    if (!selectedCourseId) {
      setFormErrors(['Please select a course']);
      return;
    }

    // Check if course/session type combination already exists
    const exists = selectedCourses.some(
      sc => sc.courseId === selectedCourseId && sc.sessionType === selectedSessionType
    );

    if (exists) {
      setNotification({
        type: 'error',
        message: 'You have already selected this course for this role.'
      });
      return;
    }

    setSelectedCourses([...selectedCourses, {
      courseId: selectedCourseId,
      sessionType: selectedSessionType
    }]);
    setSelectedCourseId('');
  };

  const handleRemoveCourse = (courseId: string, sessionType: string) => {
    setSelectedCourses(selectedCourses.filter(
      sc => !(sc.courseId === courseId && sc.sessionType === sessionType)
    ));
  };

  // Skill management functions
  const handleAddSkill = (skill: string) => {
    if (!skill.trim()) return;
    
    if (skill.length < 2) {
      setNotification({
        type: 'error',
        message: 'Skill must be at least 2 characters long'
      });
      return;
    }
    
    if (!skills.includes(skill.trim())) {
      setSkills([...skills, skill.trim()]);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Previous roles management functions
  const handleAddRole = (role: Omit<PreviousRole, 'id'>) => {
    // Basic validation
    if (!role.position.trim() || !role.organisation.trim() || !role.startDate) {
      setNotification({
        type: 'error',
        message: 'Position, organisation, and start date are required'
      });
      return;
    }

    if (role.endDate && new Date(role.endDate) < new Date(role.startDate)) {
      setNotification({
        type: 'error',
        message: 'End date cannot be before start date'
      });
      return;
    }

    const newRole: PreviousRole = {
      ...role,
      id: `role-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    setPreviousRoles([...previousRoles, newRole]);
  };

  const handleRemoveRole = (roleId: string) => {
    setPreviousRoles(previousRoles.filter(role => role.id !== roleId));
  };

  // Academic credentials management functions
  const handleAddCredential = (credential: Omit<AcademicCredential, 'id' | 'gpa'> & { gpa: string }) => {
    // Basic validation
    if (!credential.degree.trim() || !credential.institution.trim()) {
      setNotification({
        type: 'error',
        message: 'Degree and institution are required'
      });
      return;
    }

    if (credential.year < 1950 || credential.year > new Date().getFullYear()) {
      setNotification({
        type: 'error',
        message: `Year must be between 1950 and ${new Date().getFullYear()}`
      });
      return;
    }

    const gpaNum = credential.gpa ? parseFloat(credential.gpa) : undefined;
    if (gpaNum !== undefined && (gpaNum < 0 || gpaNum > 4)) {
      setNotification({
        type: 'error',
        message: 'GPA must be between 0 and 4'
      });
      return;
    }

    const newCredential: AcademicCredential = {
      ...credential,
      id: `cred-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      gpa: gpaNum
    };
    setAcademicCredentials([...academicCredentials, newCredential]);
  };

  const handleRemoveCredential = (credentialId: string) => {
    setAcademicCredentials(academicCredentials.filter(cred => cred.id !== credentialId));
  };

  // Submit all applications
  const handleSubmit = async () => {
    setFormErrors([]);
    
    if (!currentUser) {
      setNotification({
        type: 'error',
        message: 'You must be logged in to submit applications'
      });
      return;
    }

    if (selectedCourses.length === 0) {
      setFormErrors(['Please select at least one course']);
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Starting application submission process...');
      
      // Submit each application individually
      const applicationPromises = selectedCourses.map(async (courseSelection, index) => {
        console.log(`Submitting application ${index + 1}/${selectedCourses.length}...`);
        
        const applicationData = {
          candidate_id: currentUser.id,
          course_id: courseSelection.courseId,
          session_type: courseSelection.sessionType,
          skills: skills,
          availability: availability,
          academic_credentials: academicCredentials.map(cred => ({
            degree: cred.degree,
            institution: cred.institution,
            year: cred.year,
            gpa: cred.gpa || null // Convert undefined to null for API
          })),
          previous_roles: previousRoles.map(role => ({
            position: role.position,
            organisation: role.organisation,
            startDate: role.startDate,
            endDate: role.endDate || null, // Convert undefined to null for API
            description: role.description || null
          }))
        };

        console.log(`Application data for ${courseSelection.courseId}:`, applicationData);

        // Validate application data
        const validationErrors = validateApplicationData(applicationData);
        if (validationErrors.length > 0) {
          throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
        }

        try {
          const result = await createApplication(applicationData);
          console.log(`✅ Application ${index + 1} submitted successfully:`, result);
          return result;
        } catch (appError) {
          console.error(`❌ Application ${index + 1} failed:`, appError);
          throw appError;
        }
      });

      const results = await Promise.allSettled(applicationPromises);
      console.log('All applications processed:', results);
      
      // Analyze results
      const successful = results.filter(result => result.status === 'fulfilled');
      const failed = results.filter(result => result.status === 'rejected');

      console.log(`Results: ${successful.length} successful, ${failed.length} failed`);

      if (successful.length > 0) {
        setNotification({
          type: 'success',
          message: `Successfully submitted ${successful.length} application(s)!${failed.length > 0 ? ` ${failed.length} failed - check console for details.` : ''}`
        });

        // Reset form only if all applications succeeded
        if (failed.length === 0) {
          console.log('All applications successful, resetting form...');
          setSelectedCourses([]);
          setSkills([]);
          setPreviousRoles([]);
          setAcademicCredentials([]);
          setAvailability('parttime');
        }
      } else {
        // All failed - show the first error
        const firstFailure = failed[0];
        if (firstFailure && firstFailure.status === 'rejected') {
          console.error('All applications failed. First error:', firstFailure.reason);
          throw firstFailure.reason;
        } else {
          throw new Error('All applications failed unexpectedly');
        }
      }
    } catch (error: any) {
      console.error('Error in handleSubmit:', error);
      
      let errorMessage = 'Error submitting applications. Please try again.';
      
      // Extract meaningful error message
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      console.error('Final error message:', errorMessage);
      
      setNotification({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsSubmitting(false);
      console.log('Application submission process completed');
    }
  };

  // Helper function to get course name for display
  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.code} - ${course.name}` : 'Unknown Course';
  };

  // Loading state
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold text-emerald-800 mb-4">Loading Dashboard...</h2>
            <p className="text-gray-600 mb-6">
              Please wait while we load your dashboard.
            </p>
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
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-emerald-800 mb-6">Tutor/Lab Assistant Application</h1>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Display form validation errors */}
      {formErrors.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-red-800 font-semibold mb-2">Please fix the following errors:</h3>
          <ul className="text-red-700 text-sm space-y-1">
            {formErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-8">
        {/* Course and Role Selection */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold text-emerald-800 mb-4">Course Selection</h3>
          <p className="text-gray-600 mb-4">
            Select courses you'd like to apply for as a tutor or lab assistant. You can apply for multiple courses and roles.
          </p>

          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select a Course *
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  disabled={isSubmitting}
                >
                  <option value="">Choose a course...</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select a Role *
                </label>
                <select
                  value={selectedSessionType}
                  onChange={(e) => setSelectedSessionType(e.target.value as 'tutor' | 'lab_assistant')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                  disabled={isSubmitting}
                >
                  <option value="tutor">Tutor</option>
                  <option value="lab_assistant">Lab Assistant</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={handleAddCourse}
                  disabled={!selectedCourseId || isSubmitting}
                >
                  Add Course
                </Button>
              </div>
            </div>

            {/* Selected Courses Display */}
            <div className="mt-6">
              <h4 className="font-medium mb-3">Selected Applications ({selectedCourses.length}):</h4>
              {selectedCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedCourses.map((courseSelection, index) => (
                    <div key={`${courseSelection.courseId}-${courseSelection.sessionType}-${index}`} 
                         className="border border-emerald-200 rounded-md p-4 bg-emerald-50">
                      <div className="font-medium text-emerald-900">
                        {getCourseName(courseSelection.courseId)}
                      </div>
                      <div className="text-sm text-emerald-700 mt-1">
                        Role: {courseSelection.sessionType === 'tutor' ? 'Tutor' : 'Lab Assistant'}
                      </div>
                      <button
                        onClick={() => handleRemoveCourse(courseSelection.courseId, courseSelection.sessionType)}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
                        disabled={isSubmitting}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500 italic">No courses selected yet.</p>
                  <p className="text-gray-400 text-sm mt-1">Use the form above to add courses.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Availability Selection */}
        <AvailabilitySelection
          availability={availability}
          onChange={setAvailability}
        />

        {/* Skills Section */}
        <SkillsList
          skills={skills}
          onAddSkill={handleAddSkill}
          onRemoveSkill={handleRemoveSkill}
        />

        {/* Previous Roles Section */}
        <PreviousRoles
          roles={previousRoles}
          onAddRole={handleAddRole}
          onRemoveRole={handleRemoveRole}
        />

        {/* Academic Credentials Section */}
        <AcademicCredentials
          credentials={academicCredentials}
          onAddCredential={handleAddCredential}
          onRemoveCredential={handleRemoveCredential}
        />

        {/* Submit Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-emerald-800">
                Ready to Submit?
              </h3>
              <p className="text-gray-600 text-sm">
                You are about to submit {selectedCourses.length} application(s).
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={handleSubmit}
              disabled={isSubmitting || selectedCourses.length === 0}
              className="px-8 py-3 text-lg"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Submitting...
                </span>
              ) : (
                `Submit ${selectedCourses.length} Application(s)`
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}