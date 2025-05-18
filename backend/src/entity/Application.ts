import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { Candidate } from "./Candidate";
import { Course } from "./Course";
import { SessionType } from "./SessionType";

export enum ApplicationStatus {
  PENDING = "Pending",
  SELECTED = "Selected",
  REJECTED = "Rejected"
}

@Entity()
export class Application {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Candidate, (candidate) => candidate.applications)
  @JoinColumn({ name: "candidate_id" })
  candidate: Candidate;

  @ManyToOne(() => Course, (course) => course.applications)
  @JoinColumn({ name: "course_id" })
  course: Course;

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

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;

  @ManyToMany(() => SessionType)
  @JoinTable({
    name: "application_session_types",
    joinColumn: { name: "application_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "session_type_id", referencedColumnName: "id" }
  })
  sessionTypes: SessionType[];
}