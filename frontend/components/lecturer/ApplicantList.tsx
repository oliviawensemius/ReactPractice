// src/components/lecturer/ApplicantList.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { lecturerService, ApplicantDisplayData } from '@/services/lecturer.service';
import { searchLecturerApplications } from '@/services/lecturerSearch.service';
import { SearchCriteria } from './SearchBar';
import Notification from '@/components/ui/Notification';

interface ApplicantListProps {
    selectedCourse: string;
    setSelectedCourse: (course: string) => void;
    searchCriteria: SearchCriteria;
    onSelectApplicant: (applicant: ApplicantDisplayData | null) => void;
}

interface Course {
    id: string;
    code: string;
    name: string;
    semester: string;
    year: number;
}

const ApplicantList: React.FC<ApplicantListProps> = ({
    selectedCourse,
    setSelectedCourse,
    searchCriteria,
    onSelectApplicant
}) => {
    // States
    const [lecturerCourses, setLecturerCourses] = useState<Course[]>([]);
    const [allApplicants, setAllApplicants] = useState<ApplicantDisplayData[]>([]);
    const [filteredApplicants, setFilteredApplicants] = useState<ApplicantDisplayData[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);

    // Load lecturer's courses
    const loadLecturerCourses = async () => {
        try {
            const courses = await lecturerService.getLecturerCourses();
            setLecturerCourses(courses);
            
            // If no course is selected yet, select the first one or 'All'
            if (selectedCourse === '') {
                setSelectedCourse(courses.length > 0 ? 'All' : '');
            }
            
            return courses;
        } catch (error: any) {
            console.error("Error loading lecturer courses:", error);
            setNotification({
                type: 'error',
                message: error.message || 'Failed to load courses'
            });
            return [];
        }
    };

    // Load applications for a specific course
    const loadApplicationsForCourse = async (courseId: string) => {
        try {
            return await lecturerService.getApplicationsForCourse(courseId);
        } catch (error: any) {
            console.error(`Error loading applications for course ${courseId}:`, error);
            return [];
        }
    };

    // Load all applications for all lecturer courses
    const loadAllApplications = async () => {
        try {
            setIsLoading(true);

            // First get all lecturer courses
            const courses = await loadLecturerCourses();
            if (courses.length === 0) {
                setIsLoading(false);
                return;
            }

            // If a specific course is selected (not 'All')
            if (selectedCourse !== 'All' && selectedCourse !== '') {
                const applications = await loadApplicationsForCourse(selectedCourse);
                setAllApplicants(applications);
            } else {
                // Otherwise, load applications for all courses
                const applications = await lecturerService.getAllLecturerApplications();
                setAllApplicants(applications);
            }
        } catch (error: any) {
            console.error("Error loading applications:", error);
            setNotification({
                type: 'error',
                message: error.message || 'Failed to load applications'
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Load data on component mount and when selectedCourse changes
    useEffect(() => {
        loadAllApplications();
    }, [loadAllApplications]);

    // Filter and sort applicants using backend search API
    useEffect(() => {
        const filterAndSort = async () => {
            setIsLoading(true);
            try {
                // Step 1: Collect all applicant IDs
                const applicationIds = allApplicants.map(app => app.id);

                // Step 2: Call backend search with IDs and criteria
                const resultIds = await searchLecturerApplications({
                    applicationIds,
                    name: searchCriteria.tutorName,
                    availability: searchCriteria.availability as 'fulltime' | 'parttime' | undefined,
                    skills: searchCriteria.skillSet
                        ? searchCriteria.skillSet.split(',').map(s => s.trim()).filter(Boolean)
                        : undefined,
                    sessionType: searchCriteria.sessionType as 'tutor' | 'lab_assistant' | undefined,
                    sort_by: searchCriteria.sortBy,
                    sort_direction: searchCriteria.sortDirection,
                });


                let filtered: ApplicantDisplayData[] = [];
                if (resultIds.length > 0) {
                    filtered = await lecturerService.getApplicationsByID(resultIds);
                    // Ensure order matches backend
                    filtered.sort((a, b) => resultIds.indexOf(a.id) - resultIds.indexOf(b.id));
                }
                setFilteredApplicants(filtered);
            } catch (error: any) {
                setNotification({
                    type: 'error',
                    message: error.message || 'Failed to filter applicants'
                });
                setFilteredApplicants([]);
            } finally {
                setIsLoading(false);
            }
        };

        filterAndSort();

    }, [allApplicants, searchCriteria]);

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Applicants</h2>
            
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            {/* Dropdown for selecting course */}
            <div className="mb-4">
                <label htmlFor="courseFilter" className="block font-semibold">Filter by Course:</label>
                <select
                    id="courseFilter"
                    className="mt-1 p-2 border border-gray-300 rounded w-full"
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    disabled={isLoading}
                >
                    <option value="All">All Courses</option>
                    {lecturerCourses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.code} - {course.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Applicants table */}
            {isLoading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
                    <span className="ml-2 text-gray-600">Loading applicants...</span>
                </div>
            ) : (
                <div className="w-full overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 bg-white shadow-lg">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border border-gray-300 px-4 py-2">Course Code</th>
                                <th className="border border-gray-300 px-4 py-2">Course Name</th>
                                <th className="border border-gray-300 px-4 py-2">Applicant Name</th>
                                <th className="border border-gray-300 px-4 py-2">
                                    Availability
                                </th>
                                <th className="border border-gray-300 px-4 py-2">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplicants.length > 0 ? (
                                filteredApplicants.map((applicant, index) => (
                                    <tr
                                        key={`${applicant.id}-${index}`}
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
                                            lecturerCourses.length > 0 ? 'No applicants available' : 'No courses assigned yet'}
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

export default ApplicantList;