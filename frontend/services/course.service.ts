// frontend/services/course.service.ts
import api from '@/services/api';

interface Course {
  id: string;
  code: string;
  name: string;
  semester: string;
  year: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CourseResponse {
  success: boolean;
  message?: string;
  courses?: Course[];
  course?: Course;
}

class CourseService {
  async getAllCourses(): Promise<Course[]> {
    try {
      const response = await api.get('/courses');
      const data = response.data as CourseResponse;

      if (data.success && data.courses) {
        return data.courses;
      } else {
        throw new Error(data.message || 'Failed to fetch courses');
      }
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch courses');
    }
  }

  async getCourseById(id: string): Promise<Course | null> {
    try {
      const response = await api.get(`/courses/${id}`);
      const data = response.data as CourseResponse;

      if (data.success && data.course) {
        return data.course;
      }

      return null;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Error fetching course:', error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch course');
    }
  }

  async createCourse(courseData: {
    code: string;
    name: string;
    semester: string;
    year: number;
  }): Promise<{ success: boolean; message: string; course?: Course }> {
    try {
      const response = await api.post('/courses', courseData);
      return response.data as { success: boolean; message: string; course?: Course };
    } catch (error: any) {
      console.error('Error creating course:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Network error. Please try again.'
      };
    }
  }

  async updateCourse(id: string, courseData: Partial<Course>): Promise<{ success: boolean; message: string; course?: Course }> {
    try {
      const response = await api.put(`/courses/${id}`, courseData);
      return response.data as { success: boolean; message: string; course?: Course };
    } catch (error: any) {
      console.error('Error updating course:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Network error. Please try again.'
      };
    }
  }

  async deleteCourse(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/courses/${id}`);
      return response.data as { success: boolean; message: string };
    } catch (error: any) {
      console.error('Error deleting course:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Network error. Please try again.'
      };
    }
  }
}

export const courseService = new CourseService();