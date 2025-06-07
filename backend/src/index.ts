// backend/src/index.ts
import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { AppDataSource } from './data-source';

import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import applicationRoutes from './routes/applications';
import lecturerCourseRoutes from './routes/lecturer-courses';
import lecturerSearchRoutes from './routes/lecturerSearch';

import { attachUser } from './middleware/auth';

const app = express();
const PORT = process.env.PORT || 3001;

// CRITICAL: Trust proxy for session cookies
app.set('trust proxy', 1);

// STEP 1: CORS MUST BE FIRST - BEFORE SESSION
app.use(cors({
  origin: function (origin, callback) {
    // Allow all localhost/development origins
    if (!origin || 
        origin.includes('localhost') || 
        origin.includes('127.0.0.1') ||
        origin.includes('::1')) {
      return callback(null, true);
    }
    callback(null, false);
  },
  credentials: true, // ABSOLUTELY CRITICAL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With', 
    'Content-Type', 
    'Accept',
    'Authorization',
    'Cookie',
    'Set-Cookie'
  ],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 200
}));

// STEP 2: Handle preflight requests
app.options('*', cors());

// STEP 3: Body parsing BEFORE session
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// STEP 4: SESSION CONFIGURATION - THE ULTIMATE FIX
app.use(session({
  secret: 'teachteam-assignment2-ultimate-secret-key-2025-very-secure',
  name: 'connect.sid',
  resave: false,
  saveUninitialized: false,
  rolling: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'lax',
    domain: undefined,
    path: '/'
  }
}));

// STEP 5: Session debugging middleware (only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    if (req.path.includes('/auth') || req.path.includes('/lecturer-courses')) {
      console.log('🔍', new Date().toISOString(), '-', req.method, req.path);
      console.log('🍪 Session Details:', {
        sessionID: req.sessionID,
        userId: req.session?.userId || 'none',
        userRole: req.session?.user?.role || 'none',
        cookieHeader: req.headers.cookie || 'none',
        sessionExists: !!req.session
      });
    }
    next();
  });
}

// STEP 6: User attachment
app.use(attachUser);

// STEP 7: Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/lecturer-courses', lecturerCourseRoutes);
app.use('/api/lecturer-search', lecturerSearchRoutes);

// STEP 8: Debug endpoints
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'TeachTeam Backend - ULTIMATE SESSION FIX',
    timestamp: new Date().toISOString(),
    session: {
      id: req.sessionID,
      authenticated: !!req.session?.userId,
      userId: req.session?.userId || null,
      userRole: req.session?.user?.role || null,
      cookie: req.session?.cookie
    },
    request: {
      cookies: req.headers.cookie,
      origin: req.headers.origin
    }
  });
});

app.get('/api/debug/session', (req, res) => {
  res.json({
    sessionID: req.sessionID,
    session: req.session,
    cookies: req.headers.cookie,
    authenticated: !!req.session?.userId
  });
});

app.post('/api/debug/create-session', (req, res) => {
  console.log('🧪 Creating test session...');
  
  req.session.userId = 'test-lecturer-123';
  req.session.user = {
    id: 'test-lecturer-123',
    email: 'lecturer@example.com',
    name: 'Test Lecturer',
    role: 'lecturer'
  };
  
  console.log('✅ Test session created:', req.sessionID);
  
  res.json({
    success: true,
    message: 'Test session created',
    sessionID: req.sessionID,
    session: {
      userId: req.session.userId,
      user: req.session.user
    }
  });
});

// Initialize and start server
async function startServer() {
  try {
    // Skip server startup messages in test mode
    if (process.env.NODE_ENV !== 'test') {
      console.log('🚀 Starting TeachTeam Backend - ULTIMATE SESSION FIX...');
    }
    
    await AppDataSource.initialize();
    
    // Only start listening if not in test mode
    if (process.env.NODE_ENV !== 'test') {
      app.listen(PORT, () => {
        console.log('');
        console.log('🎯 TeachTeam Backend Server - ULTIMATE SESSION FIX');
        console.log(`📍 URL: http://localhost:${PORT}`);
        console.log('🍪 Session Configuration: FIXED');
        console.log('');
        console.log('🧪 Test Endpoints:');
        console.log(`   Health: http://localhost:${PORT}/api/health`);
        console.log(`   Debug: http://localhost:${PORT}/api/debug/session`);
        console.log(`   Create Session: POST http://localhost:${PORT}/api/debug/create-session`);
        console.log('');
        console.log('🔐 Demo Accounts:');
        console.log('   lecturer@example.com / Password123');
        console.log('   candidate@example.com / Password123');
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

// Export app for testing (HD requirement)
export default app;