// tests/setup.ts - Test setup configuration
import { initializeTestDB, cleanupTestDB, clearTestData, TestDataSource } from './data-source.utils';

// Global test setup
beforeAll(async () => {
  console.log('🚀 Setting up test environment...');
  
  try {
    // Initialize database connection for tests
    await initializeTestDB();
    console.log('✅ Test database connection established');
    
    // Optionally clear existing test data
    await clearTestData();
    console.log('✅ Test data cleared');
    
  } catch (error) {
    console.error('❌ Failed to setup test environment:', error);
    throw error;
  }
});

// Global test teardown
afterAll(async () => {
  console.log('🧹 Cleaning up test environment...');
  
  try {
    // Clear test data after all tests
    await clearTestData();
    console.log('✅ Test data cleared');
    
    // Close database connection
    await cleanupTestDB();
    console.log('✅ Test database connection closed');
    
  } catch (error) {
    console.error('❌ Failed to cleanup test environment:', error);
  }
});

// Increase test timeout for database operations
jest.setTimeout(30000);

// Configure test environment
process.env.NODE_ENV = 'test';

export { TestDataSource, initializeTestDB, cleanupTestDB, clearTestData };