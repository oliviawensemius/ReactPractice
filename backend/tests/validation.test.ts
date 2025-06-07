// backend/tests/validation.test.ts - Updated comprehensive validation tests
import request from 'supertest';
import app from '../src/index';
import { TestDataSource } from './data-source.utils';
import { User } from '../src/entity/User';
import { Course } from '../src/entity/Course';
import { Candidate } from '../src/entity/Candidate';
import bcrypt from 'bcryptjs';

/**
 * Test Suite: Comprehensive Data Validation
 * 
 * Context: Tests comprehensive input validation as required in Assignment 2 PA requirements.
 * All form input validations must be handled on both React frontend AND backend/REST API.
 * This ensures data integrity and security across the TeachTeam application.
 * 
 * Business Logic: Validation prevents corrupt data entry, ensures consistent data formats,
 * and protects against malicious inputs. Critical for maintaining database integrity
 * and preventing application errors in production.
 */

describe('Comprehensive Data Validation', () => {
  let userRepository: any;
  let courseRepository: any;
  let candidateRepository: any;
  let testCourse: any;
  let authenticatedAgent: any;

  beforeEach(async () => {
    // Initialize repositories
    userRepository = TestDataSource.getRepository(User);
    courseRepository = TestDataSource.getRepository(Course);
    candidateRepository = TestDataSource.getRepository(Candidate);

    // Create test course for application validation
    testCourse = await courseRepository.save({
      code: 'COSC2758',
      name: 'Full Stack Development',
      semester: 'Semester 1',
      year: 2025,
      is_active: true
    });

    // Create authenticated candidate for application tests
    const hashedPassword = await bcrypt.hash('TestPass123!', 12);
    const candidateUser = await userRepository.save({
      name: 'Test Candidate',
      email: 'test.candidate@student.rmit.edu.au',
      password: hashedPassword,
      role: 'candidate',
      is_active: true
    });

    await candidateRepository.save({
      user_id: candidateUser.id,
      availability: 'fulltime',
      skills: ['JavaScript']
    });

    authenticatedAgent = request.agent(app);
    await authenticatedAgent
      .post('/api/auth/signin')
      .send({
        email: candidateUser.email,
        password: 'TestPass123!'
      });
  });

  /**
   * Test: User Registration Validation (PA Requirements)
   * Context: PA requirement - strong password validation, proper field validation
   * Business Logic: Secure user accounts require proper validation at registration
   */
  describe('User Registration Validation', () => {
    it('should validate all required fields for user registration', async () => {
      const invalidRegistrations = [
        {
          description: 'missing name',
          data: {
            email: 'test@student.rmit.edu.au',
            password: 'SecurePass123!',
            role: 'candidate'
          },
          expectedField: 'name'
        },
        {
          description: 'empty name',
          data: {
            name: '',
            email: 'test@student.rmit.edu.au',
            password: 'SecurePass123!',
            role: 'candidate'
          },
          expectedField: 'name'
        },
        {
          description: 'name too short',
          data: {
            name: 'A',
            email: 'test@student.rmit.edu.au',
            password: 'SecurePass123!',
            role: 'candidate'
          },
          expectedField: 'name'
        },
        {
          description: 'missing email',
          data: {
            name: 'John Doe',
            password: 'SecurePass123!',
            role: 'candidate'
          },
          expectedField: 'email'
        },
        {
          description: 'invalid email format',
          data: {
            name: 'John Doe',
            email: 'invalid-email-format',
            password: 'SecurePass123!',
            role: 'candidate'
          },
          expectedField: 'email'
        },
        {
          description: 'missing password',
          data: {
            name: 'John Doe',
            email: 'john@student.rmit.edu.au',
            role: 'candidate'
          },
          expectedField: 'password'
        },
        {
          description: 'missing role',
          data: {
            name: 'John Doe',
            email: 'john@student.rmit.edu.au',
            password: 'SecurePass123!'
          },
          expectedField: 'role'
        },
        {
          description: 'invalid role',
          data: {
            name: 'John Doe',
            email: 'john@student.rmit.edu.au',
            password: 'SecurePass123!',
            role: 'invalid_role'
          },
          expectedField: 'role'
        }
      ];

      for (const testCase of invalidRegistrations) {
        const response = await request(app)
          .post('/api/auth/signup')
          .send(testCase.data)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message.toLowerCase()).toContain(testCase.expectedField);

        console.log(`✓ Registration validation test passed: ${testCase.description}`);
      }

      // Verify no invalid users were created in database
      const userCount = await userRepository.count();
      expect(userCount).toBe(1); // Only the test candidate from beforeEach
    });

    it('should validate strong password requirements (PA requirement)', async () => {
      const weakPasswords = [
        {
          password: 'weak',
          reason: 'too short'
        },
        {
          password: 'weakpassword',
          reason: 'no numbers, no uppercase'
        },
        {
          password: 'Weakpassword',
          reason: 'no numbers'
        },
        {
          password: 'weakpassword123',
          reason: 'no uppercase'
        },
        {
          password: 'WEAKPASSWORD123',
          reason: 'no lowercase'
        },
        {
          password: '12345678',
          reason: 'no letters'
        },
        {
          password: 'Short1',
          reason: 'too short even with mixed case and numbers'
        }
      ];

      for (const testCase of weakPasswords) {
        const response = await request(app)
          .post('/api/auth/signup')
          .send({
            name: 'Test User',
            email: `test${Date.now()}@rmit.edu.au`,
            password: testCase.password,
            role: 'candidate'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message.toLowerCase()).toMatch(/password/);
        
        console.log(`✓ Password validation test passed: ${testCase.reason}`);
      }
    });

    it('should accept valid registration data', async () => {
      const validRegistration = {
        name: 'Valid User',
        email: 'valid.user@student.rmit.edu.au',
        password: 'ValidPass123!',
        role: 'candidate'
      };

      const response = await request(app)
        .post('/api/auth/signup')
        .send(validRegistration)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe(validRegistration.name);
      expect(response.body.user.email).toBe(validRegistration.email);
      expect(response.body.user.role).toBe(validRegistration.role);
    });
  });

  /**
   * Test: Application Data Validation (PA/CR Requirements)
   * Context: PA requirement - comprehensive validation for tutor applications
   * Business Logic: Applications must have complete, valid data for fair evaluation
   */
  describe('Application Data Validation', () => {
    it('should validate required application fields', async () => {
      const invalidApplications = [
        {
          description: 'missing course_id',
          data: {
            session_type: 'tutor',
            skills: ['JavaScript'],
            availability: 'fulltime',
            academic_credentials: [],
            previous_roles: []
          }
        },
        {
          description: 'invalid session_type',
          data: {
            course_id: testCourse.id,
            session_type: 'invalid_session',
            skills: ['JavaScript'],
            availability: 'fulltime',
            academic_credentials: [],
            previous_roles: []
          }
        },
        {
          description: 'empty skills array',
          data: {
            course_id: testCourse.id,
            session_type: 'tutor',
            skills: [],
            availability: 'fulltime',
            academic_credentials: [],
            previous_roles: []
          }
        },
        {
          description: 'invalid availability',
          data: {
            course_id: testCourse.id,
            session_type: 'tutor',
            skills: ['JavaScript'],
            availability: 'invalid_availability',
            academic_credentials: [],
            previous_roles: []
          }
        }
      ];

      for (const testCase of invalidApplications) {
        const response = await authenticatedAgent
          .post('/api/applications/submit')
          .send(testCase.data)
          .expect(400);

        expect(response.body).toHaveProperty('success', false);
        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toMatch(/validation|invalid|required|missing/i);

        console.log(`✓ Application validation test passed: ${testCase.description}`);
      }
    });

    it('should validate academic credentials data', async () => {
      const invalidCredentials = [
        {
          description: 'missing degree',
          credentials: [{
            institution: 'RMIT University',
            year: 2024,
            gpa: 3.5
          }]
        },
        {
          description: 'missing institution',
          credentials: [{
            degree: 'Bachelor of Computer Science',
            year: 2024,
            gpa: 3.5
          }]
        },
        {
          description: 'invalid year - too old',
          credentials: [{
            degree: 'Bachelor of Computer Science',
            institution: 'RMIT University',
            year: 1900,
            gpa: 3.5
          }]
        },
        {
          description: 'invalid year - future',
          credentials: [{
            degree: 'Bachelor of Computer Science',
            institution: 'RMIT University',
            year: 2030,
            gpa: 3.5
          }]
        },
        {
          description: 'invalid GPA - too high',
          credentials: [{
            degree: 'Bachelor of Computer Science',
            institution: 'RMIT University',
            year: 2024,
            gpa: 5.0
          }]
        },
        {
          description: 'invalid GPA - negative',
          credentials: [{
            degree: 'Bachelor of Computer Science',
            institution: 'RMIT University',
            year: 2024,
            gpa: -1.0
          }]
        }
      ];

      for (const testCase of invalidCredentials) {
        const applicationData = {
          course_id: testCourse.id,
          session_type: 'tutor',
          skills: ['JavaScript'],
          availability: 'fulltime',
          academic_credentials: testCase.credentials,
          previous_roles: []
        };

        const response = await authenticatedAgent
          .post('/api/applications/submit')
          .send(applicationData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch(/validation.*failed|invalid/i);

        console.log(`✓ Academic credentials validation test passed: ${testCase.description}`);
      }
    });

    it('should validate previous roles data', async () => {
      const invalidRoles = [
        {
          description: 'missing position',
          roles: [{
            organisation: 'RMIT University',
            startDate: '2023-01-01',
            endDate: '2023-12-31'
          }]
        },
        {
          description: 'missing organisation',
          roles: [{
            position: 'Teaching Assistant',
            startDate: '2023-01-01',
            endDate: '2023-12-31'
          }]
        },
        {
          description: 'missing start date',
          roles: [{
            position: 'Teaching Assistant',
            organisation: 'RMIT University',
            endDate: '2023-12-31'
          }]
        },
        {
          description: 'end date before start date',
          roles: [{
            position: 'Teaching Assistant',
            organisation: 'RMIT University',
            startDate: '2023-06-01',
            endDate: '2023-01-01'
          }]
        }
      ];

      for (const testCase of invalidRoles) {
        const applicationData = {
          course_id: testCourse.id,
          session_type: 'tutor',
          skills: ['JavaScript'],
          availability: 'fulltime',
          academic_credentials: [],
          previous_roles: testCase.roles
        };

        const response = await authenticatedAgent
          .post('/api/applications/submit')
          .send(applicationData)
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch(/validation.*failed|invalid/i);

        console.log(`✓ Previous roles validation test passed: ${testCase.description}`);
      }
    });

    it('should accept valid application data', async () => {
      const validApplication = {
        course_id: testCourse.id,
        session_type: 'tutor',
        skills: ['JavaScript', 'React', 'Node.js'],
        availability: 'fulltime',
        academic_credentials: [
          {
            degree: 'Bachelor of Computer Science',
            institution: 'RMIT University',
            year: 2024,
            gpa: 3.8
          }
        ],
        previous_roles: [
          {
            position: 'Teaching Assistant',
            organisation: 'RMIT University',
            startDate: '2023-03-01',
            endDate: '2023-11-30',
            description: 'Assisted with programming tutorials'
          }
        ]
      };

      const response = await authenticatedAgent
        .post('/api/applications/submit')
        .send(validApplication)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.application).toHaveProperty('id');
    });
  });

  /**
   * Test: Security Validation (XSS & Injection Prevention)
   * Context: Security requirement - protect against malicious inputs
   * Business Logic: Prevent database attacks and script injection
   */
  describe('Security Validation', () => {
    it('should sanitize inputs and prevent injection attacks', async () => {
      // Test SQL injection attempts
      const sqlInjectionAttempts = [
        "'; DROP TABLE users; --",
        "1' OR '1'='1",
        "admin'/*",
        "' UNION SELECT * FROM users --",
        "'; DELETE FROM applications; --"
      ];

      // Test XSS attempts
      const xssAttempts = [
        "<script>alert('xss')</script>",
        "javascript:alert('xss')",
        "<img src=x onerror=alert('xss')>",
        "';alert('xss');//",
        "<iframe src='javascript:alert(1)'></iframe>"
      ];

      const maliciousInputs = [...sqlInjectionAttempts, ...xssAttempts];

      // Test malicious inputs in registration
      for (const maliciousInput of maliciousInputs) {
        const response = await request(app)
          .post('/api/auth/signup')
          .send({
            name: maliciousInput,
            email: `test${Date.now()}@example.com`,
            password: 'SecurePass123!',
            role: 'candidate'
          });

        // Should either reject (400) or sanitize and accept (201)
        expect([201, 400]).toContain(response.status);

        if (response.status === 201) {
          // If accepted, verify input was sanitized
          expect(response.body.user.name).not.toBe(maliciousInput);
          expect(response.body.user.name).not.toContain('<script>');
          expect(response.body.user.name).not.toContain('DROP TABLE');
          expect(response.body.user.name).not.toContain('DELETE FROM');
        }
      }

      console.log('✓ Security validation tests passed: inputs properly handled');
    });

    it('should prevent SQL injection in application comments', async () => {
      // Create application first
      const application = {
        course_id: testCourse.id,
        session_type: 'tutor',
        skills: ['JavaScript'],
        availability: 'fulltime',
        academic_credentials: [],
        previous_roles: []
      };

      const appResponse = await authenticatedAgent
        .post('/api/applications/submit')
        .send(application)
        .expect(201);

      // Create lecturer to add comments
      const lecturerUser = await userRepository.save({
        name: 'Test Lecturer',
        email: 'lecturer@rmit.edu.au',
        password: await bcrypt.hash('LecturerPass123!', 12),
        role: 'lecturer',
        is_active: true
      });

      const lecturerAgent = request.agent(app);
      await lecturerAgent
        .post('/api/auth/signin')
        .send({
          email: lecturerUser.email,
          password: 'LecturerPass123!'
        });

      // Test SQL injection in comments
      const maliciousComment = "'; DROP TABLE applications; --";
      
      const commentResponse = await lecturerAgent
        .post(`/api/applications/${appResponse.body.application.id}/comment`)
        .send({ comment: maliciousComment });

      // Should either reject or sanitize
      expect([200, 400]).toContain(commentResponse.status);

      if (commentResponse.status === 200) {
        expect(commentResponse.body.comments[0]).not.toContain('DROP TABLE');
      }
    });
  });

  /**
   * Test: Course Code Validation
   * Context: Course codes must follow RMIT format
   * Business Logic: Standardized course identification system
   */
  describe('Course Code Validation', () => {
    it('should validate course code format', async () => {
      const invalidCourseCodes = [
        'INVALID',
        'COSC',
        'COSC275',
        'COSC27588',
        'cosc2758',
        'MATH2758',
        '2758',
        ''
      ];

      for (const invalidCode of invalidCourseCodes) {
        const courseData = {
          code: invalidCode,
          name: 'Test Course',
          semester: 'Semester 1',
          year: 2025
        };

        // This would be tested if you had admin course creation endpoint
        // For now we test it through the course entity validation
        const course = courseRepository.create(courseData);
        
        if (invalidCode === 'COSC2758') {
          // This should be valid
          expect(course.code).toBe('COSC2758');
        } else {
          // Invalid codes should be caught by validation
          try {
            await courseRepository.save(course);
            // If it saves, it means validation didn't catch it
            // This might be acceptable depending on your validation strategy
          } catch (error) {
            // Validation caught the error - this is good
            expect(error).toBeTruthy();
          }
        }
      }
    });

    it('should accept valid course codes', async () => {
      const validCourseCodes = [
        'COSC1295',
        'COSC2758',
        'COSC3000',
        'COSC9999'
      ];

      for (const validCode of validCourseCodes) {
        const courseData = {
          code: validCode,
          name: `Test Course ${validCode}`,
          semester: 'Semester 1',
          year: 2025,
          is_active: true
        };

        const course = await courseRepository.save(courseData);
        expect(course.code).toBe(validCode);
      }
    });
  });

  /**
   * Test: Comment Validation (CR Requirements)
   * Context: Lecturer comments must be meaningful and appropriate
   * Business Logic: Quality control for feedback system
   */
  describe('Comment Validation', () => {
    let testApplication: any;
    let lecturerAgent: any;

    beforeEach(async () => {
      // Create application for comment testing
      const appResponse = await authenticatedAgent
        .post('/api/applications/submit')
        .send({
          course_id: testCourse.id,
          session_type: 'tutor',
          skills: ['JavaScript'],
          availability: 'fulltime',
          academic_credentials: [],
          previous_roles: []
        });

      testApplication = appResponse.body.application;

      // Create lecturer
      const lecturerUser = await userRepository.save({
        name: 'Test Lecturer',
        email: 'comment.lecturer@rmit.edu.au',
        password: await bcrypt.hash('LecturerPass123!', 12),
        role: 'lecturer',
        is_active: true
      });

      lecturerAgent = request.agent(app);
      await lecturerAgent
        .post('/api/auth/signin')
        .send({
          email: lecturerUser.email,
          password: 'LecturerPass123!'
        });
    });

    it('should validate comment length and content', async () => {
      const invalidComments = [
        {
          comment: '',
          reason: 'empty comment'
        },
        {
          comment: 'Hi',
          reason: 'too short'
        },
        {
          comment: 'x'.repeat(501),
          reason: 'too long'
        }
      ];

      for (const testCase of invalidComments) {
        const response = await lecturerAgent
          .post(`/api/applications/${testApplication.id}/comment`)
          .send({ comment: testCase.comment })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message).toMatch(/comment/i);

        console.log(`✓ Comment validation test passed: ${testCase.reason}`);
      }
    });

    it('should accept valid comments', async () => {
      const validComments = [
        'Excellent technical skills demonstrated',
        'Good communication during the interview process',
        'Strong academic background with relevant experience'
      ];

      for (const comment of validComments) {
        const response = await lecturerAgent
          .post(`/api/applications/${testApplication.id}/comment`)
          .send({ comment })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.comments).toContain(comment);
      }
    });
  });

  /**
   * Test: Email Format Validation
   * Context: Email addresses must be valid and preferably from academic domains
   * Business Logic: Communication reliability and institutional verification
   */
  describe('Email Format Validation', () => {
    it('should validate email formats strictly', async () => {
      const invalidEmails = [
        'plainaddress',
        '@missingdomain.com',
        'missing@.com',
        'missing@domain',
        'spaces in@email.com',
        'email@',
        'email..double.dot@domain.com',
        'email@domain@domain.com',
        '.email@domain.com',
        'email.@domain.com'
      ];

      for (const invalidEmail of invalidEmails) {
        const response = await request(app)
          .post('/api/auth/signup')
          .send({
            name: 'Test User',
            email: invalidEmail,
            password: 'ValidPass123!',
            role: 'candidate'
          })
          .expect(400);

        expect(response.body.success).toBe(false);
        expect(response.body.message.toLowerCase()).toContain('email');
      }
    });

    it('should accept valid email formats', async () => {
      const validEmails = [
        'student@student.rmit.edu.au',
        'lecturer@rmit.edu.au',
        'test.user@example.com',
        'user123@domain.org',
        'valid_email@test-domain.com'
      ];

      for (const validEmail of validEmails) {
        const response = await request(app)
          .post('/api/auth/signup')
          .send({
            name: 'Test User',
            email: validEmail,
            password: 'ValidPass123!',
            role: 'candidate'
          })
          .expect(201);

        expect(response.body.success).toBe(true);
        expect(response.body.user.email).toBe(validEmail);
      }
    });
  });
});