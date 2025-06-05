// admin-backend/src/resolvers/index.ts - Course Operations Section
import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { AppDataSource } from "../data-source";
import { User } from "../../../backend/src/entity/User";
import { Course } from "../../../backend/src/entity/Course";
import { Lecturer } from "../../../backend/src/entity/Lecturer";
import { CandidateApplication } from "../../../backend/src/entity/CandidateApplication";
import { Candidate } from "../../../backend/src/entity/Candidate";
import bcrypt from "bcryptjs";
import { In } from "typeorm";

// Import GraphQL types
import {
  CourseInput,
  LecturerCourseAssignmentInput,
  LecturerMultipleCourseAssignmentInput,
  AuthPayload,
  CourseAssignmentResult,
  CandidateReport,
  UnselectedCandidate,
  CourseType,
  LecturerType,
  CandidateType,
  CandidateApplicationType,
  UserType,
  CourseReportType
} from "../types/graphql-types";

@Resolver()
export class AdminResolver {
  // Authentication - HD Requirement: admin login (admin/admin)
  @Mutation(() => AuthPayload)
  async adminLogin(
    @Arg("username") username: string,
    @Arg("password") password: string
  ): Promise<AuthPayload> {
    try {
      // HD Requirement: Admin must login with credentials (admin, admin)
      if (username === "admin" && password === "admin") {
        return {
          success: true,
          message: "Admin login successful",
          user: {
            id: "admin-001",
            name: "System Administrator",
            email: "admin@teachteam.com",
            role: "admin",
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
          } as UserType
        };
      }

      return {
        success: false,
        message: "Invalid admin credentials. Use admin/admin as specified in HD requirements."
      };
    } catch (error) {
      console.error("Admin login error:", error);
      return {
        success: false,
        message: "Login failed"
      };
    }
  }

  // HD Requirement: Add/Edit/Delete courses available in a semester
  @Query(() => [CourseType])
  async getAllCourses(): Promise<CourseType[]> {
    try {
      console.log("🔍 Fetching all courses from database...");
      const courseRepo = AppDataSource.getRepository(Course);
      
      const courses = await courseRepo.find({ 
        relations: ["lecturers", "lecturers.user"],
        order: { created_at: "DESC" } // Show newest first
      });
      
      console.log(`📚 Found ${courses.length} courses in database`);
      courses.forEach(course => {
        console.log(`  - ${course.code}: ${course.name} (${course.semester} ${course.year}) - Active: ${course.is_active}`);
      });
      
      return courses as CourseType[];
    } catch (error) {
      console.error("❌ Error fetching courses:", error);
      throw new Error("Failed to fetch courses from database");
    }
  }

  @Mutation(() => CourseType)
  async addCourse(@Arg("courseData") courseData: CourseInput): Promise<CourseType> {
    try {
      console.log("📝 Adding new course:", courseData);
      const courseRepo = AppDataSource.getRepository(Course);
      
      // Check if course code already exists for the same semester/year
      const existingCourse = await courseRepo.findOne({ 
        where: { 
          code: courseData.code,
          semester: courseData.semester,
          year: courseData.year,
          is_active: true
        } 
      });
      
      if (existingCourse) {
        console.log("❌ Course already exists:", existingCourse);
        throw new Error(`Course ${courseData.code} already exists for ${courseData.semester} ${courseData.year}`);
      }

      // Validate course code format (should be COSCxxxx)
      const courseCodeRegex = /^COSC\d{4}$/;
      if (!courseCodeRegex.test(courseData.code)) {
        throw new Error("Course code must be in format COSCxxxx (e.g., COSC2758)");
      }

      // Create new course with all required fields
      const newCourse = new Course();
      newCourse.code = courseData.code;
      newCourse.name = courseData.name;
      newCourse.semester = courseData.semester;
      newCourse.year = courseData.year;
      newCourse.is_active = true;
      newCourse.created_at = new Date();
      newCourse.updated_at = new Date();
      
      console.log("💾 Saving course to database:", newCourse);
      
      // Save to database
      const savedCourse = await courseRepo.save(newCourse);
      
      console.log("✅ Course saved successfully:", savedCourse);
      
      // Verify it was saved by fetching it back
      const verificationCourse = await courseRepo.findOne({ 
        where: { id: savedCourse.id },
        relations: ["lecturers", "lecturers.user"]
      });
      
      if (!verificationCourse) {
        throw new Error("Course was not properly saved to database");
      }
      
      console.log("✅ Course verified in database:", verificationCourse);
      return verificationCourse as CourseType;
      
    } catch (error: any) {
      console.error("❌ Error adding course:", error);
      throw new Error(`Failed to add course: ${error.message}`);
    }
  }

