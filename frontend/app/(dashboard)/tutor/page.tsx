'use client';

// STARTING TO GET MESSY, REMOVED LINES ARE KEPT TRACK HERE
// - removed validate application fucntion as it doesnt even exist
// - replaced submitAppl;ication with createApplication from SERVICES
// - 

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import AvailabilitySelection from '@/components/tutor/AvailabilitySelection';
import SkillsList from '@/components/tutor/SkillsList';
import PreviousRoles from '@/components/tutor/PreviousRoles';
import AcademicCredentials from '@/components/tutor/AcademicCredentials';
import { courses } from '@/lib/data';
import { PreviousRole, AcademicCredential } from '@/lib/types';
import {
  addSkill,
  removeSkill,
  addPreviousRole,
  removePreviousRole,
  addAcademicCredential,
  removeAcademicCredential,
  createTutorApplication
} from '@/lib/tutor';
// impory API functions from services
import { createApplication } from '@/services/application.service';
import { getUserData } from '@/lib/storage';

export default function TutorDashboard() {
  // selected course and role
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'tutor' | 'lab_assistant'>('tutor');

  // user details
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');

  // application details
  const [skills, setSkills] = useState<string[]>([]);
  const [previousRoles, setPreviousRoles] = useState<PreviousRole[]>([]);
  const [academicCredentials, setAcademicCredentials] = useState<AcademicCredential[]>([]);
  const [availability, setAvailability] = useState<'fulltime' | 'parttime'>('parttime');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Get user data
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUserEmail = localStorage.getItem('currentUserEmail');
      if (currentUserEmail) {
        const userData = getUserData(currentUserEmail);
        if (userData) {
          setUserName(userData.name);
          setUserEmail(userData.email);
        }
      }
    }
  }, []);

  // Function to handle adding a skill
  const handleAddSkill = (skill: string) => {
    setSkills(addSkill(skill, skills));
  };

  // Function to handle removing a skill
  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(removeSkill(skillToRemove, skills));
  };

  // Function to handle changing availability
  const handleAvailabilityChange = (value: 'fulltime' | 'parttime') => {
    setAvailability(value);
  };

  // Function to handle adding a previous role
  const handleAddRole = (role: Omit<PreviousRole, 'id'>) => {
    setPreviousRoles(addPreviousRole(role, previousRoles));
  };

  // Function to handle removing a previous role
  const handleRemoveRole = (roleId: string) => {
    setPreviousRoles(removePreviousRole(roleId, previousRoles));
  };

  // Function to handle adding an academic credential
  const handleAddCredential = (credential: Omit<AcademicCredential, 'id' | 'gpa'> & { gpa: string }) => {
    setAcademicCredentials(addAcademicCredential(credential, academicCredentials));
  };

  // Function to handle removing an academic credential
  const handleRemoveCredential = (credentialId: string) => {
    setAcademicCredentials(removeAcademicCredential(credentialId, academicCredentials));
  };

  // Function to handle form submission
  const handleSubmit = () => {
    // Validate application
  // const { valid, errors } = validateApplication(
  //     selectedCourseId,
  //     selectedRole,
  //     skills,
  //     previousRoles,
  //     academicCredentials,
  //   );

    // if (!valid) {
    //   // Display errors
    //   setFormErrors(errors);
    //   return;
    // }

    // Reset any previous errors if validation passes
    setFormErrors({});

    // extra check... just incase
    if (!userEmail) {
      alert('You must be logged in to submit an application');
      return;
    }

    // Create application object
    const application = createTutorApplication(
      userEmail,
      userName,
      selectedCourseId,
      selectedRole,
      skills,
      previousRoles,
      academicCredentials,
      availability
    );

    createApplication(application);
    alert('Application submitted successfully!');

    // reset form
    setSelectedCourseId('');
    setSelectedRole('tutor');
    setSkills([]);
    setPreviousRoles([]);
    setAcademicCredentials([]);
    setAvailability('parttime');
  };

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
        {Object.keys(formErrors).some(key => key.startsWith('role_')) && (
          <p className="text-red-500 text-sm mt-1">Please complete all required fields for previous roles</p>
        )}

        {/* Academic Credentials Component */}
        <AcademicCredentials
          credentials={academicCredentials}
          onAddCredential={handleAddCredential}
          onRemoveCredential={handleRemoveCredential}
        />
        {Object.keys(formErrors).some(key => key.startsWith('credential_')) && (
          <p className="text-red-500 text-sm mt-1">Please complete all required fields for academic credentials</p>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            variant="secondary"
            className="px-6 py-3"
            onClick={handleSubmit}
          >
            Submit Application
          </Button>
        </div>
      </div>
    </div>
  );
}