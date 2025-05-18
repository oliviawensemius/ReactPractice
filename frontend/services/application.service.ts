// Updated frontend/services/application.service.ts
import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
axios.defaults.withCredentials = true;

// Session type service functions
export const getSessionTypes = async () => {
    try {
        const response = await axios.get(`${API_URL}/session-types`);
        return response.data;
    } catch (error) {
        console.error("Error fetching session types:", error);
        throw error;
    }
}

export const getAllApplications = async () => {
    try {
        const response = await axios.get(`${API_URL}/applications`);
        return response.data;
    } catch (error) {
        console.error("Error fetching applications:", error);
        throw error;
    }
}

export const getApplicationById = async (id: string) => {
    try {
        const response = await axios.get(`${API_URL}/applications/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching application by ID:", error);
        throw error;
    }
}

export const getApplicationsByCandidate = async (candidateId: string) => {
    try {
        const response = await axios.get(`${API_URL}/applications/candidate/${candidateId}`);        
        return response.data;
    } catch (error) {
        console.error("Error fetching applications by candidate:", error);
        throw error;
    }
}

export const getApplicationsByCourse = async (courseId: string) => {
    try {
        const response = await axios.get(`${API_URL}/applications/course/${courseId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching applications by course:", error);
        throw error;
    }
}

export const createApplication = async (applicationData: any) => {
    try {
        const response = await axios.post(`${API_URL}/applications`, applicationData);
        return response.data;
    } catch (error) {
        console.error("Error creating application:", error);
        throw error;
    }
}

export const updateApplicationStatus = async (id: string, status: string) => {
    try {
        const response = await axios.patch(`${API_URL}/applications/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error("Error updating application status:", error);
        throw error;
    }
}

export const updateApplicationRanking = async (id: string, ranking: number) => {
    try {
        const response = await axios.patch(`${API_URL}/applications/${id}/ranking`, { ranking });
        return response.data;
    } catch (error) {
        console.error("Error updating application ranking:", error);
        throw error;
    }
}

export const addComment = async (id: string, comment: string) => {
    try {
        const response = await axios.patch(`${API_URL}/applications/${id}/comments`, { comment });
        return response.data;
    } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
    }
}

export const deleteComment = async (id: string, comment: string) => {
    try {
        const response = await axios.delete(`${API_URL}/applications/${id}/comments`, { 
            data: { comment } 
        });
        return response.data;
    } catch (error) {
        console.error("Error deleting comment:", error);
        throw error;
    }
}

export const deleteApplication = async (id: string) => {
    try {
        const response = await axios.delete(`${API_URL}/applications/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting application:", error);
        throw error;
    }
}