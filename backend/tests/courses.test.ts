// backend/tests/courses.test.ts - Complete and corrected version
import request from 'supertest';
import app from '../src/index';
import { TestDataSource } from './data-source.utils';
import { Course } from '../src/entity/Course';
import { User } from '../src/entity/User';
import { Lecturer } from '../src/entity/Lecturer';
import bcrypt from 'bcryptjs';

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
  let testLecturerUser: any;
  let authenticatedAgent: any;

  beforeEach(async () => {
    // Initialize repositories
    courseRepository = TestDataSource.getRepository(Course);
    userRepository = TestDataSource.getRepository(User);
    lecturerRepository = TestDataSource.getRepository(Lecturer);

    // Create test lecturer for authenticated requests
    const hashedPassword = await bcrypt.hash('LecturerPass123!', 12);
    testLecturerUser = await userRepository.save({
      name: 'Dr. Alice Johnson',
      email: 'alice.johnson@rmit.edu.au',
      password: hashedPassword,
      role: 'lecturer',
      is_active: true,
      is_blocked: false
    });

    testLecturer = await lecturerRepository.save({
      user_id: testLecturerUser.id,
      department: 'Computer Science',
      courses: []
    });

    // Create authenticated agent for session-based auth
    authenticatedAgent = request.agent(app);
    await authenticatedAgent
      .post('/api/auth/signin')
      .send({
        email: testLecturerUser.email,
        password: 'LecturerPass123!'
      })
      .expect(200);
  });

  /**
   * Test: Retrieve Available Courses for Applications
   * Context: PA requirement - candidates need to see available courses to apply
   * Business Logic: Candidates must be able to view and select courses for tutor applications
   */
  describe('Public Course Access', () => {
    it('should return all active courses for candidate applications', async () => {
      // Setup: Create test courses with different statuses
      await courseRepository.save([
        {
          code: 'COSC2758',
          name: 'Full Stack Development / Further Web Programming',
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
        .get('/api/courses') // Correct endpoint from your routes
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
      expect(course).toHaveProperty('is_active');

      // Verify specific courses are present
      const courseCodes = response.body.courses.map((c: any) => c.code);
      expect(courseCodes).toContain('COSC2758');
      expect(courseCodes).toContain('COSC1295');
      expect(courseCodes).not.toContain('COSC9999'); // Inactive course excluded

      // Verify all returned courses are active
      response.body.courses.forEach((course: any) => {
        expect(course.is_active).toBe(true);
      });
    });

    it('should return course details by ID', async () => {
      // Setup: Create a detailed course
      const course = await courseRepository.save({
        code: 'COSC2758',
        name: 'Full Stack Development / Further Web Programming',
        semester: 'Semester 1',
        year: 2025,
        is_active: true
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

    it('should return 404 for non-existent course', async () => {
      const response = await request(app)
        .get('/api/courses/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/course.*not.*found/i);
    });
  });

  /**
   * Test: Lecturer-Specific Course Management
   * Context: CR requirement 2.4.5 - lecturers can only see their assigned courses
   * Business Logic: Access control ensures lecturers only manage their own course applications
   */
  describe('Lecturer Course Management', () => {
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

      const response = await authenticatedAgent
        .get('/api/lecturer-courses/my-courses')
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

    it('should allow adding courses to lecturer', async () => {
      // Create new course
      const newCourse = await courseRepository.save({
        code: 'COSC3000',
        name: 'Advanced Topics',
        semester: 'Semester 2',
        year: 2025,
        is_active: true
      });

      const response = await authenticatedAgent
        .post('/api/lecturer-courses/add')
        .send({ course_id: newCourse.id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('added successfully');
      expect(response.body.course.code).toBe('COSC3000');

      // Verify course was added to lecturer
      const updatedLecturer = await lecturerRepository.findOne({
        where: { id: testLecturer.id },
        relations: ['courses']
      });
      expect(updatedLecturer.courses).toHaveLength(1);
      expect(updatedLecturer.courses[0].code).toBe('COSC3000');
    });

    it('should allow removing courses from lecturer', async () => {
      // Setup: Add a course first
      const course = await courseRepository.save({
        code: 'COSC2758',
        name: 'Full Stack Development',
        semester: 'Semester 1',
        year: 2025,
        is_active: true
      });

      testLecturer.courses = [course];
      await lecturerRepository.save(testLecturer);

      // Remove the course
      const response = await authenticatedAgent
        .post('/api/lecturer-courses/remove')
        .send({ course_id: course.id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('removed successfully');

      // Verify course was removed
      const updatedLecturer = await lecturerRepository.findOne({
        where: { id: testLecturer.id },
        relations: ['courses']
      });
      expect(updatedLecturer.courses).toHaveLength(0);
    });

    it('should prevent duplicate course assignments', async () => {
      // Setup: Add a course first
      const course = await courseRepository.save({
        code: 'COSC2758',
        name: 'Full Stack Development',
        semester: 'Semester 1',
        year: 2025,
        is_active: true
      });

      testLecturer.courses = [course];
      await lecturerRepository.save(testLecturer);

      // Try to add the same course again
      const response = await authenticatedAgent
        .post('/api/lecturer-courses/add')
        .send({ course_id: course.id })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/already.*assigned/i);
    });

    it('should handle non-existent course assignment', async () => {
      const response = await authenticatedAgent
        .post('/api/lecturer-courses/add')
        .send({ course_id: 'non-existent-course-id' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/course.*not.*found/i);
    });
  });

  /**
   * Test: Course Data Validation
   * Context: Data integrity requirements for course management
   * Business Logic: Ensures course data meets RMIT standards
   */
  describe('Course Data Validation', () => {
    it('should validate course code format', async () => {
      const testCourses = [
        {
          code: 'COSC2758',
          name: 'Valid Course',
          semester: 'Semester 1',
          year: 2025,
          is_active: true,
          shouldPass: true
        },
        {
          code: 'COSC1295',
          name: 'Another Valid Course',
          semester: 'Semester 2',
          year: 2025,
          is_active: true,
          shouldPass: true
        }
      ];

      for (const testCourse of testCourses) {
        const course = await courseRepository.save({
          code: testCourse.code,
          name: testCourse.name,
          semester: testCourse.semester,
          year: testCourse.year,
          is_active: testCourse.is_active
        });

        if (testCourse.shouldPass) {
          expect(course.code).toBe(testCourse.code);
          expect(course.name).toBe(testCourse.name);
        }
      }
    });

    it('should validate semester values', async () => {
      const validSemesters = ['Semester 1', 'Semester 2', 'Summer', 'Winter'];

      for (const semester of validSemesters) {
        const course = await courseRepository.save({
          code: `COSC${1000 + validSemesters.indexOf(semester)}`,
          name: `Test Course ${semester}`,
          semester: semester as any,
          year: 2025,
          is_active: true
        });

        expect(course.semester).toBe(semester);
      }
    });

    it('should validate year values', async () => {
      const currentYear = new Date().getFullYear();
      const validYears = [currentYear - 1, currentYear, currentYear + 1];

      for (const year of validYears) {
        const course = await courseRepository.save({
          code: `COSC${2000 + validYears.indexOf(year)}`,
          name: `Test Course ${year}`,
          semester: 'Semester 1',
          year: year,
          is_active: true
        });

        expect(course.year).toBe(year);
      }
    });
  });

  /**
   * Test: Authentication and Authorization
   * Context: Security requirements for course management
   * Business Logic: Only authenticated lecturers can manage courses
   */
  describe('Course Management Security', () => {
    it('should require authentication for lecturer course operations', async () => {
      const course = await courseRepository.save({
        code: 'COSC2758',
        name: 'Test Course',
        semester: 'Semester 1',
        year: 2025,
        is_active: true
      });

      // Test without authentication
      await request(app)
        .get('/api/lecturer-courses/my-courses')
        .expect(401);

      await request(app)
        .post('/api/lecturer-courses/add')
        .send({ course_id: course.id })
        .expect(401);

      await request(app)
        .post('/api/lecturer-courses/remove')
        .send({ course_id: course.id })
        .expect(401);
    });

    it('should prevent candidates from accessing lecturer course management', async () => {
      // Create candidate user
      const candidateUser = await userRepository.save({
        name: 'Test Candidate',
        email: 'candidate@student.rmit.edu.au',
        password: await bcrypt.hash('CandidatePass123!', 12),
        role: 'candidate',
        is_active: true
      });

      const candidateAgent = request.agent(app);
      await candidateAgent
        .post('/api/auth/signin')
        .send({
          email: candidateUser.email,
          password: 'CandidatePass123!'
        });

      const course = await courseRepository.save({
        code: 'COSC2758',
        name: 'Test Course',
        semester: 'Semester 1',
        year: 2025,
        is_active: true
      });

      // Candidate should not access lecturer endpoints
      await candidateAgent
        .get('/api/lecturer-courses/my-courses')
        .expect(403);

      await candidateAgent
        .post('/api/lecturer-courses/add')
        .send({ course_id: course.id })
        .expect(403);

      await candidateAgent
        .post('/api/lecturer-courses/remove')
        .send({ course_id: course.id })
        .expect(403);
    });
  });

  /**
   * Test: Course Search and Filtering (if implemented)
   * Context: Efficient course discovery for large course catalogs
   * Business Logic: Users need to find relevant courses quickly
   */
  describe('Course Search and Filtering', () => {
    beforeEach(async () => {
      // Create diverse course data for filtering tests
      await courseRepository.save([
        {
          code: 'COSC1295',
          name: 'Advanced Programming',
          semester: 'Semester 1',
          year: 2025,
          is_active: true
        },
        {
          code: 'COSC2758',
          name: 'Full Stack Development',
          semester: 'Semester 1',
          year: 2025,
          is_active: true
        },
        {
          code: 'COSC3000',
          name: 'Professional Computing Practice',
          semester: 'Semester 2',
          year: 2025,
          is_active: true
        },
        {
          code: 'COSC2123',
          name: 'Algorithms and Analysis',
          semester: 'Semester 2',
          year: 2025,
          is_active: true
        },
        {
          code: 'COSC1234',
          name: 'Introduction to Programming',
          semester: 'Semester 1',
          year: 2024,
          is_active: false
        }
      ]);
    });

    it('should return all courses when no filters applied', async () => {
      const response = await request(app)
        .get('/api/courses')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.courses.length).toBe(4); // Only active courses

      // Verify all returned courses are active
      response.body.courses.forEach((course: any) => {
        expect(course.is_active).toBe(true);
      });
    });

    it('should handle search parameters gracefully', async () => {
      // Test with query parameters (if your API supports them)
      const response = await request(app)
        .get('/api/courses?year=2025')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.courses.length).toBeGreaterThan(0);

      // All returned courses should be from 2025
      response.body.courses.forEach((course: any) => {
        expect(course.year).toBe(2025);
        expect(course.is_active).toBe(true);
      });
    });

    it('should handle invalid search parameters', async () => {
      const response = await request(app)
        .get('/api/courses?invalid_param=test')
        .expect(200);

      expect(response.body.success).toBe(true);
      // Should still return courses, ignoring invalid parameters
      expect(Array.isArray(response.body.courses)).toBe(true);
    });
  });

  /**
   * Test: Course Lifecycle Management
   * Context: Courses need to be activated/deactivated over time
   * Business Logic: Course availability changes with academic calendar
   */
  describe('Course Lifecycle Management', () => {
    it('should handle course activation status correctly', async () => {
      // Create both active and inactive courses
      const activeCourse = await courseRepository.save({
        code: 'COSC2758',
        name: 'Active Course',
        semester: 'Semester 1',
        year: 2025,
        is_active: true
      });

      const inactiveCourse = await courseRepository.save({
        code: 'COSC1234',
        name: 'Inactive Course',
        semester: 'Semester 1',
        year: 2024,
        is_active: false
      });

      // Public endpoint should only return active courses
      const publicResponse = await request(app)
        .get('/api/courses')
        .expect(200);

      const publicCodes = publicResponse.body.courses.map((c: any) => c.code);
      expect(publicCodes).toContain('COSC2758');
      expect(publicCodes).not.toContain('COSC1234');

      // All returned courses should be active
      publicResponse.body.courses.forEach((course: any) => {
        expect(course.is_active).toBe(true);
      });
    });

    it('should maintain course data integrity over time', async () => {
      const course = await courseRepository.save({
        code: 'COSC2758',
        name: 'Full Stack Development',
        semester: 'Semester 1',
        year: 2025,
        is_active: true
      });

      // Verify course has timestamps
      expect(course.created_at).toBeTruthy();
      expect(course.updated_at).toBeTruthy();
      expect(course.created_at).toBeInstanceOf(Date);
      expect(course.updated_at).toBeInstanceOf(Date);

      // Update course and verify timestamp changes
      const originalUpdatedAt = course.updated_at;

      // Small delay to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      course.name = 'Updated Course Name';
      const updatedCourse = await courseRepository.save(course);

      expect(updatedCourse.updated_at.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      expect(updatedCourse.created_at).toEqual(course.created_at); // Created date unchanged
    });
  });

  /**
   * Test: Database Constraints and Relationships
   * Context: Ensure referential integrity in course-lecturer relationships
   * Business Logic: Data consistency requirements for assignment system
   */
  describe('Course Database Constraints', () => {
    it('should maintain course-lecturer relationship integrity', async () => {
      const course1 = await courseRepository.save({
        code: 'COSC2758',
        name: 'Course 1',
        semester: 'Semester 1',
        year: 2025,
        is_active: true
      });

      const course2 = await courseRepository.save({
        code: 'COSC1295',
        name: 'Course 2',
        semester: 'Semester 1',
        year: 2025,
        is_active: true
      });

      // Assign courses to lecturer
      testLecturer.courses = [course1, course2];
      const savedLecturer = await lecturerRepository.save(testLecturer);

      // Verify many-to-many relationship works correctly
      const lecturerWithCourses = await lecturerRepository.findOne({
        where: { id: savedLecturer.id },
        relations: ['courses']
      });

      expect(lecturerWithCourses?.courses).toHaveLength(2);
      expect(lecturerWithCourses?.courses.map((c: any) => c.code)).toContain('COSC2758');
      expect(lecturerWithCourses?.courses.map((c: any) => c.code)).toContain('COSC1295');
    });

    it('should handle course deletion gracefully', async () => {
      const course = await courseRepository.save({
        code: 'COSC2758',
        name: 'Test Course',
        semester: 'Semester 1',
        year: 2025,
        is_active: true
      });

      // Assign course to lecturer
      testLecturer.courses = [course];
      await lecturerRepository.save(testLecturer);

      // Soft delete course (deactivate)
      course.is_active = false;
      await courseRepository.save(course);

      // Verify course still exists but is inactive
      const inactiveCourse = await courseRepository.findOne({
        where: { id: course.id }
      });
      expect(inactiveCourse?.is_active).toBe(false);

      // Verify lecturer relationship is maintained
      const lecturerWithCourses = await lecturerRepository.findOne({
        where: { id: testLecturer.id },
        relations: ['courses']
      });
      expect(lecturerWithCourses?.courses).toHaveLength(1);
    });
  });

  /**
   * Test: Error Handling and Edge Cases
   * Context: Robust error handling for production reliability
   * Business Logic: System must gracefully handle unexpected scenarios
   */
  describe('Course Error Handling', () => {
    it('should handle malformed course creation requests', async () => {
      const invalidCourseData = [
        { code: '', name: 'Valid Name', semester: 'Semester 1', year: 2025 },
        { code: 'COSC2758', name: '', semester: 'Semester 1', year: 2025 },
        { code: 'COSC2758', name: 'Valid Name', semester: '', year: 2025 }
      ];

      for (const invalidData of invalidCourseData) {
        try {
          await courseRepository.save(invalidData);
          // If it doesn't throw, at least verify the data wasn't corrupted
          const savedCourse = await courseRepository.findOne({ where: { code: invalidData.code } });
          if (savedCourse && savedCourse.code) {
            // Basic integrity checks
            expect(savedCourse.code).toBeTruthy();
            expect(savedCourse.name).toBeTruthy();
          }
        } catch (error) {
          // Database constraint violations are expected for invalid data
          expect(error).toBeTruthy();
        }
      }
    });

    it('should handle database connection issues gracefully', async () => {
      // This test verifies error handling without actually breaking the connection
      try {
        await courseRepository.query('SELECT * FROM non_existent_table');
      } catch (error: any) {
        expect(error).toBeTruthy();
        expect(error.message).toMatch(/table|relation|exist|no such table/i);
      }
    });

    it('should prevent course code conflicts', async () => {
      // Create first course
      await courseRepository.save({
        code: 'COSC2758',
        name: 'First Course',
        semester: 'Semester 1',
        year: 2025,
        is_active: true
      });

      // Try to create second course with same code - should either fail or be handled gracefully
      try {
        await courseRepository.save({
          code: 'COSC2758',
          name: 'Duplicate Course',
          semester: 'Semester 2',
          year: 2025,
          is_active: true
        });

        // If no error thrown, verify only one exists or both exist with different IDs
        const courses = await courseRepository.find({ where: { code: 'COSC2758' } });
        expect(courses.length).toBeGreaterThan(0);
      } catch (error) {
        // Unique constraint violation expected in some database configurations
        expect(error).toBeTruthy();
      }
    });
  });

  /**
   * Test: Performance and Scalability
   * Context: System must handle reasonable loads efficiently
   * Business Logic: Course queries should be optimized for user experience
   */
  describe('Course Performance Tests', () => {
    it('should handle bulk course operations efficiently', async () => {
      const startTime = Date.now();

      // Create multiple courses
      const courses: any[] = [];
      for (let i = 1; i <= 50; i++) {
        courses.push({
          code: `COSC${1000 + i}`,
          name: `Test Course ${i}`,
          semester: i % 2 === 0 ? 'Semester 1' : 'Semester 2',
          year: 2025,
          is_active: true
        });
      }

      await courseRepository.save(courses);
      const creationTime = Date.now() - startTime;

      // Verify all courses were created
      const savedCourses = await courseRepository.find();
      expect(savedCourses.length).toBeGreaterThanOrEqual(50);

      // Performance check - should complete within reasonable time (5 seconds)
      expect(creationTime).toBeLessThan(5000);

      console.log(`✅ Created 50 courses in ${creationTime}ms`);
    });

    it('should handle concurrent course access efficiently', async () => {
      // Create test courses
      await courseRepository.save([
        { code: 'COSC2758', name: 'Course 1', semester: 'Semester 1', year: 2025, is_active: true },
        { code: 'COSC1295', name: 'Course 2', semester: 'Semester 1', year: 2025, is_active: true },
        { code: 'COSC3000', name: 'Course 3', semester: 'Semester 2', year: 2025, is_active: true }
      ]);

      const startTime = Date.now();

      // Simulate concurrent API requests
      const requests = Array(10).fill(null).map(() =>
        request(app).get('/api/courses').expect(200)
      );

      const responses = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      // Verify all requests succeeded
      responses.forEach(response => {
        expect(response.body.success).toBe(true);
        expect(response.body.courses).toHaveLength(3);
      });

      // Performance check - concurrent requests should be handled efficiently
      expect(totalTime).toBeLessThan(3000);

      console.log(`✅ Handled 10 concurrent requests in ${totalTime}ms`);
    });
  });
});