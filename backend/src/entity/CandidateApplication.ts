// backend/src/entity/CandidateApplication.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Candidate } from "./Candidate";
import { Course } from "./Course";

export type SessionType = 'tutor' | 'lab_assistant';
export type ApplicationStatus = 'Pending' | 'Selected' | 'Rejected';
export type AvailabilityType = 'fulltime' | 'parttime';

@Entity('candidate_applications')
export class CandidateApplication {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('uuid')
    candidate_id!: string;

    @Column('uuid')
    course_id!: string;

    @Column({ 
        type: 'enum',
        enum: ['tutor', 'lab_assistant']
    })
    session_type!: SessionType;

    @Column({ 
        type: 'enum',
        enum: ['fulltime', 'parttime']
    })
    availability!: AvailabilityType;

    @Column({ type: 'json' })
    skills!: string[];

    @Column({ 
        type: 'enum',
        enum: ['Pending', 'Selected', 'Rejected'],
        default: 'Pending'
    })
    status!: ApplicationStatus;

    @Column({ type: 'int', nullable: true })
    ranking?: number;

    @Column({ type: 'json', nullable: true })
    comments?: string[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    // Relationships
    @ManyToOne(() => Candidate, candidate => candidate.applications)
    @JoinColumn({ name: 'candidate_id' })
    candidate!: Candidate;

    @ManyToOne(() => Course, course => course.applications)
    @JoinColumn({ name: 'course_id' })
    course!: Course;
}