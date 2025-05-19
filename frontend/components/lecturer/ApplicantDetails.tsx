// components/lecturer/ApplicantDetails.tsx - Enhanced with MySQL integration
'use client';

import React, { useState } from 'react';
import { AcademicCredential, ApplicantDisplay, PreviousRole } from '@/lib/types';
import { updateApplicationStatus, addComment } from '@/services/application.service';

interface ApplicantDetailsProps {
  selectedApplicant: ApplicantDisplay | null;
  onUpdate: (applicant: ApplicantDisplay | null) => void;
}

// Client-side validation functions
const validateComment = (comment: string): string | null => {
  if (!comment.trim()) {
    return 'Comment cannot be empty';
  }
  if (comment.trim().length < 3) {
    return 'Comment must be at least 3 characters long';
  }
  if (comment.length > 500) {
    return 'Comment must be less than 500 characters';
  }
  return null;
};

const ApplicantDetails: React.FC<ApplicantDetailsProps> = ({
  selectedApplicant,
  onUpdate
}) => {
  const [newComment, setNewComment] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Clear messages after a delay
  React.useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  React.useEffect(() => {
    if (validationError) {
      const timer = setTimeout(() => {
        setValidationError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [validationError]);

  // Handle applicant status change with server-side integration
  const handleApplicantStatusChange = async (status: 'Selected' | 'Rejected') => {
    if (!selectedApplicant || isUpdating) {
      return;
    }

    // Confirmation dialog
    const confirmMessage = `Are you sure you want to ${status.toLowerCase()} ${selectedApplicant.tutorName} for ${selectedApplicant.courseCode}?`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    setIsUpdating(true);
    setValidationError(null);

    try {
      // Update status in backend
      await updateApplicationStatus(selectedApplicant.id, status);

      // Update the component state
      const updatedApplicant = {
        ...selectedApplicant,
        status
      };

      onUpdate(updatedApplicant);

      // Show success message
      setSuccessMessage(`${selectedApplicant.tutorName} has been ${status.toLowerCase()} for ${selectedApplicant.courseCode}.`);
    } catch (error: any) {
      console.error('Error updating application status:', error);

      // Handle specific error cases
      if (error?.response?.status === 404) {
        setValidationError('Application not found. It may have been already processed.');
      } else if (error?.response?.status === 400) {
        setValidationError(error.response.data.message || 'Invalid status update request.');
      } else {
        setValidationError('Error updating application status. Please try again.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Format academic credentials for display
  const formatAcademicCredential = (credential: AcademicCredential, index: number) => {
    return (
      <li key={credential.id || `credential-${index}`} className="bg-gray-50 p-3 rounded border">
        <div className="font-semibold text-gray-900">{credential.degree}</div>
        <div className="text-gray-700">{credential.institution}</div>
        <div className="text-sm text-gray-600">
          Year: {credential.year}
          {credential.gpa !== undefined && (
            <span className="ml-3">GPA: {credential.gpa}</span>
          )}
        </div>
      </li>
    );
  };

  // Format previous roles for display
  const formatPreviousRole = (role: PreviousRole, index: number) => {
    return (
      <li key={role.id || `role-${index}`} className="bg-gray-50 p-3 rounded border">
        <div className="font-semibold text-gray-900">{role.position}</div>
        <div className="text-gray-700">{role.organisation}</div>
        <div className="text-sm text-gray-600">
          {role.startDate} {role.endDate ? `- ${role.endDate}` : '- Present'}
        </div>
        {role.description && (
          <p className="text-sm text-gray-600 mt-2 italic">{role.description}</p>
        )}
      </li>
    );
  };

  // Add a new comment with validation
  const handleAddComment = async () => {
    if (!selectedApplicant || !newComment.trim() || isUpdating) return;

    // Client-side validation
    const validationError = validateComment(newComment);
    if (validationError) {
      setValidationError(validationError);
      return;
    }

    setIsUpdating(true);
    setValidationError(null);

    try {
      // Add comment in backend
      await addComment(selectedApplicant.id, newComment.trim());

      // Update the component state
      const updatedApplicant = {
        ...selectedApplicant,
        comments: [...(selectedApplicant.comments || []), newComment.trim()]
      };

      onUpdate(updatedApplicant);
      setNewComment('');
      setSuccessMessage('Comment added successfully');
    } catch (error: any) {
      console.error('Error adding comment:', error);

      if (error?.response?.status === 404) {
        setValidationError('Application not found. Please refresh the page.');
      } else if (error?.response?.status === 400) {
        setValidationError(error.response.data.message || 'Invalid comment.');
      } else {
        setValidationError('Error adding comment. Please try again.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle enter key press in comment input
  const handleCommentKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isUpdating) {
      e.preventDefault();
      handleAddComment();
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Applicant Details</h2>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {validationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-700">{validationError}</p>
        </div>
      )}

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="mb-1">
                  <span className="font-medium">Course:</span> {selectedApplicant.courseCode} - {selectedApplicant.courseName}
                </p>
                <p className="mb-1">
                  <span className="font-medium">Applied Role:</span>
                  <span className="ml-1 capitalize">
                    {selectedApplicant.role === 'lab_assistant' ? 'Lab Assistant' : 'Tutor'}
                  </span>
                </p>
              </div>
              <div>
                <p className="mb-1">
                  <span className="font-medium">Availability:</span>
                  <span className="ml-1">
                    {selectedApplicant.availability === 'fulltime' ? 'Full-time' : 'Part-time'}
                  </span>
                </p>
                {selectedApplicant.ranking && (
                  <p>
                    <span className="font-medium">Current Ranking:</span>
                    <span className="ml-1 font-semibold text-blue-600">#{selectedApplicant.ranking}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Skills section */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {selectedApplicant.skills.length > 0 ? (
                selectedApplicant.skills.map((skill, index) => (
                  <span key={index} className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-sm font-medium">
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
            <h4 className="font-semibold text-lg mb-3">Previous Roles</h4>
            <ul className="space-y-3">
              {selectedApplicant.previousRoles && selectedApplicant.previousRoles.length > 0 ? (
                selectedApplicant.previousRoles.map((role, index) => formatPreviousRole(role, index))
              ) : (
                <li className="italic text-gray-500 bg-gray-50 p-3 rounded">No previous roles listed</li>
              )}
            </ul>
          </div>

          {/* Academic Credentials section */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-3">Academic Credentials</h4>
            <ul className="space-y-3">
              {selectedApplicant.academicCredentials && selectedApplicant.academicCredentials.length > 0 ? (
                selectedApplicant.academicCredentials.map((cred, index) => formatAcademicCredential(cred, index))
              ) : (
                <li className="italic text-gray-500 bg-gray-50 p-3 rounded">No credentials listed</li>
              )}
            </ul>
          </div>

          {/* Comments section */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-3">Lecturer Comments</h4>
            <div className="space-y-3 mb-4">
              {selectedApplicant.comments && selectedApplicant.comments.length > 0 ? (
                selectedApplicant.comments.map((comment, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded border-l-3 border-emerald-300">
                    <p className="text-gray-700">{comment}</p>
                  </div>
                ))
              ) : (
                <p className="italic text-gray-500">No comments yet</p>
              )}
            </div>

            {/* Add comment form */}
            <div className="space-y-2">
              <textarea
                placeholder="Add a comment about this applicant..."
                className="w-full border border-gray-300 rounded p-3 focus:ring-emerald-500 focus:border-emerald-500 resize-vertical"
                rows={3}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={handleCommentKeyPress}
                disabled={isUpdating}
                maxLength={500}
              />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {newComment.length}/500 characters
                </span>
                <button
                  className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAddComment}
                  disabled={isUpdating || !newComment.trim()}
                >
                  {isUpdating ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </div>
          </div>

          {/* Status and Actions section */}
          <div className="border-t pt-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                <p className="font-semibold text-lg">Application Status:</p>
                <p className={`
                  mt-1 font-medium text-lg
                  ${selectedApplicant.status === 'Selected' ? 'text-green-600' : ''}
                  ${selectedApplicant.status === 'Rejected' ? 'text-red-600' : ''}
                  ${selectedApplicant.status === 'Pending' ? 'text-yellow-600' : ''}
                `}>
                  {selectedApplicant.status}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleApplicantStatusChange('Selected')}
                  disabled={selectedApplicant.status === 'Selected' || isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Accept'}
                </button>

                <button
                  className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleApplicantStatusChange('Rejected')}
                  disabled={selectedApplicant.status === 'Rejected' || isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Reject'}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-lg p-8 rounded-md text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-gray-600 text-lg">Click on an applicant to see more details</p>
          <p className="text-gray-500 text-sm mt-2">Select an applicant from the list to view their profile, academic credentials, and manage their application status.</p>
        </div>
      )}
    </div>
  );
};

export default ApplicantDetails;