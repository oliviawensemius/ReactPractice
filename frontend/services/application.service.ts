// frontend/services/application.service.ts
import api from './api';

interface ApplicationData {
  candidate_id: string;
  course_id: string;
  session_type: 'tutor' | 'lab_assistant';
  skills: string[];
  availability: 'fulltime' | 'parttime';
  academic_credentials?: Array<{
    degree: string;
    institution: string;
    year: number;
    gpa?: number | null;
  }>;
  previous_roles?: Array<{
    position: string;
    organisation: string;
    startDate: string;
    endDate?: string | null;
    description?: string | null;
  }>;
}

interface Application {
  id: string;
  course: {
    id: string;
    code: string;
    name: string;
  };
  session_type: string;
  status: string;
  ranking?: number;
  comments: string[];
  created_at: string;
}

interface ApplicationResponse {
  success: boolean;
  message?: string;
  application?: any;
  applications?: Application[];
  errors?: string[];
}

export async function createApplication(applicationData: ApplicationData): Promise<ApplicationResponse> {
  try {
    console.log('Submitting application with axios:', applicationData);
    
    const response = await api.post('/applications/submit', applicationData);
    
    console.log('Application response:', response.data);
    return response.data as ApplicationResponse;
  } catch (error: any) {
    console.error('Error creating application:', error);
    
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
    throw new Error(errorMessage);
  }
}

export async function getApplicationsByCandidate(candidateId: string): Promise<Application[]> {
  try {
    const response = await api.get('/applications/my-applications');
    const data = response.data as ApplicationResponse;
    
    if (data.success && data.applications) {
      return data.applications;
    } else {
      throw new Error(data.message || 'Failed to fetch applications');
    }
  } catch (error: any) {
    console.error('Error fetching applications:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch applications');
  }
}

export async function getApplicationsForReview(): Promise<any[]> {
  try {
    const response = await api.get('/applications/for-review');
    const data = response.data as ApplicationResponse;
    
    if (data.success && data.applications) {
      return data.applications;
    } else {
      throw new Error(data.message || 'Failed to fetch applications');
    }
  } catch (error: any) {
    console.error('Error fetching applications for review:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to fetch applications for review');
  }
}

export async function updateApplicationStatus(applicationId: string, status: 'Pending' | 'Selected' | 'Rejected'): Promise<ApplicationResponse> {
  try {
    const response = await api.put(`/applications/${applicationId}/status`, { status });
    return response.data as ApplicationResponse;
  } catch (error: any) {
    console.error('Error updating application status:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update application status');
  }
}

export async function addCommentToApplication(applicationId: string, comment: string): Promise<ApplicationResponse> {
  try {
    const response = await api.post(`/applications/${applicationId}/comment`, { comment });
    return response.data as ApplicationResponse;
  } catch (error: any) {
    console.error('Error adding comment:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to add comment');
  }
}

export async function updateApplicationRanking(applicationId: string, ranking: number): Promise<ApplicationResponse> {
  try {
    const response = await api.put(`/applications/${applicationId}/ranking`, { ranking });
    return response.data as ApplicationResponse;
  } catch (error: any) {
    console.error('Error updating ranking:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to update ranking');
  }
}