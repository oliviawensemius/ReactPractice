
export enum UserRole {
  Tutor = 'tutor',
  Lecturer = 'lecturer',
}

// Base user interface for authentication
export interface User {
  name: string;
  email: string;
  role: UserRole;
  password: string;
}

// Tutor user 
export interface Tutor extends User {
  applications: TutorApplication[];
}

// Lecturer user
export interface Lecturer extends User {
  courses: string[];
}

// Application details
export interface TutorApplication {
  id: string;
  tutorEmail: string;
  courseId: string;
  role: 'tutor' | 'lab_assistant'; 
  skills: string[];
  previousRoles: PreviousRole[];
  academicCredentials: AcademicCredential[];
  availability: 'fulltime' | 'parttime';
  createdAt: string;
  status: 'Pending' | 'Selected' | 'Rejected';
  comments?: string[];
  ranking?: number;
}

export interface PreviousRole {
  id: string;
  position: string;
  organisation: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface AcademicCredential {
  id: string;
  degree: string;
  institution: string;
  year: number;
  gpa?: number;
}

export interface Course {
  id: string;
  code: string; // Format: COSCxxxx
  name: string;
  semester: string;
  year: number;
}

// Combo of tutor and application
export interface ApplicantDisplay {
  id: string;           // Application ID
  tutorName: string;    // Tutor's name
  tutorEmail: string;   // Tutor's email
  courseId: string;     // Course ID
  courseCode: string;   // Course code for display
  courseName: string;   // Course name for display
  role: 'tutor' | 'lab_assistant';
  skills: string[];
  previousRoles: PreviousRole[];
  academicCredentials: AcademicCredential[];
  availability: 'fulltime' | 'parttime';
  status: 'Pending' | 'Selected' | 'Rejected';
  comments?: string[];
  ranking?: number;
}