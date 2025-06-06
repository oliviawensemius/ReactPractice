// backend/src/entity/Lecturer.ts - Final fix for lecturer-course relationship
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

    // Fixed Many-to-many relationship with explicit junction table
    @ManyToMany(() => Course, course => course.lecturers, {
        cascade: false,
        eager: false
    })
    @JoinTable({
        name: 'lecturer_courses',
        joinColumn: { 
            name: 'lecturer_id', 
            referencedColumnName: 'id' 
        },
        inverseJoinColumn: { 
            name: 'course_id', 
            referencedColumnName: 'id' 
        }
    })
    courses!: Course[];

    // Helper methods
    getCoursesForSemester(semester: string, year: number): Course[] {
        if (!this.courses) return [];
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

    // Check if lecturer is assigned to a specific course
    hasCoursesAssigned(): boolean {
        return this.courses && this.courses.length > 0;
    }

    // Get course count
    getCourseCount(): number {
        return this.courses ? this.courses.length : 0;
    }

    // Get active course count
    getActiveCourseCount(): number {
        return this.getAllActiveCourses().length;
    }
}