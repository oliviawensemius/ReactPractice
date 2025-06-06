// admin-backend/src/resolvers/index.ts - Enhanced with debugging and better error handling
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

  // Course Management
  @Query(() => [CourseType])
  async getAllCourses(): Promise<CourseType[]> {
    try {
      const courseRepo = AppDataSource.getRepository(Course);
      const courses = await courseRepo.find({ 
        relations: ["lecturers", "lecturers.user"],
        order: { year: "DESC", semester: "ASC", code: "ASC" }
      });
      
      console.log(`📚 Found ${courses.length} courses:`);
      courses.forEach(course => {
        console.log(`  - ${course.code}: ${course.name} (${course.semester} ${course.year}) - Active: ${course.is_active} - ID: ${course.id}`);
      });
      
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
          semester: courseData.semester as any,
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

      // Create course
      const course = courseRepo.create({
        code: courseData.code,
        name: courseData.name,
        semester: courseData.semester as any,
        year: courseData.year,
        is_active: true
      });
      
      const savedCourse = await courseRepo.save(course);
      console.log(`✅ Created course: ${savedCourse.code} - ${savedCourse.name} - ID: ${savedCourse.id}`);
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
            semester: courseData.semester as any,
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
      course.semester = courseData.semester as any;
      course.year = courseData.year;

      const savedCourse = await courseRepo.save(course);
      console.log(`✅ Updated course: ${savedCourse.code} - ID: ${savedCourse.id}`);
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
      
      console.log(`✅ Soft deleted course: ${course.code} - ID: ${course.id}`);
      return true;
    } catch (error: any) {
      console.error("Error deleting course:", error);
      throw new Error(`Failed to delete course: ${error.message}`);
    }
  }

  // Lecturer Management - Enhanced with detailed debugging
  @Query(() => [LecturerType])
  async getAllLecturers(): Promise<LecturerType[]> {
    try {
      const lecturerRepo = AppDataSource.getRepository(Lecturer);
      const lecturers = await lecturerRepo.find({
        relations: ["user", "courses"]
      });
      
      console.log(`👨‍🏫 Found ${lecturers.length} lecturers:`);
      
      // Log detailed information for debugging
      lecturers.forEach(lecturer => {
        console.log(`  - ${lecturer.user?.name || 'Unknown'} (ID: ${lecturer.id}):`);
        console.log(`    User ID: ${lecturer.user_id}`);
        console.log(`    Department: ${lecturer.department || 'Not specified'}`);
        console.log(`    Courses assigned: ${lecturer.courses?.length || 0}`);
        if (lecturer.courses && lecturer.courses.length > 0) {
          lecturer.courses.forEach(course => {
            console.log(`      * ${course.code} - ${course.name} (ID: ${course.id}, Active: ${course.is_active})`);
          });
        }
      });
      
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
      console.log(`\n🎯 === LECTURER COURSE ASSIGNMENT DEBUG ===`);
      console.log(`Lecturer ID: ${input.lecturerId}`);
      console.log(`Course IDs requested: [${input.courseIds.join(', ')}]`);
      
      const lecturerRepo = AppDataSource.getRepository(Lecturer);
      const courseRepo = AppDataSource.getRepository(Course);

      // Step 1: Find the lecturer
      console.log(`\n📋 Step 1: Finding lecturer...`);
      const lecturer = await lecturerRepo.findOne({
        where: { id: input.lecturerId },
        relations: ["courses", "user"]
      });

      if (!lecturer) {
        console.log(`❌ Lecturer not found with ID: ${input.lecturerId}`);
        return {
          success: false,
          message: "Lecturer not found"
        };
      }

      console.log(`✅ Found lecturer: ${lecturer.user?.name || 'Unknown'}`);
      console.log(`   Current courses: ${lecturer.courses?.length || 0}`);

      // Step 2: Debug all available courses
      console.log(`\n📚 Step 2: Checking all available courses...`);
      const allCourses = await courseRepo.find({
        select: ['id', 'code', 'name', 'is_active', 'semester', 'year']
      });
      
      console.log(`Total courses in database: ${allCourses.length}`);
      console.log(`Active courses: ${allCourses.filter(c => c.is_active).length}`);
      
      // Log first few courses for reference
      console.log(`Sample courses:`);
      allCourses.slice(0, 5).forEach(course => {
        console.log(`  - ${course.code}: ${course.name} (Active: ${course.is_active}, ID: ${course.id})`);
      });

      // Step 3: Find requested courses
      console.log(`\n🔍 Step 3: Finding requested courses...`);
      const requestedCourses = await courseRepo.find({
        where: { 
          id: In(input.courseIds)
        }
      });

      console.log(`Found ${requestedCourses.length} out of ${input.courseIds.length} requested courses:`);
      requestedCourses.forEach(course => {
        console.log(`  ✅ ${course.code}: ${course.name} (Active: ${course.is_active}, ID: ${course.id})`);
      });

      // Step 4: Check for missing courses
      const foundIds = requestedCourses.map(c => c.id);
      const missingIds = input.courseIds.filter(id => !foundIds.includes(id));
      
      if (missingIds.length > 0) {
        console.log(`❌ Missing course IDs: [${missingIds.join(', ')}]`);
        
        // Try to find these courses even if inactive
        const missingCourses = await courseRepo.find({
          where: { id: In(missingIds) }
        });
        
        if (missingCourses.length > 0) {
          console.log(`Found missing courses (possibly inactive):`);
          missingCourses.forEach(course => {
            console.log(`  - ${course.code}: ${course.name} (Active: ${course.is_active}, ID: ${course.id})`);
          });
        } else {
          console.log(`These course IDs do not exist in the database at all.`);
        }
        
        return {
          success: false,
          message: `Some courses not found or inactive: ${missingIds.join(', ')}`
        };
      }

      // Step 5: Filter only active courses
      console.log(`\n✅ Step 5: Filtering active courses...`);
      const activeCourses = requestedCourses.filter(course => course.is_active);
      
      console.log(`Active courses to assign: ${activeCourses.length}`);
      activeCourses.forEach(course => {
        console.log(`  ✓ ${course.code}: ${course.name} (ID: ${course.id})`);
      });

      if (activeCourses.length !== requestedCourses.length) {
        const inactiveCourses = requestedCourses.filter(course => !course.is_active);
        console.log(`❌ Inactive courses found:`);
        inactiveCourses.forEach(course => {
          console.log(`  - ${course.code}: ${course.name} (ID: ${course.id})`);
        });
        
        return {
          success: false,
          message: `Some courses are inactive and cannot be assigned: ${inactiveCourses.map(c => c.code).join(', ')}`
        };
      }

      // Step 6: Assign courses to lecturer
      console.log(`\n💾 Step 6: Assigning courses to lecturer...`);
      lecturer.courses = activeCourses;
      
      try {
        const savedLecturer = await lecturerRepo.save(lecturer);
        console.log(`✅ Successfully saved lecturer with ${activeCourses.length} courses`);
        
        // Verify the assignment was saved
        const verifyLecturer = await lecturerRepo.findOne({
          where: { id: input.lecturerId },
          relations: ["courses"]
        });
        
        console.log(`🔍 Verification: Lecturer now has ${verifyLecturer?.courses?.length || 0} courses assigned`);
        
        return {
          success: true,
          message: `Successfully assigned ${activeCourses.length} course(s) to ${lecturer.user?.name || 'lecturer'}`
        };
      } catch (saveError) {
        console.error("❌ Error saving lecturer course assignments:", saveError);
        return {
          success: false,
          message: `Failed to save course assignments: ${saveError}`
        };
      }
      
    } catch (error: any) {
      console.error("❌ Error in assignLecturerToCourses:", error);
      return {
        success: false,
        message: `Failed to assign courses: ${error.message || 'Unknown error'}`
      };
    }
  }

  // Add a debug query to help troubleshoot
  @Query(() => String)
  async debugCourseInfo(@Arg("courseId") courseId: string): Promise<string> {
    try {
      const courseRepo = AppDataSource.getRepository(Course);
      const course = await courseRepo.findOne({
        where: { id: courseId },
        relations: ["lecturers"]
      });

      if (!course) {
        return `Course with ID ${courseId} not found in database`;
      }

      return `Course found: ${course.code} - ${course.name} (Active: ${course.is_active}, Lecturers: ${course.lecturers?.length || 0})`;
    } catch (error: any) {
      return `Error checking course: ${error.message}`;
    }
  }

  // User Management with blocking functionality
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

      // Update blocking status
      candidate.user.is_blocked = input.isBlocked;
      candidate.user.blocked_reason = input.reason || undefined;
      candidate.user.blocked_by = "admin";
      candidate.user.blocked_at = input.isBlocked ? new Date() : undefined;

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

      // Toggle the blocked status
      const newBlockedStatus = !candidate.user.is_blocked;
      candidate.user.is_blocked = newBlockedStatus;
      candidate.user.blocked_by = "admin";
      candidate.user.blocked_at = newBlockedStatus ? new Date() : undefined;
      
      if (!newBlockedStatus) {
        candidate.user.blocked_reason = undefined;
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

  // Reports - HD Requirements (keeping existing implementation)
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