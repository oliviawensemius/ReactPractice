// backend/src/index.ts
import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { AppDataSource } from './data-source';
import { seedCourses } from './utils/seedCourses';
import { seedDemoUsers } from './utils/seedDemoUsers';
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
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

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'TeachTeam API is running',
    timestamp: new Date().toISOString()
  });
});

// Basic test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend is working!',
    database: AppDataSource.isInitialized ? 'Connected' : 'Not Connected'
  });
});

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting TeachTeam Backend Server...');
    
    // Initialize database connection
    console.log('📡 Connecting to database...');
    await AppDataSource.initialize();
    console.log('✅ Database connection established');
    
    // Seed initial data
    console.log('🌱 Seeding initial data...');
    await seedCourses();
    await seedDemoUsers();
    console.log('✅ Data seeding completed');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🎯 Server running on http://localhost:${PORT}`);
      console.log('📊 Available endpoints:');
      console.log(`   - Health Check: http://localhost:${PORT}/api/health`);
      console.log(`   - Test: http://localhost:${PORT}/api/test`);
      console.log(`   - Auth Routes: http://localhost:${PORT}/api/auth/*`);
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