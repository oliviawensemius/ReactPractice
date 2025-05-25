// frontend/services/course.service.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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
  // Get all courses
  async getAllCourses(): Promise<Course[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CourseResponse = await response.json();
      
      if (data.success && data.courses) {
        return data.courses;
      } else {
        throw new Error(data.message || 'Failed to fetch courses');
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      // Return fallback data for development
      return this.getFallbackCourses();
    }
  }

  // Get course by ID
  async getCourseById(id: string): Promise<Course | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CourseResponse = await response.json();
      
      if (data.success && data.course) {
        return data.course;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching course:', error);
      return null;
    }
  }

  // Create new course (admin only)
  async createCourse(courseData: {
    code: string;
    name: string;
    semester: string;
    year: number;
  }): Promise<{ success: boolean; message: string; course?: Course }> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(courseData),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error creating course:', error);
      return {
        success: false,
        message: 'Network error. Please try again.'
      };
    }
  }

  // Fallback courses for development (matches your seed data)
  private getFallbackCourses(): Course[] {
    const currentYear = new Date().getFullYear();
    const semester = 'Semester 1';
    
    return [
      { id: '1', code: 'COSC2801', name: 'Programming bootcamp 1', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '2', code: 'COSC2803', name: 'Programming studio 1', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '3', code: 'COSC2802', name: 'Programming bootcamp 2', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '4', code: 'COSC2804', name: 'Programming studio 2', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '5', code: 'COSC1107', name: 'Computing theory', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '6', code: 'COSC1076', name: 'Advanced programming techniques', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '7', code: 'COSC2299', name: 'Software engineering: process and tools', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '8', code: 'COSC2123', name: 'Algorithms and analysis', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '9', code: 'COSC1114', name: 'Operating systems principles', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '10', code: 'COSC1147', name: 'Professional computing practice', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '11', code: 'COSC1127', name: 'Artificial intelligence', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '12', code: 'COSC2626', name: 'Cloud computing', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '13', code: 'COSC2408', name: 'Programming project 1', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '14', code: 'COSC2409', name: 'Programming project 2', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '15', code: 'COSC1204', name: 'Agent-oriented programming and design', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '16', code: 'COSC1111', name: 'Data communication and net-centric computing', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '17', code: 'COSC2406', name: 'Database systems', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '18', code: 'COSC2972', name: 'Deep learning', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '19', code: 'COSC2758', name: 'Full stack development', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '20', code: 'COSC2738', name: 'Practical data science', semester, year: currentYear, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ];
  }
}

export const courseService = new CourseService();