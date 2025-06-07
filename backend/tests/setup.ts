// tests/setup.ts
import { initializeTestDB, cleanupTestDB, TestDataSource } from './data-source.test';

// Setup before all tests
beforeAll(async () => {
  await initializeTestDB();
});

// Cleanup after all tests
afterAll(async () => {
  await cleanupTestDB();
});

// Clean database between tests
beforeEach(async () => {
  // Clear all tables for clean test state
  const entities = TestDataSource.entityMetadatas;
  for (const entity of entities) {
    const repository = TestDataSource.getRepository(entity.name);
    await repository.clear();
  }
});