// Admin entity extends User
// Admins have special privileges:
// - Assigning lecturers to courses
// - Adding/editing/removing courses
// - Managing user accounts

import { Entity } from "typeorm";
import { User } from "./User";

@Entity()
export class Admin extends User {
// Admin-specific fields can be added here
//Add as we go along ***********
// TO DO: Add admin-specific fields if needed
}