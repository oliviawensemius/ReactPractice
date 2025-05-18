import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { Candidate } from "./Candidate";
@Entity()
export class PreviousRole {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    position: string;

    @Column()
    organisation: string;

    @Column()
    startDate: string;

    @Column({ nullable: true })
    endDate: string;

    @Column({ nullable: true })
    description: string;

    @ManyToOne(() => Candidate, candidate => candidate.previousRoles)

    @JoinColumn({ name: "candidate_id" })
    candidate: Candidate;
    }