import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";
import { CandidateApplication } from "./CandidateApplication";
import { Lecturer } from "./Lecturer";

@Entity()
export class Course {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  code: string;

  @Column()
  name: string;

  @Column()
  semester: string;

  @Column()
  year: number;

  @OneToMany(() => CandidateApplication, application => application.course, { cascade: true })
  applications: CandidateApplication[];

  @ManyToMany(() => Lecturer, lecturer => lecturer.courses)
  lecturers: Lecturer[];
}