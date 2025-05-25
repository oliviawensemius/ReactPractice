// backend/src/utils/seedTestApplications.ts
import { AppDataSource } from "../data-source";
import { User } from "../entity/User";
import { Candidate } from "../entity/Candidate";
import { Course } from "../entity/Course";
import { CandidateApplication } from "../entity/CandidateApplication";

export async function seedTestApplications() {
  try {
    console.log("📝 Seeding test applications...");
    
    const userRepo = AppDataSource.getRepository(User);
    const candidateRepo = AppDataSource.getRepository(Candidate);
    const courseRepo = AppDataSource.getRepository(Course);
    const applicationRepo = AppDataSource.getRepository(CandidateApplication);
    
    // Find the demo candidate
    const candidateUser = await userRepo.findOne({
      where: { email: 'candidate@example.com' },
      relations: ['candidate']
    });
    
    if (!candidateUser || !candidateUser.candidate) {
      console.log("❌ Demo candidate not found");
      return;
    }
    
    // Get first 2 courses
    const courses = await courseRepo.find({
      take: 2,
      where: { is_active: true }
    });
    
    if (courses.length === 0) {
      console.log("❌ No courses found");
      return;
    }
    
    // Create test applications
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      
      // Check if application already exists
      const existingApp = await applicationRepo.findOne({
        where: {
          candidate_id: candidateUser.candidate.id,
          course_id: course.id,
          session_type: i === 0 ? 'tutor' : 'lab_assistant'
        }
      });
      
      if (existingApp) {
        console.log(`- Application already exists for ${course.code}`);
        continue;
      }
      
      const application = applicationRepo.create({
        candidate_id: candidateUser.candidate.id,
        course_id: course.id,
        session_type: i === 0 ? 'tutor' : 'lab_assistant',
        availability: 'parttime',
        skills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
        status: 'Pending'
      });
      
      await applicationRepo.save(application);
      console.log(`✓ Created application for ${course.code} as ${application.session_type}`);
    }
    
    console.log("✅ Test applications seeding completed");
    
  } catch (error) {
    console.error("❌ Error seeding test applications:", error);
    throw error;
  }
}