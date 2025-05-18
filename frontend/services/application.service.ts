import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
axios.defaults.withCredentials = true;

export const getAllApplications = async () => {
    try {
        const response = await axios.get(`${API_URL}/application`);
        return response.data;
    } catch (error) {
        console.error("Error fetching applications:", error);
        throw error;
    }
}

export const getApplicationById = async (id: string) => {
    try {
        const response = await axios.get(`${API_URL}/application/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching application by ID:", error);
        throw error;
    }
}

export const getApplicationsByCandidate = async (candidateId: string) => {
    try {
        const response = await axios.get(`${API_URL}/application/candidate/${candidateId}`);        
        return response.data;
    } catch (error) {
        console.error("Error fetching applications by candidate:", error);
        throw error;
    }
}

export const getApplicationsByCourse = async (courseId: string) => {
    try {
        const response = await axios.get(`${API_URL}/application/course/${courseId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching applications by course:", error);
        throw error;
    }
}

export const createApplication = async (applicationData: any) => {
    try {
        const response = await axios.post(`${API_URL}/application`, applicationData);
        return response.data;
    } catch (error) {
        console.error("Error creating application:", error);
        throw error;
    }
}

export const updateApplicationStatus = async (id: string, status: string) => {
    try {
        const response = await axios.patch(`${API_URL}/application/${id}/status`, { status });
        return response.data;
    } catch (error) {
        console.error("Error updating application status:", error);
        throw error;
    }
}


export const addComment = async (id: string, comment: string) => {
    try {
        const response = await axios.patch(`${API_URL}/application/${id}/comments`, { comment });
        return response.data;
    } catch (error) {
        console.error("Error adding comment:", error);
        throw error;
    }
}

export const deleteComment = async (id: string, commentId: string) => {
    try {
        const response = await axios.delete(`${API_URL}/application/${id}/comments`, { data: { commentId } });
        return response.data;
    } catch (error) {
        console.error("Error deleting comment:", error);
        throw error;
    }
}

export const deleteApplication = async (id: string) => {
    try {
        const response = await axios.delete(`${API_URL}/application/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting application:", error);
        throw error;
    }
}

