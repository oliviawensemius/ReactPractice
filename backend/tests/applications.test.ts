// tests/applications.test.ts
import request from 'supertest';
import app from '../src/index';
import { TestDataSource } from './data-source.test';
import { CandidateApplication } from '../src/entity/CandidateApplication';
import { User } from '../src/entity/User';
import { Candidate } from '../src/entity/Candidate';
import { Course } from '../src/entity/Course';

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
  let testCandidate: any;
  let testCourse: any;
  let authToken: string;

  beforeEach(async () => {
    // Initialize repositories
    applicationRepository = TestDataSource.getRepository(CandidateApplication);
    userRepository = TestDataSource.getRepository(User);
    candidateRepository = TestDataSource.getRepository(Candidate);
    courseRepository = TestDataSource.getRepository(Course);

    // Create test candidate
    const candidateUser = await userRepository.save({
      name: 'John Student',
      email: 'john.student@student.rmit.edu.au',
      password: 'hashedPassword123',
      role: 'candidate',
      is_active: true
    });

    testCandidate = await candidateRepository.save({
      user: candidateUser,
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

    // Mock authentication token for candidate
    authToken = 'Bearer candidate-jwt-token';
  });

  /**
   * Test: Successful Application Submission
   * Context: PA requirement (c) - candidates must be able to apply for courses
   * Business Logic: Core functionality allowing candidates to submit applications
   * with all required details (skills, availability, credentials, previous roles)
   */
  it('should successfully submit a complete tutor application', async () => {
    const applicationData = {
      course_id: testCourse.id,
      session_type: 'tutor',
      skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
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
          description: 'Assisted in COSC1295 tutorials'
        }
      ]
    };

    const response = await request(app)
      .post('/api/applications')
      .set('Authorization', authToken)
      .send(applicationData)
      .expect(201);

    // Verify response structure matches Assignment 2 requirements
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('application');
    expect(response.body.application).toHaveProperty('id');

    // Verify application was saved to database with correct status
    const savedApplication = await applicationRepository.findOne({
      where: { id: response.body.application.id },
      relations: ['candidate', 'course']
    });

    expect(savedApplication).toBeTruthy();
    expect(savedApplication.session_type).toBe('tutor');
    expect(savedApplication.status).toBe('Pending'); // Default status
    expect(savedApplication.candidate.id).toBe(testCandidate.id);
    expect(savedApplication.course.id).toBe(testCourse.id);
    
    // Verify skills are properly stored
    expect(savedApplication.skills).toEqual(applicationData.skills);
    expect(savedApplication.availability).toBe('fulltime');

    // Verify academic credentials are stored
    expect(savedApplication.academic_credentials).toHaveLength(1);
    expect(savedApplication.academic_credentials[0].degree).toBe('Bachelor of Computer Science');

    // Verify previous roles are stored
    expect(savedApplication.previous_roles).toHaveLength(1);
    expect(savedApplication.previous_roles[0].position).toBe('Teaching Assistant');
  });

  /**
   * Test: Prevent Duplicate Applications (PA Requirement)
   * Context: PA requirement - "A candidate SHOULD NOT BE ABLE TO APPLY FOR A SAME ROLE TWICE"
   * Business Logic: System integrity - prevents gaming the system with multiple applications
   */
  it('should prevent duplicate applications for the same course and role', async () => {
    // First application - should succeed
    const applicationData = {
      course_id: testCourse.id,
      session_type: 'tutor',
      skills: ['JavaScript', 'React'],
      availability: 'parttime',
      academic_credentials: [],
      previous_roles: []
    };

    await request(app)
      .post('/api/applications')
      .set('Authorization', authToken)
      .send(applicationData)
      .expect(201);

    // Second identical application - should fail
    const duplicateResponse = await request(app)
      .post('/api/applications')
      .set('Authorization', authToken)
      .send(applicationData)
      .expect(409); // Conflict status code

    // Verify proper error response
    expect(duplicateResponse.body).toHaveProperty('success', false);
    expect(duplicateResponse.body).toHaveProperty('message');
    expect(duplicateResponse.body.message).toMatch(/already applied|duplicate|exists/i);

    // Verify only one application exists in database
    const applicationCount = await applicationRepository.count({
      where: {
        candidate: { id: testCandidate.id },
        course: { id: testCourse.id },
        session_type: 'tutor'
      }
    });
    expect(applicationCount).toBe(1);
  });

  /**
   * Test: Application Input Validation
   * Context: PA requirement - frontend AND backend validation required
   * Business Logic: Data integrity - all applications must have complete, valid data
   */
  it('should validate required fields and reject invalid applications', async () => {
    // Test missing required fields
    const invalidApplications = [
      {
        // Missing course_id
        session_type: 'tutor',
        skills: ['JavaScript'],
        availability: 'fulltime'
      },
      {
        course_id: testCourse.id,
        // Missing session_type
        skills: ['JavaScript'],
        availability: 'fulltime'
      },
      {
        course_id: testCourse.id,
        session_type: 'invalid_type', // Invalid session type
        skills: ['JavaScript'],
        availability: 'fulltime'
      },
      {
        course_id: testCourse.id,
        session_type: 'tutor',
        skills: [], // Empty skills array
        availability: 'fulltime'
      }
    ];

    // Test each invalid application
    for (const invalidApp of invalidApplications) {
      const response = await request(app)
        .post('/api/applications')
        .set('Authorization', authToken)
        .send(invalidApp)
        .expect(400);

      // Verify validation error response
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toMatch(/required|invalid|missing/i);
    }

    // Verify no invalid applications were saved
    const applicationCount = await applicationRepository.count({
      where: { candidate: { id: testCandidate.id } }
    });
    expect(applicationCount).toBe(0);
  });
});