// backend/src/entity/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from "typeorm";
import { Candidate } from "./Candidate";
import { Lecturer } from "./Lecturer";
import { Admin } from "./Admin";

export type UserRole = 'candidate' | 'lecturer' | 'admin';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 100 })
    name!: string;

    @Column({ type: 'varchar', length: 150, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 255 })
    password!: string;

    @Column({ 
        type: 'enum',
        enum: ['candidate', 'lecturer', 'admin'],
        default: 'candidate'
    })
    role!: UserRole;

    @Column({ type: 'boolean', default: true })
    is_active!: boolean;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    // Relationships - one user can be one type of role
    @OneToOne(() => Candidate, candidate => candidate.user, { cascade: true })
    candidate?: Candidate;

    @OneToOne(() => Lecturer, lecturer => lecturer.user, { cascade: true })
    lecturer?: Lecturer;

    @OneToOne(() => Admin, admin => admin.user, { cascade: true })
    admin?: Admin;
}