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
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Get current user and courses on component mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }

    // Fetch courses from backend
    const fetchCourses = async () => {
      try {
        const coursesData = await courseService.getAllCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
        setNotification({
          type: 'error',
          message: 'Error loading courses. Please try again.'
        });
      }
    };

    fetchCourses();
  }, []);

  // Course selection functions
  const handleAddCourse = () => {
    if (!selectedCourseId) return;

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
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Availability change function
  const handleAvailabilityChange = (value: 'fulltime' | 'parttime') => {
    setAvailability(value);
  };

  // Previous roles management functions
  const handleAddRole = (role: Omit<PreviousRole, 'id'>) => {
    const newRole: PreviousRole = {
      ...role,
      id: `role-${Date.now()}`
    };
    setPreviousRoles([...previousRoles, newRole]);
  };

  const handleRemoveRole = (roleId: string) => {
    setPreviousRoles(previousRoles.filter(role => role.id !== roleId));
  };

  // Academic credentials management functions
  const handleAddCredential = (credential: Omit<AcademicCredential, 'id' | 'gpa'> & { gpa: string }) => {
    const newCredential: AcademicCredential = {
      ...credential,
      id: `cred-${Date.now()}`,
      gpa: credential.gpa ? parseFloat(credential.gpa) : undefined
    };
    setAcademicCredentials([...academicCredentials, newCredential]);
  };

  const handleRemoveCredential = (credentialId: string) => {
    setAcademicCredentials(academicCredentials.filter(cred => cred.id !== credentialId));
  };

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (selectedCourses.length === 0) {
      errors.courses = 'Please select at least one course';
    }

    if (skills.length === 0) {
      errors.skills = 'Please add at least one skill';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit all applications
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!currentUser) {
      setNotification({
        type: 'error',
        message: 'You must be logged in to submit applications'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const applicationPromises = selectedCourses.map(courseSelection => {
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
            gpa: cred.gpa
          })),
          previous_roles: previousRoles.map(role => ({
            position: role.position,
            organisation: role.organisation,
            startDate: role.startDate,
            endDate: role.endDate,
            description: role.description
          }))
        };

        return createApplication(applicationData);
      });

      await Promise.all(applicationPromises);

      setNotification({
        type: 'success',
        message: `Successfully submitted ${selectedCourses.length} application(s)!`
      });

      // Reset form
      setSelectedCourses([]);
      setSkills([]);
      setPreviousRoles([]);
      setAcademicCredentials([]);
      setAvailability('parttime');
      setFormErrors({});
    } catch (error: any) {
      console.error('Error submitting applications:', error);
      
      // Check if it's a duplicate application error
      if (error?.response?.data?.message?.includes('already exists')) {
        setNotification({
          type: 'error',
          message: 'You have already applied for one or more of these courses with the same role.'
        });
      } else {
        setNotification({
          type: 'error',
          message: 'Error submitting applications. Please try again.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-emerald-800 mb-4">Loading Dashboard...</h2>
          <p className="text-gray-600">
            Please sign in to access the tutor dashboard.
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

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.code} - ${course.name}` : 'Unknown Course';
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-emerald-800 mb-6">Tutor/Lab Assistant Application</h1>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <div className="space-y-8">
        {/* Course and Role Selection */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-emerald-800 mb-4">Course Selection</h3>

          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select a Course
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="">Select a course...</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select a Role
                </label>
                <select
                  value={selectedSessionType}
                  onChange={(e) => setSelectedSessionType(e.target.value as 'tutor' | 'lab_assistant')}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                >
                  <option value="tutor">Tutor</option>
                  <option value="lab_assistant">Lab Assistant</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="secondary"
                  onClick={handleAddCourse}
                  className="px-6 py-2"
                >
                  Add Course
                </Button>
              </div>
            </div>

            {formErrors.courses && (
              <p className="text-red-500 text-sm">{formErrors.courses}</p>
            )}

            {/* Selected Courses Display */}
            <div className="mt-4">
              <h4 className="font-medium mb-2">Selected Courses:</h4>
              {selectedCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedCourses.map((courseSelection, index) => (
                    <div key={`${courseSelection.courseId}-${courseSelection.sessionType}`} className="border rounded-md p-3 bg-gray-50">
                      <div className="font-medium">{getCourseName(courseSelection.courseId)}</div>
                      <div className="text-sm text-emerald-600">
                        Role: {courseSelection.sessionType === 'tutor' ? 'Tutor' : 'Lab Assistant'}
                      </div>
                      <button
                        onClick={() => handleRemoveCourse(courseSelection.courseId, courseSelection.sessionType)}
                        className="mt-2 text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No courses selected yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Availability Selection Component */}
        <AvailabilitySelection
          availability={availability}
          onChange={handleAvailabilityChange}
        />

        {/* Skills List Component */}
        <div>
          <SkillsList
            skills={skills}
            onAddSkill={handleAddSkill}
            onRemoveSkill={handleRemoveSkill}
          />
          {formErrors.skills && (
            <p className="text-red-500 text-sm mt-1">{formErrors.skills}</p>
          )}
        </div>

        {/* Previous Roles Component */}
        <PreviousRoles
          roles={previousRoles}
          onAddRole={handleAddRole}
          onRemoveRole={handleRemoveRole}
        />

        {/* Academic Credentials Component */}
        <AcademicCredentials
          credentials={academicCredentials}
          onAddCredential={handleAddCredential}
          onRemoveCredential={handleRemoveCredential}
        />

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            variant="secondary"
            className="px-6 py-3"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting Applications...' : `Submit ${selectedCourses.length} Application(s)`}
          </Button>
        </div>
      </div>
    </div>
  );
}