// backend/src/entity/Course.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { CandidateApplication } from "./CandidateApplication";
import { Lecturer } from "./Lecturer";

@Entity('courses')
export class Course {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 10, unique: true })
    code!: string;

    @Column({ type: 'varchar', length: 200 })
    name!: string;

    @Column({ type: 'varchar', length: 50 })
    semester!: string;

    @Column({ type: 'int' })
    year!: number;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    // Relationships
    @OneToMany(() => CandidateApplication, application => application.course)
    applications!: CandidateApplication[];

    @ManyToMany(() => Lecturer, lecturer => lecturer.courses)
    lecturers!: Lecturer[];
}