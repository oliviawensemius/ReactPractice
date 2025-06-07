// src/components/lecturer/ApplicantDetails.tsx
'use client';

import React, { useState } from 'react';
import { lecturerService } from '@/services/lecturer.service';
import { ApplicantDisplayData } from '@/services/lecturer.service';
import Notification from '@/components/ui/Notification';

interface ApplicantDetailsProps {
  selectedApplicant: ApplicantDisplayData | null;
  onUpdate: (applicant: ApplicantDisplayData | null) => void;
}

const ApplicantDetails: React.FC<ApplicantDetailsProps> = ({
  selectedApplicant,
  onUpdate
}) => {
  const [newComment, setNewComment] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

  // Handle applicant status change
  const handleApplicantStatusChange = async (status: 'Selected' | 'Rejected') => {
    if (!selectedApplicant || isUpdating) return;

    setIsUpdating(true);

    try {
      // Update status in backend
      await lecturerService.updateApplicationStatus(selectedApplicant.id, status);

      // Update the component state
      onUpdate({
        ...selectedApplicant,
        status
      });

      // Show success notification
      setNotification({
        type: 'success',
        message: `${selectedApplicant.tutorName} has been ${status.toLowerCase()} for ${selectedApplicant.courseCode}.`
      });
    } catch (error: any) {
      console.error('Error updating application status:', error);
      
      // Show error notification
      setNotification({
        type: 'error',
        message: error.message || 'Error updating application status. Please try again.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Format academic credentials for display
  const formatAcademicCredential = (credential: any, index: number) => {
    return (
      <li key={credential.id || `credential-${index}`}>
        <strong>{credential.degree}</strong> from {credential.institution} ({credential.year})
        {credential.gpa !== undefined && credential.gpa !== null && (
          <span className="text-sm text-gray-600 ml-2">GPA: {credential.gpa}</span>
        )}
      </li>
    );
  };

  // Format previous roles for display - Fixed to handle both camelCase and snake_case
  const formatPreviousRole = (role: any, index: number) => {
    // Handle both camelCase and snake_case field names
    const startDate = role.startDate || role.start_date;
    const endDate = role.endDate || role.end_date;
    
    // Format dates properly
    const formatDate = (dateValue: any) => {
      if (!dateValue) return '';
      
      try {
        // Handle different date formats
        if (typeof dateValue === 'string') {
          const date = new Date(dateValue);
          if (!isNaN(date.getTime())) {
            return date.toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'short' 
            });
          }
          return dateValue; // Return as-is if it's already formatted
        } else if (dateValue instanceof Date) {
          return dateValue.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
        }
        return String(dateValue);
      } catch (error) {
        console.warn('Error formatting date:', dateValue, error);
        return String(dateValue);
      }
    };

    return (
      <li key={role.id || `role-${index}`}>
        <strong>{role.position}</strong> at {role.organisation || role.organization}
        <br />
        <span className="text-sm text-gray-600">
          {formatDate(startDate)} {endDate ? `- ${formatDate(endDate)}` : '- Present'}
        </span>
        {role.description && (
          <p className="text-sm text-gray-600 mt-1 ml-4">{role.description}</p>
        )}
      </li>
    );
  };

  // Add a new comment
  const handleAddComment = async () => {
    if (!selectedApplicant || !newComment.trim() || isUpdating) return;

    // Validate comment
    if (newComment.trim().length < 3) {
      setNotification({
        type: 'error',
        message: 'Comment must be at least 3 characters'
      });
      return;
    }

    if (newComment.trim().length > 500) {
      setNotification({
        type: 'error',
        message: 'Comment must not exceed 500 characters'
      });
      return;
    }

    setIsUpdating(true);

    try {
      // Add comment in backend
      await lecturerService.addCommentToApplication(selectedApplicant.id, newComment);
      
      // Update the component state
      onUpdate({
        ...selectedApplicant,
        comments: [...(selectedApplicant.comments || []), newComment]
      });
      
      setNewComment('');
      
      // Show success notification
      setNotification({
        type: 'success',
        message: 'Comment added successfully'
      });
    } catch (error: any) {
      console.error('Error adding comment:', error);
      
      // Show error notification
      setNotification({
        type: 'error',
        message: error.message || 'Error adding comment. Please try again.'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Applicant Details</h2>
      
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
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
              {selectedApplicant.skills && selectedApplicant.skills.length > 0 ? (
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
            {selectedApplicant.previousRoles && selectedApplicant.previousRoles.length > 0 ? (
              <ul className="list-disc pl-6 space-y-3">
                {selectedApplicant.previousRoles.map((role, index) => formatPreviousRole(role, index))}
              </ul>
            ) : (
              <p className="italic text-gray-500">No previous roles listed</p>
            )}
          </div>

          {/* Academic Credentials section */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Academic Credentials</h4>
            {selectedApplicant.academicCredentials && selectedApplicant.academicCredentials.length > 0 ? (
              <ul className="list-disc pl-6 space-y-3">
                {selectedApplicant.academicCredentials.map((cred, index) => formatAcademicCredential(cred, index))}
              </ul>
            ) : (
              <p className="italic text-gray-500">No credentials listed</p>
            )}
          </div>

          {/* Comments section */}
          <div className="mb-6">
            <h4 className="font-semibold text-lg mb-2">Comments</h4>
            {selectedApplicant.comments && selectedApplicant.comments.length > 0 ? (
              <ul className="list-disc pl-6 space-y-2 mb-4">
                {selectedApplicant.comments.map((comment, index) => (
                  <li key={index} className="text-gray-700">{comment}</li>
                ))}
              </ul>
            ) : (
              <p className="italic text-gray-500 mb-4">No comments yet</p>
            )}

            {/* Add comment form */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a comment"
                className="flex-grow border border-gray-300 rounded p-2"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                disabled={isUpdating}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !isUpdating) {
                    handleAddComment();
                  }
                }}
              />
              <button
                className="bg-emerald-700 text-white px-4 py-2 rounded-md hover:bg-emerald-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddComment}
                disabled={isUpdating || !newComment.trim()}
              >
                {isUpdating ? 'Adding...' : 'Add'}
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
                  disabled={selectedApplicant.status === 'Selected' || isUpdating}
                >
                  {isUpdating ? 'Updating...' : 'Accept'}
                </button>

                <button
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
        <div className="bg-white shadow-lg p-6 rounded-md text-gray-600 italic text-center">
          Click on an applicant to see more details
        </div>
      )}
    </div>
  );
};

export default ApplicantDetails;