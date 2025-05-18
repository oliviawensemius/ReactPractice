'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { ApplicantDisplay } from '@/lib/types';
import { getCourseDetails, getApplicantsForCourse, getAllCoursesWithApplications } from '@/lib/applicantList';
import { SearchCriteria } from './SearchBar';
import CompactSortControls, { SortField, SortDirection } from './CompactSortControls';

interface ApplicantListProps {
    courses: string[];
    selectedCourse: string;
    setSelectedCourse: (course: string) => void;
    searchCriteria: SearchCriteria;
    onSelectApplicant: (applicant: ApplicantDisplay | null) => void;
}

const ApplicantList: React.FC<ApplicantListProps> = ({
    courses,
    selectedCourse,
    setSelectedCourse,
    searchCriteria,
    onSelectApplicant
}) => {
    const [availableCourses, setAvailableCourses] = useState<string[]>([]);
    const [allApplicants, setAllApplicants] = useState<ApplicantDisplay[]>([]);
    const [sortSettings, setSortSettings] = useState<{
        field: SortField;
        direction: SortDirection;
    }>({ field: 'none', direction: 'asc' });

    // Get all courses with applications on component mount
    useEffect(() => {
        const courseIds = getAllCoursesWithApplications();
        setAvailableCourses(courseIds);
    }, []);

    // Filter applicants based on search criteria
    const filterApplicants = (applicants: ApplicantDisplay[], criteria: SearchCriteria): ApplicantDisplay[] => {
        return applicants.filter(app => {
            // Filter by tutor name
            if (criteria.tutorName && criteria.tutorName.trim() !== '') {
                if (!app.tutorName.toLowerCase().includes(criteria.tutorName.toLowerCase().trim())) {
                    return false;
                }
            }

            // Filter by availability
            if (criteria.availability && criteria.availability.trim() !== '') {
                if (app.availability !== criteria.availability) {
                    return false;
                }
            }

            // Filter by skill set
            if (criteria.skillSet && criteria.skillSet.trim() !== '') {
                const hasSkill = app.skills.some(skill =>
                    skill.toLowerCase().includes(criteria.skillSet.toLowerCase().trim())
                );
                if (!hasSkill) {
                    return false;
                }
            }

            return true;
        });
    };

    // Sort applicants
    const sortApplicants = (applicants: ApplicantDisplay[], sort: { field: SortField; direction: SortDirection }): ApplicantDisplay[] => {
        if (sort.field === 'none') return applicants;

        return [...applicants].sort((a, b) => {
            let comparison = 0;

            if (sort.field === 'courseName') {
                    comparison = a.courseName.localeCompare(b.courseName);
            }
            else if (sort.field === 'availability') {
                const availA = a.availability === 'fulltime' ? 'A-fulltime' : 'B-parttime';
                const availB = b.availability === 'fulltime' ? 'A-fulltime' : 'B-parttime';
                comparison = availA.localeCompare(availB);
            }

            // Apply the sort direction
            return sort.direction === 'asc' ? comparison : -comparison;
        });
    };

    // Use useCallback to memoize the function
    const getFilteredAndSortedApplicants = useCallback(() => {
        const coursesToProcess = selectedCourse === 'All'
            ? (courses.length > 0 ? courses : availableCourses)
            : [selectedCourse];

        let allApps: ApplicantDisplay[] = [];

        coursesToProcess.forEach(courseId => {
            const courseApplicants = getApplicantsForCourse(courseId);
            allApps = [...allApps, ...courseApplicants];
        });

        // Apply filters
        if (
            searchCriteria.tutorName ||
            searchCriteria.availability ||
            searchCriteria.skillSet
        ) {
            allApps = filterApplicants(allApps, searchCriteria);
        }

        // Apply sorting
        allApps = sortApplicants(allApps, sortSettings);

        return allApps;
    }, [selectedCourse, courses, availableCourses, searchCriteria, sortSettings]);

    // Update applicants when the filtered and sorted applicants change
    useEffect(() => {
        const apps = getFilteredAndSortedApplicants();
        setAllApplicants(apps);
    }, [getFilteredAndSortedApplicants]);

    // Handle sort change
    const handleSortChange = (field: SortField, direction: SortDirection) => {
        setSortSettings({ field, direction });
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Applicants</h2>

            {/* Dropdown for selecting course */}
            <div className="mb-4">
                <label htmlFor="courseFilter" className="block font-semibold">Filter by Course:</label>
                <select
                    id="courseFilter"
                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                >
                    <option value="All">All Courses</option>
                    {[...new Set([...courses, ...availableCourses])].map((courseId) => {
                        const { code, name } = getCourseDetails(courseId);
                        return (
                            <option key={courseId} value={courseId}>
                                {code} - {name}
                            </option>
                        );
                    })}
                </select>
            </div>

            {/* Compact Sort Controls */}
            <CompactSortControls
                currentSort={sortSettings}
                onSort={handleSortChange}
            />

            {/* Applicants table */}
            <div className="w-full overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 bg-white shadow-lg">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="border border-gray-300 px-4 py-2">Course Code</th>
                            <th className="border border-gray-300 px-4 py-2">Course Name</th>
                            <th className="border border-gray-300 px-4 py-2">Applicant Name</th>
                            <th className="border border-gray-300 px-4 py-2">
                                {sortSettings.field === 'availability' ? (
                                    <span className="flex items-center justify-center">
                                        Availability
                                    </span>
                                ) : (
                                    'Availability'
                                )}
                            </th>
                            <th className="border border-gray-300 px-4 py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {allApplicants.length > 0 ? (
                            allApplicants.map((applicant, index) => (
                                <tr
                                    key={`${applicant.courseId}-${applicant.tutorEmail}-${index}`}
                                    className={`
                    border border-gray-300 cursor-pointer hover:bg-gray-100
                    ${applicant.status === 'Selected' ? 'bg-green-50' : ''}
                    ${applicant.status === 'Rejected' ? 'bg-red-50' : ''}
                  `}
                                    onClick={() => onSelectApplicant(applicant)}
                                >
                                    <td className="border border-gray-300 px-4 py-2">{applicant.courseCode}</td>
                                    <td className="border border-gray-300 px-4 py-2">{applicant.courseName}</td>
                                    <td className="border border-gray-300 px-4 py-2">{applicant.tutorName}</td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        {applicant.availability === 'fulltime' ? 'Full-time' : 'Part-time'}
                                    </td>
                                    <td className="border border-gray-300 px-4 py-2">
                                        <span className={`
                      px-2 py-1 rounded-full text-xs font-medium
                      ${applicant.status === 'Selected' ? 'bg-green-200 text-green-800' : ''}
                      ${applicant.status === 'Rejected' ? 'bg-red-200 text-red-800' : ''}
                      ${applicant.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                    `}>
                                            {applicant.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="border border-gray-300 px-4 py-2 text-center text-gray-500 italic"
                                >
                                    {searchCriteria.tutorName || searchCriteria.availability || searchCriteria.skillSet ?
                                        'No matching applicants found' :
                                        'No applicants available'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ApplicantList;