  @Mutation(() => CourseType)
  async editCourse(
    @Arg("id") id: string,
    @Arg("courseData") courseData: CourseInput
  ): Promise<CourseType> {
    try {
      console.log("📝 Editing course:", id, courseData);
      const courseRepo = AppDataSource.getRepository(Course);
      
      const course = await courseRepo.findOne({ where: { id } });
      if (!course) {
        throw new Error("Course not found");
      }

      // Validate course code format
      const courseCodeRegex = /^COSC\d{4}$/;
      if (!courseCodeRegex.test(courseData.code)) {
        throw new Error("Course code must be in format COSCxxxx (e.g., COSC2758)");
      }

      // Check if new code conflicts with existing course (excluding current course)
      if (courseData.code !== course.code) {
        const existingCourse = await courseRepo
          .createQueryBuilder("course")
          .where("course.code = :code", { code: courseData.code })
          .andWhere("course.semester = :semester", { semester: courseData.semester })
          .andWhere("course.year = :year", { year: courseData.year })
          .andWhere("course.is_active = :is_active", { is_active: true })
          .andWhere("course.id != :id", { id })
          .getOne();
          
        if (existingCourse) {
          throw new Error(`Course ${courseData.code} already exists for ${courseData.semester} ${courseData.year}`);
        }
      }

      // Update course properties
      course.code = courseData.code;
      course.name = courseData.name;
      course.semester = courseData.semester;
      course.year = courseData.year;
      course.updated_at = new Date();
      
      console.log("💾 Updating course in database:", course);
      const savedCourse = await courseRepo.save(course);
      
      // Fetch updated course with relations
      const updatedCourse = await courseRepo.findOne({
        where: { id: savedCourse.id },
        relations: ["lecturers", "lecturers.user"]
      });
      
      console.log("✅ Course updated successfully:", updatedCourse);
      return updatedCourse as CourseType;
      
    } catch (error: any) {
      console.error("❌ Error editing course:", error);
      throw new Error(`Failed to edit course: ${error.message}`);
    }
  }

  @Mutation(() => Boolean)
  async deleteCourse(@Arg("id") id: string): Promise<boolean> {
    try {
      console.log("🗑️ Deleting course:", id);
      const courseRepo = AppDataSource.getRepository(Course);
      
      const course = await courseRepo.findOne({ where: { id } });
      if (!course) {
        throw new Error("Course not found");
      }

      // Soft delete by setting is_active to false (preserves data integrity)
      course.is_active = false;
      course.updated_at = new Date();
      
      console.log("💾 Soft deleting course:", course);
      await courseRepo.save(course);
      
      console.log("✅ Course soft deleted successfully");
      return true;
      
    } catch (error: any) {
      console.error("❌ Error deleting course:", error);
      throw new Error(`Failed to delete course: ${error.message}`);
    }
  }

  // HD Requirement: Assign lecturer to course(s) for the semester
  @Query(() => [LecturerType])
  async getAllLecturers(): Promise<LecturerType[]> {
    try {
      console.log("🔍 Fetching all lecturers from database...");
      const lecturerRepo = AppDataSource.getRepository(Lecturer);
      
      const lecturers = await lecturerRepo.find({
        relations: ["user", "courses"],
        order: { created_at: "DESC" }
      });
      
      console.log(`👨‍🏫 Found ${lecturers.length} lecturers in database`);
      return lecturers as LecturerType[];
      
    } catch (error) {
      console.error("❌ Error fetching lecturers:", error);
      throw new Error("Failed to fetch lecturers");
    }
  }

