// backend/src/utils/seedData.ts
import { AppDataSource } from "../data-source";
import { Course } from "../entity/Course";
import { Lecturer } from "../entity/Lecturer";
import { UserRole } from "../entity/User";
import * as bcrypt from "bcrypt";

export async function seedDatabase() {
    try {
        

        // Create courses
        const courseRepo = AppDataSource.getRepository(Course);
        const coursesData = [
            { code: 'COSC2801', name: 'Programming bootcamp 1', semester: 'Semester 1', year: 2025 },
            { code: 'COSC2803', name: 'Programming studio 1', semester: 'Semester 1', year: 2025 },
            { code: 'COSC2802', name: 'Programming bootcamp 2', semester: 'Semester 1', year: 2025 },
            { code: 'COSC2804', name: 'Programming studio 2', semester: 'Semester 1', year: 2025 },
            { code: 'COSC1107', name: 'Computing theory', semester: 'Semester 1', year: 2025 },
            { code: 'COSC2758', name: 'Full stack development', semester: 'Semester 1', year: 2025 },
        ];

        for (const courseData of coursesData) {
            const existing = await courseRepo.findOne({ where: { code: courseData.code } });
            if (!existing) {
                const course = courseRepo.create(courseData);
                await courseRepo.save(course);
            }
        }

        // Create demo lecturer
        const lecturerRepo = AppDataSource.getRepository(Lecturer);
        const demoLecturer = await lecturerRepo.findOne({ where: { email: 'lecturer@example.com' } });
        
        if (!demoLecturer) {
            const hashedPassword = await bcrypt.hash('Password123', 10);
            const lecturer = lecturerRepo.create({
                name: 'Demo Lecturer',
                email: 'lecturer@example.com',
                password: hashedPassword,
                role: UserRole.LECTURER,
                courses: []
            });
            
            // Assign first 3 courses to the lecturer
            const courses = await courseRepo.find({ take: 3 });
            lecturer.courses = courses;
            
            await lecturerRepo.save(lecturer);
        }

        console.log('Database seeded successfully!');
    } catch (error) {
        console.error('Error seeding database:', error);
    }
}