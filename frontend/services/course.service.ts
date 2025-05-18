import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
axios.defaults.withCredentials = true;

export const courseService = {
    // Get all courses
    getAllCourses: async () => {
        try {
            const response = await axios.get(`${API_URL}/courses`);
            return response.data;
        } catch (error) {
            console.error("Error fetching courses:", error);
            throw error;
        }
    },

    // Get a single course by ID
    getCourseById: async (id: string) => {
        try {
            const response = await axios.get(`${API_URL}/courses/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching course:", error);
            throw error;
        }
    },

    // Get courses for a lecturer
    getCoursesForLecturer: async (lecturerId: string) => {
        try {
            const response = await axios.get(`${API_URL}/courses/lecturer/${lecturerId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching lecturer courses:", error);
            throw error;
        }
    },

    // Create a new course
    createCourse: async (courseData: any) => {
        try {
            const response = await axios.post(`${API_URL}/courses`, courseData);
            return response.data;
        } catch (error) {
            console.error("Error creating course:", error);
            throw error;
        }
    },

    // Update a course
    updateCourse: async (id: string, courseData: any) => {
        try {
            const response = await axios.put(`${API_URL}/courses/${id}`, courseData);
            return response.data;
        } catch (error) {
            console.error("Error updating course:", error);
            throw error;
        }
    },

    // Delete a course
    deleteCourse: async (id: string) => {
        try {
            const response = await axios.delete(`${API_URL}/courses/${id}`);
            return response.data;
        } catch (error) {
            console.error("Error deleting course:", error);
            throw error;
        }
    }
};