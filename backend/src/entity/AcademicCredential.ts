// backend/src/entity/AcademicCredential.ts - Fixed nullable gpa field

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
  gpa?: number; // Made optional with ? to match TypeScript type

  @ManyToOne(() => Candidate, candidate => candidate.academicCredentials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "candidate_id" })
  candidate: Candidate;
}