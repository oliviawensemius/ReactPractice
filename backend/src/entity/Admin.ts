// Admin entity extends User
// Admins have special privileges:
// - Assigning lecturers to courses
// - Adding/editing/removing courses
// - Managing user accounts

import { ChildEntity } from "typeorm";
import { User } from "./User";

@ChildEntity("admin")
export class Admin extends User {
  // Admin-specific fields can be added here in the future
}