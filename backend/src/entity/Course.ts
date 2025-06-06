// backend/src/entity/Course.ts - Fixed semester type to be explicit
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, CreateDateColumn, UpdateDateColumn, Index } from "typeorm";
import { CandidateApplication } from "./CandidateApplication";
import { Lecturer } from "./Lecturer";

export type SemesterType = 'Semester 1' | 'Semester 2' | 'Summer' | 'Winter';

@Entity('courses')
export class Course {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 10 })
    code!: string;

    @Column({ type: 'varchar', length: 200 })
    name!: string;

    // UPDATED: Explicit enum column for semester support
    @Column({ 
        type: 'enum',
        enum: ['Semester 1', 'Semester 2', 'Summer', 'Winter'],
        default: 'Semester 1'
    })
    semester!: 'Semester 1' | 'Semester 2' | 'Summer' | 'Winter';

    @Column({ type: 'int' })
    year!: number;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    // Relationships - keep existing
    @OneToMany(() => CandidateApplication, application => application.course)
    applications!: CandidateApplication[];

    // Keep existing lecturer relationship
    @ManyToMany(() => Lecturer, lecturer => lecturer.courses)
    lecturers!: Lecturer[];

    // Helper methods
    getFullIdentifier(): string {
        return `${this.code} - ${this.name} (${this.semester} ${this.year})`;
    }

    isCurrentlyOffered(): boolean {
        const currentYear = new Date().getFullYear();
        return this.is_active && this.year >= currentYear;
    }
}