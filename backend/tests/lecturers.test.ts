// tests/lecturers.test.ts
import request from 'supertest';
import app from '../src/index';
import { TestDataSource } from './data-source.test';
import { User } from '../src/entity/User';
import { Lecturer } from '../src/entity/Lecturer';
import { Course } from '../src/entity/Course';
import { CandidateApplication } from '../src/entity/CandidateApplication';
import { Candidate } from '../src/entity/Candidate';

/**
 * Test Suite: Lecturer Operations Endpoints
 * 
 * Context: Tests lecturer-specific functionality required in Assignment 2 CR/DI sections.
 * This includes viewing applications for assigned courses (requirement 2.4.5), 
 * filtering applicants by various criteria (CR section), and updating application
 * status/rankings. Lecturers can only access data for their assigned courses.
 * 
 * Business Logic: Lecturers are the decision makers in TeachTeam - they review
 * applications, select candidates, and provide rankings. The system must ensure
 * proper access control and provide filtering capabilities for efficient review.
 */

describe('Lecturer Operations Endpoints', () => {
  let userRepository: any;
  let lecturerRepository: any;
  let courseRepository: any;
  let applicationRepository: any;
  let candidateRepository: any;
  let testLecturer: any;
  let testCourse: any;
  let testCandidate: any;
  let authToken: string;

  beforeEach(async () => {
    // Initialize repositories
    userRepository = TestDataSource.getRepository(User);
    lecturerRepository = TestDataSource.getRepository(Lecturer);
    courseRepository = TestDataSource.getRepository(Course);
    applicationRepository = TestDataSource.getRepository(CandidateApplication);
    candidateRepository = TestDataSource.getRepository(Candidate);

    // Create test lecturer
    const lecturerUser = await userRepository.save({
      name: 'Dr. Sarah Wilson',
      email: 'sarah.wilson@rmit.edu.au',
      password: 'hashedPassword123',
      role: 'lecturer',
      is_active: true
    });

    testLecturer = await lecturerRepository.save({
      user: lecturerUser,
      department: 'Computer Science'
    });

    // Create test course assigned to lecturer
    testCourse = await courseRepository.save({
      code: 'COSC2758',
      name: 'Full Stack Development',
      semester: 'Semester 1',
      year: 2025,
      is_active: true
    });

    // Assign course to lecturer
    testLecturer.courses = [testCourse];
    await lecturerRepository.save(testLecturer);

    // Create test candidate and application
    const candidateUser = await userRepository.save({
      name: 'Alice Johnson',
      email: 'alice.johnson@student.rmit.edu.au',
      password: 'hashedPassword123',
      role: 'candidate',
      is_active: true
    });

    testCandidate = await candidateRepository.save({
      user: candidateUser,
      availability: 'fulltime',
      skills: ['JavaScript', 'React', 'Node.js']
    });

    // Mock authentication token for lecturer
    authToken = 'Bearer lecturer-jwt-token';
  });

  /**
   * Test: View Applications for Assigned Courses
   * Context: Requirement 2.4.5 - lecturers can only see applications for their assigned courses
   * Business Logic: Access control prevents lecturers from seeing other lecturers' applications
   */
  it('should return applications only for lecturer assigned courses', async () => {
    // Create applications for the lecturer's course
    await applicationRepository.save({
      candidate: testCandidate,
      course: testCourse,
      session_type: 'tutor',
      status: 'Pending',
      skills: ['JavaScript', 'React'],
      availability: 'fulltime',
      academic_credentials: [],
      previous_roles: []
    });

    // Create another candidate and application
    const anotherCandidateUser = await userRepository.save({
      name: 'Bob Smith',
      email: 'bob.smith@student.rmit.edu.au',
      password: 'hashedPassword123',
      role: 'candidate',
      is_active: true
    });

    const anotherCandidate = await candidateRepository.save({
      user: anotherCandidateUser,
      availability: 'parttime',
      skills: ['Python', 'Django']
    });

    await applicationRepository.save({
      candidate: anotherCandidate,
      course: testCourse,
      session_type: 'lab_assistant',
      status: 'Pending',
      skills: ['Python', 'Django'],
      availability: 'parttime',
      academic_credentials: [],
      previous_roles: []
    });

    // Create course NOT assigned to lecturer
    const unassignedCourse = await courseRepository.save({
      code: 'COSC9999',
      name: 'Unassigned Course',
      semester: 'Semester 1',
      year: 2025,
      is_active: true
    });

    // Create application for unassigned course (should not appear)
    await applicationRepository.save({
      candidate: testCandidate,
      course: unassignedCourse,
      session_type: 'tutor',
      status: 'Pending',
      skills: ['Java'],
      availability: 'fulltime',
      academic_credentials: [],
      previous_roles: []
    });

    const response = await request(app)
      .get('/api/lecturer-courses/applications')
      .set('Authorization', authToken)
      .expect(200);

    // Verify response structure
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('applications');
    expect(Array.isArray(response.body.applications)).toBe(true);

    // Verify only applications for assigned course are returned (requirement 2.4.5)
    expect(response.body.applications).toHaveLength(2); // Only the 2 for COSC2758
    
    // Verify all applications belong to assigned course
    response.body.applications.forEach((application: any) => {
      expect(application.course.code).toBe('COSC2758');
      expect(application.course.id).toBe(testCourse.id);
    });

    // Verify candidate details are included - FIXED variable name conflict
    const firstApplication = response.body.applications[0];
    expect(firstApplication).toHaveProperty('candidate');
    expect(firstApplication.candidate).toHaveProperty('name');
    expect(firstApplication.candidate).toHaveProperty('email');
    expect(firstApplication).toHaveProperty('skills');
    expect(firstApplication).toHaveProperty('availability');
  });

  /**
   * Test: Filter Applications by Criteria (CR Requirement)
   * Context: CR section - lecturers should be able to filter applicants by name, 
   * session type, availability, and skill set
   * Business Logic: Efficient review process requires filtering capabilities
   */
  it('should filter applications by session type and availability', async () => {
    // Create diverse applications for filtering
    const candidates = [];
    
    // Create multiple candidates with different attributes
    for (let i = 0; i < 4; i++) {
      const candidateUser = await userRepository.save({
        name: `Candidate ${i + 1}`,
        email: `candidate${i + 1}@student.rmit.edu.au`,
        password: 'hashedPassword123',
        role: 'candidate',
        is_active: true
      });

      const candidate = await candidateRepository.save({
        user: candidateUser,
        availability: i % 2 === 0 ? 'fulltime' : 'parttime',
        skills: i < 2 ? ['JavaScript', 'React'] : ['Python', 'Django']
      });

      candidates.push(candidate);
    }

    // Create applications with different session types and availability
    await applicationRepository.save({
      candidate: candidates[0],
      course: testCourse,
      session_type: 'tutor',
      status: 'Pending',
      skills: ['JavaScript', 'React'],
      availability: 'fulltime',
      academic_credentials: [],
      previous_roles: []
    });

    await applicationRepository.save({
      candidate: candidates[1],
      course: testCourse,
      session_type: 'lab_assistant',
      status: 'Pending',
      skills: ['JavaScript', 'React'],
      availability: 'parttime',
      academic_credentials: [],
      previous_roles: []
    });

    await applicationRepository.save({
      candidate: candidates[2],
      course: testCourse,
      session_type: 'tutor',
      status: 'Pending',
      skills: ['Python', 'Django'],
      availability: 'fulltime',
      academic_credentials: [],
      previous_roles: []
    });

    // Test filtering by session type
    const tutorResponse = await request(app)
      .get('/api/lecturer-courses/applications?session_type=tutor')
      .set('Authorization', authToken)
      .expect(200);

    expect(tutorResponse.body.applications).toHaveLength(2);
    tutorResponse.body.applications.forEach((application: any) => {
      expect(application.session_type).toBe('tutor');
    });

    // Test filtering by availability
    const fulltimeResponse = await request(app)
      .get('/api/lecturer-courses/applications?availability=fulltime')
      .set('Authorization', authToken)
      .expect(200);

    expect(fulltimeResponse.body.applications).toHaveLength(2);
    fulltimeResponse.body.applications.forEach((application: any) => {
      expect(application.availability).toBe('fulltime');
    });

    // Test combined filtering
    const combinedResponse = await request(app)
      .get('/api/lecturer-courses/applications?session_type=tutor&availability=fulltime')
      .set('Authorization', authToken)
      .expect(200);

    expect(combinedResponse.body.applications).toHaveLength(2);
    combinedResponse.body.applications.forEach((application: any) => {
      expect(application.session_type).toBe('tutor');
      expect(application.availability).toBe('fulltime');
    });
  });

  /**
   * Test: Update Application Status and Ranking
   * Context: Lecturers need to select candidates and assign rankings
   * Business Logic: Core workflow - lecturers review, select, and rank candidates
   */
  it('should allow lecturers to update application status and ranking', async () => {
    // Create test application
    const application = await applicationRepository.save({
      candidate: testCandidate,
      course: testCourse,
      session_type: 'tutor',
      status: 'Pending',
      skills: ['JavaScript', 'React', 'Node.js'],
      availability: 'fulltime',
      academic_credentials: [],
      previous_roles: []
    });

    // Update application status to Selected with ranking
    const updateData = {
      status: 'Selected',
      ranking: 1,
      comments: ['Excellent technical skills', 'Strong communication during interview']
    };

    const response = await request(app)
      .patch(`/api/lecturer-courses/applications/${application.id}`)
      .set('Authorization', authToken)
      .send(updateData)
      .expect(200);

    // Verify response
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('application');
    expect(response.body.application.status).toBe('Selected');
    expect(response.body.application.ranking).toBe(1);

    // Verify database was updated
    const updatedApplication = await applicationRepository.findOne({
      where: { id: application.id }
    });

    expect(updatedApplication.status).toBe('Selected');
    expect(updatedApplication.ranking).toBe(1);
    expect(updatedApplication.comments).toEqual(updateData.comments);
  });
});