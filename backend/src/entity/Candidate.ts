// backend/src/entity/Candidate.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { CandidateApplication } from "./CandidateApplication";
import { AcademicCredential } from "./AcademicCredential";
import { PreviousRole } from "./PreviousRole";

export type AvailabilityType = 'fulltime' | 'parttime';

@Entity('candidates')
export class Candidate {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('uuid')
    user_id!: string;

    @Column({ 
        type: 'enum',
        enum: ['fulltime', 'parttime'],
        default: 'parttime'
    })
    availability!: AvailabilityType;

    @Column({ type: 'json', nullable: true })
    skills?: string[];

    @CreateDateColumn()
    created_at!: Date;

    // Relationships
    @OneToOne(() => User, user => user.candidate)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @OneToMany(() => CandidateApplication, application => application.candidate)
    applications!: CandidateApplication[];

    @OneToMany(() => AcademicCredential, credential => credential.candidate)
    academic_credentials!: AcademicCredential[];

    @OneToMany(() => PreviousRole, role => role.candidate)
    previous_roles!: PreviousRole[];
}