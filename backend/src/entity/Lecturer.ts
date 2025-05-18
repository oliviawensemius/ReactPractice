// Lecturer entity extends User
// Additional fields:
// - courses (many-to-many relation to Course)
// Lecturers can be assigned to multiple courses

import { ChildEntity, ManyToMany, JoinTable } from "typeorm";
import { User } from "./User";
import { Course } from "./Course";

@ChildEntity("lecturer")
export class Lecturer extends User {
  @ManyToMany(() => Course, course => course.lecturers, { cascade: true })
  @JoinTable({
    name: "lecturer_courses",
    joinColumn: { name: "lecturer_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "course_id", referencedColumnName: "id" }
  })
  courses: Course[];
}