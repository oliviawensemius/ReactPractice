// frontend/services/lecturer.service.ts
import api from './api';

// Response type interfaces
interface AuthCheckResponse {
  success: boolean;
  authenticated: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

interface CourseResponse {
  success: boolean;
  courses?: Course[];
  message?: string;
}

interface ApplicationResponse {
  success: boolean;
  applications?: any[];
  message?: string;
}

interface SearchResponse {
  success: boolean;
  results?: ApplicantDisplayData[];
  message?: string;
}

interface StandardResponse {
  success: boolean;
  message?: string;
  data?: any;
}

// Data type interfaces
interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  year: number;
  credits: number;
  is_active: boolean;
}

interface ApplicantDisplayData {
  id: string;
  candidateId?: string;
  tutorName?: string;
  name?: string;
  tutorEmail?: string;
  email?: string;
  course: {
    id: string;
    code: string;
    name: string;
  };
  courseId?: string;
  courseCode?: string;
  courseName?: string;
  session_type: string;
  role?: string;
  status: string;
  ranking?: number;
  comments?: any[];
  createdAt: string;
  skills?: string[];
  availability?: string;
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

interface SearchCriteria {
  courseName?: string;
  tutorName?: string;
  availability?: string;
  skillSet?: string;
  sessionType?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
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
  
