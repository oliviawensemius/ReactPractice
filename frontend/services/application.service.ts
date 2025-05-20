// frontend/services/application.service.ts - Fixed version with proper response handling

import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
axios.defaults.withCredentials = true;

// Add request interceptor for debugging
axios.interceptors.request.use(request => {
    console.log('Starting Request:', request.method?.toUpperCase(), request.url);
    console.log('Request data:', request.data);
    return request;
});

// Add response interceptor for debugging
axios.interceptors.response.use(
    response => {
        console.log('Response Success:', response.status, response.data);
        return response;
    },
    error => {
        console.log('Response Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

// Create application with fixed response handling
export const createApplication = async (applicationData: any): Promise<any> => {
    try {
        console.log('=== Creating Application ===');
        console.log('Application data being sent:', JSON.stringify(applicationData, null, 2));
        
        const response = await axios.post(`${API_URL}/applications`, applicationData);
        
        console.log('Full response:', response);
        console.log('Response status:', response.status);
        console.log('Response data:', response.data);
        
        // Check for successful status codes (200, 201)
        if (response.status === 200 || response.status === 201) {
            // If response has success field and it's true, or if there's no success field but we got a 200/201
            if (!response.data || response.data.success !== false) {
                console.log('✅ Application created successfully');
                return response.data?.application || response.data;
            }
        }
        
        // If we get here, there was an issue
        console.warn('⚠️ Unexpected response:', response.data);
        throw new Error(response.data?.message || 'Application may have been created but response format was unexpected');
        
    } catch (error: any) {
        console.error('=== Application Creation Error ===');
        
        // If it's an Axios error
        if (error.response) {
            // Server responded with error status
            const status = error.response.status;
            const data = error.response.data;
            
            console.error(`❌ Server error ${status}:`, data);
            
            // Handle different status codes
            if (status === 400) {
                // Bad request - validation errors
                if (data?.errors && Array.isArray(data.errors)) {
                    throw new Error(`Validation failed: ${data.errors.join('; ')}`);
                } else if (data?.message) {
                    throw new Error(data.message);
                } else {
                    throw new Error('Invalid request data');
                }
            } else if (status === 404) {
                throw new Error(data?.message || 'Resource not found');
            } else if (status === 500) {
                throw new Error(data?.message || 'Server error occurred');
            } else {
                throw new Error(data?.message || `Server error ${status}`);
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('❌ No response received:', error.request);
            throw new Error('Unable to connect to server. Please check if the backend is running.');
        } else {
            // Something else happened in setting up the request
            console.error('❌ Request setup error:', error.message);
            throw new Error(`Request failed: ${error.message}`);
        }
    }
};

// Get all applications with optional filters
export const getAllApplications = async (filters?: any): Promise<any[]> => {
    try {
        const params = new URLSearchParams();
        
        // Add filters to params if they exist
        if (filters) {
            Object.keys(filters).forEach(key => {
                if (filters[key] != null && filters[key] !== '') {
                    params.append(key, filters[key]);
                }
            });
        }
        
        const url = `${API_URL}/applications${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await axios.get(url);
        
        if (response.status === 200) {
            return response.data?.applications || response.data || [];
        }
        
        throw new Error('Failed to fetch applications');
    } catch (error: any) {
        console.error("Error fetching applications:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch applications');
    }
};

// Get application by ID
export const getApplicationById = async (id: string): Promise<any> => {
    try {
        const response = await axios.get(`${API_URL}/applications/${id}`);
        
        if (response.status === 200) {
            return response.data?.application || response.data;
        }
        
        throw new Error('Application not found');
    } catch (error: any) {
        console.error("Error fetching application by ID:", error.response?.data || error.message);
        
        if (error.response?.status === 404) {
            throw new Error('Application not found');
        }
        
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch application');
    }
};

// Get applications by candidate
export const getApplicationsByCandidate = async (candidateId: string): Promise<any[]> => {
    try {
        const response = await axios.get(`${API_URL}/applications/candidate/${candidateId}`);
        
        if (response.status === 200) {
            return response.data?.applications || response.data || [];
        }
        
        throw new Error('Failed to fetch candidate applications');
    } catch (error: any) {
        console.error("Error fetching applications by candidate:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch candidate applications');
    }
};

// Get applications by course
export const getApplicationsByCourse = async (courseId: string): Promise<any[]> => {
    try {
        const response = await axios.get(`${API_URL}/applications/course/${courseId}`);
        
        if (response.status === 200) {
            return response.data?.applications || response.data || [];
        }
        
        throw new Error('Failed to fetch course applications');
    } catch (error: any) {
        console.error("Error fetching applications by course:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch course applications');
    }
};

// Update application status
export const updateApplicationStatus = async (id: string, status: string): Promise<any> => {
    try {
        const response = await axios.patch(`${API_URL}/applications/${id}/status`, { status });
        
        if (response.status === 200) {
            return response.data?.application || response.data;
        }
        
        throw new Error('Failed to update application status');
    } catch (error: any) {
        console.error("Error updating application status:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to update application status');
    }
};

// Update application ranking
export const updateApplicationRanking = async (id: string, ranking: number): Promise<any> => {
    try {
        const response = await axios.patch(`${API_URL}/applications/${id}/ranking`, { ranking });
        
        if (response.status === 200) {
            return response.data?.application || response.data;
        }
        
        throw new Error('Failed to update application ranking');
    } catch (error: any) {
        console.error("Error updating application ranking:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to update application ranking');
    }
};

// Add comment to application
export const addComment = async (id: string, comment: string): Promise<any> => {
    try {
        const response = await axios.patch(`${API_URL}/applications/${id}/comments`, { comment });
        
        if (response.status === 200) {
            return response.data?.application || response.data;
        }
        
        throw new Error('Failed to add comment');
    } catch (error: any) {
        console.error("Error adding comment:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to add comment');
    }
};

// Delete comment from application
export const deleteComment = async (id: string, comment: string): Promise<any> => {
    try {
        const response = await axios.delete(`${API_URL}/applications/${id}/comments`, { 
            data: { comment } 
        });
        
        if (response.status === 200) {
            return response.data?.application || response.data;
        }
        
        throw new Error('Failed to delete comment');
    } catch (error: any) {
        console.error("Error deleting comment:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to delete comment');
    }
};

// Delete application
export const deleteApplication = async (id: string): Promise<void> => {
    try {
        const response = await axios.delete(`${API_URL}/applications/${id}`);
        
        if (response.status !== 200) {
            throw new Error('Failed to delete application');
        }
    } catch (error: any) {
        console.error("Error deleting application:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to delete application');
    }
};

// Get applications by session type
export const getApplicationsBySessionType = async (sessionType: string): Promise<any[]> => {
    try {
        const response = await axios.get(`${API_URL}/applications/session-type/${sessionType}`);
        
        if (response.status === 200) {
            return response.data?.applications || response.data || [];
        }
        
        throw new Error('Failed to fetch applications by session type');
    } catch (error: any) {
        console.error("Error fetching applications by session type:", error.response?.data || error.message);
        throw new Error(error.response?.data?.message || error.message || 'Failed to fetch applications by session type');
    }
};