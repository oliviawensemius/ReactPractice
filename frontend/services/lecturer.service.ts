// frontend/services/lecturer.service.ts
import axios from 'axios';
import { authService } from './auth.service';

const API_URL = 'http://localhost:3001/api';
axios.defaults.withCredentials = true;

export interface ApplicantDisplayData {
  id: string;
  tutorName: string;
  tutorEmail: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  role: 'tutor' | 'lab_assistant';
  skills: string[];
  previousRoles: any[];
  academicCredentials: any[];
  availability: 'fulltime' | 'parttime';
  status: 'Pending' | 'Selected' | 'Rejected';
  comments?: string[];
  ranking?: number;
}

export const lecturerService = {
  // Get courses assigned to the lecturer
  getLecturerCourses: async (): Promise<any[]> => {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const response = await axios.get(`${API_URL}/courses/lecturer/${user.id}`);
      
      if (response.status === 200) {
        return response.data || [];
      }
      
      throw new Error('Failed to fetch lecturer courses');
    } catch (error: any) {
      console.error("Error fetching lecturer courses:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch lecturer courses');
    }
  },

  // Get applications for a specific course
  getApplicationsForCourse: async (courseId: string): Promise<ApplicantDisplayData[]> => {
    try {
      const response = await axios.get(`${API_URL}/applications/course/${courseId}`);
      
      if (response.status === 200) {
        // Convert the response data to ApplicantDisplayData format
        if (response.data.applications && Array.isArray(response.data.applications)) {
          return response.data.applications.map((app: any) => ({
            id: app.id,
            tutorName: app.candidate.name,
            tutorEmail: app.candidate.email,
            courseId: app.course.id,
            courseCode: app.course.code,
            courseName: app.course.name,
            role: app.sessionType,
            skills: app.candidate.skills || [],
            previousRoles: app.candidate.previousRoles || [],
            academicCredentials: app.candidate.academicCredentials || [],
            availability: app.candidate.availability,
            status: app.status,
            comments: app.comments || [],
            ranking: app.ranking
          }));
        }
        return [];
      }
      
      throw new Error('Failed to fetch applications for course');
    } catch (error: any) {
      console.error("Error fetching applications for course:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch applications');
    }
  },

  // Get all applications for all courses assigned to lecturer
  getAllLecturerApplications: async (): Promise<ApplicantDisplayData[]> => {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      // Get lecturer's courses first
      const courses = await lecturerService.getLecturerCourses();
      if (!courses.length) return [];
      
      // Get applications for each course and combine them
      const applications: ApplicantDisplayData[] = [];
      
      for (const course of courses) {
        const courseApps = await lecturerService.getApplicationsForCourse(course.id);
        applications.push(...courseApps);
      }
      
      return applications;
    } catch (error: any) {
      console.error("Error fetching all lecturer applications:", error);
      throw new Error(error.message || 'Failed to fetch all applications');
    }
  },

  // Update application status (accept/reject)
  updateApplicationStatus: async (applicationId: string, status: 'Pending' | 'Selected' | 'Rejected'): Promise<any> => {
    try {
      const response = await axios.patch(`${API_URL}/applications/${applicationId}/status`, { 
        status: status.toLowerCase() // Convert to lowercase to match backend enum values
      });
      
      if (response.status === 200) {
        return response.data?.application || response.data;
      }
      
      throw new Error('Failed to update application status');
    } catch (error: any) {
      console.error("Error updating application status:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update status');
    }
  },

  // Add comment to application
  addCommentToApplication: async (applicationId: string, comment: string): Promise<any> => {
    try {
      const response = await axios.patch(`${API_URL}/applications/${applicationId}/comments`, { comment });
      
      if (response.status === 200) {
        return response.data?.application || response.data;
      }
      
      throw new Error('Failed to add comment');
    } catch (error: any) {
      console.error("Error adding comment:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to add comment');
    }
  },

  // Update application ranking
  updateApplicationRanking: async (applicationId: string, ranking: number): Promise<any> => {
    try {
      const response = await axios.patch(`${API_URL}/applications/${applicationId}/ranking`, { ranking });
      
      if (response.status === 200) {
        return response.data?.application || response.data;
      }
      
      throw new Error('Failed to update ranking');
    } catch (error: any) {
      console.error("Error updating ranking:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update ranking');
    }
  },

  // Get statistics for lecturer dashboard
  getApplicantStatistics: async (): Promise<any> => {
    try {
      const user = authService.getCurrentUser();
      if (!user) throw new Error('Not authenticated');
      
      // Get statistics directly from backend
      const response = await axios.get(`${API_URL}/statistics/lecturer/${user.id}`);
      
      if (response.status === 200 && response.data.success) {
        return response.data.statistics;
      }
      
      throw new Error('Failed to fetch statistics');
    } catch (error: any) {
      console.error("Error generating statistics:", error);
      
      // Fallback if the backend fails - generate stats from local data
      try {
        console.log("Using fallback statistics calculation...");
        const applications = await lecturerService.getAllLecturerApplications();
        
        // Count selected applications per tutor
        const selectionCount: Record<string, { name: string, email: string, count: number }> = {};
        
        applications.forEach(app => {
          if (app.status === 'Selected') {
            if (!selectionCount[app.tutorEmail]) {
              selectionCount[app.tutorEmail] = {
                name: app.tutorName,
                email: app.tutorEmail,
                count: 0
              };
            }
            selectionCount[app.tutorEmail].count++;
          }
        });
        
        // Find most and least selected applicants
        const selectedApplicants = Object.values(selectionCount);
        let mostSelected = null;
        let leastSelected = null;
        
        if (selectedApplicants.length > 0) {
          mostSelected = selectedApplicants.reduce((prev, current) => 
            (prev.count > current.count) ? prev : current
          );
          
          leastSelected = selectedApplicants.reduce((prev, current) => 
            (prev.count < current.count) ? prev : current
          );
        }
        
        // Find unselected applicants
        const applicantStatus: Record<string, { name: string, email: string, selected: boolean }> = {};
        
        applications.forEach(app => {
          if (!applicantStatus[app.tutorEmail]) {
            applicantStatus[app.tutorEmail] = {
              name: app.tutorName,
              email: app.tutorEmail,
              selected: false
            };
          }
          
          if (app.status === 'Selected') {
            applicantStatus[app.tutorEmail].selected = true;
          }
        });
        
        const unselectedApplicants = Object.values(applicantStatus)
          .filter(status => !status.selected)
          .map(({ name, email }) => ({ name, email }));
        
        return {
          mostSelected,
          leastSelected,
          unselectedApplicants,
          totalApplicants: applications.length,
          selectedCount: applications.filter(app => app.status === 'Selected').length,
          pendingCount: applications.filter(app => app.status === 'Pending').length,
          rejectedCount: applications.filter(app => app.status === 'Rejected').length
        };
      } catch (fallbackError) {
        console.error("Fallback statistics calculation failed:", fallbackError);
        throw new Error('Failed to generate statistics');
      }
    }
  }
};