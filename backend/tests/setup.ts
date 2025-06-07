// backend/tests/setup.ts - Updated test setup configuration
import { initializeTestDB, cleanupTestDB, clearTestData, TestDataSource } from './data-source.test';

/**
 * Global test setup configuration
 * This file configures Jest testing environment for the TeachTeam backend
 * following Assignment 2 requirements for comprehensive testing
 */

// Increase timeout for integration tests that involve multiple database operations
jest.setTimeout(30000);

// Setup before all tests run
beforeAll(async () => {
  console.log('🚀 Starting TeachTeam test suite...');
  console.log('📋 Assignment 2 Requirements Testing:');
  console.log('   - PA: Authentication, Applications, Validation');
  console.log('   - CR: Lecturer Features, Filtering, Comments');
  console.log('   - DI: Rankings, Visual Data, Advanced Features');
  console.log('');
  
  try {
    await initializeTestDB();
    console.log('✅ Test environment ready');
  } catch (error) {
    console.error('❌ Failed to initialize test environment:', error);
    process.exit(1);
  }
});

// Cleanup after all tests complete
afterAll(async () => {
  console.log('');
  console.log('🧹 Cleaning up test environment...');
  
  try {
    await cleanupTestDB();
    console.log('✅ Test cleanup completed');
    console.log('🎉 All TeachTeam tests completed successfully!');
  } catch (error) {
    console.error('❌ Error during test cleanup:', error);
  }
});

// Clear database between each test for isolation
beforeEach(async () => {
  try {
    await clearTestData();
  } catch (error) {
    console.error('Warning: Could not clear test data:', error);
    // Don't fail the test for cleanup issues
  }
});

// Handle unhandled promise rejections in tests
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process during tests, just log the error
});

// Handle uncaught exceptions in tests  
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Don't exit the process during tests, just log the error
});

// Mock console methods for cleaner test output if needed
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

// Optionally suppress some console output during tests
// Uncomment these lines if you want quieter test output
/*
beforeAll(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
*/

// Global test utilities that can be used across test files
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidUUID(): R;
      toBeValidEmail(): R;
      toBeValidCourseCode(): R;
    }
  }
}

// Custom Jest matchers for TeachTeam-specific validations
expect.extend({
  toBeValidUUID(received: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    const pass = uuidRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid UUID`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid UUID`,
        pass: false,
      };
    }
  },

  toBeValidEmail(received: string) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    const pass = emailRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid email`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid email`,
        pass: false,
      };
    }
  },

  toBeValidCourseCode(received: string) {
    const courseCodeRegex = /^COSC\d{4}$/;
    const pass = courseCodeRegex.test(received);
    
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid course code`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid RMIT course code (COSCxxxx)`,
        pass: false,
      };
    }
  },
});

// Export test utilities for use in test files
export const testUtils = {
  /**
   * Create a valid test user data object
   */
  createTestUser: (overrides: any = {}) => ({
    name: 'Test User',
    email: 'test@student.rmit.edu.au',
    password: 'TestPass123!',
    role: 'candidate',
    ...overrides
  }),

  /**
   * Create a valid test course data object
   */
  createTestCourse: (overrides: any = {}) => ({
    code: 'COSC2758',
    name: 'Full Stack Development',
    semester: 'Semester 1',
    year: 2025,
    is_active: true,
    ...overrides
  }),

  /**
   * Create a valid test application data object
   */
  createTestApplication: (courseId: string, overrides: any = {}) => ({
    course_id: courseId,
    session_type: 'tutor',
    skills: ['JavaScript', 'React'],
    availability: 'fulltime',
    academic_credentials: [],
    previous_roles: [],
    ...overrides
  }),

  /**
   * Wait for a specified amount of time (useful for testing timeouts)
   */
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Get test database connection for direct queries if needed
   */
  getTestConnection: () => TestDataSource
};