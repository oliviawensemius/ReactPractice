// frontend/lib/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'candidate' | 'lecturer' | 'admin';
  roleSpecificId?: string;
  created_at?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  year: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Application {
  id: string;
  tutorName: string;
  tutorEmail: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  role: string;
  skills: string[];
  availability: string;
  status: string;
  ranking?: number;
  comments?: string[];
  createdAt: string;
  academicCredentials?: AcademicCredential[];
  previousRoles?: PreviousRole[];
}

export interface PreviousRole {
  id: string;
  position: string;
  organisation: string;
  startDate: string;
  endDate?: string;
  description?: string;
}

export interface AcademicCredential {
  id: string;
  degree: string;
  institution: string;
  year: number;
  gpa?: number;
}

export interface ApplicationData {
  candidate_id: string;
  course_id: string;
  session_type: 'tutor' | 'lab_assistant';
  skills: string[];
  availability: 'fulltime' | 'parttime';
  academic_credentials: Array<{
    degree: string;
    institution: string;
    year: number;
    gpa: number | null;
  }>;
  previous_roles: Array<{
    position: string;
    organisation: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
}

export interface SearchCriteria {
  courseName?: string;
  tutorName?: string;
  availability?: string;
  skillSet?: string;
  sessionType?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface ChartData {
  name: string;
  value: number;
}

export interface CourseSelection {
  courseId: string;
  sessionType: 'tutor' | 'lab_assistant';
}

export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface NotificationData {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}