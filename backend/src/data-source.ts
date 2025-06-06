// backend/src/data-source.ts - Updated to include only the modified entities
import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Candidate } from "./entity/Candidate";
import { Lecturer } from "./entity/Lecturer";
import { Admin } from "./entity/Admin";
import { Course } from "./entity/Course";
import { CandidateApplication } from "./entity/CandidateApplication";
import { AcademicCredential } from "./entity/AcademicCredential";
import { PreviousRole } from "./entity/PreviousRole";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: "209.38.26.237",
  port: 3306,
  username: "S4101562",
  password: "Razor.123",
  database: "S4101562",
  // Set to true temporarily to update schema with new fields (blocking fields only)
  synchronize: true,
  logging: true,
  entities: [
    User, 
    Candidate, 
    Lecturer, 
    Admin, 
    Course, 
    CandidateApplication, 
    AcademicCredential, 
    PreviousRole
    // Remove LecturerCourse entity to avoid conflicts with existing lecturer_courses table
  ],
  migrations: [],
  subscribers: [],
  extra: {
    ssl: false,
    connectionLimit: 10,
    acquireTimeout: 60000,
    timeout: 60000,
  }
});