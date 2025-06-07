// src/components/lecturer/SelectedCandidates.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { lecturerService, ApplicantDisplayData } from '@/services/lecturer.service';
import Notification from '@/components/ui/Notification';

interface SelectedCandidatesProps {
    onSelectApplicant: (applicant: ApplicantDisplayData | null) => void;
    onRankingUpdated?: () => void;
    forceRefresh?: number; // to force refresh when selection changes
}

const SelectedCandidates: React.FC<SelectedCandidatesProps> = ({
    onSelectApplicant,
    onRankingUpdated,
    forceRefresh = 0
}) => {
    const [isEditingRank, setIsEditingRank] = useState<string | null>(null);
    const [newRank, setNewRank] = useState<number>(1);
    const [selectedApplicants, setSelectedApplicants] = useState<ApplicantDisplayData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

    // Load selected applicants from all lecturer courses
    const loadSelectedApplicants = async () => {
        try {
            setIsLoading(true);
            
            // Get all applications for the lecturer's courses
            const allApplications = await lecturerService.getAllLecturerApplications();
            
            // Filter for selected applications only
            const selected = allApplications.filter(app => app.status === 'Selected');
            
            // Sort by ranking if available
            selected.sort((a, b) => {
                // If both have ranking, compare rankings
                if (a.ranking && b.ranking) {
                    return a.ranking - b.ranking;
                }
                // If only one has ranking, put the ranked one first
                if (a.ranking) return -1;
                if (b.ranking) return 1;
                // Otherwise sort by name - FIXED: Added null checks for tutorName
                const nameA = a.tutorName || '';
                const nameB = b.tutorName || '';
                return nameA.localeCompare(nameB);
            });
            
            setSelectedApplicants(selected);
        } catch (error: any) {
            console.error("Error loading selected applicants:", error);
            setNotification({
                type: 'error',
                message: error.message || 'Failed to load selected applicants'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Load selected applicants on component mount and when forceRefresh changes
    useEffect(() => {
        loadSelectedApplicants();
    }, [forceRefresh]);

    // Handle rank change
    const handleRankChange = (applicantId: string, currentRank: number) => {
        setIsEditingRank(applicantId);
        setNewRank(currentRank || 1);
    };

    // Save updated rank
    const saveRankChange = async (applicantId: string) => {
        try {
            // Validate ranking
            if (newRank < 1) {
                setNotification({
                    type: 'error',
                    message: 'Ranking must be a positive number'
                });
                return;
            }
            
            // Update ranking in backend
            await lecturerService.updateApplicationRanking(applicantId, newRank);
            
            // Refresh the list
            await loadSelectedApplicants();
            
            // Show success notification
            setNotification({
                type: 'success',
                message: 'Ranking updated successfully'
            });
            
            // Notify parent component
            if (onRankingUpdated) {
                onRankingUpdated();
            }
        } catch (error: any) {
            console.error("Error updating ranking:", error);
            setNotification({
                type: 'error',
                message: error.message || 'Failed to update ranking'
            });
        } finally {
            setIsEditingRank(null);
        }
    };

    // Cancel rank editing
    const cancelRankEdit = () => {
        setIsEditingRank(null);
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mt-4 mb-4">Selected Candidates</h2>

            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            {isLoading ? (
                <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead className="bg-emerald-600 text-white">
                            <tr>
                                <th className="border border-gray-300 px-4 py-2 text-center">Rank</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Course</th>
                                <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                                <th className="border border-gray-300 px-4 py-2 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {selectedApplicants.length > 0 ? (
                                selectedApplicants.map((applicant, index) => (
                                    <tr
                                        key={applicant.id}
                                        className="border border-gray-300 hover:bg-gray-100"
                                    >
                                        <td className="border border-gray-300 px-4 py-2 text-center">
                                            {isEditingRank === applicant.id ? (
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max={selectedApplicants.length}
                                                    value={newRank}
                                                    onChange={(e) => setNewRank(parseInt(e.target.value) || 1)}
                                                    className="w-16 p-1 border border-gray-300 rounded text-center"
                                                />
                                            ) : (
                                                <span className="font-medium">{applicant.ranking || index + 1}</span>
                                            )}
                                        </td>
                                        <td
                                            className="border border-gray-300 px-4 py-2 cursor-pointer hover:text-emerald-700"
                                            onClick={() => onSelectApplicant(applicant)}
                                        >
                                            {/* FIXED: Added fallback for undefined tutorName */}
                                            {applicant.tutorName || 'Unknown Applicant'}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {applicant.courseCode || 'N/A'}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {applicant.role === 'lab_assistant' ? 'Lab Assistant' : 'Tutor'}
                                        </td>
                                        <td className="border border-gray-300 px-4 py-2">
                                            {isEditingRank === applicant.id ? (
                                                <div className="flex space-x-1">
                                                    <button
                                                        onClick={() => saveRankChange(applicant.id)}
                                                        className="p-1 bg-green-500 text-white rounded hover:bg-green-600"
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={cancelRankEdit}
                                                        className="p-1 bg-red-500 text-white rounded hover:bg-red-600"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleRankChange(applicant.id, applicant.ranking || index + 1)}
                                                    className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                                >
                                                    Adjust Rank
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="border border-gray-300 px-4 py-2 text-center text-gray-500 italic">
                                        No selected applicants yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default SelectedCandidates;