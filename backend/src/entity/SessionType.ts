import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { CandidateApplication } from "./CandidateApplication";

@Entity()
export class SessionType {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string; // e.g., "tutorial", "lab"
    
    @ManyToMany(() => CandidateApplication, application => application.sessionTypes)
    applications: CandidateApplication[];
}