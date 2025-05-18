import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Candidate } from "./Candidate";
import { Course } from "./Course";

export enum ApplicationStatus {
  PENDING = "pending",
  SELECTED = "selected", 
  REJECTED = "rejected"
}

export enum SessionType {
  TUTOR = "tutor",
  LAB_ASSISTANT = "lab_assistant"
}

@Entity('candidate_application')
export class CandidateApplication {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Candidate, (candidate) => candidate.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "candidate_id" })
  candidate: Candidate;

  @ManyToOne(() => Course, (course) => course.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: "course_id" })
  course: Course;

  @Column({
    type: "enum",
    enum: SessionType
  })
  sessionType: SessionType;

  @Column({
    type: "enum",
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING
  })
  status: ApplicationStatus;

  @Column("simple-array", { nullable: true })
  comments: string[];

  @Column({ nullable: true })
  ranking: number;

  @CreateDateColumn()
  createdAt: Date;
}