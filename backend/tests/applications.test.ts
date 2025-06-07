// backend/tests/applications.test.ts - Updated to match actual implementation
import request from 'supertest';
import app from '../src/index';
import { TestDataSource } from './data-source.test';
import { CandidateApplication } from '../src/entity/CandidateApplication';
import { User } from '../src/entity/User';
import { Candidate } from '../src/entity/Candidate';
import { Course } from '../src/entity/Course';
import { AcademicCredential } from '../src/entity/AcademicCredential';
import { PreviousRole } from '../src/entity/PreviousRole';
import bcrypt from 'bcryptjs';

/**
 * Test Suite: Application Submission Endpoints
 * 
 * Context: Tests the core functionality of TeachTeam - candidates applying for
 * tutor and lab assistant positions. This covers PA requirement (c) where candidates
 * submit applications, and the business rule that candidates cannot apply for the
 * same role twice (PA requirement validation).
 * 
 * Business Logic: Applications are the heart of TeachTeam system. Candidates apply
 * for specific courses with either 'tutor' or 'lab_assistant' roles. The system must
 * prevent duplicate applications and properly validate all required fields.
 */

describe('Application Submission Endpoints', () => {
  let applicationRepository: any;
  let userRepository: any;
  let candidateRepository: any;
  let courseRepository: any;
  let credentialRepository: any;
  let roleRepository: any;
  let testCandidate: any;
  let testUser: any;
  let testCourse: any;
  let authenticatedAgent: any;

  beforeEach(async () => {
    // Initialize repositories
    applicationRepository = TestDataSource.getRepository(CandidateApplication);
    userRepository = TestDataSource.getRepository(User);
    candidateRepository = TestDataSource.getRepository(Candidate);
    courseRepository = TestDataSource.getRepository(Course);
    credentialRepository = TestDataSource.getRepository(AcademicCredential);
    roleRepository = TestDataSource.getRepository(PreviousRole);

    // Create test user and candidate with authentication
    const hashedPassword = await bcrypt.hash('StudentPass123!', 12);
    testUser = await userRepository.save({
      name: 'John Student',
      email: 'john.student@student.rmit.edu.au',
      password: hashedPassword,
      role: 'candidate',
      is_active: true,
      is_blocked: false
    });

    testCandidate = await candidateRepository.save({
      user_id: testUser.id,
      availability: 'fulltime',
      skills: ['JavaScript', 'React', 'TypeScript']
    });

    // Create test course
    testCourse = await courseRepository.save({
      code: 'COSC2758',
      name: 'Full Stack Development',
      semester: 'Semester 1',
      year: 2025,
      is_active: true
    });

    // Create authenticated agent for session-based auth
    authenticatedAgent = request.agent(app);
    await authenticatedAgent
      .post('/api/auth/signin')
      .send({
        email: testUser.email,
        password: 'StudentPass123!'
      })
      .expect(200);
  });

  /**
   * Test: Successful Application Submission with Complete Data
   * Context: PA requirement (c) - candidates must be able to apply for courses
   * Business Logic: Core functionality allowing candidates to submit applications
   * with all required details (skills, availability, credentials, previous roles)
   */
  it('should successfully submit a complete tutor application with validation', async () => {
    const applicationData = {
      course_id: testCourse.id,
      session_type: 'tutor',
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'Express'],
      availability: 'fulltime',
      academic_credentials: [
        {
          degree: 'Bachelor of Computer Science',
          institution: 'RMIT University',
          year: 2024,
          gpa: 3.8
        },
        {
          degree: 'Diploma of IT',
          institution: 'TAFE Victoria',
          year: 2022,
          gpa: 3.5
        }
      ],
      previous_roles: [
        {
          position: 'Teaching Assistant',
          organisation: 'RMIT University',
          startDate: '2023-03-01',
          endDate: '2023-11-30',
          description: 'Assisted in COSC1295 Advanced Programming tutorials'
        },
        {
          position: 'Peer Tutor',
          organisation: 'RMIT Student Support',
          startDate: '2023-01-15',
          endDate: '2023-06-30',
          description: 'Provided one-on-one tutoring for first-year programming students'
        }
      ]
    };

    const response = await authenticatedAgent
      .post('/api/applications/submit') // Correct endpoint from your routes
      .send(applicationData)
      .expect(201);

    // Verify response structure matches Assignment 2 requirements
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'Application submitted successfully');
    expect(response.body).toHaveProperty('application');
    expect(response.body.application).toHaveProperty('id');
    expect(response.body.application.course_id).toBe(testCourse.id);
    expect(response.body.application.session_type).toBe('tutor');
    expect(response.body.application.status).toBe('Pending');

    // Verify application was saved to database with correct relationships
    const savedApplication = await applicationRepository.findOne({
      where: { id: response.body.application.id },
      relations: ['candidate', 'course']
    });

    expect(savedApplication).toBeTruthy();
    expect(savedApplication.session_type).toBe('tutor');
    expect(savedApplication.status).toBe('Pending');
    expect(savedApplication.candidate_id).toBe(testCandidate.id);
    expect(savedApplication.course_id).toBe(testCourse.id);
    expect(savedApplication.availability).toBe('fulltime');
    
    // Verify skills are properly stored as JSON array
    expect(savedApplication.skills).toEqual(applicationData.skills);
    expect(savedApplication.skills).toHaveLength(5);

    // Verify academic credentials were saved separately
    const savedCredentials = await credentialRepository.find({
      where: { candidate_id: testCandidate.id }
    });
    expect(savedCredentials).toHaveLength(2);
    expect(savedCredentials[0].degree).toBe('Bachelor of Computer Science');
    expect(savedCredentials[0].institution).toBe('RMIT University');
    expect(savedCredentials[0].year).toBe(2024);
    expect(savedCredentials[0].gpa).toBe(3.8);

    // Verify previous roles were saved separately
    const savedRoles = await roleRepository.find({
      where: { candidate_id: testCandidate.id }
    });
    expect(savedRoles).toHaveLength(2);
    expect(savedRoles[0].position).toBe('Teaching Assistant');
    expect(savedRoles[0].organisation).toBe('RMIT University');
    expect(savedRoles[0].description).toContain('COSC1295');
  });

  /**
   * Test: Lab Assistant Application
   * Context: PA requirement - system must support both tutor and lab assistant roles
   * Business Logic: Different roles have same application process but different responsibilities
   */
  it('should successfully submit lab assistant application', async () => {
    const applicationData = {
      course_id: testCourse.id,
      session_type: 'lab_assistant',
      skills: ['Python', 'Java', 'Linux', 'Git'],
      availability: 'parttime',
      academic_credentials: [],
      previous_roles: []
    };

    const response = await authenticatedAgent
      .post('/api/applications/submit')
      .send(applicationData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.application.session_type).toBe('lab_assistant');

    // Verify in database
    const savedApplication = await applicationRepository.findOne({
      where: { id: response.body.application.id }
    });
    expect(savedApplication.session_type).toBe('lab_assistant');
    expect(savedApplication.availability).toBe('parttime');
  });

  /**
   * Test: Prevent Duplicate Applications (Critical PA Requirement)
   * Context: PA requirement - "A candidate SHOULD NOT BE ABLE TO APPLY FOR A SAME ROLE TWICE"
   * Business Logic: System integrity - prevents gaming the system with multiple applications
   */
  it('should prevent duplicate applications for the same course and session type', async () => {
    // First application - should succeed
    const applicationData = {
      course_id: testCourse.id,
      session_type: 'tutor',
      skills: ['JavaScript', 'React'],
      availability: 'parttime',
      academic_credentials: [],
      previous_roles: []
    };

    const firstResponse = await authenticatedAgent
      .post('/api/applications/submit')
      .send(applicationData)
      .expect(201);

    expect(firstResponse.body.success).toBe(true);

    // Second identical application - should fail with 409 Conflict
    const duplicateResponse = await authenticatedAgent
      .post('/api/applications/submit')
      .send(applicationData)
      .expect(409);

    // Verify proper error response
    expect(duplicateResponse.body).toHaveProperty('success', false);
    expect(duplicateResponse.body).toHaveProperty('message');
    expect(duplicateResponse.body.message).toMatch(/already applied|duplicate|exists/i);

    // Verify only one application exists in database
    const applicationCount = await applicationRepository.count({
      where: {
        candidate_id: testCandidate.id,
        course_id: testCourse.id,
        session_type: 'tutor'
      }
    });
    expect(applicationCount).toBe(1);
  });

  /**
   * Test: Allow Different Roles for Same Course
   * Context: PA requirement - candidates can apply for both tutor AND lab assistant for same course
   * Business Logic: Same candidate can have different roles in same course
   */
  it('should allow candidate to apply for different roles in same course', async () => {
    // Apply as tutor
    const tutorApplication = {
      course_id: testCourse.id,
      session_type: 'tutor',
      skills: ['JavaScript', 'React', 'Teaching'],
      availability: 'fulltime',
      academic_credentials: [],
      previous_roles: []
    };

    await authenticatedAgent
      .post('/api/applications/submit')
      .send(tutorApplication)
      .expect(201);

    // Apply as lab assistant for same course - should succeed
    const labAssistantApplication = {
      course_id: testCourse.id,
      session_type: 'lab_assistant',
      skills: ['JavaScript', 'React', 'Lab Management'],
      availability: 'parttime',
      academic_credentials: [],
      previous_roles: []
    };

    const response = await authenticatedAgent
      .post('/api/applications/submit')
      .send(labAssistantApplication)
      .expect(201);

    expect(response.body.success).toBe(true);

    // Verify both applications exist
    const applicationCount = await applicationRepository.count({
      where: {
        candidate_id: testCandidate.id,
        course_id: testCourse.id
      }
    });
    expect(applicationCount).toBe(2);
  });

  /**
   * Test: Application Input Validation (PA/CR Requirements)
   * Context: PA requirement - frontend AND backend validation required
   * Business Logic: Data integrity - all applications must have complete, valid data
   */
  it('should validate all required fields and reject invalid applications', async () => {
    const invalidApplications = [
      {
        description: 'missing course_id',
        data: {
          session_type: 'tutor',
          skills: ['JavaScript'],
          availability: 'fulltime',
          academic_credentials: [],
          previous_roles: []
        },
        expectedError: /course.*required|course.*not found/i
      },
      {
        description: 'missing session_type',
        data: {
          course_id: testCourse.id,
          skills: ['JavaScript'],
          availability: 'fulltime',
          academic_credentials: [],
          previous_roles: []
        },
        expectedError: /session.*type.*required/i
      },
      {
        description: 'invalid session_type',
        data: {
          course_id: testCourse.id,
          session_type: 'invalid_type',
          skills: ['JavaScript'],
          availability: 'fulltime',
          academic_credentials: [],
          previous_roles: []
        },
        expectedError: /invalid.*session.*type|valid.*session.*type/i
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
        },
        expectedError: /skill.*required|least.*one.*skill/i
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
        },
        expectedError: /availability.*fulltime.*parttime/i
      }
    ];

    // Test each invalid application
    for (const testCase of invalidApplications) {
      const response = await authenticatedAgent
        .post('/api/applications/submit')
        .send(testCase.data)
        .expect(400);

      // Verify validation error response
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(testCase.expectedError);

      console.log(`✅ Validation test passed: ${testCase.description}`);
    }

    // Verify no invalid applications were saved
    const applicationCount = await applicationRepository.count({
      where: { candidate_id: testCandidate.id }
    });
    expect(applicationCount).toBe(0);
  });

  /**
   * Test: Academic Credentials Validation
   * Context: PA requirement - comprehensive validation for academic data
   * Business Logic: Academic credentials must be valid and realistic
   */
  it('should validate academic credentials properly', async () => {
    const invalidCredentials = [
      {
        description: 'invalid year - too old',
        data: {
          course_id: testCourse.id,
          session_type: 'tutor',
          skills: ['JavaScript'],
          availability: 'fulltime',
          academic_credentials: [{
            degree: 'Bachelor of CS',
            institution: 'RMIT',
            year: 1900, // Too old
            gpa: 3.5
          }],
          previous_roles: []
        }
      },
      {
        description: 'invalid year - future',
        data: {
          course_id: testCourse.id,
          session_type: 'tutor',
          skills: ['JavaScript'],
          availability: 'fulltime',
          academic_credentials: [{
            degree: 'Bachelor of CS',
            institution: 'RMIT',
            year: 2030, // Future year
            gpa: 3.5
          }],
          previous_roles: []
        }
      },
      {
        description: 'invalid GPA - too high',
        data: {
          course_id: testCourse.id,
          session_type: 'tutor',
          skills: ['JavaScript'],
          availability: 'fulltime',
          academic_credentials: [{
            degree: 'Bachelor of CS',
            institution: 'RMIT',
            year: 2024,
            gpa: 5.0 // Too high
          }],
          previous_roles: []
        }
      }
    ];

    for (const testCase of invalidCredentials) {
      const response = await authenticatedAgent
        .post('/api/applications/submit')
        .send(testCase.data)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/validation.*failed|invalid/i);
    }
  });

  /**
   * Test: Get Candidate Applications
   * Context: PA requirement - candidates must be able to view their application status
   * Business Logic: Transparency - candidates need to track their applications
   */
  it('should return candidate applications with status and details', async () => {
    // Create an application first
    const applicationData = {
      course_id: testCourse.id,
      session_type: 'tutor',
      skills: ['JavaScript', 'React'],
      availability: 'fulltime',
      academic_credentials: [],
      previous_roles: []
    };

    const submitResponse = await authenticatedAgent
      .post('/api/applications/submit')
      .send(applicationData)
      .expect(201);

    // Get applications
    const getResponse = await authenticatedAgent
      .get('/api/applications/my-applications')
      .expect(200);

    expect(getResponse.body.success).toBe(true);
    expect(getResponse.body.applications).toHaveLength(1);
    
    const application = getResponse.body.applications[0];
    expect(application).toHaveProperty('id');
    expect(application).toHaveProperty('course');
    expect(application.course.code).toBe('COSC2758');
    expect(application.session_type).toBe('tutor');
    expect(application.status).toBe('Pending');
    expect(application.comments).toEqual([]);
  });

  /**
   * Test: Unauthenticated Access Prevention
   * Context: Security requirement - only authenticated candidates can submit applications
   * Business Logic: Access control prevents unauthorized application submissions
   */
  it('should prevent unauthenticated users from submitting applications', async () => {
    const applicationData = {
      course_id: testCourse.id,
      session_type: 'tutor',
      skills: ['JavaScript'],
      availability: 'fulltime',
      academic_credentials: [],
      previous_roles: []
    };

    const response = await request(app)
      .post('/api/applications/submit')
      .send(applicationData)
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/authentication.*required|sign.*in/i);
  });

  /**
   * Test: Non-existent Course Application
   * Context: Data integrity - applications must reference valid courses
   * Business Logic: Prevents orphaned applications
   */
  it('should reject applications for non-existent courses', async () => {
    const applicationData = {
      course_id: 'non-existent-course-id',
      session_type: 'tutor',
      skills: ['JavaScript'],
      availability: 'fulltime',
      academic_credentials: [],
      previous_roles: []
    };

    const response = await authenticatedAgent
      .post('/api/applications/submit')
      .send(applicationData)
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toMatch(/course.*not.*found/i);
  });
});