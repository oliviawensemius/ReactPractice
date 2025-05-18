'use client';

import React, { useState } from 'react';
import { AcademicCredential, ApplicantDisplay, PreviousRole } from '@/lib/types';
import { addComments, updateStatus } from '@/lib/applicantList';

interface ApplicantDetailsProps {
  selectedApplicant: ApplicantDisplay | null;
  onUpdate: (applicant: ApplicantDisplay | null) => void;
}

const ApplicantDetails: React.FC<ApplicantDetailsProps> = ({
  selectedApplicant,
  onUpdate
}) => {
  const [newComment, setNewComment] = useState<string>('');

  // Handle applicant status change
  const handleApplicantStatusChange = (status: 'Selected' | 'Rejected') => {
    if (!selectedApplicant) {
      console.log('No applicant selected');
      return;
    }

    // Update status in storage
    updateStatus(selectedApplicant.id, status);

    // Update the component state
    onUpdate({
      ...selectedApplicant,
      status
    });

    // Show confirmation
    if (status === 'Selected') {
      alert(`${selectedApplicant.tutorName} has been accepted for ${selectedApplicant.courseCode}.`);
    } else if (status === 'Rejected') {
      alert(`${selectedApplicant.tutorName} has been rejected for ${selectedApplicant.courseCode}.`);
    }
  };

  // Format academic credentials for display
  const formatAcademicCredential = (credential: AcademicCredential, index: number) => {
    return (
      <li key={credential.id || `credential-${index}`}>
        <strong>{credential.degree}</strong> from {credential.institution} ({credential.year})
        {credential.gpa !== undefined && (
          <span className="text-sm text-gray-600 ml-2">GPA: {credential.gpa}</span>
        )}
      </li>
    );
  };

  // Format previous roles for display
  const formatPreviousRole = (role: PreviousRole, index: number) => {
    return (
      <li key={role.id || `role-${index}`}>
        <strong>{role.position}</strong> at {role.organisation}
        <br />
        {role.startDate} {role.endDate ? `- ${role.endDate}` : '- Present'}
        {role.description && <p className="text-sm text-gray-600 ml-4">{role.description}</p>}
      </li>
    );
  };

  // Add a new comment
  const handleAddComment = () => {
    if (!selectedApplicant || !newComment.trim()) return;

    addComments(selectedApplicant.id, newComment);
    
    // Update the component state
    onUpdate({
      ...selectedApplicant,
      comments: [...(selectedApplicant.comments || []), newComment]
    });
    
    setNewComment('');
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Applicant Details</h2>
      
      {selectedApplicant ? (
        <div className="bg-white shadow-lg p-6 rounded-md">
          {/* Header section with name and status */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-bold text-emerald-800">{selectedApplicant.tutorName}</h3>
              <p className="text-gray-600">{selectedApplicant.tutorEmail}</p>
            </div>
            {selectedApplicant.status && (
              <span className={`
                px-3 py-1 rounded-full text-sm font-medium
                ${selectedApplicant.status === 'Selected' ? 'bg-green-200 text-green-800' : ''}
                ${selectedApplicant.status === 'Rejected' ? 'bg-red-200 text-red-800' : ''}
                ${selectedApplicant.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
              `}>
                {selectedApplicant.status}
              </span>
            )}
          </div>
          
          {/* Course information */}
          <div className="mb-6 bg-gray-50 p-4 rounded-md">
            <h4 className="font-semibold text-lg mb-2">Application Details</h4>
            <p className="mb-1">
              <span className="font-medium">Course:</span> {selectedApplicant.courseCode} - {selectedApplicant.courseName}
            </p>
            <p className="mb-1">
              <span className="font-medium">Applied Role:</span> {selectedApplicant.role === 'lab_assistant' ? 'Lab Assistant' : 'Tutor'}
            </p>
            <p>
              <span className="font-medium">Availability:</span> {selectedApplicant.availability === 'fulltime' ? 'Full-time' : 'Part-time'}
            </p>
          </div>

          {/* Skills section */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {selectedApplicant.skills.length > 0 ? (
                selectedApplicant.skills.map((skill, index) => (
                  <span key={index} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="italic text-gray-500">No skills listed</p>
              )}
            </div>
          </div>

          {/* Previous Roles section */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Previous Roles</h4>
            <ul className="list-disc pl-6 space-y-3">
              {selectedApplicant.previousRoles && selectedApplicant.previousRoles.length > 0 ? (
                selectedApplicant.previousRoles.map((role, index) => formatPreviousRole(role, index))
              ) : (
                <li className="italic text-gray-500">No previous roles listed</li>
              )}
            </ul>
          </div>

          {/* Academic Credentials section */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Academic Credentials</h4>
            <ul className="list-disc pl-6 space-y-3">
              {selectedApplicant.academicCredentials && selectedApplicant.academicCredentials.length > 0 ? (
                selectedApplicant.academicCredentials.map((cred, index) => formatAcademicCredential(cred, index))
              ) : (
                <li className="italic text-gray-500">No credentials listed</li>
              )}
            </ul>
          </div>

          {/* Comments section */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Comments</h4>
            <ul className="list-disc pl-6 space-y-2 mb-4">
              {selectedApplicant.comments && selectedApplicant.comments.length > 0 ? (
                selectedApplicant.comments.map((comment, index) => (
                  <li key={index} className="text-gray-700">{comment}</li>
                ))
              ) : (
                <li className="italic text-gray-500">No comments yet</li>
              )}
            </ul>

            {/* Add comment form */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a comment"
                className="flex-grow border border-gray-300 rounded p-2"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddComment();
                  }
                }}
              />
              <button
                className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-800 transition-colors"
                onClick={handleAddComment}
              >
                Add
              </button>
            </div>
          </div>

          {/* Status and Actions section */}
          <div className="border-t pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                <p className="font-semibold text-lg">Current Status:</p>
                <p className={`
                  mt-1 font-medium
                  ${selectedApplicant.status === 'Selected' ? 'text-green-600' : ''}
                  ${selectedApplicant.status === 'Rejected' ? 'text-red-600' : ''}
                  ${selectedApplicant.status === 'Pending' ? 'text-yellow-600' : ''}
                `}>
                  {selectedApplicant.status}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleApplicantStatusChange('Selected')}
                  disabled={selectedApplicant.status === 'Selected'}
                >
                  Accept
                </button>

                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleApplicantStatusChange('Rejected')}
                  disabled={selectedApplicant.status === 'Rejected'}
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-lg p-6 rounded-md text-gray-600 italic text-center">
          Click on an applicant to see more details
        </div>
      )}
    </div>
  );
};

export default ApplicantDetails;