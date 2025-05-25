// backend/src/entity/Lecturer.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToMany, JoinTable, CreateDateColumn } from "typeorm";
import { User } from "./User";
import { Course } from "./Course";

@Entity('lecturers')
export class Lecturer {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column('uuid')
    user_id!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    department?: string;

    @CreateDateColumn()
    created_at!: Date;

    // Relationships
    @OneToOne(() => User, user => user.lecturer)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToMany(() => Course, course => course.lecturers)
    @JoinTable({
        name: 'lecturer_courses',
        joinColumn: { name: 'lecturer_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'course_id', referencedColumnName: 'id' }
    })
    courses!: Course[];
}