// admin-backend/src/resolvers/index.ts - Fixed TypeScript issues
import { Resolver, Query, Mutation, Arg } from "type-graphql";
import { AppDataSource } from "../data-source";
import { User } from "../../../backend/src/entity/User";
import { Course } from "../../../backend/src/entity/Course";
import { Lecturer } from "../../../backend/src/entity/Lecturer";
import { CandidateApplication } from "../../../backend/src/entity/CandidateApplication";
import { Candidate } from "../../../backend/src/entity/Candidate";
import { In } from "typeorm";

// Import GraphQL types
import {
  CourseInput,
  LecturerMultipleCourseAssignmentInput,
  AuthPayload,
  CourseAssignmentResult,
  CandidateReport,
  UnselectedCandidate,
  CourseType,
  LecturerType,
  CandidateType,
  UserType,
  CourseReportType,
  BlockCandidateInput,
  CandidateWithCoursesType
} from "../types/graphql-types";

@Resolver()
export class AdminResolver {
  // Authentication
  @Mutation(() => AuthPayload)
  async adminLogin(
    @Arg("username") username: string,
    @Arg("password") password: string
  ): Promise<AuthPayload> {
    try {
      if (username === "admin" && password === "admin") {
        return {
          success: true,
          message: "Login successful",
          user: {
            id: "admin-001",
            name: "System Administrator",
            email: "admin@teachteam.com",
            role: "admin",
            is_active: true,
            is_blocked: false,
            created_at: new Date(),
            updated_at: new Date()
          } as UserType
        };
      }

      return {
        success: false,
        message: "Invalid credentials"
      };
    } catch (error) {
      console.error("Admin login error:", error);
      return {
        success: false,
        message: "Login failed"
      };
    }
  }

  // Course Management - Fixed TypeScript issues
  @Query(() => [CourseType])
  async getAllCourses(): Promise<CourseType[]> {
    try {
      const courseRepo = AppDataSource.getRepository(Course);
      const courses = await courseRepo.find({ 
        relations: ["lecturers", "lecturers.user"],
        order: { year: "DESC", semester: "ASC", code: "ASC" }
      });
      
      console.log(`📚 Found ${courses.length} courses`);
      return courses as CourseType[];
    } catch (error) {
      console.error("Error fetching courses:", error);
      throw new Error("Failed to fetch courses");
    }
  }

  @Mutation(() => CourseType)
  async addCourse(@Arg("courseData") courseData: CourseInput): Promise<CourseType> {
    try {
      const courseRepo = AppDataSource.getRepository(Course);
      
      // Check if course already exists for this semester and year
      const existingCourse = await courseRepo.findOne({ 
        where: { 
          code: courseData.code,
          semester: courseData.semester as any, // Cast to satisfy TypeScript
          year: courseData.year
        } 
      });
      
      if (existingCourse) {
        throw new Error(`Course ${courseData.code} already exists for ${courseData.semester} ${courseData.year}`);
      }

      // Validate course code format
      const courseCodeRegex = /^COSC\d{4}$/;
      if (!courseCodeRegex.test(courseData.code)) {
        throw new Error("Course code must be in format COSCxxxx (e.g., COSC2758)");
      }

      // Create course with proper typing
      const course = courseRepo.create({
        code: courseData.code,
        name: courseData.name,
        semester: courseData.semester as any, // Cast to satisfy TypeScript
        year: courseData.year,
        is_active: true
      });
      
      const savedCourse = await courseRepo.save(course);
      console.log(`✅ Created course: ${savedCourse.code} - ${savedCourse.name}`);
      return savedCourse as CourseType;
    } catch (error: any) {
      console.error("Error adding course:", error);
      throw new Error(`Failed to add course: ${error.message}`);
    }
  }

  @Mutation(() => CourseType)
  async editCourse(
    @Arg("id") id: string,
    @Arg("courseData") courseData: CourseInput
  ): Promise<CourseType> {
    try {
      const courseRepo = AppDataSource.getRepository(Course);
      
      const course = await courseRepo.findOne({ where: { id } });
      if (!course) {
        throw new Error("Course not found");
      }

      // Check for conflicts if changing course details
      if (courseData.code !== course.code || 
          courseData.semester !== course.semester || 
          courseData.year !== course.year) {
        const existingCourse = await courseRepo.findOne({ 
          where: { 
            code: courseData.code,
            semester: courseData.semester as any, // Cast to satisfy TypeScript
            year: courseData.year
          } 
        });
        if (existingCourse && existingCourse.id !== id) {
          throw new Error(`Course ${courseData.code} already exists for ${courseData.semester} ${courseData.year}`);
        }
      }

      // Update course properties
      course.code = courseData.code;
      course.name = courseData.name;
      course.semester = courseData.semester as any; // Cast to satisfy TypeScript
      course.year = courseData.year;

      const savedCourse = await courseRepo.save(course);
      console.log(`✅ Updated course: ${savedCourse.code}`);
      return savedCourse as CourseType;
    } catch (error: any) {
      console.error("Error editing course:", error);
      throw new Error(`Failed to edit course: ${error.message}`);
    }
  }

