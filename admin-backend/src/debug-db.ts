// admin-backend/src/debug-db.ts
import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { Course } from "../../backend/src/entity/Course";
import { User } from "../../backend/src/entity/User";
import { Candidate } from "../../backend/src/entity/Candidate";
import { Lecturer } from "../../backend/src/entity/Lecturer";
import { CandidateApplication } from "../../backend/src/entity/CandidateApplication";

async function debugDatabase() {
  try {
    console.log("🔍 Starting database debug script...");
    console.log("📡 Connecting to database...");
    
    await AppDataSource.initialize();
    console.log("✅ Connected to database successfully!");
    
    // Check courses
    console.log("\n📚 COURSES TABLE:");
    const courseRepo = AppDataSource.getRepository(Course);
    const courses = await courseRepo.find({
      order: { created_at: "DESC" }
    });
    
    console.log(`Found ${courses.length} courses:`);
    courses.forEach((course, index) => {
      console.log(`  ${index + 1}. ${course.code} - ${course.name}`);
      console.log(`     Semester: ${course.semester} ${course.year}`);
      console.log(`     Active: ${course.is_active}`);
      console.log(`     Created: ${course.created_at}`);
      console.log(`     ID: ${course.id}`);
      console.log("");
    });
    
    // Check users
    console.log("\n👥 USERS TABLE:");
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.find({
      order: { created_at: "DESC" },
      take: 10 // Limit to 10 most recent
    });
    
    console.log(`Found ${users.length} recent users:`);
    users.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.name} (${user.email})`);
      console.log(`     Role: ${user.role}`);
      console.log(`     Active: ${user.is_active}`);
      console.log(`     Created: ${user.created_at}`);
      console.log("");
    });
    
    // Check candidates
    console.log("\n👨‍🎓 CANDIDATES TABLE:");
    const candidateRepo = AppDataSource.getRepository(Candidate);
    const candidates = await candidateRepo.find({
      relations: ["user"],
      order: { created_at: "DESC" },
      take: 5
    });
    
    console.log(`Found ${candidates.length} recent candidates:`);
    candidates.forEach((candidate, index) => {
      console.log(`  ${index + 1}. ${candidate.user.name} (${candidate.user.email})`);
      console.log(`     Availability: ${candidate.availability}`);
      console.log(`     Skills: ${candidate.skills || 'None listed'}`);
      console.log(`     User Active: ${candidate.user.is_active}`);
      console.log("");
    });
    
    // Check lecturers
    console.log("\n👨‍🏫 LECTURERS TABLE:");
    const lecturerRepo = AppDataSource.getRepository(Lecturer);
    const lecturers = await lecturerRepo.find({
      relations: ["user", "courses"],
      order: { created_at: "DESC" }
    });
    
    console.log(`Found ${lecturers.length} lecturers:`);
    lecturers.forEach((lecturer, index) => {
      console.log(`  ${index + 1}. ${lecturer.user.name} (${lecturer.user.email})`);
      console.log(`     Department: ${lecturer.department || 'Not specified'}`);
      console.log(`     Courses: ${lecturer.courses?.length || 0} assigned`);
      if (lecturer.courses && lecturer.courses.length > 0) {
        lecturer.courses.forEach(course => {
          console.log(`       - ${course.code}: ${course.name}`);
        });
      }
      console.log("");
    });
    
    // Check applications
    console.log("\n📝 CANDIDATE APPLICATIONS TABLE:");
    const applicationRepo = AppDataSource.getRepository(CandidateApplication);
    const applications = await applicationRepo.find({
      relations: ["candidate", "candidate.user", "course"],
      order: { created_at: "DESC" },
      take: 10
    });
    
    console.log(`Found ${applications.length} recent applications:`);
    applications.forEach((app, index) => {
      console.log(`  ${index + 1}. ${app.candidate.user.name} -> ${app.course.code}`);
      console.log(`     Session Type: ${app.session_type}`);
      console.log(`     Status: ${app.status}`);
      console.log(`     Ranking: ${app.ranking || 'Not ranked'}`);
      console.log(`     Created: ${app.created_at}`);
      console.log("");
    });
    
    // Database statistics
    console.log("\n📊 DATABASE STATISTICS:");
    const totalUsers = await userRepo.count();
    const activeUsers = await userRepo.count({ where: { is_active: true } });
    const totalCourses = await courseRepo.count();
    const activeCourses = await courseRepo.count({ where: { is_active: true } });
    const totalCandidates = await candidateRepo.count();
    const totalLecturers = await lecturerRepo.count();
    const totalApplications = await applicationRepo.count();
    const selectedApplications = await applicationRepo.count({ where: { status: "Selected" } });
    
    console.log(`📊 Users: ${totalUsers} total, ${activeUsers} active`);
    console.log(`📚 Courses: ${totalCourses} total, ${activeCourses} active`);
    console.log(`👨‍🎓 Candidates: ${totalCandidates}`);
    console.log(`👨‍🏫 Lecturers: ${totalLecturers}`);
    console.log(`📝 Applications: ${totalApplications} total, ${selectedApplications} selected`);
    
    // Test course creation manually
    console.log("\n🧪 TESTING COURSE CREATION:");
    const testCourse = new Course();
    testCourse.code = "COSC9999";
    testCourse.name = "Debug Test Course";
    testCourse.semester = "Semester 1";
    testCourse.year = 2025;
    testCourse.is_active = true;
    testCourse.created_at = new Date();
    testCourse.updated_at = new Date();
    
    console.log("Creating test course:", testCourse);
    
    const savedTestCourse = await courseRepo.save(testCourse);
    console.log("✅ Test course saved:", savedTestCourse);
    
    // Verify it exists
    const verifyTestCourse = await courseRepo.findOne({ where: { id: savedTestCourse.id } });
    console.log("✅ Test course verified:", verifyTestCourse);
    
    // Clean up test course
    if (verifyTestCourse) {
      await courseRepo.remove(verifyTestCourse);
      console.log("🧹 Test course cleaned up");
    }
    
  } catch (error) {
    console.error("❌ Database debug error:", error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log("📡 Database connection closed");
    }
  }
}

// Run the debug script
debugDatabase();