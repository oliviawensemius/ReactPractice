// tests/data-source.test.ts
import { DataSource } from 'typeorm';
import { User } from '../src/entity/User';
import { Course } from '../src/entity/Course';
import { CandidateApplication } from '../src/entity/CandidateApplication';
import { Candidate } from '../src/entity/Candidate';
import { Lecturer } from '../src/entity/Lecturer';

/**
 * Test database configuration using SQLite in-memory database
 * This ensures tests don't interfere with the main MySQL database
 * and provides fast, isolated testing environment
 */
export const TestDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:', // In-memory database for testing
  dropSchema: true,
  entities: [User, Course, CandidateApplication, Candidate, Lecturer],
  synchronize: true,
  logging: false, // Set to true for debugging
});

/**
 * Initialize test database connection
 * Called before all tests to set up the testing environment
 */
export const initializeTestDB = async () => {
  try {
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
      console.log('Test database initialized successfully');
    }
  } catch (error) {
    console.error('Error initializing test database:', error);
    throw error;
  }
};

/**
 * Clean up test database connection
 * Called after all tests to properly close connections
 */
export const cleanupTestDB = async () => {
  try {
    if (TestDataSource.isInitialized) {
      await TestDataSource.destroy();
      console.log('Test database cleaned up successfully');
    }
  } catch (error) {
    console.error('Error cleaning up test database:', error);
  }
};

// Add a simple test to satisfy Jest requirement
describe('Database Configuration', () => {
  it('should be properly configured for testing', () => {
    expect(TestDataSource.options.type).toBe('sqlite');
    expect(TestDataSource.options.database).toBe(':memory:');
    expect(TestDataSource.options.synchronize).toBe(true);
  });
});