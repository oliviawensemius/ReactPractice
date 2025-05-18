// Course entity
// - id (primary key)
// - code (string, e.g., 'COSC2758')
// - name (string, e.g., 'Full Stack Development')
// - semester (string, e.g., 'Semester 1')
// - year (number, e.g., 2025)

import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany } from "typeorm";
import { Application } from "./Application";
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

    @OneToMany(() => Application, application => application.course)
    applications: Application[];

    @ManyToMany(() => Lecturer, lecturer => lecturer.courses)
    lecturers: Lecturer[];
}