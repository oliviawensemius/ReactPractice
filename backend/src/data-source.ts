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
  // synchronize: true will automatically create database tables based on entity definitions
  // and update them when entity definitions change. This is useful during development
  // but should be disabled in production to prevent accidental data loss.
  synchronize: true,
  logging: true,
  entities: [User, Course, Candidate, Lecturer, Admin, CandidateApplication, AcademicCredential, PreviousRole],
  migrations: [],
  subscribers: [],
});