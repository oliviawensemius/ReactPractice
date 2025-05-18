import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm";
import { Application } from "./Application";

@Entity()
export class SessionType {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string; // e.g., "tutorial", "lab"
    
    @ManyToMany(() => Application, application => application.sessionTypes)
    applications: Application[];
}