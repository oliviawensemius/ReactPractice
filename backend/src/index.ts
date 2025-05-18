import express from "express";
import cors from "cors";
import session from "express-session";
import { AppDataSource } from "./data-source";
import authRoutes from "./routes/auth.routes";
import applicationRoutes from "./routes/application.routes";
// TODO: Add course routes when created

// Initialize express app
const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Your frontend URL
    credentials: true
}));
app.use(express.json());

// Session setup
app.use(session({
    secret: 'your-secret-key', // Use a strong secret
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 1 day
    }
}));

// Initialize database connection
AppDataSource.initialize()
    .then(() => {
        console.log("Data Source has been initialized!");
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
// app.use('/api/courses', courseRoutes); // TODO: Add when created

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});