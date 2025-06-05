// admin-backend/src/data-source.ts
import "reflect-metadata";
import { DataSource } from "typeorm";
// Import entities from main backend - reuse existing entities
import { User } from "../../backend/src/entity/User";
import { Candidate } from "../../backend/src/entity/Candidate";
import { Lecturer } from "../../backend/src/entity/Lecturer";
import { Admin } from "../../backend/src/entity/Admin";
import { Course } from "../../backend/src/entity/Course";
import { CandidateApplication } from "../../backend/src/entity/CandidateApplication";
import { AcademicCredential } from "../../backend/src/entity/AcademicCredential";
import { PreviousRole } from "../../backend/src/entity/PreviousRole";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "209.38.26.237",
  port: 3306,
  username: "S4101562", // Your database username
  password: "Razor.123", // Your database password
  database: "S4101562", // Your database name
  synchronize: false, // Set to false since main backend handles schema
  logging: ["error", "warn"], // Only log errors and warnings in production
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
  migrations: [],
  subscribers: [],
  extra: {
    ssl: false,
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
    // Additional MySQL configuration for better stability
    reconnect: true,
    idleTimeout: 300000,
    charset: 'utf8mb4'
  },
  // Connection pool settings for admin backend
  maxQueryExecutionTime: 30000,
  cache: false // Disable caching for admin operations
});