  @Mutation(() => CourseAssignmentResult)
  async assignLecturerToCourses(
    @Arg("input") input: LecturerMultipleCourseAssignmentInput
  ): Promise<CourseAssignmentResult> {
    try {
      console.log("📝 Assigning lecturer to courses:", input);
      const lecturerRepo = AppDataSource.getRepository(Lecturer);
      const courseRepo = AppDataSource.getRepository(Course);

      const lecturer = await lecturerRepo.findOne({
        where: { id: input.lecturerId },
        relations: ["courses", "user"]
      });

      if (!lecturer) {
        return {
          success: false,
          message: "Lecturer not found"
        };
      }

      // Get all courses to assign (only active courses)
      const courses = await courseRepo.find({
        where: { 
          id: In(input.courseIds),
          is_active: true 
        }
      });

      if (courses.length !== input.courseIds.length) {
        const foundIds = courses.map(c => c.id);
        const missingIds = input.courseIds.filter(id => !foundIds.includes(id));
        return {
          success: false,
          message: `Some courses not found or inactive: ${missingIds.join(', ')}`
        };
      }

      // Replace lecturer's courses with new selection
      lecturer.courses = courses;
      
      console.log("💾 Saving lecturer course assignments:", lecturer);
      await lecturerRepo.save(lecturer);

      console.log("✅ Lecturer courses assigned successfully");
      return {
        success: true,
        message: `Successfully assigned ${courses.length} course(s) to ${lecturer.user?.name || 'lecturer'}`
      };
      
    } catch (error: any) {
      console.error("❌ Error assigning courses:", error);
      return {
        success: false,
        message: `Failed to assign courses: ${error.message || 'Unknown error'}`
      };
    }
  }

  // HD Requirement: Block/unblock login of a potential candidate
  @Mutation(() => Boolean)
  async toggleCandidateStatus(@Arg("id") id: string): Promise<boolean> {
    try {
      console.log("🔄 Toggling candidate status:", id);
      const candidateRepo = AppDataSource.getRepository(Candidate);
      const userRepo = AppDataSource.getRepository(User);

      const candidate = await candidateRepo.findOne({
        where: { id },
        relations: ["user"]
      });

      if (!candidate) {
        throw new Error("Candidate not found");
      }

      const previousStatus = candidate.user.is_active;
      
      // Toggle the active status (this blocks/unblocks login)
      candidate.user.is_active = !candidate.user.is_active;
      candidate.user.updated_at = new Date();
      
      console.log(`💾 Changing candidate status from ${previousStatus} to ${candidate.user.is_active}`);
      await userRepo.save(candidate.user);

      console.log("✅ Candidate status toggled successfully");
      return true;
      
    } catch (error: any) {
      console.error("❌ Error toggling candidate status:", error);
      throw new Error(`Failed to toggle candidate status: ${error.message}`);
    }
  }

  @Query(() => [CandidateType])
  async getAllCandidates(): Promise<CandidateType[]> {
    try {
      console.log("🔍 Fetching all candidates from database...");
      const candidateRepo = AppDataSource.getRepository(Candidate);
      
      const candidates = await candidateRepo.find({
        relations: ["user"],
        order: { created_at: "DESC" }
      });
      
      console.log(`👨‍🎓 Found ${candidates.length} candidates in database`);
      return candidates as CandidateType[];
      
    } catch (error) {
      console.error("❌ Error fetching candidates:", error);
      throw new Error("Failed to fetch candidates");
    }
  }

  // HD REPORTING REQUIREMENTS
  // HD Requirement: List of candidates chosen for each of the courses
  @Query(() => [CourseReportType])
  async getCourseApplicationReports(): Promise<CourseReportType[]> {
    try {
      console.log("📊 Generating course application reports...");
      const courseRepo = AppDataSource.getRepository(Course);
      const applicationRepo = AppDataSource.getRepository(CandidateApplication);
      
      // Get all active courses
      const courses = await courseRepo.find({
        where: { is_active: true },
        order: { code: "ASC" }
      });

      console.log(`📚 Processing ${courses.length} active courses for reports`);
      const reports: CourseReportType[] = [];

      for (const course of courses) {
        // Get all selected applications for this course
        const selectedApplications = await applicationRepo.find({
          where: { 
            course_id: course.id,
            status: "Selected" as any
          },
          relations: ["candidate", "candidate.user"],
          order: { ranking: "ASC" }
        });

        const selectedCandidates = selectedApplications.map(app => ({
          candidateName: app.candidate.user.name,
          candidateEmail: app.candidate.user.email,
          sessionType: app.session_type,
          ranking: app.ranking || 999
        }));

        reports.push({
          courseCode: course.code,
          courseName: course.name,
          selectedCandidates
        });
        
        console.log(`  - ${course.code}: ${selectedCandidates.length} selected candidates`);
      }

      console.log("✅ Course reports generated successfully");
      return reports;
      
    } catch (error) {
      console.error("❌ Error generating course reports:", error);
      throw new Error("Failed to generate course application reports");
    }
  }

