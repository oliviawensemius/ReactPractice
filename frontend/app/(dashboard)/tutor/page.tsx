'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
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

export default function TutorDashboard() {
  // State for available courses
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Selected course and role
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'tutor' | 'lab_assistant'>('tutor');

  // User details
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Application details
  const [skills, setSkills] = useState<string[]>([]);
  const [previousRoles, setPreviousRoles] = useState<PreviousRole[]>([]);
  const [academicCredentials, setAcademicCredentials] = useState<AcademicCredential[]>([]);
  const [availability, setAvailability] = useState<'fulltime' | 'parttime'>('parttime');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      }
    };

    fetchCourses();
  }, []);

  // Function to handle adding a skill
  const handleAddSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
    }
  };

  // Function to handle removing a skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  // Function to handle changing availability
  const handleAvailabilityChange = (value: 'fulltime' | 'parttime') => {
    setAvailability(value);
  };

  // Function to handle adding a previous role
  const handleAddRole = (role: Omit<PreviousRole, 'id'>) => {
    const newRole: PreviousRole = {
      ...role,
      id: `role-${Date.now()}`
    };
    setPreviousRoles([...previousRoles, newRole]);
  };

  // Function to handle removing a previous role
  const handleRemoveRole = (roleId: string) => {
    setPreviousRoles(previousRoles.filter(role => role.id !== roleId));
  };

  // Function to handle adding an academic credential
  const handleAddCredential = (credential: Omit<AcademicCredential, 'id' | 'gpa'> & { gpa: string }) => {
    const newCredential: AcademicCredential = {
      ...credential,
      id: `cred-${Date.now()}`,
      gpa: credential.gpa ? parseFloat(credential.gpa) : undefined
    };
    setAcademicCredentials([...academicCredentials, newCredential]);
  };

  // Function to handle removing an academic credential
  const handleRemoveCredential = (credentialId: string) => {
    setAcademicCredentials(academicCredentials.filter(cred => cred.id !== credentialId));
  };

  // Validate form
  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!selectedCourseId) {
      errors.course = 'Please select a course';
    }

    if (skills.length === 0) {
      errors.skills = 'Please add at least one skill';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Function to handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    if (!currentUser) {
      alert('You must be logged in to submit an application');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create application object for backend
      const applicationData = {
        candidate_id: currentUser.id,
        course_id: selectedCourseId,
        ranking: 1, // Default ranking
        // Note: We'll need to handle session types separately
        // For now we'll focus on core functionality
      };

      await createApplication(applicationData);
      alert('Application submitted successfully!');

      // Reset form
      setSelectedCourseId('');
      setSelectedRole('tutor');
      setSkills([]);
      setPreviousRoles([]);
      setAcademicCredentials([]);
      setAvailability('parttime');
      setFormErrors({});
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Error submitting application. Please try again.');
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

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold text-emerald-800 mb-6">Tutor/Lab Assistant Application</h1>

      <div className="space-y-8">
        {/* Course and Role Selection */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-emerald-800 mb-4">Course Selection</h3>

          <div className="space-y-4">
            <div>
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
              {formErrors.course && (
                <p className="text-red-500 text-sm mt-1">{formErrors.course}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select a Role
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="tutor"
                    checked={selectedRole === 'tutor'}
                    onChange={() => setSelectedRole('tutor')}
                    className="text-emerald-600"
                  />
                  <span className="ml-2">Tutor</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="role"
                    value="lab_assistant"
                    checked={selectedRole === 'lab_assistant'}
                    onChange={() => setSelectedRole('lab_assistant')}
                    className="text-emerald-600"
                  />
                  <span className="ml-2">Lab Assistant</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Availability Selection Component */}
        <AvailabilitySelection
          availability={availability}
          onChange={handleAvailabilityChange}
        />

        {/* Skills List Component */}
        <SkillsList
          skills={skills}
          onAddSkill={handleAddSkill}
          onRemoveSkill={handleRemoveSkill}
        />
        {formErrors.skills && (
          <p className="text-red-500 text-sm mt-1">{formErrors.skills}</p>
        )}

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
          >
            {isSubmitting ? 'Submitting...' : 'Submit Application'}
          </Button>
        </div>
      </div>
    </div>
  );
}