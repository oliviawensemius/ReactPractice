// admin-frontend/lib/queries.ts
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
      }
    }
  }
`;

// Course Management
export const GET_ALL_COURSES = gql`
  query GetAllCourses {
    getAllCourses {
      id
      code
      name
      semester
      year
      is_active
      created_at
      updated_at
      lecturers {
        id
        user {
          id
          name
          email
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
      created_at
      updated_at
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
      created_at
      updated_at
    }
  }
`;

export const DELETE_COURSE = gql`
  mutation DeleteCourse($id: String!) {
    deleteCourse(id: $id)
  }
`;

// Lecturer Management
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
      courses {
        id
        code
        name
        semester
        year
      }
      created_at
    }
  }
`;

export const ASSIGN_LECTURER_TO_COURSES = gql`
  mutation AssignLecturerToCourses($input: LecturerMultipleCourseAssignmentInput!) {
    assignLecturerToCourses(input: $input) {
      success
      message
    }
  }
`;

// Candidate Management  
export const GET_ALL_CANDIDATES = gql`
  query GetAllCandidates {
    getAllCandidates {
      id
      user {
        id
        name
        email
        is_active
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

// Reports - HD REQUIREMENTS
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
}

export interface LecturerCourseAssignmentInput {
  lecturerId: string;
  courseId: string;
}

export interface LecturerMultipleCourseAssignmentInput {
  lecturerId: string;
  courseIds: string[];
}