  // HD Requirement: A candidate chosen for more than 3 courses
  @Query(() => [CandidateReport])
  async getCandidatesWithMultipleCourses(): Promise<CandidateReport[]> {
    try {
      console.log("📊 Finding candidates with multiple course selections...");
      const applicationRepo = AppDataSource.getRepository(CandidateApplication);
      
      // Get all selected applications with candidate and course info
      const applications = await applicationRepo
        .createQueryBuilder("app")
        .leftJoinAndSelect("app.candidate", "candidate")
        .leftJoinAndSelect("candidate.user", "user")
        .leftJoinAndSelect("app.course", "course")
        .where("app.status = :status", { status: "Selected" })
        .andWhere("course.is_active = :active", { active: true })
        .getMany();

      // Group by candidate and count courses
      const candidateGroups = new Map<string, {
        candidate: Candidate;
        courses: Course[];
      }>();

      applications.forEach(app => {
        const candidateId = app.candidate.id;
        if (!candidateGroups.has(candidateId)) {
          candidateGroups.set(candidateId, {
            candidate: app.candidate,
            courses: []
          });
        }
        candidateGroups.get(candidateId)!.courses.push(app.course);
      });

      // Filter candidates with MORE THAN 3 courses (as per HD requirement)
      const multipleCoursesCandidates: CandidateReport[] = [];
      candidateGroups.forEach(({ candidate, courses }) => {
        if (courses.length > 3) {
          multipleCoursesCandidates.push({
            id: candidate.id,
            candidateName: candidate.user.name,
            candidateEmail: candidate.user.email,
            courseCount: courses.length,
            courses: courses.map(c => c.code)
          });
          console.log(`  - ${candidate.user.name}: ${courses.length} courses`);
        }
      });

      console.log(`✅ Found ${multipleCoursesCandidates.length} candidates with >3 courses`);
      // Sort by course count (highest first)
      return multipleCoursesCandidates.sort((a, b) => b.courseCount - a.courseCount);
      
    } catch (error) {
      console.error("❌ Error getting candidates with multiple courses:", error);
      throw new Error("Failed to get candidates with multiple courses");
    }
  }

  // HD Requirement: Candidates who have not been chosen for any of the courses
  @Query(() => [UnselectedCandidate])
  async getUnselectedCandidates(): Promise<UnselectedCandidate[]> {
    try {
      console.log("📊 Finding unselected candidates...");
      const candidateRepo = AppDataSource.getRepository(Candidate);

      // Get all candidates with their applications
      const candidates = await candidateRepo.find({
        relations: ["user", "applications", "applications.course"],
        where: { user: { is_active: true } } // Only consider active candidates
      });

      const unselectedCandidates: UnselectedCandidate[] = [];

      for (const candidate of candidates) {
        // Check if candidate has any selected applications
        const hasSelectedApplication = candidate.applications.some(
          app => app.status === "Selected"
        );

        // Only include candidates who applied but were not selected anywhere
        if (!hasSelectedApplication && candidate.applications.length > 0) {
          // Only include applications to active courses
          const activeApplications = candidate.applications.filter(
            app => app.course.is_active
          );

          if (activeApplications.length > 0) {
            unselectedCandidates.push({
              id: candidate.id,
              candidateName: candidate.user.name,
              candidateEmail: candidate.user.email,
              applicationCount: activeApplications.length,
              appliedCourses: activeApplications.map(app => app.course.code)
            });
            console.log(`  - ${candidate.user.name}: ${activeApplications.length} applications, not selected`);
          }
        }
      }

      console.log(`✅ Found ${unselectedCandidates.length} unselected candidates`);
      // Sort by application count (highest first)
      return unselectedCandidates.sort((a, b) => b.applicationCount - a.applicationCount);
      
    } catch (error) {
      console.error("❌ Error getting unselected candidates:", error);
      throw new Error("Failed to get unselected candidates");
    }
  }
}