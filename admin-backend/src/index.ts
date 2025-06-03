// admin-backend/src/index.ts
import "reflect-metadata";
import express, { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import cors from 'cors';
import session from 'express-session';
import { AppDataSource } from './data-source';
import { AdminResolver } from './resolvers';

// Extend session data interface
declare module 'express-session' {
  interface SessionData {
    userId?: string;
    user?: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
  }
}

async function startServer() {
  try {
    console.log('🚀 Starting TeachTeam Admin Backend with GraphQL...');
    
    // Initialize database connection
    console.log('📡 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    // Create Express app
    const app: Application = express();

    // Session configuration
    app.use(session({
      secret: process.env.SESSION_SECRET || 'admin-super-secret-key',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }
    }));

    // CORS middleware
    app.use(cors({
      origin: ['http://localhost:3002', 'http://127.0.0.1:3002'], // Admin frontend port
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
    }));

    // Build GraphQL schema
    const schema = await buildSchema({
      resolvers: [AdminResolver],
      validate: false
    });

    // Create Apollo Server
    const server = new ApolloServer({
      schema,
      context: ({ req, res }) => ({
        req,
        res,
        user: req.session?.user
      }),
      introspection: true,
      plugins: []
    });

    await server.start();

    // Apply Apollo GraphQL middleware
    server.applyMiddleware({ 
      app: app as any, 
      path: '/graphql',
      cors: false // We're handling CORS above
    });

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        message: 'TeachTeam Admin API is running',
        timestamp: new Date().toISOString(),
        graphql: server.graphqlPath
      });
    });

    const PORT = process.env.PORT || 4000;

    // Start server
    app.listen(PORT, () => {
      console.log(`🎯 Admin Server running on http://localhost:${PORT}`);
      console.log(`🔍 GraphQL Playground: http://localhost:${PORT}${server.graphqlPath}`);
      console.log('🏗️  Architecture: GraphQL + TypeORM');
      console.log('');
      console.log('📊 Available GraphQL operations:');
      console.log('   - adminLogin(username, password): AuthPayload');
      console.log('   - getAllCourses(): [Course]');
      console.log('   - addCourse(courseData): Course');
      console.log('   - editCourse(id, courseData): Course');
      console.log('   - deleteCourse(id): Boolean');
      console.log('   - getAllLecturers(): [Lecturer]');
      console.log('   - assignLecturerToCourses(input): CourseAssignmentResult');
      console.log('   - toggleCandidateStatus(id): Boolean');
      console.log('   - getCourseApplicationReports(): [CourseReport]');
      console.log('   - getCandidatesWithMultipleCourses(): [CandidateReport]');
      console.log('   - getUnselectedCandidates(): [UnselectedCandidate]');
      console.log('   - getAllCandidates(): [Candidate]');
      console.log('');
      console.log('🔐 Admin login credentials: admin / admin');
    });

  } catch (error) {
    console.error('❌ Failed to start admin server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down admin server gracefully...');
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(0);
});

// Start the server
startServer();