import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Candidate } from "./Candidate";
@Entity()
export class AcademicCredential {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    degree: string;

    @Column()
    institution: string;

    @Column()
    year: number;

    @Column({ type: "float", nullable: true })
    gpa: number;

    @ManyToOne(() => Candidate, candidate => candidate.academicCredentials)
    
    @JoinColumn({ name: "candidate_id" })
    candidate: Candidate;
}