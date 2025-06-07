// tests/validation.test.ts
import request from 'supertest';
import app from '../src/index';
import { TestDataSource } from './data-source.test';
import { User } from '../src/entity/User';
import { Course } from '../src/entity/Course';

/**
 * Test Suite: Data Validation
 * 
 * Context: Tests comprehensive input validation as required in Assignment 2 PA requirements.
 * All form input validations must be handled on both React frontend AND backend/REST API.
 * This ensures data integrity and security across the TeachTeam application.
 * 
 * Business Logic: Validation prevents corrupt data entry, ensures consistent data formats,
 * and protects against malicious inputs. Critical for maintaining database integrity
 * and preventing application errors in production.
 */

describe('Data Validation', () => {
  let userRepository: any;
  let courseRepository: any;
  let testCourse: any;

  beforeEach(async () => {
    // Initialize repositories
    userRepository = TestDataSource.getRepository(User);
    courseRepository = TestDataSource.getRepository(Course);

    // Create test course for application validation
    testCourse = await courseRepository.save({
      code: 'COSC2758',
      name: 'Full Stack Development',
      semester: 'Semester 1',
      year: 2025,
      is_active: true
    });
  });

  /**
   * Test: User Registration Validation
   * Context: PA requirement - strong password validation, confirm password field
   * Business Logic: Secure user accounts require proper validation at registration
   */
  it('should validate user registration data with comprehensive checks', async () => {
    // Test cases for invalid registration data
    const invalidRegistrations = [
      {
        description: 'missing required fields',
        data: {
          name: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: ''
        },
        expectedErrors: ['name', 'email', 'password', 'role']
      },
      {
        description: 'invalid email format',
        data: {
          name: 'John Doe',
          email: 'invalid-email',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          role: 'candidate'
        },
        expectedErrors: ['email']
      },
      {
        description: 'weak password (no special characters)',
        data: {
          name: 'John Doe',
          email: 'john@student.rmit.edu.au',
          password: 'weakpass123',
          confirmPassword: 'weakpass123',
          role: 'candidate'
        },
        expectedErrors: ['password']
      },
      {
        description: 'weak password (too short)',
        data: {
          name: 'John Doe',
          email: 'john@student.rmit.edu.au',
          password: 'Short1!',
          confirmPassword: 'Short1!',
          role: 'candidate'
        },
        expectedErrors: ['password']
      },
      {
        description: 'password confirmation mismatch',
        data: {
          name: 'John Doe',
          email: 'john@student.rmit.edu.au',
          password: 'SecurePass123!',
          confirmPassword: 'DifferentPass123!',
          role: 'candidate'
        },
        expectedErrors: ['confirmPassword']
      },
      {
        description: 'invalid role',
        data: {
          name: 'John Doe',
          email: 'john@student.rmit.edu.au',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          role: 'invalid_role'
        },
        expectedErrors: ['role']
      }
    ];

    // Test each invalid registration
    for (const testCase of invalidRegistrations) {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testCase.data)
        .expect(400);

      // Verify validation error response structure
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('errors');
      
      // Verify specific validation errors are present
      const errorFields = Object.keys(response.body.errors || {});
      testCase.expectedErrors.forEach(expectedField => {
        expect(errorFields).toContain(expectedField);
      });

      console.log(`✓ Validation test passed: ${testCase.description}`);
    }

    // Verify no invalid users were created in database
    const userCount = await userRepository.count();
    expect(userCount).toBe(0);
  });

  /**
   * Test: Application Data Validation
   * Context: PA requirement - comprehensive validation for tutor applications
   * Business Logic: Applications must have complete, valid data for fair evaluation
   */
  it('should validate application submission with detailed field checks', async () => {
    // Create a test candidate first for authentication context
    const candidateUser = await userRepository.save({
      name: 'Test Candidate',
      email: 'candidate@student.rmit.edu.au',
      password: 'hashedPassword123',
      role: 'candidate',
      is_active: true
    });

    const authToken = 'Bearer candidate-jwt-token';

    // Test cases for invalid application data
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
      },
      {
        description: 'invalid academic credential year',
        data: {
          course_id: testCourse.id,
          session_type: 'tutor',
          skills: ['JavaScript'],
          availability: 'fulltime',
          academic_credentials: [{
            degree: 'Bachelor of Computer Science',
            institution: 'RMIT University',
            year: 1900, // Invalid year - too old
            gpa: 3.5
          }],
          previous_roles: []
        }
      },
      {
        description: 'invalid GPA range',
        data: {
          course_id: testCourse.id,
          session_type: 'tutor',
          skills: ['JavaScript'],
          availability: 'fulltime',
          academic_credentials: [{
            degree: 'Bachelor of Computer Science',
            institution: 'RMIT University',
            year: 2024,
            gpa: 5.0 // Invalid GPA - exceeds 4.0 scale
          }],
          previous_roles: []
        }
      }
    ];

    // Test each invalid application
    for (const testCase of invalidApplications) {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', authToken)
        .send(testCase.data)
        .expect(400);

      // Verify validation error response
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/validation|invalid|required|missing/i);

      console.log(`✓ Application validation test passed: ${testCase.description}`);
    }
  });

  /**
   * Test: Security Validation (SQL Injection & XSS Prevention)
   * Context: Security requirement - protect against malicious inputs
   * Business Logic: Prevent database attacks and script injection
   */
  it('should sanitize inputs and prevent injection attacks', async () => {
    // Test SQL injection attempts
    const sqlInjectionAttempts = [
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'/*",
      "' UNION SELECT * FROM users --"
    ];

    // Test XSS attempts
    const xssAttempts = [
      "<script>alert('xss')</script>",
      "javascript:alert('xss')",
      "<img src=x onerror=alert('xss')>",
      "';alert('xss');//"
    ];

    // Test malicious inputs in registration
    for (const maliciousInput of [...sqlInjectionAttempts, ...xssAttempts]) {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: maliciousInput,
          email: `test${Date.now()}@example.com`,
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          role: 'candidate'
        });

      // Should either reject (400) or sanitize and accept (201)
      expect([201, 400]).toContain(response.status);

      if (response.status === 201) {
        // If accepted, verify input was sanitized
        expect(response.body.user.name).not.toBe(maliciousInput);
        expect(response.body.user.name).not.toContain('<script>');
        expect(response.body.user.name).not.toContain('DROP TABLE');
      }
    }

    console.log('✓ Security validation tests passed: inputs properly sanitized');
  });
});