  @Mutation(() => Boolean)
  async deleteCourse(@Arg("id") id: string): Promise<boolean> {
    try {
      const courseRepo = AppDataSource.getRepository(Course);
      
      const course = await courseRepo.findOne({ where: { id } });
      if (!course) {
        throw new Error("Course not found");
      }

      // Soft delete
      course.is_active = false;
      await courseRepo.save(course);
      
      console.log(`✅ Soft deleted course: ${course.code}`);
      return true;
    } catch (error: any) {
      console.error("Error deleting course:", error);
      throw new Error(`Failed to delete course: ${error.message}`);
    }
  }

  // Lecturer Management - Using existing lecturer_courses table
  @Query(() => [LecturerType])
  async getAllLecturers(): Promise<LecturerType[]> {
    try {
      const lecturerRepo = AppDataSource.getRepository(Lecturer);
      const lecturers = await lecturerRepo.find({
        relations: ["user", "courses"]
      });
      
      console.log(`👨‍🏫 Found ${lecturers.length} lecturers`);
      return lecturers as LecturerType[];
    } catch (error) {
      console.error("Error fetching lecturers:", error);
      throw new Error("Failed to fetch lecturers");
    }
  }

  @Mutation(() => CourseAssignmentResult)
  async assignLecturerToCourses(
    @Arg("input") input: LecturerMultipleCourseAssignmentInput
  ): Promise<CourseAssignmentResult> {
    try {
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

      // Get courses to assign (only active courses)
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
      await lecturerRepo.save(lecturer);

      console.log(`✅ Assigned ${courses.length} courses to ${lecturer.user?.name || 'lecturer'}`);
      return {
        success: true,
        message: `Successfully assigned ${courses.length} course(s) to ${lecturer.user?.name || 'lecturer'}`
      };
    } catch (error: any) {
      console.error("Error assigning courses:", error);
      return {
        success: false,
        message: `Failed to assign courses: ${error.message || 'Unknown error'}`
      };
    }
  }

  // Enhanced User Management with proper blocking - Fixed TypeScript issues
  @Mutation(() => Boolean)
  async blockCandidate(@Arg("input") input: BlockCandidateInput): Promise<boolean> {
    try {
      const userRepo = AppDataSource.getRepository(User);
      const candidateRepo = AppDataSource.getRepository(Candidate);

      const candidate = await candidateRepo.findOne({
        where: { id: input.candidateId },
        relations: ["user"]
      });

      if (!candidate) {
        throw new Error("Candidate not found");
      }

      // Update blocking status - Fixed type issues
      candidate.user.is_blocked = input.isBlocked;
      candidate.user.blocked_reason = input.reason || undefined; // Use undefined instead of null
      candidate.user.blocked_by = "admin";
      candidate.user.blocked_at = input.isBlocked ? new Date() : undefined; // Use undefined instead of null

      await userRepo.save(candidate.user);
      
      const action = input.isBlocked ? 'blocked' : 'unblocked';
      console.log(`✅ ${action} candidate: ${candidate.user.name}`);
      return true;
    } catch (error: any) {
      console.error("Error blocking candidate:", error);
      throw new Error(`Failed to block candidate: ${error.message}`);
    }
  }

  @Mutation(() => Boolean)
  async toggleCandidateStatus(@Arg("id") id: string): Promise<boolean> {
    try {
      const candidateRepo = AppDataSource.getRepository(Candidate);
      const userRepo = AppDataSource.getRepository(User);

      const candidate = await candidateRepo.findOne({
        where: { id },
        relations: ["user"]
      });

      if (!candidate) {
        throw new Error("Candidate not found");
      }

      // Toggle the blocked status - Fixed type issues
      const newBlockedStatus = !candidate.user.is_blocked;
      candidate.user.is_blocked = newBlockedStatus;
      candidate.user.blocked_by = "admin";
      candidate.user.blocked_at = newBlockedStatus ? new Date() : undefined; // Use undefined instead of null
      
      if (!newBlockedStatus) {
        candidate.user.blocked_reason = undefined; // Use undefined instead of null
      } else {
        candidate.user.blocked_reason = "Blocked by administrator";
      }

      await userRepo.save(candidate.user);
      
      const action = newBlockedStatus ? 'blocked' : 'unblocked';
      console.log(`✅ ${action} candidate: ${candidate.user.name}`);
      return true;
    } catch (error: any) {
      console.error("Error toggling candidate status:", error);
      throw new Error(`Failed to toggle candidate status: ${error.message}`);
    }
  }

