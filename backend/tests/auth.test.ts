// tests/auth.test.ts
import request from 'supertest';
import app from '../src/index';
import { TestDataSource } from './data-source.test';
import { User } from '../src/entity/User';
import { Candidate } from '../src/entity/Candidate';

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

  beforeEach(async () => {
    // Initialize repositories for test data setup
    userRepository = TestDataSource.getRepository(User);
    candidateRepository = TestDataSource.getRepository(Candidate);
  });

  /**
   * Test: User Registration (Sign-up)
   * Context: PA requirement - users must be stored in MySQL database
   * Business Logic: New candidates need to register before applying for tutor positions
   */
  it('should register a new candidate successfully', async () => {
    const newUser = {
      name: 'John Doe',
      email: 'john.doe@student.rmit.edu.au',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      role: 'candidate'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(newUser)
      .expect(201);

    // Verify response structure matches Assignment 2 requirements
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe(newUser.email);
    expect(response.body.user.name).toBe(newUser.name);
    expect(response.body.user.role).toBe('candidate');

    // Verify user was actually created in database (not just mocked)
    const savedUser = await userRepository.findOne({ 
      where: { email: newUser.email } 
    });
    expect(savedUser).toBeTruthy();
    expect(savedUser.name).toBe(newUser.name);
    // Verify password is hashed (PA requirement)
    expect(savedUser.password).not.toBe(newUser.password);

    // Verify candidate profile was created
    const candidateProfile = await candidateRepository.findOne({
      where: { user: { id: savedUser.id } }
    });
    expect(candidateProfile).toBeTruthy();
  });

  /**
   * Test: User Authentication (Sign-in)
   * Context: PA requirement - login must use backend validation and show welcome message
   * Business Logic: Users need to authenticate to access their specific features
   */
  it('should authenticate user and return welcome message', async () => {
    // Setup: Create a test user first
    const testUser = {
      name: 'Jane Smith',
      email: 'jane.smith@lecturer.rmit.edu.au',
      password: 'LecturerPass456!',
      role: 'lecturer'
    };

    // Register the user first
    await request(app)
      .post('/api/auth/register')
      .send({
        ...testUser,
        confirmPassword: testUser.password
      });

    // Test: Login with correct credentials
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      })
      .expect(200);

    // Verify authentication response matches PA requirements
    expect(loginResponse.body).toHaveProperty('success', true);
    expect(loginResponse.body).toHaveProperty('user');
    expect(loginResponse.body.user.email).toBe(testUser.email);
    expect(loginResponse.body.user.name).toBe(testUser.name);
    expect(loginResponse.body.user.role).toBe(testUser.role);
    
    // Verify welcome message format as specified in PA requirements
    expect(loginResponse.body).toHaveProperty('message');
    expect(loginResponse.body.message).toContain('Welcome');
    expect(loginResponse.body.message).toContain(testUser.name);

    // Verify JWT token or session is provided for subsequent requests
    expect(
      loginResponse.body.token || loginResponse.headers['set-cookie']
    ).toBeTruthy();
  });

  /**
   * Test: Invalid Authentication Attempts
   * Context: Security requirement - system must handle invalid login attempts properly
   * Business Logic: Protects against unauthorized access to tutor application system
   */
  it('should reject invalid login credentials with proper error', async () => {
    const invalidLogin = {
      email: 'nonexistent@rmit.edu.au',
      password: 'wrongpassword'
    };

    const response = await request(app)
      .post('/api/auth/login')
      .send(invalidLogin)
      .expect(401);

    // Verify error response follows consistent format
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toMatch(/invalid|incorrect|not found/i);
    
    // Ensure no sensitive information is leaked
    expect(response.body).not.toHaveProperty('user');
    expect(response.body).not.toHaveProperty('token');
  });
});