// backend/src/utils/seedCourses.ts
import { AppDataSource } from "../data-source";
import { Course } from "../entity/Course";

// Import the courses from your frontend data
const coursesData = [
  { code: 'COSC2801', name: 'Programming bootcamp 1', semester: 'Semester 1', year: 2025 },
  { code: 'COSC2803', name: 'Programming studio 1', semester: 'Semester 1', year: 2025 },
  { code: 'COSC2802', name: 'Programming bootcamp 2', semester: 'Semester 1', year: 2025 },
  { code: 'COSC2804', name: 'Programming studio 2', semester: 'Semester 1', year: 2025 },
  { code: 'COSC1107', name: 'Computing theory', semester: 'Semester 1', year: 2025 },
  { code: 'COSC1076', name: 'Advanced programming techniques', semester: 'Semester 1', year: 2025 },
  { code: 'COSC2299', name: 'Software engineering: process and tools', semester: 'Semester 1', year: 2025 },
  { code: 'COSC2123', name: 'Algorithms and analysis', semester: 'Semester 1', year: 2025 },
  { code: 'COSC1114', name: 'Operating systems principles', semester: 'Semester 1', year: 2025 },
  { code: 'COSC1147', name: 'Professional computing practice', semester: 'Semester 1', year: 2025 },
  { code: 'COSC1127', name: 'Artificial intelligence', semester: 'Semester 1', year: 2025 },
  { code: 'COSC2626', name: 'Cloud computing', semester: 'Semester 1', year: 2025 },
  { code: 'COSC2408', name: 'Programming project 1', semester: 'Semester 1', year: 2025 },
  { code: 'COSC2409', name: 'Programming project 2', semester: 'Semester 1', year: 2025 },
  { code: 'COSC1204', name: 'Agent-oriented programming and design', semester: 'Semester 1', year: 2025 },
  { code: 'COSC1111', name: 'Data communication and net-centric computing', semester: 'Semester 1', year: 2025 },
  { code: 'COSC2406', name: 'Database systems', semester: 'Semester 1', year: 2025 },
  { code: 'COSC2972', name: 'Deep learning', semester: 'Semester 1', year: 2025 },
  { code: 'COSC2758', name: 'Full stack development', semester: 'Semester 1', year: 2025 },
  { code: 'COSC2738', name: 'Practical data science', semester: 'Semester 1', year: 2025 }
];

export async function seedCourses() {
  try {
    console.log("Seeding courses...");
    const courseRepo = AppDataSource.getRepository(Course);
    
    for (const courseData of coursesData) {
      const existingCourse = await courseRepo.findOne({ 
        where: { code: courseData.code } 
      });
      
      if (!existingCourse) {
        const course = courseRepo.create(courseData);
        await courseRepo.save(course);
        console.log(`✓ Created course: ${courseData.code} - ${courseData.name}`);
      } else {
        console.log(`- Course already exists: ${courseData.code}`);
      }
    }
    
    console.log("Courses seeding completed!");
  } catch (error) {
    console.error("Error seeding courses:", error);
    throw error;
  }
}