// backend/src/utils/seedLecturerCourses.ts
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Lecturer } from "../entity/Lecturer";
import { Course } from "../entity/Course";

export async function seedLecturerCourses() {
  try {
    console.log("🎓 Seeding lecturer-course assignments...");
    
    const userRepo = AppDataSource.getRepository(User);
    const lecturerRepo = AppDataSource.getRepository(Lecturer);
    const courseRepo = AppDataSource.getRepository(Course);
    
    // Find the demo lecturer
    const lecturerUser = await userRepo.findOne({
      where: { email: 'lecturer@example.com' },
      relations: ['lecturer']
    });
    
    if (!lecturerUser) {
      console.log("❌ Demo lecturer not found");
      return;
    }
    
    if (!lecturerUser.lecturer) {
      console.log("❌ Lecturer profile not found");
      return;
    }
    
    // Get the lecturer with courses relation
    const lecturer = await lecturerRepo.findOne({
      where: { id: lecturerUser.lecturer.id },
      relations: ['courses']
    });
    
    if (!lecturer) {
      console.log("❌ Lecturer entity not found");
      return;
    }
    
    // Get first 3 courses
    const courses = await courseRepo.find({
      take: 3,
      where: { is_active: true }
    });
    
    if (courses.length === 0) {
      console.log("❌ No courses found");
      return;
    }
    
    // Clear existing assignments
    lecturer.courses = [];
    
    // Assign courses
    for (const course of courses) {
      lecturer.courses.push(course);
      console.log(`✓ Assigned ${lecturerUser.name} to ${course.code} - ${course.name}`);
    }
    
    await lecturerRepo.save(lecturer);
    
    console.log(`✅ Successfully assigned lecturer to ${courses.length} courses`);
    
  } catch (error) {
    console.error("❌ Error seeding lecturer courses:", error);
    throw error;
  }
}