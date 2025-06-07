// backend/tests/lecturers.test.ts - Updated to match actual implementation
import request from 'supertest';
import app from '../src/index';
import { TestDataSource } from './data-source.utils';
import { User } from '../src/entity/User';
import { Lecturer } from '../src/entity/Lecturer';
import { Course } from '../src/entity/Course';
import { CandidateApplication } from '../src/entity/CandidateApplication';
import { Candidate } from '../src/entity/Candidate';
import bcrypt from 'bcryptjs';

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
  let testLecturerUser: any;
  let testCourse: any;
  let testCourse2: any;
  let testCandidate: any;
  let authenticatedAgent: any;

  beforeEach(async () => {
    // Initialize repositories
    userRepository = TestDataSource.getRepository(User);
    lecturerRepository = TestDataSource.getRepository(Lecturer);
    courseRepository = TestDataSource.getRepository(Course);
    applicationRepository = TestDataSource.getRepository(CandidateApplication);
    candidateRepository = TestDataSource.getRepository(Candidate);

    // Create test lecturer with authentication
    const hashedPassword = await bcrypt.hash('LecturerPass123!', 12);
    testLecturerUser = await userRepository.save({
      name: 'Dr. Sarah Wilson',
      email: 'sarah.wilson@rmit.edu.au',
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

    // Create test courses
    testCourse = await courseRepository.save({
      code: 'COSC2758',
      name: 'Full Stack Development',
      semester: 'Semester 1',
      year: 2025,
      is_active: true
    });

    testCourse2 = await courseRepository.save({
      code: 'COSC1295',
      name: 'Advanced Programming',
      semester: 'Semester 1',
      year: 2025,
      is_active: true
    });

    // Assign courses to lecturer using the correct many-to-many relationship
    testLecturer.courses = [testCourse, testCourse2];
    await lecturerRepository.save(testLecturer);

    // Create test candidate
    const candidateUser = await userRepository.save({
      name: 'Alice Johnson',
      email: 'alice.johnson@student.rmit.edu.au',
      password: await bcrypt.hash('StudentPass123!', 12),
      role: 'candidate',
      is_active: true,
      is_blocked: false
    });

    testCandidate = await candidateRepository.save({
      user_id: candidateUser.id,
      availability: 'fulltime',
      skills: ['JavaScript', 'React', 'Node.js']
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
   * Test: View Applications for Assigned Courses Only
   * Context: Requirement 2.4.5 - lecturers can only see applications for their assigned courses
   * Business Logic: Access control prevents lecturers from seeing other lecturers' applications
   */
  it('should return applications only for lecturer assigned courses', async () => {
    // Create applications for the lecturer's assigned courses
    const app1 = await applicationRepository.save({
      candidate_id: testCandidate.id,
      course_id: testCourse.id,
      session_type: 'tutor',
      status: 'Pending',
      skills: ['JavaScript', 'React'],
      availability: 'fulltime'
    });

    const app2 = await applicationRepository.save({
      candidate_id: testCandidate.id,
      course_id: testCourse2.id,
      session_type: 'lab_assistant',
      status: 'Pending',
      skills: ['Python', 'Django'],
      availability: 'parttime'
    });

    // Create unassigned course and application (should not appear)
    const unassignedCourse = await courseRepository.save({
      code: 'COSC9999',
      name: 'Unassigned Course',
      semester: 'Semester 2',
      year: 2025,
      is_active: true
    });

    await applicationRepository.save({
      candidate_id: testCandidate.id,
      course_id: unassignedCourse.id,
      session_type: 'tutor',
      status: 'Pending',
      skills: ['Java'],
      availability: 'fulltime'
    });

    // Test the actual endpoint from your routes
    const response = await authenticatedAgent
      .get('/api/applications/for-review')
      .expect(200);

    // Verify response structure
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('applications');
    expect(Array.isArray(response.body.applications)).toBe(true);

    // Verify only applications for assigned courses are returned (requirement 2.4.5)
    expect(response.body.applications).toHaveLength(2);
    
    // Verify all applications belong to assigned courses
    const courseCodes = response.body.applications.map((app: any) => app.courseCode);
    expect(courseCodes).toContain('COSC2758');
    expect(courseCodes).toContain('COSC1295');
    expect(courseCodes).not.toContain('COSC9999'); // Unassigned course

    // Verify application data structure matches frontend expectations
    const firstApplication = response.body.applications[0];
    expect(firstApplication).toHaveProperty('id');
    expect(firstApplication).toHaveProperty('tutorName');
    expect(firstApplication).toHaveProperty('tutorEmail');
    expect(firstApplication).toHaveProperty('courseCode');
    expect(firstApplication).toHaveProperty('courseName');
    expect(firstApplication).toHaveProperty('role');
    expect(firstApplication).toHaveProperty('skills');
    expect(firstApplication).toHaveProperty('availability');
    expect(firstApplication).toHaveProperty('status');
    expect(firstApplication).toHaveProperty('academicCredentials');
    expect(firstApplication).toHaveProperty('previousRoles');
  });

  /**
   * Test: Update Application Status (CR/DI Requirements)
   * Context: Lecturers need to select/reject candidates
   * Business Logic: Core workflow - lecturers review and make decisions
   */
  it('should allow lecturers to update application status', async () => {
    // Create test application
    const application = await applicationRepository.save({
      candidate_id: testCandidate.id,
      course_id: testCourse.id,
      session_type: 'tutor',
      status: 'Pending',
      skills: ['JavaScript', 'React', 'Node.js'],
      availability: 'fulltime'
    });

    // Update application status to Selected
    const updateData = {
      status: 'Selected'
    };

    const response = await authenticatedAgent
      .put(`/api/applications/${application.id}/status`)
      .send(updateData)
      .expect(200);

    // Verify response
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');
    expect(response.body.application.status).toBe('Selected');

    // Verify database was updated
    const updatedApplication = await applicationRepository.findOne({
      where: { id: application.id }
    });
    expect(updatedApplication.status).toBe('Selected');
  });

  /**
   * Test: Add Comments to Applications (CR Requirements)
   * Context: Lecturers need to provide feedback on applications
   * Business Logic: Communication tool for application review process
   */
  it('should allow lecturers to add comments to applications', async () => {
    // Create test application
    const application = await applicationRepository.save({
      candidate_id: testCandidate.id,
      course_id: testCourse.id,
      session_type: 'tutor',
      status: 'Pending',
      skills: ['JavaScript', 'React'],
      availability: 'fulltime',
      comments: []
    });

    const commentData = {
      comment: 'Excellent technical skills demonstrated in portfolio'
    };

    const response = await authenticatedAgent
      .post(`/api/applications/${application.id}/comment`)
      .send(commentData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.comments).toContain(commentData.comment);

    // Verify in database
    const updatedApplication = await applicationRepository.findOne({
      where: { id: application.id }
    });
    expect(updatedApplication.comments).toContain(commentData.comment);
  });

  /**
   * Test: Update Application Ranking (DI Requirements)
   * Context: Lecturers need to rank selected candidates
   * Business Logic: Priority system for selected candidates
   */
  it('should allow lecturers to update application ranking', async () => {
    // Create selected application
    const application = await applicationRepository.save({
      candidate_id: testCandidate.id,
      course_id: testCourse.id,
      session_type: 'tutor',
      status: 'Selected',
      skills: ['JavaScript', 'React'],
      availability: 'fulltime',
      ranking: null
    });

    const rankingData = {
      ranking: 1
    };

    const response = await authenticatedAgent
      .put(`/api/applications/${application.id}/ranking`)
      .send(rankingData)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.application.ranking).toBe(1);

    // Verify in database
    const updatedApplication = await applicationRepository.findOne({
      where: { id: application.id }
    });
    expect(updatedApplication.ranking).toBe(1);
  });

  /**
   * Test: Lecturer Course Management
   * Context: Lecturers need to manage their assigned courses
   * Business Logic: Course assignment affects which applications they can see
   */
  it('should allow lecturers to view and manage their courses', async () => {
    // Get lecturer's courses
    const response = await authenticatedAgent
      .get('/api/lecturer-courses/my-courses')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.courses).toHaveLength(2);
    
    const courseCodes = response.body.courses.map((c: any) => c.code);
    expect(courseCodes).toContain('COSC2758');
    expect(courseCodes).toContain('COSC1295');
  });

  /**
   * Test: Add Course to Lecturer
   * Context: Lecturers can be assigned additional courses
   * Business Logic: Dynamic course assignment affects application visibility
   */
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

    // Verify course was added
    const updatedLecturer = await lecturerRepository.findOne({
      where: { id: testLecturer.id },
      relations: ['courses']
    });
    expect(updatedLecturer.courses).toHaveLength(3);
  });

  /**
   * Test: Remove Course from Lecturer
   * Context: Lecturers may no longer teach certain courses
   * Business Logic: Course removal affects application access
   */
  it('should allow removing courses from lecturer', async () => {
    const response = await authenticatedAgent
      .post('/api/lecturer-courses/remove')
      .send({ course_id: testCourse2.id })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('removed successfully');

    // Verify course was removed
    const updatedLecturer = await lecturerRepository.findOne({
      where: { id: testLecturer.id },
      relations: ['courses']
    });
    expect(updatedLecturer.courses).toHaveLength(1);
    expect(updatedLecturer.courses[0].code).toBe('COSC2758');
  });

  /**
   * Test: Search and Filter Applications (CR Requirements)
   * Context: CR section - lecturers should be able to filter applicants
   * Business Logic: Efficient review process requires filtering capabilities
   */
  it('should filter applications using lecturer search service', async () => {
    // Create multiple candidates with different attributes
    const candidates = [];
    
    for (let i = 0; i < 3; i++) {
      const candidateUser = await userRepository.save({
        name: `Candidate ${i + 1}`,
        email: `candidate${i + 1}@student.rmit.edu.au`,
        password: await bcrypt.hash('Pass123!', 12),
        role: 'candidate',
        is_active: true
      });

      const candidate = await candidateRepository.save({
        user_id: candidateUser.id,
        availability: i % 2 === 0 ? 'fulltime' : 'parttime',
        skills: i < 2 ? ['JavaScript', 'React'] : ['Python', 'Django']
      });

      candidates.push(candidate);
    }

    // Create applications with different attributes
    const applications = [];
    for (let i = 0; i < 3; i++) {
      const app = await applicationRepository.save({
        candidate_id: candidates[i].id,
        course_id: testCourse.id,
        session_type: i % 2 === 0 ? 'tutor' : 'lab_assistant',
        status: 'Pending',
        skills: i < 2 ? ['JavaScript', 'React'] : ['Python', 'Django'],
        availability: i % 2 === 0 ? 'fulltime' : 'parttime'
      });
      applications.push(app);
    }

    // Test filtering by session type using the search service
    const filterData = {
      applicationIds: applications.map(app => app.id),
      sessionType: 'tutor'
    };

    const searchResponse = await authenticatedAgent
      .post('/api/lecturer-search/search')
      .send(filterData)
      .expect(200);

    expect(searchResponse.body).toHaveProperty('application_ids');
    expect(searchResponse.body.application_ids.length).toBeLessThanOrEqual(applications.length);

    // Verify returned IDs are from tutor applications only
    const tutorApplicationIds = applications
      .filter(app => app.session_type === 'tutor')
      .map(app => app.id);
    
    searchResponse.body.application_ids.forEach((id: string) => {
      expect(tutorApplicationIds).toContain(id);
    });
  });

  /**
   * Test: Unauthorized Access Prevention
   * Context: Security requirement - only authenticated lecturers can access endpoints
   * Business Logic: Access control prevents unauthorized application access
   */
  it('should prevent unauthorized access to lecturer endpoints', async () => {
    // Test without authentication
    await request(app)
      .get('/api/applications/for-review')
      .expect(401);

    await request(app)
      .get('/api/lecturer-courses/my-courses')
      .expect(401);

    // Create candidate and try to access lecturer endpoints
    const candidateAgent = request.agent(app);
    const candidateUser = await userRepository.save({
      name: 'Test Candidate',
      email: 'test.candidate@student.rmit.edu.au',
      password: await bcrypt.hash('CandidatePass123!', 12),
      role: 'candidate',
      is_active: true
    });

    await candidateAgent
      .post('/api/auth/signin')
      .send({
        email: candidateUser.email,
        password: 'CandidatePass123!'
      });

    // Candidate should not access lecturer endpoints
    await candidateAgent
      .get('/api/applications/for-review')
      .expect(403);

    await candidateAgent
      .get('/api/lecturer-courses/my-courses')
      .expect(403);
  });

  /**
   * Test: Invalid Application Status Updates
   * Context: Data integrity - only valid status values should be accepted
   * Business Logic: Prevents invalid application states
   */
  it('should reject invalid application status updates', async () => {
    const application = await applicationRepository.save({
      candidate_id: testCandidate.id,
      course_id: testCourse.id,
      session_type: 'tutor',
      status: 'Pending',
      skills: ['JavaScript'],
      availability: 'fulltime'
    });

    // Test invalid status
    const invalidUpdate = await authenticatedAgent
      .put(`/api/applications/${application.id}/status`)
      .send({ status: 'InvalidStatus' })
      .expect(400);

    expect(invalidUpdate.body.success).toBe(false);
    expect(invalidUpdate.body.message).toMatch(/invalid.*status/i);

    // Verify status wasn't changed
    const unchangedApp = await applicationRepository.findOne({
      where: { id: application.id }
    });
    expect(unchangedApp.status).toBe('Pending');
  });
});