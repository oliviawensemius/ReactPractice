// frontend/services/lecturer.service.ts
import { getApplicationsForReview, updateApplicationStatus, addCommentToApplication, updateApplicationRanking } from './application.service';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export interface ApplicantDisplayData {
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
  academicCredentials?: Array<{
    id: string;
    degree: string;
    institution: string;
    year: number;
    gpa?: number;
  }>;
  previousRoles?: Array<{
    id: string;
    position: string;
    organisation: string;
    startDate: string;
    endDate?: string;
    description?: string;
  }>;
}

class LecturerService {
  // Get all applications for lecturer review
  async getAllLecturerApplications(): Promise<ApplicantDisplayData[]> {
    try {
      const applications = await getApplicationsForReview();
      return applications;
    } catch (error) {
      console.error('Error in getAllLecturerApplications:', error);
      throw error;
    }
  }

  // Get applications for specific course
  async getApplicationsForCourse(courseId: string): Promise<ApplicantDisplayData[]> {
    try {
      const allApplications = await this.getAllLecturerApplications();
      return allApplications.filter(app => app.courseId === courseId);
    } catch (error) {
      console.error('Error in getApplicationsForCourse:', error);
      throw error;
    }
  }

  // Update application status
  async updateApplicationStatus(applicationId: string, status: 'Pending' | 'Selected' | 'Rejected'): Promise<void> {
    try {
      await updateApplicationStatus(applicationId, status);
    } catch (error) {
      console.error('Error in updateApplicationStatus:', error);
      throw error;
    }
  }

  // Add comment to application
  async addCommentToApplication(applicationId: string, comment: string): Promise<void> {
    try {
      await addCommentToApplication(applicationId, comment);
    } catch (error) {
      console.error('Error in addCommentToApplication:', error);
      throw error;
    }
  }

  // Update application ranking
  async updateApplicationRanking(applicationId: string, ranking: number): Promise<void> {
    try {
      await updateApplicationRanking(applicationId, ranking);
    } catch (error) {
      console.error('Error in updateApplicationRanking:', error);
      throw error;
    }
  }

  // Get lecturer's courses
  async getLecturerCourses(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/lecturer-courses/my-courses`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success && data.courses) {
        return data.courses;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Error fetching lecturer courses:', error);
      return [];
    }
  }

  // Auto-assign courses for testing
  async autoAssignCourses(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/lecturer-courses/auto-assign`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error auto-assigning courses:', error);
      throw error;
    }
  }

  // Get applicant statistics
  async getApplicantStatistics(): Promise<any> {
    try {
      const applications = await this.getAllLecturerApplications();
      
      const stats = {
        totalApplicants: applications.length,
        selectedCount: applications.filter(app => app.status === 'Selected').length,
        pendingCount: applications.filter(app => app.status === 'Pending').length,
        rejectedCount: applications.filter(app => app.status === 'Rejected').length,
        mostSelected: null,
        leastSelected: null,
        unselectedApplicants: applications.filter(app => app.status === 'Pending').map(app => ({ name: app.tutorName }))
      };

      // Calculate most/least selected (simple version for now)
      const selectedApps = applications.filter(app => app.status === 'Selected');
      if (selectedApps.length > 0) {
        // Group by tutor name and count selections
        const selectionCounts = selectedApps.reduce((acc: any, app) => {
          acc[app.tutorName] = (acc[app.tutorName] || 0) + 1;
          return acc;
        }, {});

        const sortedCounts = Object.entries(selectionCounts).sort(([,a]: any, [,b]: any) => b - a);
        
        if (sortedCounts.length > 0) {
          stats.mostSelected = { name: sortedCounts[0][0], count: sortedCounts[0][1] };
          stats.leastSelected = { name: sortedCounts[sortedCounts.length - 1][0], count: sortedCounts[sortedCounts.length - 1][1] };
        }
      }

      return stats;
    } catch (error) {
      console.error('Error getting applicant statistics:', error);
      throw error;
    }
  }
}

export const lecturerService = new LecturerService();