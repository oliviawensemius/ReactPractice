// backend/src/index.ts - Clean final version
import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { AppDataSource } from './data-source';
import { seedCourses } from './utils/seedCourses';
import { seedDemoUsers } from './utils/seedDemoUsers';
import { seedLecturerCourses } from './utils/seedLecturerCourses';
import { seedTestApplications } from './utils/seedTestApplications';

// Import routes (which now use controllers)
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import applicationRoutes from './routes/applications';
import lecturerCourseRoutes from './routes/lecturer-courses';

import { attachUser } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'teachteam-super-secret-key-change-in-production',
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
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Attach user to requests (for authenticated routes)
app.use(attachUser);

// API Routes (using MVC pattern with controllers)
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/lecturer-courses', lecturerCourseRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'TeachTeam API is running',
    timestamp: new Date().toISOString(),
    architecture: 'MVC Pattern (Models, Views, Controllers)'
  });
});

// Basic test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    database: AppDataSource.isInitialized ? 'Connected' : 'Not Connected',
    architecture: {
      pattern: 'MVC',
      layers: {
        routes: 'Handle HTTP requests and routing',
        controllers: 'Handle request/response logic and business logic',
        entities: 'Handle data models and database operations',
        middleware: 'Handle authentication and validation'
      }
    }
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting TeachTeam Backend Server with MVC Architecture...');
    
    // Initialize database connection
    console.log('📡 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    
    // Seed initial data
    console.log('🌱 Seeding initial data...');
    await seedCourses();
    await seedDemoUsers();
    await seedLecturerCourses();
    await seedTestApplications();
    console.log('✅ Data seeding completed');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🎯 Server running on http://localhost:${PORT}`);
      console.log('🏗️  Architecture: MVC Pattern');
      console.log('   📁 Controllers: Handle request/response logic & business logic');
      console.log('   🗄️  Models/Entities: Handle data operations');
      console.log('   🛡️  Middleware: Handle auth & validation');
      console.log('   🔧 Utils: Handle validation & utilities');
      console.log('');
      console.log('📊 Available endpoints:');
      console.log(`   - Health Check: http://localhost:${PORT}/api/health`);
      console.log(`   - Test: http://localhost:${PORT}/api/test`);
      console.log(`   - Auth Routes: http://localhost:${PORT}/api/auth/*`);
      console.log(`   - Course Routes: http://localhost:${PORT}/api/courses/*`);
      console.log(`   - Application Routes: http://localhost:${PORT}/api/applications/*`);
      console.log(`   - Lecturer-Course Routes: http://localhost:${PORT}/api/lecturer-courses/*`);
      console.log('🔐 Demo accounts available:');
      console.log('   - Lecturer: lecturer@example.com / Password123');
      console.log('   - Candidate: candidate@example.com / Password123');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 Shutting down gracefully...');
  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
  process.exit(0);
});

// Start the server
startServer();