  // Enhanced candidate query with course information
  @Query(() => [CandidateWithCoursesType])
  async getAllCandidatesWithCourses(): Promise<CandidateWithCoursesType[]> {
    try {
      const candidateRepo = AppDataSource.getRepository(Candidate);
      const candidates = await candidateRepo.find({
        relations: [
          "user", 
          "applications", 
          "applications.course"
        ],
        order: { created_at: "DESC" }
      });

      console.log(`👨‍🎓 Found ${candidates.length} candidates with course information`);

      return candidates.map(candidate => {
        const selectedApplications = candidate.applications?.filter(app => app.status === 'Selected') || [];
        
        return {
          id: candidate.id,
          user: candidate.user,
          availability: candidate.availability,
          skills: candidate.skills || [],
          created_at: candidate.created_at,
          selectedCourses: selectedApplications.map(app => ({
            courseCode: app.course.code,
            courseName: app.course.name,
            semester: app.course.semester,
            year: app.course.year,
            role: app.session_type,
            ranking: app.ranking
          })),
          totalApplications: candidate.applications?.length || 0,
          selectedApplicationsCount: selectedApplications.length
        } as CandidateWithCoursesType;
      });
    } catch (error) {
      console.error("Error fetching candidates with courses:", error);
      throw new Error("Failed to fetch candidates with course information");
    }
  }

  // Keep legacy method for backward compatibility
  @Query(() => [CandidateType])
  async getAllCandidates(): Promise<CandidateType[]> {
    try {
      const candidateRepo = AppDataSource.getRepository(Candidate);
      const candidates = await candidateRepo.find({
        relations: ["user"],
        order: { created_at: "DESC" }
      });
      return candidates as CandidateType[];
    } catch (error) {
      console.error("Error fetching candidates:", error);
      throw new Error("Failed to fetch candidates");
    }
  }

  // Reports - HD Requirements
  @Query(() => [CourseReportType])
  async getCourseApplicationReports(): Promise<CourseReportType[]> {
    try {
      console.log("📊 Generating course application reports...");
      const courseRepo = AppDataSource.getRepository(Course);
      const applicationRepo = AppDataSource.getRepository(CandidateApplication);
      
      const courses = await courseRepo.find({
        where: { is_active: true },
        order: { code: "ASC" }
      });

      const reports: CourseReportType[] = [];

      for (const course of courses) {
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
      }

      console.log("✅ Course reports generated successfully");
      return reports;
      
    } catch (error) {
      console.error("❌ Error generating course reports:", error);
      throw new Error("Failed to generate course application reports");
    }
  }

  @Query(() => [CandidateReport])
  async getCandidatesWithMultipleCourses(): Promise<CandidateReport[]> {
    try {
      console.log("📊 Finding candidates with multiple course selections...");
      const applicationRepo = AppDataSource.getRepository(CandidateApplication);
      
      const applications = await applicationRepo
        .createQueryBuilder("app")
        .leftJoinAndSelect("app.candidate", "candidate")
        .leftJoinAndSelect("candidate.user", "user")
        .leftJoinAndSelect("app.course", "course")
        .where("app.status = :status", { status: "Selected" })
        .andWhere("course.is_active = :active", { active: true })
        .getMany();

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
        }
      });

      return multipleCoursesCandidates.sort((a, b) => b.courseCount - a.courseCount);
      
    } catch (error) {
      console.error("❌ Error getting candidates with multiple courses:", error);
      throw new Error("Failed to get candidates with multiple courses");
    }
  }

  @Query(() => [UnselectedCandidate])
  async getUnselectedCandidates(): Promise<UnselectedCandidate[]> {
    try {
      console.log("📊 Finding unselected candidates...");
      const candidateRepo = AppDataSource.getRepository(Candidate);

      const candidates = await candidateRepo.find({
        relations: ["user", "applications", "applications.course"],
        where: { user: { is_active: true, is_blocked: false } }
      });

      const unselectedCandidates: UnselectedCandidate[] = [];

      for (const candidate of candidates) {
        const hasSelectedApplication = candidate.applications.some(
          app => app.status === "Selected"
        );

        if (!hasSelectedApplication && candidate.applications.length > 0) {
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
          }
        }
      }

      return unselectedCandidates.sort((a, b) => b.applicationCount - a.applicationCount);
      
    } catch (error) {
      console.error("❌ Error getting unselected candidates:", error);
      throw new Error("Failed to get unselected candidates");
    }
  }
}