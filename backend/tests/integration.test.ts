// tests/integration.test.ts
import request from 'supertest';
import app from '../src/index';
import { TestDataSource } from './data-source.test';
import { User } from '../src/entity/User';
import { Candidate } from '../src/entity/Candidate';
import { Lecturer } from '../src/entity/Lecturer';
import { Course } from '../src/entity/Course';
import { CandidateApplication } from '../src/entity/CandidateApplication';

/**
 * Test Suite: End-to-End Integration Test
 * 
 * Context: Tests complete user workflows that span multiple components and
 * demonstrate the full TeachTeam application functionality as required in
 * Assignment 2. This integration test validates the entire process from
 * user registration through application submission to lecturer review.
 * 
 * Business Logic: Integration tests ensure all components work together
 * correctly, simulating real user interactions and validating the complete
 * Assignment 2 requirements including PA, CR, and DI sections functionality.
 */

describe('End-to-End Integration Test', () => {
  let userRepository: any;
  let candidateRepository: any;
  let lecturerRepository: any;
  let courseRepository: any;
  let applicationRepository: any;

  beforeEach(async () => {
    // Initialize all repositories for complete integration testing
    userRepository = TestDataSource.getRepository(User);
    candidateRepository = TestDataSource.getRepository(Candidate);
    lecturerRepository = TestDataSource.getRepository(Lecturer);
    courseRepository = TestDataSource.getRepository(Course);
    applicationRepository = TestDataSource.getRepository(CandidateApplication);
  });

  /**
   * Integration Test: Complete TeachTeam Workflow
   * Context: Tests the full Assignment 2 workflow covering all requirements
   * Business Logic: Simulates real-world usage from registration to selection
   */
  it('should complete full TeachTeam workflow: registration → application → lecturer review → selection', async () => {
    // ================================
    // STEP 1: Lecturer Registration & Course Setup (PA Requirement)
    // ================================
    console.log('🧪 Step 1: Setting up lecturer and course...');

    // Register lecturer
    const lecturerRegistration = {
      name: 'Dr. Emma Thompson',
      email: 'emma.thompson@rmit.edu.au',
      password: 'LecturerPass123!',
      confirmPassword: 'LecturerPass123!',
      role: 'lecturer'
    };

    const lecturerRegResponse = await request(app)
      .post('/api/auth/register')
      .send(lecturerRegistration)
      .expect(201);

    expect(lecturerRegResponse.body.success).toBe(true);
    expect(lecturerRegResponse.body.user.role).toBe('lecturer');

    // Create course and assign to lecturer
    const courseData = {
      code: 'COSC2758',
      name: 'Full Stack Development / Further Web Programming',
      semester: 'Semester 1',
      year: 2025,
      is_active: true
    };

    const course = await courseRepository.save(courseData);
    
    // Create lecturer profile and assign course
    const lecturer = await lecturerRepository.save({
      user: { id: lecturerRegResponse.body.user.id },
      department: 'Computer Science',
      courses: [course]
    });

    console.log('✅ Step 1 Complete: Lecturer and course setup successful');

    // ================================
    // STEP 2: Candidate Registration (PA Requirement)
    // ================================
    console.log('🧪 Step 2: Candidate registration...');

    const candidateRegistration = {
      name: 'Alex Johnson',
      email: 'alex.johnson@student.rmit.edu.au',
      password: 'StudentPass123!',
      confirmPassword: 'StudentPass123!',
      role: 'candidate'
    };

    const candidateRegResponse = await request(app)
      .post('/api/auth/register')
      .send(candidateRegistration)
      .expect(201);

    expect(candidateRegResponse.body.success).toBe(true);
    expect(candidateRegResponse.body.user.role).toBe('candidate');
    expect(candidateRegResponse.body.message).toContain('Welcome');

    console.log('✅ Step 2 Complete: Candidate registration successful');

    // ================================
    // STEP 3: Candidate Authentication (PA Requirement)
    // ================================
    console.log('🧪 Step 3: Candidate authentication...');

    const candidateLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: candidateRegistration.email,
        password: candidateRegistration.password
      })
      .expect(200);

    expect(candidateLogin.body.success).toBe(true);
    expect(candidateLogin.body.message).toContain('Welcome');
    expect(candidateLogin.body.message).toContain(candidateRegistration.name);

    const candidateAuthToken = candidateLogin.body.token || 'Bearer candidate-token';

    console.log('✅ Step 3 Complete: Candidate authentication successful');

    // ================================
    // STEP 4: View Available Courses (PA Requirement)
    // ================================
    console.log('🧪 Step 4: Viewing available courses...');

    const coursesResponse = await request(app)
      .get('/api/courses/active')
      .expect(200);

    expect(coursesResponse.body.success).toBe(true);
    expect(coursesResponse.body.courses.length).toBeGreaterThan(0);
    expect(coursesResponse.body.courses[0].code).toBe('COSC2758');

    console.log('✅ Step 4 Complete: Course listing successful');

    // ================================
    // STEP 5: Submit Tutor Application (PA Requirement)
    // ================================
    console.log('🧪 Step 5: Submitting tutor application...');

    const applicationData = {
      course_id: course.id,
      session_type: 'tutor',
      skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Express'],
      availability: 'fulltime',
      academic_credentials: [
        {
          degree: 'Bachelor of Computer Science',
          institution: 'RMIT University',
          year: 2024,
          gpa: 3.7
        }
      ],
      previous_roles: [
        {
          position: 'Junior Developer',
          organisation: 'Tech Startup',
          startDate: '2023-06-01',
          endDate: '2024-02-28',
          description: 'Full-stack web development using React and Node.js'
        }
      ]
    };

    const applicationResponse = await request(app)
      .post('/api/applications')
      .set('Authorization', candidateAuthToken)
      .send(applicationData)
      .expect(201);

    expect(applicationResponse.body.success).toBe(true);
    expect(applicationResponse.body.application).toHaveProperty('id');

    const applicationId = applicationResponse.body.application.id;

    console.log('✅ Step 5 Complete: Application submission successful');

    // ================================
    // STEP 6: Lecturer Authentication & Review (CR/DI Requirements)
    // ================================
    console.log('🧪 Step 6: Lecturer authentication and application review...');

    const lecturerLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: lecturerRegistration.email,
        password: lecturerRegistration.password
      })
      .expect(200);

    expect(lecturerLogin.body.success).toBe(true);
    const lecturerAuthToken = lecturerLogin.body.token || 'Bearer lecturer-token';

    // Lecturer views applications for their assigned courses (Requirement 2.4.5)
    const applicationsResponse = await request(app)
      .get('/api/lecturer-courses/applications')
      .set('Authorization', lecturerAuthToken)
      .expect(200);

    expect(applicationsResponse.body.success).toBe(true);
    expect(applicationsResponse.body.applications.length).toBe(1);
    expect(applicationsResponse.body.applications[0].course.code).toBe('COSC2758');
    expect(applicationsResponse.body.applications[0].candidate.name).toBe('Alex Johnson');

    console.log('✅ Step 6 Complete: Lecturer review successful');

    // ================================
    // STEP 7: Filter Applications (CR Requirement)
    // ================================
    console.log('🧪 Step 7: Testing application filtering...');

    // Test filtering by session type
    const filteredResponse = await request(app)
      .get('/api/lecturer-courses/applications?session_type=tutor')
      .set('Authorization', lecturerAuthToken)
      .expect(200);

    expect(filteredResponse.body.success).toBe(true);
    expect(filteredResponse.body.applications.length).toBe(1);
    expect(filteredResponse.body.applications[0].session_type).toBe('tutor');

    console.log('✅ Step 7 Complete: Application filtering successful');

    // ================================
    // STEP 8: Select Candidate & Update Status (CR/DI Requirements)
    // ================================
    console.log('🧪 Step 8: Selecting candidate and updating application status...');

    const selectionUpdate = {
      status: 'Selected',
      ranking: 1,
      comments: ['Excellent technical skills demonstrated', 'Strong academic background', 'Good availability match']
    };

    const updateResponse = await request(app)
      .patch(`/api/lecturer-courses/applications/${applicationId}`)
      .set('Authorization', lecturerAuthToken)
      .send(selectionUpdate)
      .expect(200);

    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.application.status).toBe('Selected');
    expect(updateResponse.body.application.ranking).toBe(1);

    console.log('✅ Step 8 Complete: Candidate selection successful');

    // ================================
    // STEP 9: Candidate Views Application Status (PA Requirement)
    // ================================
    console.log('🧪 Step 9: Candidate checking application status...');

    const candidateApplicationsResponse = await request(app)
      .get('/api/applications/my-applications')
      .set('Authorization', candidateAuthToken)
      .expect(200);

    expect(candidateApplicationsResponse.body.success).toBe(true);
    expect(candidateApplicationsResponse.body.applications.length).toBe(1);
    expect(candidateApplicationsResponse.body.applications[0].status).toBe('Selected');
    expect(candidateApplicationsResponse.body.applications[0].ranking).toBe(1);

    console.log('✅ Step 9 Complete: Application status check successful');

    // ================================
    // STEP 10: Verify Database Integrity
    // ================================
    console.log('🧪 Step 10: Verifying final database state...');

    // Verify all entities were created correctly
    const finalUserCount = await userRepository.count();
    const finalCandidateCount = await candidateRepository.count();
    const finalLecturerCount = await lecturerRepository.count();
    const finalCourseCount = await courseRepository.count();
    const finalApplicationCount = await applicationRepository.count();

    expect(finalUserCount).toBe(2); // 1 candidate + 1 lecturer
    expect(finalCandidateCount).toBe(1);
    expect(finalLecturerCount).toBe(1);
    expect(finalCourseCount).toBe(1);
    expect(finalApplicationCount).toBe(1);

    // Verify final application state
    const finalApplication = await applicationRepository.findOne({
      where: { id: applicationId },
      relations: ['candidate', 'course', 'candidate.user']
    });

    expect(finalApplication.status).toBe('Selected');
    expect(finalApplication.ranking).toBe(1);
    expect(finalApplication.comments).toHaveLength(3);
    expect(finalApplication.candidate.user.name).toBe('Alex Johnson');
    expect(finalApplication.course.code).toBe('COSC2758');

    console.log('✅ Step 10 Complete: Database integrity verified');

    // ================================
    // INTEGRATION TEST SUMMARY
    // ================================
    console.log('');
    console.log('🎉 INTEGRATION TEST COMPLETED SUCCESSFULLY!');
    console.log('✅ PA Requirements: User registration, authentication, profile, course applications');
    console.log('✅ CR Requirements: Lecturer filtering, application management');
    console.log('✅ DI Requirements: Status updates, ranking system');
    console.log('✅ Database Integrity: All entities properly created and linked');
    console.log('✅ Full Workflow: Registration → Application → Review → Selection');
    console.log('');

    // Final assertion to confirm complete workflow success
    expect(true).toBe(true); // Integration test passed
  });
});