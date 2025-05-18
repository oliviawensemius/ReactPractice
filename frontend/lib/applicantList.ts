import {
    TutorApplication,
    ApplicantDisplay
} from '@/lib/types';
import {
    getAllApplications,
    getApplicationsForCourse,
    getUserData,
    getComments,
    addComment,
    updateApplicationStatus,
    updateApplicationRanking,
    getSelectedApplications,
    getApplicantStatistics as getStats
} from '@/lib/storage';
import { courses as allCourses } from '@/lib/data';

/**
 * Get course details by ID
 */
export const getCourseDetails = (courseId: string): { code: string; name: string } => {
    // First try to find by id
    const courseById = allCourses.find(c => c.id === courseId);
    if (courseById) {
        return { code: courseById.code, name: courseById.name };
    }
    
    // If not found by ID, try to find by course code directly
    const courseByCode = allCourses.find(c => c.code === courseId);
    if (courseByCode) {
        return { code: courseByCode.code, name: courseByCode.name };
    }
    
    // Course not found in our data, but it might be a valid course code
    if (typeof courseId === 'string' && courseId.match(/^[A-Z]{4}\d{4}$/)) {
        return { code: courseId, name: `${courseId} Course` };
    }
    
    // fixing up in case null/undefined
    return { code: courseId || 'Unknown', name: 'Course not in catalog' };
};

/**
 * Convert a TutorApplication to an ApplicantDisplay just to make it easier 
 */
export const applicationToDisplay = (application: TutorApplication): ApplicantDisplay => {
    const tutorData = getUserData(application.tutorEmail);
    const tutorName = tutorData?.name || 'Unknown Tutor';
    const { code, name } = getCourseDetails(application.courseId);

    return {
        id: application.id,
        tutorName,
        tutorEmail: application.tutorEmail,
        courseId: application.courseId,
        courseCode: code,
        courseName: name,
        role: application.role,
        skills: application.skills,
        previousRoles: application.previousRoles,
        academicCredentials: application.academicCredentials,
        availability: application.availability,
        status: application.status,
        comments: application.comments,
        ranking: application.ranking
    };
};

/**
 * Get all applicants for a specific course
 */
export const getApplicantsForCourse = (courseId: string): ApplicantDisplay[] => {
    if (typeof window === 'undefined') return [];

    const applications = getApplicationsForCourse(courseId);
    return applications.map(applicationToDisplay);
};

/**
 * Get all courses that have applications
 */
export const getAllCoursesWithApplications = (): string[] => {
    if (typeof window === 'undefined') return [];

    const applications = getAllApplications();
    const coursesSet = new Set<string>();

    applications.forEach(app => {
        coursesSet.add(app.courseId);
    });

    return Array.from(coursesSet);
};

/**
 * Add a comment to an application
 */
export const addComments = (applicationId: string, comment: string): void => {
    if (typeof window === 'undefined') return;
    addComment(applicationId, comment);
};

/**
 * Get all comments for an application
 */
export const getApplicationComments = (applicationId: string): string[] => {
    if (typeof window === 'undefined') return [];
    return getComments(applicationId);
};

/**
 * Get all selected applicants with their rankings
 */
export const getSelectedApplicants = (): ApplicantDisplay[] => {
    if (typeof window === 'undefined') return [];

    const selectedApplications = getSelectedApplications();
    return selectedApplications.map(applicationToDisplay);
};

/**
 * Update the ranking of an applicant
 */
export const updateRanking = (applicationId: string, newRank: number): boolean => {
    if (typeof window === 'undefined') return false;
    return updateApplicationRanking(applicationId, newRank);
};

/**
 * Update the status of an application
 */
export const updateStatus = (applicationId: string, status: 'Pending' | 'Selected' | 'Rejected'): void => {
    if (typeof window === 'undefined') return;
    updateApplicationStatus(applicationId, status);
};

/**
 * Get statistics about applicant selections
 */
export const getApplicantStatistics = () => {
    if (typeof window === 'undefined') {
        return {
            mostSelected: null,
            leastSelected: null,
            unselectedApplicants: []
        };
    }

    return getStats();
};