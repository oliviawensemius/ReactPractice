'use client';

import React, { useState, useEffect } from 'react';
import { ApplicantDisplay } from '@/lib/types';
import { getSelectedApplicants, updateRanking } from '@/lib/applicantList';

interface SelectedCandidatesProps {
    onSelectApplicant: (applicant: ApplicantDisplay | null) => void;
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
    const [selectedApplicants, setSelectedApplicants] = useState<ApplicantDisplay[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    useEffect(() => {
        const applicants = getSelectedApplicants();
        setSelectedApplicants(applicants);
    }, [refreshTrigger, forceRefresh]);

    //  automatic refresh
    useEffect(() => {
        const interval = setInterval(() => {
            const applicants = getSelectedApplicants();
            setSelectedApplicants(applicants);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    // Handle rank change
    const handleRankChange = (applicantId: string, currentRank: number) => {
        setIsEditingRank(applicantId);
        setNewRank(currentRank || 1);
    };

    // Save updated rank
    const saveRankChange = (applicantId: string) => {
        if (updateRanking(applicantId, newRank)) {
            // Refresh the list to show updated rankings
            setRefreshTrigger(prev => prev + 1);

            // Notify parent component
            if (onRankingUpdated) {
                onRankingUpdated();
            }
        }
        setIsEditingRank(null);
    };

    // Cancel rank editing
    const cancelRankEdit = () => {
        setIsEditingRank(null);
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mt-4 mb-4">Selected Candidates</h2>

            <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 bg-white shadow-lg">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 px-4 py-2 w-20">Ranking</th>
                            <th className="border border-gray-300 px-4 py-2">Applicant</th>
                            <th className="border border-gray-300 px-4 py-2">Course</th>
                            <th className="border border-gray-300 px-4 py-2">Role</th>
                            <th className="border border-gray-300 px-4 py-2 w-20"></th>
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
                                        {applicant.tutorName}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {applicant.courseCode}
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
        </div>
    );
};

export default SelectedCandidates;