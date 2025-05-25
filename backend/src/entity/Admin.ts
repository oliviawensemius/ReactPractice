// backend/src/entity/Admin.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { User } from "./User";

@Entity('admins')
export class Admin {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('uuid')
    user_id!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    department?: string;

    @CreateDateColumn()
    created_at!: Date;

    // Relationships
    @OneToOne(() => User, user => user.admin)
    @JoinColumn({ name: 'user_id' })
    user!: User;
}