// Updated backend/src/index.ts
import express from "express";
import cors from "cors";
import session from "express-session";
import { AppDataSource } from "./data-source";
import { seedCourses } from "./utils/seedCourses";
import authRoutes from "./routes/auth.routes";
import applicationRoutes from "./routes/application.routes";
import courseRoutes from "./routes/course.routes";
import lecturerCourseRoutes from "./routes/lecturerCourse.routes";
import statisticsRoutes from "./routes/statistics.routes";

// Initialize express app
const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Session setup
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Initialize database connection
AppDataSource.initialize()
    .then(async () => {
        console.log("✓ Database connected successfully!");
        
        // Seed courses
        await seedCourses();
        
        console.log("✓ Database initialization complete!");
    })
    .catch((err) => {
        console.error("❌ Database connection failed:", err);
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lecturer-courses', lecturerCourseRoutes);
app.use('/api/statistics', statisticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'TeachTeam API is running' });
});

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});