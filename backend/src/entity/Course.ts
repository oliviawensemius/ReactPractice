// Course entity
// - id (primary key)
// - code (string, e.g., 'COSC2758')
// - name (string, e.g., 'Full Stack Development')
// - semester (string, e.g., 'Semester 1')
// - year (number, e.g., 2025)
// Course entity
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";
import { CandidateApplication } from "./CandidateApplication";
import { Lecturer } from "./Lecturer";

@Entity()
export class Course {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    code: string;

    @Column()
    name: string;

    @Column()
    semester: string;

    @Column()
    year: number;

    @OneToMany(() => CandidateApplication, application => application.course)
    applications: CandidateApplication[];

    @ManyToMany(() => Lecturer, lecturer => lecturer.courses)
    lecturers: Lecturer[];
}