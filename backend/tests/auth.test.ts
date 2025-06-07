// backend/tests/auth.test.ts - Updated to match actual MVC implementation
import request from 'supertest';
import app from '../src/index';
import { TestDataSource } from './data-source.utils';
import { User } from '../src/entity/User';
import { Candidate } from '../src/entity/Candidate';
import { Lecturer } from '../src/entity/Lecturer';
import bcrypt from 'bcryptjs';

/**
 * Test Suite: Authentication Endpoints
 * 
 * Context: Tests the core authentication functionality for TeachTeam application
 * covering sign-up, sign-in, and logout features as required in Assignment 2 PA section.
 * These tests ensure that user authentication works correctly with the MySQL database
 * and validates both frontend and backend validation requirements.
 * 
 * Business Logic: Authentication is critical for TeachTeam as it needs to support
 * three user types (candidates, lecturers, admin) with proper access control.
 */

describe('Authentication Endpoints', () => {
  let userRepository: any;
  let candidateRepository: any;
  let lecturerRepository: any;

  beforeEach(async () => {
    // Initialize repositories for test data setup
    userRepository = TestDataSource.getRepository(User);
    candidateRepository = TestDataSource.getRepository(Candidate);
    lecturerRepository = TestDataSource.getRepository(Lecturer);
  });

  /**
   * Test: User Registration (Sign-up)
   * Context: PA requirement - users must be stored in MySQL database with hashed passwords
   * Business Logic: New candidates need to register before applying for tutor positions
   */
  it('should register a new candidate successfully with proper validation', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'john.doe@student.rmit.edu.au',
      password: 'SecurePass123!', // Meets strong password requirements
      role: 'candidate'
    };

    const response = await request(app)
      .post('/api/auth/signup') // Correct endpoint from your routes
      .send(newUser)
      .expect(201);

    // Verify response structure matches Assignment 2 requirements
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message', 'User created successfully');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe(newUser.email);
    expect(response.body.user.name).toBe(newUser.name);
    expect(response.body.user.role).toBe('candidate');
    expect(response.body.user).not.toHaveProperty('password'); // No password in response

    // Verify user was actually created in database (not just mocked)
    const savedUser = await userRepository.findOne({ 
      where: { email: newUser.email } 
    });
    expect(savedUser).toBeTruthy();
    expect(savedUser.name).toBe(newUser.name);
    expect(savedUser.is_active).toBe(true);
    expect(savedUser.is_blocked).toBe(false);
    
    // Verify password is hashed (PA requirement for security)
    expect(savedUser.password).not.toBe(newUser.password);
    expect(savedUser.password.length).toBeGreaterThan(50); // Bcrypt hash length
    
    // Verify password can be verified with bcrypt
    const isPasswordValid = await bcrypt.compare(newUser.password, savedUser.password);
    expect(isPasswordValid).toBe(true);

    // Verify candidate profile was created automatically
    const candidateProfile = await candidateRepository.findOne({
      where: { user_id: savedUser.id }
    });
    expect(candidateProfile).toBeTruthy();
    expect(candidateProfile.availability).toBe('parttime'); // Default value
    expect(candidateProfile.skills).toEqual([]); // Default empty array
  });

  /**
   * Test: Lecturer Registration
   * Context: PA requirement - system must support lecturer accounts
   * Business Logic: Lecturers need accounts to review applications
   */
  it('should register a new lecturer successfully', async () => {
    const newLecturer = {
      name: 'Dr. Jane Smith',
      email: 'jane.smith@rmit.edu.au',
      password: 'LecturerPass123!',
      role: 'lecturer'
    };

    const response = await request(app)
      .post('/api/auth/signup')
      .send(newLecturer)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.user.role).toBe('lecturer');

    // Verify lecturer profile was created
    const savedUser = await userRepository.findOne({ 
      where: { email: newLecturer.email } 
    });
    
    const lecturerProfile = await lecturerRepository.findOne({
      where: { user_id: savedUser.id }
    });
    expect(lecturerProfile).toBeTruthy();
    expect(lecturerProfile.department).toBe('School of Computer Science'); // Default value
  });

  /**
   * Test: User Authentication (Sign-in) with Session Management
   * Context: PA requirement - login must use backend validation and show welcome message
   * Business Logic: Users need to authenticate to access their specific features
   */
  it('should authenticate user with session and return welcome message', async () => {
    // Setup: Create a test user first with hashed password
    const hashedPassword = await bcrypt.hash('LecturerPass456!', 12);
    const testUser = await userRepository.save({
      name: 'Jane Smith',
      email: 'jane.smith@rmit.edu.au',
      password: hashedPassword,
      role: 'lecturer',
      is_active: true,
      is_blocked: false
    });

    // Create lecturer profile
    await lecturerRepository.save({
      user_id: testUser.id,
      department: 'Computer Science'
    });

    // Test: Login with correct credentials
    const agent = request.agent(app); // Use agent to maintain session
    const loginResponse = await agent
      .post('/api/auth/signin') // Correct endpoint
      .send({
        email: testUser.email,
        password: 'LecturerPass456!'
      })
      .expect(200);

    // Verify authentication response matches PA requirements
    expect(loginResponse.body).toHaveProperty('success', true);
    expect(loginResponse.body).toHaveProperty('message', 'Login successful');
    expect(loginResponse.body).toHaveProperty('user');
    expect(loginResponse.body.user.email).toBe(testUser.email);
    expect(loginResponse.body.user.name).toBe(testUser.name);
    expect(loginResponse.body.user.role).toBe(testUser.role);
    expect(loginResponse.body.user).toHaveProperty('roleSpecificId');
    
    // Verify session is created (no JWT token in your implementation)
    expect(loginResponse.headers['set-cookie']).toBeTruthy();

    // Test authenticated endpoint access
    const profileResponse = await agent
      .get('/api/auth/profile')
      .expect(200);

    expect(profileResponse.body.success).toBe(true);
    expect(profileResponse.body.user.email).toBe(testUser.email);
  });

  /**
   * Test: Authentication Status Check
   * Context: Frontend needs to check if user is still authenticated
   * Business Logic: Session persistence across page reloads
   */
  it('should check authentication status correctly', async () => {
    // Test unauthenticated state
    const unauthResponse = await request(app)
      .get('/api/auth/check')
      .expect(200);

    expect(unauthResponse.body.success).toBe(true);
    expect(unauthResponse.body.authenticated).toBe(false);
    expect(unauthResponse.body.user).toBeNull();
  });

  /**
   * Test: Invalid Authentication Attempts
   * Context: Security requirement - system must handle invalid login attempts properly
   * Business Logic: Protects against unauthorized access and brute force attacks
   */
  it('should reject invalid login credentials with proper error handling', async () => {
    // Test with non-existent user
    const invalidLogin1 = await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'nonexistent@rmit.edu.au',
        password: 'wrongpassword'
      })
      .expect(401);

    expect(invalidLogin1.body).toHaveProperty('success', false);
    expect(invalidLogin1.body).toHaveProperty('message', 'Invalid email or password');
    expect(invalidLogin1.body).not.toHaveProperty('user');

    // Create user for wrong password test
    const hashedPassword = await bcrypt.hash('CorrectPass123!', 12);
    await userRepository.save({
      name: 'Test User',
      email: 'test@rmit.edu.au',
      password: hashedPassword,
      role: 'candidate',
      is_active: true,
      is_blocked: false
    });

    // Test with wrong password
    const invalidLogin2 = await request(app)
      .post('/api/auth/signin')
      .send({
        email: 'test@rmit.edu.au',
        password: 'WrongPassword123!'
      })
      .expect(401);

    expect(invalidLogin2.body.success).toBe(false);
    expect(invalidLogin2.body.message).toBe('Invalid email or password');
  });

  /**
   * Test: Blocked User Cannot Login (PA Requirement)
   * Context: Admin functionality - system must support blocking candidates
   * Business Logic: Security feature to prevent access for problem users
   */
  it('should prevent blocked users from logging in', async () => {
    // Create blocked user
    const hashedPassword = await bcrypt.hash('BlockedUser123!', 12);
    const blockedUser = await userRepository.save({
      name: 'Blocked User',
      email: 'blocked@rmit.edu.au',
      password: hashedPassword,
      role: 'candidate',
      is_active: true,
      is_blocked: true,
      blocked_reason: 'Inappropriate behavior',
      blocked_by: 'admin',
      blocked_at: new Date()
    });

    const response = await request(app)
      .post('/api/auth/signin')
      .send({
        email: blockedUser.email,
        password: 'BlockedUser123!'
      })
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain('blocked');
    expect(response.body.message).toContain('Inappropriate behavior');
  });

  /**
   * Test: Strong Password Validation (PA Requirement)
   * Context: PA requirement - strong password validation must be implemented
   * Business Logic: Security requirement for user account protection
   */
  it('should validate strong password requirements', async () => {
    const weakPasswords = [
      'weak', // Too short
      'weakpassword', // No numbers, no uppercase
      'Weakpassword', // No numbers
      'weakpassword123', // No uppercase
      'WEAKPASSWORD123', // No lowercase
      '12345678' // No letters
    ];

    for (const weakPassword of weakPasswords) {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: `test${Date.now()}@rmit.edu.au`,
          password: weakPassword,
          role: 'candidate'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toMatch(/password/i);
    }
  });

  /**
   * Test: Logout Functionality
   * Context: PA requirement - logout link must be present and functional
   * Business Logic: Users need to securely end their sessions
   */
  it('should logout user and clear session', async () => {
    // Create and login user
    const hashedPassword = await bcrypt.hash('TestPass123!', 12);
    const testUser = await userRepository.save({
      name: 'Test User',
      email: 'testlogout@rmit.edu.au',
      password: hashedPassword,
      role: 'candidate',
      is_active: true
    });

    const agent = request.agent(app);
    
    // Login
    await agent
      .post('/api/auth/signin')
      .send({
        email: testUser.email,
        password: 'TestPass123!'
      })
      .expect(200);

    // Verify authenticated
    await agent
      .get('/api/auth/profile')
      .expect(200);

    // Logout
    const logoutResponse = await agent
      .post('/api/auth/logout')
      .expect(200);

    expect(logoutResponse.body.success).toBe(true);
    expect(logoutResponse.body.message).toBe('Logged out successfully');

    // Verify session cleared
    await agent
      .get('/api/auth/profile')
      .expect(401);
  });
});