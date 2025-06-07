// backend/tests/data-source.test.ts - Updated test database configuration
import { DataSource } from 'typeorm';
import { User } from '../src/entity/User';
import { Course } from '../src/entity/Course';
import { CandidateApplication } from '../src/entity/CandidateApplication';
import { Candidate } from '../src/entity/Candidate';
import { Lecturer } from '../src/entity/Lecturer';
import { Admin } from '../src/entity/Admin';
import { AcademicCredential } from '../src/entity/AcademicCredential';
import { PreviousRole } from '../src/entity/PreviousRole';

/**
 * Test database configuration using SQLite in-memory database
 * This ensures tests don't interfere with the main MySQL database
 * and provides fast, isolated testing environment that matches your actual entities
 */
export const TestDataSource = new DataSource({
  type: 'sqlite',
  database: ':memory:', // In-memory database for testing
  dropSchema: true,
  entities: [
    User, 
    Candidate, 
    Lecturer, 
    Admin,
    Course, 
    CandidateApplication, 
    AcademicCredential, 
    PreviousRole
  ],
  synchronize: true,
  logging: false, // Set to true for debugging SQL queries
  // SQLite-specific settings for better compatibility
  extra: {
    // Enable foreign key constraints in SQLite
    'foreign_keys': 'ON'
  }
});

/**
 * Initialize test database connection
 * Called before all tests to set up the testing environment
 */
export const initializeTestDB = async () => {
  try {
    if (!TestDataSource.isInitialized) {
      await TestDataSource.initialize();
      console.log('✅ Test database initialized successfully');
      
      // Enable foreign key constraints for SQLite
      await TestDataSource.query('PRAGMA foreign_keys = ON');
      
      // Verify all tables were created
      const tables = await TestDataSource.query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );
      console.log(`📊 Created ${tables.length} test tables:`, tables.map(t => t.name).join(', '));
    }
  } catch (error) {
    console.error('❌ Error initializing test database:', error);
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
      console.log('✅ Test database cleaned up successfully');
    }
  } catch (error) {
    console.error('❌ Error cleaning up test database:', error);
  }
};

/**
 * Clear all data from test database
 * Called between tests to ensure clean state
 */
export const clearTestData = async () => {
  if (TestDataSource.isInitialized) {
    // Clear tables in correct order to avoid foreign key constraint violations
    const entities = [
      'candidate_applications',
      'academic_credentials', 
      'previous_roles',
      'lecturer_courses', // Junction table
      'candidates',
      'lecturers',
      'admins',
      'users',
      'courses'
    ];

    for (const entity of entities) {
      try {
        await TestDataSource.query(`DELETE FROM ${entity}`);
      } catch (error) {
        // Table might not exist or be empty - that's okay
        console.log(`Note: Could not clear ${entity} table (this is usually fine)`);
      }
    }
  }
};

// Simple test to verify database configuration
describe('Test Database Configuration', () => {
  it('should be properly configured for testing', () => {
    expect(TestDataSource.options.type).toBe('sqlite');
    expect(TestDataSource.options.database).toBe(':memory:');
    expect(TestDataSource.options.synchronize).toBe(true);
    expect(TestDataSource.options.dropSchema).toBe(true);
  });

  it('should include all required entities', () => {
    const entityNames = TestDataSource.options.entities?.map((entity: any) => {
      // Handle both class constructors and strings
      return typeof entity === 'string' ? entity : entity.name;
    }) || [];

    const requiredEntities = [
      'User', 'Candidate', 'Lecturer', 'Admin', 
      'Course', 'CandidateApplication', 
      'AcademicCredential', 'PreviousRole'
    ];

    requiredEntities.forEach(entityName => {
      expect(entityNames).toContain(entityName);
    });
  });
});