// admin-frontend/src/lib/queries.ts
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
      }
      department
      courses {
        id
        code
        name
      }
      created_at
    }
  }
`;

export const ASSIGN_LECTURER_TO_COURSES = gql`
  mutation AssignLecturerToCourse($assignmentData: LecturerCourseAssignmentInput!) {
    assignLecturerToCourse(assignmentData: $assignmentData) {
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

export const BLOCK_CANDIDATE = gql`
  mutation BlockCandidate($candidateId: String!) {
    blockCandidate(candidateId: $candidateId)
  }
`;

export const UNBLOCK_CANDIDATE = gql`
  mutation UnblockCandidate($candidateId: String!) {
    unblockCandidate(candidateId: $candidateId)
  }
`;

// Reports - HD REQUIREMENTS
export const GET_COURSE_APPLICATION_REPORTS = gql`
  query GetCourseApplicationReports {
    getCandidatesChosenForEachCourse {
      id
      candidate {
        user {
          name
          email
        }
      }
      course {
        code
        name
      }
      session_type
      status
      ranking
      created_at
    }
  }
`;

export const GET_CANDIDATES_WITH_MULTIPLE_COURSES = gql`
  query GetCandidatesWithMultipleCourses {
    getCandidatesChosenForMultipleCourses {
      id
      name
      email
      courseCount
      courses
    }
  }
`;

export const GET_UNSELECTED_CANDIDATES = gql`
  query GetUnselectedCandidates {
    getCandidatesNotChosenForAnyCourse {
      id
      name
      email
      applicationCount
    }
  }
`;

// Input Types
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