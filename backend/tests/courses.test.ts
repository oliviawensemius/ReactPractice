// tests/courses.test.ts
import request from 'supertest';
import app from '../src/index';
import { TestDataSource } from './data-source.test';
import { Course } from '../src/entity/Course';
import { User } from '../src/entity/User';
import { Lecturer } from '../src/entity/Lecturer';

/**
 * Test Suite: Course Management Endpoints
 * 
 * Context: Tests course-related functionality essential for TeachTeam application
 * covering course retrieval for candidate applications and lecturer course assignments.
 * This aligns with Assignment 2 PA/CR requirements where candidates apply to courses
 * and lecturers manage applications for their assigned courses.
 * 
 * Business Logic: Courses are central to TeachTeam - candidates apply for tutor/lab
 * assistant positions for specific courses, and lecturers can only see applications
 * for courses they're assigned to (requirement 2.4.5).
 */

describe('Course Management Endpoints', () => {
  let courseRepository: any;
  let userRepository: any;
  let lecturerRepository: any;
  let testLecturer: any;
  let authToken: string;

  beforeEach(async () => {
    // Initialize repositories
    courseRepository = TestDataSource.getRepository(Course);
    userRepository = TestDataSource.getRepository(User);
    lecturerRepository = TestDataSource.getRepository(Lecturer);

    // Create test lecturer for authenticated requests
    const lecturerUser = await userRepository.save({
      name: 'Dr. Alice Johnson',
      email: 'alice.johnson@rmit.edu.au',
      password: 'hashedPassword123',
      role: 'lecturer',
      is_active: true
    });

    testLecturer = await lecturerRepository.save({
      user: lecturerUser,
      department: 'Computer Science',
      courses: []
    });

    // Mock authentication token (adapt to your auth implementation)
    authToken = 'Bearer test-jwt-token';
  });

  /**
   * Test: Retrieve Available Courses for Applications
   * Context: PA requirement - candidates need to see available courses to apply
   * Business Logic: Candidates must be able to view and select courses for tutor applications
   */
  it('should return active courses available for applications', async () => {
    // Setup: Create test courses with different statuses
    await courseRepository.save([
      {
        code: 'COSC2758',
        name: 'Full Stack Development',
        semester: 'Semester 1',
        year: 2025,
        is_active: true
      },
      {
        code: 'COSC1295',
        name: 'Advanced Programming',
        semester: 'Semester 1', 
        year: 2025,
        is_active: true
      },
      {
        code: 'COSC9999',
        name: 'Inactive Course',
        semester: 'Semester 2',
        year: 2024,
        is_active: false // Should not appear in results
      }
    ]);

    const response = await request(app)
      .get('/api/courses/active')
      .expect(200);

    // Verify response structure matches Assignment 2 requirements
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('courses');
    expect(Array.isArray(response.body.courses)).toBe(true);
    
    // Verify only active courses are returned
    expect(response.body.courses).toHaveLength(2);
    
    // Check course data structure matches frontend expectations
    const course = response.body.courses[0];
    expect(course).toHaveProperty('id');
    expect(course).toHaveProperty('code');
    expect(course).toHaveProperty('name');
    expect(course).toHaveProperty('semester');
    expect(course).toHaveProperty('year');
    
    // Verify specific courses are present
    const courseCodes = response.body.courses.map((c: any) => c.code);
    expect(courseCodes).toContain('COSC2758');
    expect(courseCodes).toContain('COSC1295');
    expect(courseCodes).not.toContain('COSC9999'); // Inactive course excluded
  });

  /**
   * Test: Lecturer-Specific Course Access
   * Context: CR requirement 2.4.5 - lecturers can only see their assigned courses
   * Business Logic: Access control ensures lecturers only manage their own course applications
   */
  it('should return only courses assigned to authenticated lecturer', async () => {
    // Setup: Create courses and assign some to the test lecturer
    const course1 = await courseRepository.save({
      code: 'COSC2758',
      name: 'Full Stack Development',
      semester: 'Semester 1',
      year: 2025,
      is_active: true
    });

    const course2 = await courseRepository.save({
      code: 'COSC1295', 
      name: 'Advanced Programming',
      semester: 'Semester 1',
      year: 2025,
      is_active: true
    });

    const course3 = await courseRepository.save({
      code: 'COSC3000',
      name: 'Unassigned Course',
      semester: 'Semester 1',
      year: 2025,
      is_active: true
    });

    // Assign only course1 and course2 to test lecturer
    testLecturer.courses = [course1, course2];
    await lecturerRepository.save(testLecturer);

    const response = await request(app)
      .get('/api/courses/lecturer')
      .set('Authorization', authToken)
      .expect(200);

    // Verify response structure
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('courses');
    
    // Verify only assigned courses are returned (requirement 2.4.5)
    expect(response.body.courses).toHaveLength(2);
    
    const returnedCodes = response.body.courses.map((c: any) => c.code);
    expect(returnedCodes).toContain('COSC2758');
    expect(returnedCodes).toContain('COSC1295');
    expect(returnedCodes).not.toContain('COSC3000'); // Unassigned course excluded
  });

  /**
   * Test: Course Detail Retrieval
   * Context: Frontend needs detailed course information for application forms
   * Business Logic: Candidates need complete course details to make informed applications
   */
  it('should return detailed course information by ID', async () => {
    // Setup: Create a detailed course
    const course = await courseRepository.save({
      code: 'COSC2758',
      name: 'Full Stack Development / Further Web Programming',
      semester: 'Semester 1',
      year: 2025,
      is_active: true,
      description: 'Advanced web development using modern frameworks'
    });

    const response = await request(app)
      .get(`/api/courses/${course.id}`)
      .expect(200);

    // Verify complete course details are returned
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('course');
    
    const courseDetail = response.body.course;
    expect(courseDetail.id).toBe(course.id);
    expect(courseDetail.code).toBe('COSC2758');
    expect(courseDetail.name).toBe('Full Stack Development / Further Web Programming');
    expect(courseDetail.semester).toBe('Semester 1');
    expect(courseDetail.year).toBe(2025);
    expect(courseDetail.is_active).toBe(true);
    
    // Verify data types for frontend compatibility
    expect(typeof courseDetail.id).toBe('string');
    expect(typeof courseDetail.year).toBe('number');
    expect(typeof courseDetail.is_active).toBe('boolean');
  });
});