  // Check lecturer authentication
  async checkLecturerAuth(): Promise<boolean> {
    try {
      const response = await api.get<AuthCheckResponse>('/auth/check');
      const data = response.data;
      
      if (data.success && data.authenticated && data.user?.role === 'lecturer') {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking lecturer authentication:', error);
      return false;
    }
  }

  // Get lecturer courses
  async getLecturerCourses(): Promise<Course[]> {
    try {
      console.log('🔍 Fetching lecturer courses...');
      const response = await api.get<CourseResponse>('/lecturer-courses/my-courses');
      const data = response.data;
      
      if (data.success && data.courses) {
        console.log(`✅ Found ${data.courses.length} courses for lecturer`);
        return data.courses;
      } else {
        console.log('⚠️ No courses found:', data.message);
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error fetching lecturer courses:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please sign in as a lecturer.');
      } else if (error.response?.status === 403) {
        throw new Error('Access denied. Lecturer role required.');
      } else if (error.response?.status === 404) {
        throw new Error('Lecturer profile not found. Please contact administrator.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch lecturer courses');
    }
  }

  // Get applications for lecturer review
  async getApplicationsForReview(): Promise<ApplicantDisplayData[]> {
    try {
      console.log('🔍 Fetching applications for review...');
      const response = await api.get<ApplicationResponse>('/applications/for-review');
      
      if (response.data.success && response.data.applications) {
        console.log(`✅ Found ${response.data.applications.length} applications for review`);
        return response.data.applications.map((app: any) => ({
          ...app,
          tutorName: app.name || app.tutorName,
          tutorEmail: app.email || app.tutorEmail,
          courseId: app.course?.id || app.courseId,
          courseCode: app.course?.code || app.courseCode,
          courseName: app.course?.name || app.courseName
        }));
      } else {
        console.log('⚠️ No applications found');
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error fetching applications for review:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please sign in as a lecturer.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch applications');
    }
  }

  // REQUIRED METHOD - Called by existing frontend code
  async getAllLecturerApplications(): Promise<ApplicantDisplayData[]> {
    return this.getApplicationsForReview();
  }

  // Get applications for specific course
  async getApplicationsForCourse(courseId: string): Promise<ApplicantDisplayData[]> {
    try {
      const allApplications = await this.getAllLecturerApplications();
      return allApplications.filter(app => 
        app.course?.id === courseId || app.courseId === courseId
      );
    } catch (error: any) {
      console.error('❌ Error fetching applications for course:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch course applications');
    }
  }

  // Get applications by IDs
  async getApplicationsByID(applicationIds: string[]): Promise<ApplicantDisplayData[]> {
    try {
      if (!applicationIds || applicationIds.length === 0) return [];
      
      const response = await api.post<ApplicationResponse>('/lecturer-courses/applications/by-ids', { 
        applicationIds 
      });
      
      if (response.data.success && response.data.applications) {
        return response.data.applications;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error fetching applications by IDs:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch applications');
    }
  }

  // Search applications
  async searchApplications(criteria: SearchCriteria): Promise<ApplicantDisplayData[]> {
    try {
      const response = await api.get('/lecturer-courses/my-courses');
      const data = response.data as CourseResponse;

      if (data.success && data.courses) {
        return data.courses;

      } else {
        console.log('⚠️ No applications found matching criteria');
        return [];
      }
    } catch (error: any) {
      console.error('❌ Error searching applications:', error);
      
      if (error.response?.status === 401) {
        throw new Error('Authentication required. Please sign in as a lecturer.');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'Failed to search applications');
    }
  }

  // Update application status
  async updateApplicationStatus(applicationId: string, status: 'Pending' | 'Selected' | 'Rejected'): Promise<any> {
    try {
      const response = await api.put<StandardResponse>(`/applications/${applicationId}/status`, {
        status
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating application status:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update application status');
    }
  }

  // Add comment
  async addComment(applicationId: string, comment: string): Promise<any> {
    try {
      const response = await api.post<StandardResponse>(`/applications/${applicationId}/comment`, {
        comment
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error adding comment:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to add comment');
    }
  }

  // ALIAS - Required by existing code
  async addCommentToApplication(applicationId: string, comment: string): Promise<void> {
    await this.addComment(applicationId, comment);
  }

  // Update ranking
  async updateApplicationRanking(applicationId: string, ranking: number): Promise<any> {
    try {
      const response = await api.put<StandardResponse>(`/applications/${applicationId}/ranking`, {
        ranking
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error updating application ranking:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update ranking');
    }
  }

  // Add course to lecturer
  async addCourse(courseId: string): Promise<any> {
    try {
      const response = await api.post<StandardResponse>('/lecturer-courses/add', {
        course_id: courseId
      });

      return response.data;
    } catch (error: any) {
      console.error('❌ Error adding course to lecturer:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to add course');
    }
  }

  // Remove course from lecturer
  async removeCourse(courseId: string): Promise<any> {
    try {
      const response = await api.post<StandardResponse>('/lecturer-courses/remove', {
        course_id: courseId
      });
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Error removing course from lecturer:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to remove course');
    }
  }

  // Get statistics
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
        unselectedApplicants: applications
          .filter(app => app.status === 'Pending')
          .map(app => ({ name: app.tutorName || app.name || 'Unknown' }))
      };

      const selectedApps = applications.filter(app => app.status === 'Selected');
      if (selectedApps.length > 0) {
        const selectionCounts = selectedApps.reduce((acc: Record<string, number>, app) => {
          const name = app.tutorName || app.name || 'Unknown';
          acc[name] = (acc[name] || 0) + 1;
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
      console.error('❌ Error getting applicant statistics:', error);
      throw error;
    }
  }

  // Get all application statistics
  async getAllApplicationStatistics(): Promise<Array<{ candidateName: string; selectedCount: number; isSelected: boolean }>> {
    try {
      const applications = await this.getAllLecturerApplications();

      const selectionCounts: Record<string, { count: number; isSelected: boolean }> = {};

      for (const app of applications) {
        const name = app.tutorName || app.name || 'Unknown';
        if (!selectionCounts[name]) {
          selectionCounts[name] = { count: 0, isSelected: false };
        }
        if (app.status === 'Selected') {
          selectionCounts[name].count += 1;
          selectionCounts[name].isSelected = true;
        }
      }

      return Object.entries(selectionCounts)
        .map(([candidateName, { count, isSelected }]) => ({
          candidateName,
          selectedCount: count,
          isSelected,
        }))
        .sort((a, b) => b.selectedCount - a.selectedCount);
    } catch (error) {
      console.error('❌ Error getting all application statistics:', error);
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

// Export singleton
export const lecturerService = new LecturerService();
export default lecturerService;
export type { ApplicantDisplayData, SearchCriteria, ApplicantStats, Course };