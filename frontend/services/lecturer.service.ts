// frontend/services/lecturer.service.ts
import api from '@/lib/api';
import { getApplicationsForReview, updateApplicationStatus, addCommentToApplication, updateApplicationRanking } from './application.service';

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

interface CourseResponse {
  success: boolean;
  message?: string;
  courses?: any[];
}

interface ApplicantStats {
  totalApplicants: number;
  selectedCount: number;
  pendingCount: number;
  rejectedCount: number;
  mostSelected: { name: string; count: number } | null;
  leastSelected: { name: string; count: number } | null;
  unselectedApplicants: { name: string }[];
}
interface ApplicationsResponse {
  success: boolean;
  applications: ApplicantDisplayData[];
}
class LecturerService {
  async getAllLecturerApplications(): Promise<ApplicantDisplayData[]> {
    try {
      const applications = await getApplicationsForReview();
      return applications;
    } catch (error) {
      console.error('Error in getAllLecturerApplications:', error);
      throw error;
    }
  }

  async getApplicationsForCourse(courseId: string): Promise<ApplicantDisplayData[]> {
    try {
      const allApplications = await this.getAllLecturerApplications();
      return allApplications.filter(app => app.courseId === courseId);
    } catch (error) {
      console.error('Error in getApplicationsForCourse:', error);
      throw error;
    }
  }

  async updateApplicationStatus(applicationId: string, status: 'Pending' | 'Selected' | 'Rejected'): Promise<void> {
    try {
      await updateApplicationStatus(applicationId, status);
    } catch (error) {
      console.error('Error in updateApplicationStatus:', error);
      throw error;
    }
  }

  async addCommentToApplication(applicationId: string, comment: string): Promise<void> {
    try {
      await addCommentToApplication(applicationId, comment);
    } catch (error) {
      console.error('Error in addCommentToApplication:', error);
      throw error;
    }
  }

  async updateApplicationRanking(applicationId: string, ranking: number): Promise<void> {
    try {
      await updateApplicationRanking(applicationId, ranking);
    } catch (error) {
      console.error('Error in updateApplicationRanking:', error);
      throw error;
    }
  }

  async getLecturerCourses(): Promise<any[]> {
    try {
      const response = await api.get('/lecturer-courses/my-courses');
      const data = response.data as CourseResponse;

      if (data.success && data.courses) {
        return data.courses;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching lecturer courses:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch lecturer courses');
    }
  }

  async addCourse(courseId: string): Promise<any> {
    try {
      const response = await api.post('/lecturer-courses/add', {
        course_id: courseId
      });

      return response.data;
    } catch (error: any) {
      console.error('Error adding course to lecturer:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to add course');
    }
  }

  async removeCourse(courseId: string): Promise<any> {
    try {
      const response = await api.post('/lecturer-courses/remove', {
        course_id: courseId
      });

      return response.data;
    } catch (error: any) {
      console.error('Error removing course from lecturer:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to remove course');
    }
  }

  async autoAssignCourses(): Promise<any> {
    try {
      const response = await api.post('/lecturer-courses/auto-assign');
      return response.data;
    } catch (error: any) {
      console.error('Error auto-assigning courses:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to auto-assign courses');
    }
  }

  async getApplicantStatistics(): Promise<ApplicantStats> {
    try {
      const applications = await this.getAllLecturerApplications();

      const stats: ApplicantStats = {
        totalApplicants: applications.length,
        selectedCount: applications.filter(app => app.status === 'Selected').length,
        pendingCount: applications.filter(app => app.status === 'Pending').length,
        rejectedCount: applications.filter(app => app.status === 'Rejected').length,
        mostSelected: null,
        leastSelected: null,
        unselectedApplicants: applications.filter(app => app.status === 'Pending').map(app => ({ name: app.tutorName }))
      };

      const selectedApps = applications.filter(app => app.status === 'Selected');
      if (selectedApps.length > 0) {
        const selectionCounts = selectedApps.reduce((acc: Record<string, number>, app) => {
          acc[app.tutorName] = (acc[app.tutorName] || 0) + 1;
          return acc;
        }, {});

        const sortedCounts = Object.entries(selectionCounts).sort(([, a], [, b]) => b - a);

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

  /**
   * Returns an array of all candidates with:
   * - candidateName: string
   * - selectedCount: number
   * - isSelected: boolean
   * Sorted from most to least selected.
   */
  async getAllApplicationStatistics(): Promise<Array<{ candidateName: string; selectedCount: number; isSelected: boolean }>> {
    try {
      const applications = await this.getAllLecturerApplications();

      // counting selections per candidate
      const selectionCounts: Record<string, { count: number; isSelected: boolean }> = {};

      for (const app of applications) {
        if (!selectionCounts[app.tutorName]) {
          selectionCounts[app.tutorName] = { count: 0, isSelected: false };
        }
        if (app.status === 'Selected') {
          selectionCounts[app.tutorName].count += 1;
          selectionCounts[app.tutorName].isSelected = true;
        }
      }

      // adding candidates who have applications but none selected
      for (const app of applications) {
        if (!selectionCounts[app.tutorName]) {
          selectionCounts[app.tutorName] = { count: 0, isSelected: false };
        }
      }

      // change to [] and sort
      const statsArray = Object.entries(selectionCounts)
        .map(([candidateName, { count, isSelected }]) => ({
          candidateName,
          selectedCount: count,
          isSelected,
        }))
        .sort((a, b) => b.selectedCount - a.selectedCount);

      return statsArray;
    } catch (error) {
      console.error('Error getting all application statistics:', error);
      throw error;
    }
  }

  async getApplicationsByID(applicationIds: string[]): Promise<ApplicantDisplayData[]> {
    if (!applicationIds || applicationIds.length === 0) return [];
    const response = await api.post('/lecturer-courses/applications/by-ids', { applicationIds });
    const data = response.data as ApplicationsResponse;
    return data.applications;
  }
}

export const lecturerService = new LecturerService();