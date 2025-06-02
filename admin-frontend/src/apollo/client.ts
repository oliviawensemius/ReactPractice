// src/lib/apollo-client.ts
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql',
  credentials: 'include', // Important for session cookies
});

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default client;

// src/lib/queries.ts
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

// Course Queries
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
    }
  }
`;

export const ADD_COURSE = gql`
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

export const EDIT_COURSE = gql`
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

// Lecturer Queries
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
    }
  }
`;

export const ASSIGN_LECTURER_TO_COURSE = gql`
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
      }
      availability
      skills
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

// Reports
export const GET_CANDIDATES_CHOSEN_FOR_EACH_COURSE = gql`
  query GetCandidatesChosenForEachCourse {
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
    }
  }
`;

export const GET_CANDIDATES_CHOSEN_FOR_MULTIPLE_COURSES = gql`
  query GetCandidatesChosenForMultipleCourses {
    getCandidatesChosenForMultipleCourses {
      id
      name
      email
      courseCount
      courses
    }
  }
`;

export const GET_CANDIDATES_NOT_CHOSEN_FOR_ANY_COURSE = gql`
  query GetCandidatesNotChosenForAnyCourse {
    getCandidatesNotChosenForAnyCourse {
      id
      name
      email
      applicationCount
    }
  }
`;

// Input Types (for TypeScript)
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