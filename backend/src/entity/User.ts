// backend/src/entity/User.ts - Fixed with undefined instead of null for nullable fields
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

    // NEW: Add blocking functionality
    @Column({ type: 'boolean', default: false })
    is_blocked!: boolean;

    // NEW: Optional reason for blocking
    @Column({ type: 'text', nullable: true })
    blocked_reason?: string;

    // NEW: Who blocked the user (for audit trail)
    @Column({ type: 'varchar', length: 255, nullable: true })
    blocked_by?: string;

    // NEW: When was the user blocked
    @Column({ type: 'timestamp', nullable: true })
    blocked_at?: Date;

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

    // Relationships - unchanged
    @OneToOne(() => Candidate, candidate => candidate.user, { cascade: true })
    candidate?: Candidate;

    @OneToOne(() => Lecturer, lecturer => lecturer.user, { cascade: true })
    lecturer?: Lecturer;

    @OneToOne(() => Admin, admin => admin.user, { cascade: true })
    admin?: Admin;

    // Helper method to check if user can login
    isAllowedToLogin(): boolean {
        return this.is_active && !this.is_blocked;
    }
}