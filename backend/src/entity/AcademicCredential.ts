// backend/src/entity/AcademicCredential.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Candidate } from "./Candidate";

@Entity('academic_credentials')
export class AcademicCredential {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('uuid')
    candidate_id!: string;

    @Column({ type: 'varchar', length: 200 })
    degree!: string;

    @Column({ type: 'varchar', length: 200 })
    institution!: string;

    @Column({ type: 'int' })
    year!: number;

    @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
    gpa?: number;

    @CreateDateColumn()
    created_at!: Date;

    // Relationships
    @ManyToOne(() => Candidate, candidate => candidate.academic_credentials)
    @JoinColumn({ name: 'candidate_id' })
    candidate!: Candidate;
}