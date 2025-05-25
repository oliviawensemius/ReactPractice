// backend/src/entity/PreviousRole.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Candidate } from "./Candidate";

@Entity('previous_roles')
export class PreviousRole {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('uuid')
    candidate_id!: string;

    @Column({ type: 'varchar', length: 200 })
    position!: string;

    @Column({ type: 'varchar', length: 200 })
    organisation!: string;

    @Column({ type: 'date' })
    start_date!: Date;

    @Column({ type: 'date', nullable: true })
    end_date?: Date;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @CreateDateColumn()
    created_at!: Date;

    // Relationships
    @ManyToOne(() => Candidate, candidate => candidate.previous_roles)
    @JoinColumn({ name: 'candidate_id' })
    candidate!: Candidate;
}