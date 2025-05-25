// frontend/services/application.service.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
    gpa?: string;
  }>;
  previous_roles?: Array<{
    position: string;
    organisation: string;
    startDate: string;
    endDate?: string;
    description?: string;
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

// Create application
export async function createApplication(applicationData: ApplicationData): Promise<ApplicationResponse> {
  try {
    console.log('Submitting application:', applicationData);
    
    const response = await fetch(`${API_BASE_URL}/applications/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(applicationData),
    });

    const data = await response.json();
    console.log('Application response:', data);
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
}

// Get applications by candidate
export async function getApplicationsByCandidate(candidateId: string): Promise<Application[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/my-applications`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApplicationResponse = await response.json();
    
    if (data.success && data.applications) {
      return data.applications;
    } else {
      throw new Error(data.message || 'Failed to fetch applications');
    }
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
}

// Get applications for lecturer review
export async function getApplicationsForReview(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/for-review`, {
      method: 'GET',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApplicationResponse = await response.json();
    
    if (data.success && data.applications) {
      return data.applications;
    } else {
      throw new Error(data.message || 'Failed to fetch applications');
    }
  } catch (error) {
    console.error('Error fetching applications for review:', error);
    throw error;
  }
}

// Update application status
export async function updateApplicationStatus(applicationId: string, status: 'Pending' | 'Selected' | 'Rejected'): Promise<ApplicationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
}

// Add comment to application
export async function addCommentToApplication(applicationId: string, comment: string): Promise<ApplicationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/comment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ comment }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

// Update application ranking
export async function updateApplicationRanking(applicationId: string, ranking: number): Promise<ApplicationResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/applications/${applicationId}/ranking`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ ranking }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('Error updating ranking:', error);
    throw error;
  }
}