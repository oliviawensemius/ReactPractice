// backend/src/entity/Lecturer.ts - Keep existing structure, no changes to lecturer_courses
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

    // Relationships - keep exactly as they were
    @OneToOne(() => User, user => user.lecturer)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    // Keep the existing many-to-many relationship with courses
    // This uses the existing lecturer_courses junction table
    @ManyToMany(() => Course, course => course.lecturers)
    @JoinTable({
        name: 'lecturer_courses',
        joinColumn: { name: 'lecturer_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'course_id', referencedColumnName: 'id' }
    })
    courses!: Course[];

    // Helper methods to work with the existing structure
    getCoursesForSemester(semester: string, year: number): Course[] {
        if (!this.courses) return [];
        
        // Filter courses by semester and year
        return this.courses.filter(course => 
            course.semester === semester && 
            course.year === year && 
            course.is_active
        );
    }

    getCurrentCourses(): Course[] {
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        
        let currentSemester = 'Semester 1';
        if (currentMonth >= 7 && currentMonth <= 10) currentSemester = 'Semester 2';
        else if (currentMonth >= 11 || currentMonth === 12) currentSemester = 'Summer';
        else if (currentMonth === 1) currentSemester = 'Winter';
        
        return this.getCoursesForSemester(currentSemester, currentYear);
    }

    getAllActiveCourses(): Course[] {
        if (!this.courses) return [];
        return this.courses.filter(course => course.is_active);
    }
}