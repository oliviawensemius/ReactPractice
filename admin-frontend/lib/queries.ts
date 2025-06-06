// admin-frontend/src/lib/queries.ts - Updated with enhanced queries
import { gql } from '@apollo/client';

// Authentication
export const ADMIN_LOGIN = gql`
  mutation AdminLogin($username: String!, $password: String!) {
    adminLogin(username: $username, password: $password) {
      success
      message
      user {
        id
        name
        email
        role
        is_active
        is_blocked
      }
    }
  }
`;

// Course Management - Updated for semester support
export const GET_ALL_COURSES = gql`
  query GetAllCourses {
    getAllCourses {
      id
      code
      name
      semester
      year
      is_active
      description
      credits
      created_at
      updated_at
      lecturer_assignments {
        id
        semester
        year
        is_active
        lecturer {
          id
          user {
            id
            name
            email
          }
        }
      }
    }
  }
`;

export const CREATE_COURSE = gql`
  mutation AddCourse($courseData: CourseInput!) {
    addCourse(courseData: $courseData) {
      id
      code
      name
      semester
      year
      is_active
      description
      credits
    }
  }
`;

export const UPDATE_COURSE = gql`
  mutation EditCourse($id: String!, $courseData: CourseInput!) {
    editCourse(id: $id, courseData: $courseData) {
      id
      code
      name
      semester
      year
      is_active
      description
      credits
    }
  }
`;

export const DELETE_COURSE = gql`
  mutation DeleteCourse($id: String!) {
    deleteCourse(id: $id)
  }
`;

// Enhanced Lecturer Management
export const GET_ALL_LECTURERS = gql`
  query GetAllLecturers {
    getAllLecturers {
      id
      user {
        id
        name
        email
        is_active
      }
      department
      title
      office_location
      phone
      course_assignments {
        id
        semester
        year
        is_active
        course {
          id
          code
          name
          semester
          year
        }
      }
      created_at
    }
  }
`;

export const ASSIGN_LECTURER_TO_COURSES_FOR_SEMESTER = gql`
  mutation AssignLecturerToCoursesForSemester($input: SemesterAssignmentInput!) {
    assignLecturerToCoursesForSemester(input: $input) {
      success
      message
    }
  }
`;

// Keep legacy mutation for backward compatibility
export const ASSIGN_LECTURER_TO_COURSES = gql`
  mutation AssignLecturerToCourses($input: LecturerMultipleCourseAssignmentInput!) {
    assignLecturerToCourses(input: $input) {
      success
      message
    }
  }
`;

// Enhanced Candidate Management
export const GET_ALL_CANDIDATES_WITH_COURSES = gql`
  query GetAllCandidatesWithCourses {
    getAllCandidatesWithCourses {
      id
      user {
        id
        name
        email
        is_active
        is_blocked
        blocked_reason
        blocked_by
        blocked_at
        created_at
      }
      availability
      skills
      created_at
      selectedCourses {
        courseCode
        courseName
        semester
        year
        role
        ranking
      }
      totalApplications
      selectedApplicationsCount
    }
  }
`;

// Legacy candidate query for backward compatibility
export const GET_ALL_CANDIDATES = gql`
  query GetAllCandidates {
    getAllCandidates {
      id
      user {
        id
        name
        email
        is_active
        is_blocked
        blocked_reason
        created_at
      }
      availability
      skills
      created_at
    }
  }
`;

export const TOGGLE_CANDIDATE_STATUS = gql`
  mutation ToggleCandidateStatus($id: String!) {
    toggleCandidateStatus(id: $id)
  }
`;

export const BLOCK_CANDIDATE = gql`
  mutation BlockCandidate($input: BlockCandidateInput!) {
    blockCandidate(input: $input)
  }
`;

// Reports - HD REQUIREMENTS (unchanged)
export const GET_COURSE_APPLICATION_REPORTS = gql`
  query GetCourseApplicationReports {
    getCourseApplicationReports {
      courseCode
      courseName
      selectedCandidates {
        candidateName
        candidateEmail
        sessionType
        ranking
      }
    }
  }
`;

export const GET_CANDIDATES_WITH_MULTIPLE_COURSES = gql`
  query GetCandidatesWithMultipleCourses {
    getCandidatesWithMultipleCourses {
      id
      candidateName
      candidateEmail
      courseCount
      courses
    }
  }
`;

export const GET_UNSELECTED_CANDIDATES = gql`
  query GetUnselectedCandidates {
    getUnselectedCandidates {
      id
      candidateName
      candidateEmail
      applicationCount
      appliedCourses
    }
  }
`;

// Input Types for TypeScript
export interface CourseInput {
  code: string;
  name: string;
  semester: string;
  year: number;
  description?: string;
  credits?: number;
}

export interface BlockCandidateInput {
  candidateId: string;
  isBlocked: boolean;
  reason?: string;
}

export interface SemesterAssignmentInput {
  lecturerId: string;
  courseIds: string[];
  semester: string;
  year: number;
}

export interface LecturerCourseAssignmentInput {
  lecturerId: string;
  courseId: string;
  semester?: string;
  year?: number;
}

export interface LecturerMultipleCourseAssignmentInput {
  lecturerId: string;
  courseIds: string[];
}