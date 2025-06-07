// tests/data-source.test.ts
import "reflect-metadata";
import { DataSource, EntityTarget } from "typeorm";
import * as path from "path";

// Check if we're in a test environment
const isTestEnv = process.env.NODE_ENV === 'test';

// Define dynamic data source
export const AppDataSource = new DataSource({
  type: isTestEnv ? "sqlite" : "mysql",
  database: isTestEnv ? ":memory:" : "S4101562",
  synchronize: true,
  logging: !isTestEnv,
  entities: [path.join(__dirname, "../src/entity/**/*.{ts,js}")],
  ...(isTestEnv
    ? {}
    : {
        host: "209.38.26.237",
        port: 3306,
        username: "S4101562",
        password: "Razor.123", 
        extra: {
          ssl: false,
          connectionLimit: 5,
        },
      }),
});

// Export for use in other files
export { AppDataSource as TestDataSource };

export async function initializeTestDB(): Promise<void> {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      console.log('✅ Test database initialized');
    }
  } catch (error) {
    console.error('❌ Failed to initialize test database:', error);
    throw error;
  }
}

export async function cleanupTestDB(): Promise<void> {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('✅ Test database cleaned up');
    }
  } catch (error) {
    console.error('❌ Failed to cleanup test database:', error);
    throw error;
  }
}

export async function clearTestData(): Promise<void> {
  try {
    if (!AppDataSource.isInitialized) return;

    const entities = AppDataSource.entityMetadatas;
    for (const entity of entities) {
      const repository = AppDataSource.getRepository(entity.target);
      await repository.delete({});
    }

    console.log('✅ Test data cleared');
  } catch (error) {
    console.error('❌ Failed to clear test data:', error);
    throw error;
  }
}
